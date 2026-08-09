import { test, expect, Page } from '@playwright/test'

/**
 * The controls inside the chat panel are visible before you touch them.
 *
 * WCAG 2.2 1.4.11 Non-text Contrast, Level AA, asks 3:1 of the visual boundary
 * of a user interface component. The message input's resting ring and the send
 * button's border both measured 1.48:1 against the white panel — declared
 * boundaries that are not boundaries, which is worse than having none, because
 * the layout is built as though the outline were doing the work.
 *
 * The resting state is the whole point. Both controls switch to sky-700 on
 * focus and are comfortably past 3:1 there, so a check that did not blur first
 * would read 5.86:1 and report the bug as fixed. Opening the panel moves focus
 * into the input, so this is not a hypothetical: it is what the first
 * measurement of this did.
 *
 * Both states are measured from screenshots. The reference white is read from
 * the panel's CSS and resolved by painting it on a canvas rather than parsing
 * it — Tailwind v4 serialises this palette as `lab()`, and a regex for numbers
 * drops the minus signs, so `lab(41.6% -9.1 -42.6)` reads as rgb(42,9,43).
 * That turned a sibling spec into a check of something else entirely; see the
 * comment in `chat-launcher.spec.ts`.
 *
 * Everything else comes from pixels, and did not always. The first several
 * versions of this file read declarations — box-shadow, border colour,
 * background, outline width — and each one was wrong in the same direction,
 * crediting something CSS had been asked for rather than something a person
 * could see. The helpers below say which mistake each replaced.
 *
 * Not covered here, having been measured and found fine: the clear and close
 * buttons carry no boundary at all, and what identifies them is their glyph,
 * `stroke-zinc-500` at 4.83:1 against the panel.
 */

/** Sheet and card. The panel is white in both, but the surround differs. */
const WIDTHS = [
  { width: 390, height: 844, shape: 'sheet' },
  { width: 1440, height: 900, shape: 'card' },
]

const REQUIRED_RATIO = 3

/**
 * Controls that have to be tellable from the panel they sit on.
 *
 * Which CSS property carries that is deliberately not stated. The input draws a
 * ring, which Tailwind compiles to a box-shadow; the send button is filled, so
 * its edge is its background; a third control could use a border. Naming the
 * property per control would assert the shape of today's fix rather than the
 * property — a white send button with a compliant 1px border is a perfectly
 * legal answer to 1.4.11, and a check pinned to `backgroundColor` would fail
 * it. So all three are read and the best is taken.
 */
const BOUNDARIES = [
  { name: 'the message input', selector: '#chat' },
  { name: 'the send button', selector: '[aria-label="Send message"]' },
]

type Reading = { name: string; resting: number; focused: number }

/**
 * How far the control's edge stands out from the panel, measured from pixels.
 *
 * This used to read the declaration — box-shadow, border colour, background —
 * and it kept being wrong in the same direction. A border with zero width still
 * reports a colour. A ring set to `ring-0` still reports a colour. A shadow
 * with a blur reports its source colour while every pixel it actually paints is
 * composited half-way to the panel. And a boundary drawn with `outline` was not
 * read at all, so a compliant refactor would have failed CI.
 *
 * Each of those was a separate finding and a separate patch. They are one bug:
 * a declaration is not a boundary. What a boundary is, is pixels near the edge
 * that differ from the surface behind them, so that is what is measured — and
 * the property no longer cares which of the four ways CSS was asked to draw it.
 *
 * The reference is the panel's own flat white, read from CSS rather than
 * sampled. Sampling it risks catching a neighbour: the send button sits 12px
 * from the input, and a probe reaching outward for "the background" finds the
 * other control's ring.
 */
async function boundaryContrast(page: Page): Promise<Reading[]> {
  const readings: Reading[] = []

  for (const { name, selector } of BOUNDARIES) {
    const control = page.locator(selector)
    const box = await control.boundingBox()
    if (!box) throw new Error(`${selector} has no box`)

    const PAD = 8
    const clip = {
      x: Math.max(0, box.x - PAD),
      y: Math.max(0, box.y - PAD),
      width: box.width + PAD * 2,
      height: box.height + PAD * 2,
    }

    const measure = async () => {
      const shot = (await page.screenshot({ clip })).toString('base64')
      return page.evaluate(
        async ({ shot, pad, width, height }) => {
          const image = new Image()
          image.src = `data:image/png;base64,${shot}`
          await image.decode()
          const canvas = document.createElement('canvas')
          canvas.width = image.width
          canvas.height = image.height
          const context = canvas.getContext('2d')!
          context.drawImage(image, 0, 0)
          const data = context.getImageData(0, 0, canvas.width, canvas.height).data
          const at = (x: number, y: number) => {
            const px = Math.min(Math.max(Math.round(x), 0), canvas.width - 1)
            const py = Math.min(Math.max(Math.round(y), 0), canvas.height - 1)
            const i = (py * canvas.width + px) * 4
            return [data[i], data[i + 1], data[i + 2]] as [number, number, number]
          }

          const panel = document.querySelector('[role="dialog"]')
          if (!panel) throw new Error('the chat panel is not open')
          const surface = getComputedStyle(panel).backgroundColor
          const probe = document.createElement('canvas')
          probe.width = 1
          probe.height = 1
          const probeContext = probe.getContext('2d')!
          probeContext.fillStyle = surface
          probeContext.fillRect(0, 0, 1, 1)
          const [br, bg, bb] = probeContext.getImageData(0, 0, 1, 1).data
          const background: [number, number, number] = [br, bg, bb]

          const luminance = ([r, g, b]: [number, number, number]) => {
            const channel = (value: number) => {
              const v = value / 255
              return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
            }
            return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
          }
          const ratio = (a: [number, number, number], b: [number, number, number]) => {
            const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
            return (high + 0.05) / (low + 0.05)
          }

          // Points along each edge, kept away from the rounded corners, and a
          // band running from just outside the control to just inside it so
          // that a boundary drawn either way round is seen.
          const fractions = [0.25, 0.5, 0.75]
          const band = [-5, -4, -3, -2, -1, 0, 1, 2, 3]
          const edges: [number, number, number, number][] = []
          for (const f of fractions) {
            edges.push([pad + width * f, pad, 0, 1])
            edges.push([pad + width * f, pad + height, 0, -1])
            edges.push([pad, pad + height * f, 1, 0])
            edges.push([pad + width, pad + height * f, -1, 0])
          }

          // The weakest edge, not the strongest: a control that is obvious on
          // three sides and invisible on the fourth has an invisible side.
          let weakest = Infinity
          for (const [x, y, dx, dy] of edges) {
            let best = 0
            for (const offset of band) {
              best = Math.max(best, ratio(at(x + dx * offset, y + dy * offset), background))
            }
            weakest = Math.min(weakest, best)
          }
          return weakest
        },
        { shot, pad: PAD, width: box.width, height: box.height },
      )
    }

    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    const resting = await measure()
    await page.evaluate(
      (sel) => (document.querySelector(sel) as HTMLElement).focus(),
      selector,
    )
    const focused = await measure()
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())

    readings.push({ name, resting, focused })
  }

  return readings
}

/**
 * What focusing a control actually changes on screen.
 *
 * WCAG 2.2 2.4.13 is about the indicator *area*: the pixels that change
 * between the unfocused and focused states must contrast by 3:1, and must
 * amount to at least the area of a 2px perimeter around the control. So this
 * takes two screenshots and compares them, rather than reasoning from computed
 * style about whether an outline "should" be visible.
 *
 * That is deliberate, and it settled a disagreement. Reading style alone, an
 * outline the same colour as the control's own fill looks invisible — one
 * review called `outline-offset: 0` on the filled send button "completely
 * invisible" — while by the criterion it paints a new 2px perimeter over pixels
 * that were white, which is a 5.86:1 change and compliant. Both arguments are
 * plausible and neither is a measurement. The pixels are.
 */
async function focusChange(page: Page, selector: string) {
  const control = page.locator(selector)
  const box = await control.boundingBox()
  if (!box) throw new Error(`${selector} has no box`)

  // Wide enough to contain an outline drawn outside the border box, offset
  // included.
  const PAD = 10
  const clip = {
    x: Math.max(0, box.x - PAD),
    y: Math.max(0, box.y - PAD),
    width: box.width + PAD * 2,
    height: box.height + PAD * 2,
  }

  // The corner radius, because the perimeter of a rounded rectangle is shorter
  // than that of a sharp one and the threshold below is derived from it.
  const radius = await control.evaluate((element) =>
    parseFloat(getComputedStyle(element).borderTopLeftRadius),
  )

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  const unfocused = (await page.screenshot({ clip })).toString('base64')
  await page.evaluate((sel) => (document.querySelector(sel) as HTMLElement).focus(), selector)
  const focused = (await page.screenshot({ clip })).toString('base64')
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())

  return page.evaluate(
    async ({ unfocused, focused, width, height, radius, required: minimumRatio }) => {
      const read = async (data: string) => {
        const image = new Image()
        image.src = `data:image/png;base64,${data}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext('2d')!
        context.drawImage(image, 0, 0)
        return {
          data: context.getImageData(0, 0, canvas.width, canvas.height).data,
          w: canvas.width,
          h: canvas.height,
        }
      }
      const before = await read(unfocused)
      const after = await read(focused)

      const luminance = (r: number, g: number, b: number) => {
        const channel = (value: number) => {
          const v = value / 255
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
      }

      const ratios: number[] = []
      for (let i = 0; i < before.data.length; i += 4) {
        const [r1, g1, b1] = [before.data[i], before.data[i + 1], before.data[i + 2]]
        const [r2, g2, b2] = [after.data[i], after.data[i + 1], after.data[i + 2]]
        // Ignore the faint edges antialiasing leaves either side of a real
        // change; a channel has to move meaningfully to count.
        if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) < 30) continue
        const [high, low] = [luminance(r1, g1, b1), luminance(r2, g2, b2)].sort(
          (a, b) => b - a,
        )
        ratios.push((high + 0.05) / (low + 0.05))
      }

      ratios.sort((a, b) => a - b)
      return {
        changed: ratios.length,
        // Only the pixels that actually changed by enough count toward the
        // area. The two used to be separate assertions -- total area, and the
        // median ratio -- and that let one cover for the other: the input's
        // change is a mixture, its inset ring going zinc-500 to sky-700 at
        // 1.21:1 and its outline appearing against white at 5.86:1. The dim
        // ring pixels inflated the area while the bright outline pixels
        // carried the median, so an outline regression could leave too little
        // qualifying area and still pass both.
        qualifying: ratios.filter((value) => value >= minimumRatio).length,
        // Kept for the failure message rather than asserted on.
        median: ratios.length ? ratios[Math.floor(ratios.length / 2)] : 0,
        // A 2px-thick perimeter of the unfocused control, which is the
        // minimum area 2.4.13 describes.
        //
        // Derived from the actual shape rather than from `4 * (w + h)`, which
        // is the perimeter of a *sharp* rectangle. These controls are
        // `rounded-md`, and squaring off their corners overstates the ideal by
        // just enough to matter: the shipped design measured 1410 qualifying
        // pixels against a demanded 1416, failing by six on a corner radius
        // rather than on anything a user could see. Each corner replaces two
        // radius-length straight runs with a quarter circle.
        required: (() => {
          const r = Math.min(radius, width / 2, height / 2)
          const perimeter = 2 * (width + height) - 8 * r + 2 * Math.PI * r
          return perimeter * 2
        })(),
      }
    },
    {
      unfocused,
      focused,
      width: box.width,
      height: box.height,
      radius,
      required: REQUIRED_RATIO,
    },
  )
}

test.describe('chat panel controls', () => {
  for (const { width, height, shape } of WIDTHS) {
    test(`are visible at rest in the ${shape} at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await page.getByRole('button', { name: 'Open chat' }).click()
      await expect(page.getByRole('dialog', { name: /chat/i })).toBeVisible()

      // One real keypress before anything is measured. Chromium only grants
      // `:focus-visible` to a programmatically focused *button* when the last
      // interaction was a keyboard one — text inputs always match, buttons do
      // not — and the panel was opened with a click. Without this the send
      // button reports no focus indicator, which is true of a mouse user and
      // irrelevant, since focus indicators exist for the keyboard.
      //
      // One Tab, not more: from the input it lands on the send button, which is
      // still inside the widget. Two would reach the launcher and a third would
      // leave, and leaving closes the panel at `lg` and up.
      await page.keyboard.press('Tab')

      // And the pointer parked somewhere harmless. In the sheet the panel
      // fills the viewport, so the spot the launcher occupied when it was
      // clicked is now the send button -- which then reports its hover fill,
      // 7.51:1 rather than the resting 5.86:1, for as long as the mouse sits
      // there. A resting measurement taken under the cursor is not a resting
      // measurement.
      await page.mouse.move(2, 2)

      const readings = await boundaryContrast(page)

      // Not `readings.length === BOUNDARIES.length`, which was the first
      // version of this and holds by construction: the walk is a `map` over
      // BOUNDARIES, so no state of the page makes it false. What can be true
      // and useless is a reading of zero, so that is what is checked.
      expect(
        readings.filter((reading) => reading.resting > 0).length,
        'no control boundary produced a measurement',
      ).toBe(BOUNDARIES.length)

      const failing = readings
        .filter((reading) => reading.resting < REQUIRED_RATIO)
        .map((reading) => `${reading.name} ${reading.resting.toFixed(2)}:1`)

      expect(
        failing,
        `controls whose resting boundary is invisible against the panel ` +
          `(WCAG 1.4.11 asks ${REQUIRED_RATIO}:1)`,
      ).toEqual([])

      const weakFocus = readings
        .filter((reading) => reading.focused < REQUIRED_RATIO)
        .map((reading) => `${reading.name} ${reading.focused.toFixed(2)}:1`)

      expect(weakFocus, 'controls whose focused boundary is invisible').toEqual([])

      // WCAG 2.4.13, measured rather than inferred. Raising the resting
      // boundary to clear 1.4.11 moved it to within 1.21:1 of the focus colour
      // -- the same lightness in two hues, identical in greyscale -- so the fix
      // for one criterion silently broke the other. Nothing caught that,
      // because every assertion above compares a state to the panel and never
      // the two states to each other.
      for (const { selector, name } of BOUNDARIES) {
        const change = await focusChange(page, selector)
        expect(
          change.qualifying,
          `${name}'s focus indicator covers ${change.qualifying} pixels that ` +
            `change by ${REQUIRED_RATIO}:1 or more, against the ` +
            `${Math.round(change.required)} a 2px perimeter needs ` +
            `(${change.changed} changed at all, median ` +
            `${change.median.toFixed(2)}:1)`,
        ).toBeGreaterThanOrEqual(change.required)
      }
    })
  }
})

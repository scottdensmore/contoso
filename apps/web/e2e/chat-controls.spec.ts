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
 * Colours are resolved by painting them on a canvas rather than parsed.
 * Tailwind v4 serialises this palette as `lab()`, and a regex for numbers drops
 * the minus signs — `lab(41.6% -9.1 -42.6)` reads as rgb(42,9,43). That turned
 * a sibling spec into a check of something else entirely; see the comment in
 * `chat-launcher.spec.ts`.
 *
 * Unlike the launcher, these controls sit on a known flat surface — the panel's
 * own white — so the background is read from CSS too rather than sampled from a
 * screenshot. There is no photograph underneath to be surprised by.
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

async function boundaryContrast(page: Page): Promise<Reading[]> {
  return page.evaluate((boundaries) => {
    const COLOUR =
      /(?:rgba?|lab|lch|oklab|oklch|hsla?|color)\([^)]*\)|#[0-9a-fA-F]{3,8}/g

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const context = canvas.getContext('2d')!
    const resolve = (colour: string) => {
      context.clearRect(0, 0, 1, 1)
      context.fillStyle = colour
      context.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
      return { rgb: [r, g, b] as [number, number, number], opaque: a === 255 }
    }

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

    const panel = document.querySelector('[role="dialog"]')
    if (!panel) throw new Error('the chat panel is not open')
    const background = resolve(getComputedStyle(panel).backgroundColor).rgb

    // Best of whatever opaque colours the property carries. `ring` emits one
    // shadow layer and `border` one colour, so this is a single value in
    // practice; taking the max means a control that grows a second, stronger
    // outline is credited for it rather than failed on the weaker one.
    const outline = (selector: string) => {
      const element = document.querySelector(selector)
      if (!element) throw new Error(`no element matched ${selector}`)
      const style = getComputedStyle(element)
      // A border only counts if it is drawn. Tailwind's preflight leaves every
      // element `border-style: solid; border-width: 0` with a default border
      // colour, so `borderColor` always resolves to something -- gray-200 here,
      // 1.24:1, which happens to be too weak to rescue a failing control. A
      // zero-width `border-zinc-900` would not be, and would pass this on a
      // border nobody can see.
      const painted =
        style.borderStyle !== 'none' && parseFloat(style.borderWidth) > 0

      // Shadow layers only count if they have some geometry. `ring-0` leaves
      // the ring's colour in the computed box-shadow with every length at
      // zero, so a control whose outline had been switched off would still be
      // credited with its colour. Split on top-level commas, because the
      // colours contain commas of their own.
      const shadowLayers: string[] = []
      let depth = 0
      let current = ''
      for (const character of style.boxShadow) {
        if (character === '(') depth += 1
        if (character === ')') depth -= 1
        if (character === ',' && depth === 0) {
          shadowLayers.push(current)
          current = ''
        } else {
          current += character
        }
      }
      if (current.trim()) shadowLayers.push(current)
      const paintingShadows = shadowLayers.filter((layer) => {
        const lengths = layer.replace(COLOUR, '').match(/-?\d*\.?\d+px/g) ?? []
        return lengths.some((length) => parseFloat(length) !== 0)
      })

      const colours = [
        ...paintingShadows,
        painted ? style.borderColor : '',
        style.backgroundColor,
      ]
        .flatMap((declared) => declared.match(COLOUR) ?? [])
        .map(resolve)
        .filter((colour) => colour.opaque)
        .map((colour) => colour.rgb)
      if (colours.length === 0) return null
      return Math.max(...colours.map((colour) => ratio(colour, background)))
    }

    const input = document.querySelector('#chat') as HTMLElement | null

    return boundaries.map(({ name, selector }) => {
      // Resting first, and read with focus parked on nothing: opening the panel
      // focuses the input, and both of these controls swap to sky-700 when
      // focused.
      input?.blur()
      ;(document.activeElement as HTMLElement | null)?.blur()
      const resting = outline(selector)

      const element = document.querySelector(selector) as HTMLElement | null
      element?.focus()
      const focused = outline(selector)
      element?.blur()

      if (resting === null || focused === null) {
        throw new Error(`${name} declares no opaque colour, so nothing was measured`)
      }
      return { name, resting, focused }
    })
  }, BOUNDARIES)
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

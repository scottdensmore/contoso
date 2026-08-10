import { expect, type Page } from '@playwright/test'

/**
 * How visible a control's edge is, and what focusing it changes, from pixels.
 *
 * Extracted from `chat-controls.spec.ts` when #196 needed the same two
 * measurements for the ten text fields on `/login`, `/signup` and `/contact`.
 * Every warning below was paid for once already in that file; the history is
 * kept here because it is the reason the code looks like this.
 *
 * The measurements read rendered pixels, never a declaration. Earlier versions
 * read box-shadow, border colour, background and outline width, and each was
 * wrong in the same direction — crediting something CSS had been asked for
 * rather than something a person could see. A border with zero width still
 * reports a colour; `ring-0` still reports a colour; a blurred shadow reports
 * its source colour while every pixel it paints is composited toward the
 * surface; `outlineWidth` reports the user-agent default of 3px for an outline
 * whose style is `none`.
 */

/** WCAG 2.2 1.4.11 Non-text Contrast, Level AA. */
export const REQUIRED_RATIO = 3

/**
 * Where the colour behind a control comes from.
 *
 * `css` reads it off an ancestor and resolves it by painting, for surfaces that
 * are one flat opaque colour. It is the right choice when a probe reaching
 * outward would find a neighbour instead of the background — the chat panel's
 * send button sits 12px from its input.
 *
 * `sample` reads the real painted pixels beside the control, which is the only
 * option when the surface is not a colour anyone declared. The contact form is
 * `bg-white/90` over a blurred photograph, so its computed `backgroundColor` is
 * `rgba(255,255,255,0.9)` — a value that is not what is on screen, and that
 * paints differently again depending on what a canvas composites it over.
 * Measured, that card runs rgb(233,233,234) to rgb(240,239,238) *between
 * fields on the same form*, because the photo behind it differs.
 */
export type Surface =
  | { kind: 'css'; selector: string }
  | { kind: 'sample' }

export type Boundary = { name: string; selector: string }
export type Reading = { name: string; resting: number; focused: number }

/**
 * Sampled horizontally only, never vertically.
 *
 * A form stacks label, field, label, field, so a probe reaching up or down
 * finds text and reports the label's contrast as the background. Left and
 * right of a `w-full` field is the form's own side padding, which is clear.
 */
const SAMPLE_OFFSETS = [12, 16, 20]


/**
 * How far each control's edge stands out from the surface behind it.
 *
 * A boundary is pixels near the edge that differ from what is behind them, so
 * that is what is measured, and the property no longer cares which of border,
 * box-shadow, background or outline CSS was asked to draw it. Naming one would
 * assert the shape of today's fix: a white field with a compliant 1px border is
 * a legal answer to 1.4.11, and a check pinned to `boxShadow` would fail it.
 *
 * The weakest edge is reported, not the strongest. A control that is obvious on
 * three sides and invisible on the fourth has an invisible side.
 */
export async function boundaryContrast(
  page: Page,
  boundaries: Boundary[],
  surface: Surface,
): Promise<Reading[]> {
  const readings: Reading[] = []

  // Every *measured* control's box up front, so a reading can tell where its
  // neighbours are. A control absent from `boundaries` is not seen: pass only
  // the text fields on a form with a button beside one of them and the sampler
  // probes into the button exactly as it used to probe into `#orderNumber`. Sampling reaches sideways, and on a two-column form row the next
  // field is closer than the widest offset: measured on `/contact` at 1440,
  // `#subject` and `#orderNumber` sit in a `gap-4` grid whose gap is exactly
  // 16px, so probes at 16 and 20 landed on that neighbour's ring and inside
  // its white interior.
  //
  // The median absorbed it: `#subject` reads 4.005:1 with the probes excluded,
  // with them included, and with the grid gap narrowed to 4px so that every
  // right-hand probe lands inside the neighbour. So this removes a latent
  // contamination rather than a wrong answer — no arrangement was found where
  // the reported number moved, and the claim here is only that the sampler no
  // longer reads a control and calls it a background.
  const boxes = new Map<string, { x: number; y: number; width: number; height: number }>()
  for (const { selector } of boundaries) {
    const box = await page.locator(selector).boundingBox()
    if (box) boxes.set(selector, box)
  }

  for (const { name, selector } of boundaries) {
    const control = page.locator(selector)
    const box = await control.boundingBox()
    if (!box) throw new Error(`${selector} has no box`)

    // The margin the reading needs around the control: 5px for the band walk
    // either side of the edge, and room for the widest surface sample when the
    // background is being read from pixels.
    const NEEDED = surface.kind === 'sample' ? Math.max(...SAMPLE_OFFSETS) + 2 : 7
    const PAD = NEEDED + 4

    const viewport = page.viewportSize()
    if (!viewport) throw new Error('no viewport to clamp a screenshot to')

    // Clamped to the viewport, and the offsets derived from the clip that
    // resulted rather than assumed to be PAD. They come apart whenever the
    // control sits closer to an edge than PAD, and then every sample point is
    // shifted by the difference: at 390 the chat input starts 12px from the
    // left, so a PAD of 24 read 12px into the control and called the control
    // its own background, for a flat 1.00:1. That is not hypothetical — it is
    // what this file did when it was first extracted.
    //
    // Two separate defences, and worth knowing which does the work. At the PAD
    // above nothing clamps, so the refusal below is what fires when a control
    // is tight against an edge. The derivation only bites in the window where
    // the clip clamps but there is still enough surface to read — forced by
    // raising PAD past the gap, assuming the offset fails at 1.00:1 and
    // deriving it passes.
    const left = Math.max(0, box.x - PAD)
    const top = Math.max(0, box.y - PAD)
    const right = Math.min(viewport.width, box.x + box.width + PAD)
    const bottom = Math.min(viewport.height, box.y + box.height + PAD)
    const clip = { x: left, y: top, width: right - left, height: bottom - top }

    const padLeft = box.x - left
    const padTop = box.y - top
    const padRight = right - (box.x + box.width)
    const padBottom = bottom - (box.y + box.height)

    // Loudly, rather than measuring whatever happens to be in range. A control
    // pressed against a viewport edge cannot be read this way, and a number
    // produced anyway would look exactly like a real one.
    const tight = Math.min(padLeft, padTop, padRight, padBottom)
    if (tight < NEEDED) {
      throw new Error(
        `${selector} sits ${tight.toFixed(1)}px from a viewport edge, and this ` +
          `reading needs ${NEEDED}px of surface around it`,
      )
    }

    // How far each side can be probed before reaching another control on the
    // same row. Only controls that overlap vertically can be in the way; one
    // stacked above or below is behind the label, which is why sampling is
    // horizontal in the first place.
    const clearance = (towards: 'left' | 'right') => {
      let nearest = Infinity
      for (const [other, box2] of boxes) {
        if (other === selector) continue
        const overlaps = box2.y < box.y + box.height && box.y < box2.y + box2.height
        if (!overlaps) continue
        const gap =
          towards === 'left' ? box.x - (box2.x + box2.width) : box2.x - (box.x + box.width)
        if (gap >= 0) nearest = Math.min(nearest, gap)
      }
      return nearest
    }

    // Minus one, so a probe stops short of the neighbour's first painted pixel
    // rather than landing on it.
    const usable = (towards: 'left' | 'right') =>
      SAMPLE_OFFSETS.filter((offset) => offset <= clearance(towards) - 1)
    const leftOffsets = surface.kind === 'sample' ? usable('left') : []
    const rightOffsets = surface.kind === 'sample' ? usable('right') : []

    if (surface.kind === 'sample' && leftOffsets.length + rightOffsets.length === 0) {
      throw new Error(
        `${selector} has no clear surface either side to sample: nearest ` +
          `controls are ${clearance('left').toFixed(1)}px and ` +
          `${clearance('right').toFixed(1)}px away`,
      )
    }

    const measure = async () => {
      const shot = (await page.screenshot({ clip })).toString('base64')
      return page.evaluate(
        async ({ shot, padLeft, padTop, width, height, surface, leftOffsets, rightOffsets }) => {
          const image = new Image()
          image.src = `data:image/png;base64,${shot}`
          await image.decode()
          const canvas = document.createElement('canvas')
          canvas.width = image.width
          canvas.height = image.height
          const context = canvas.getContext('2d')!
          context.drawImage(image, 0, 0)
          const data = context.getImageData(0, 0, canvas.width, canvas.height).data
          const at = (x: number, y: number): [number, number, number] => {
            const px = Math.min(Math.max(Math.round(x), 0), canvas.width - 1)
            const py = Math.min(Math.max(Math.round(y), 0), canvas.height - 1)
            const i = (py * canvas.width + px) * 4
            return [data[i], data[i + 1], data[i + 2]]
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

          const fractions = [0.25, 0.5, 0.75]

          let background: [number, number, number]
          if (surface.kind === 'css') {
            const host = document.querySelector(surface.selector)
            if (!host) throw new Error(`no ${surface.selector} to read a surface from`)
            // Painted on a 1x1 canvas rather than parsed. Tailwind v4
            // serialises this palette as `lab()`, and a regex for numbers drops
            // the minus signs, so `lab(41.6 -9.1 -42.6)` reads as rgb(42,9,43).
            const probe = document.createElement('canvas')
            probe.width = 1
            probe.height = 1
            const probeContext = probe.getContext('2d')!
            probeContext.fillStyle = getComputedStyle(host).backgroundColor
            probeContext.fillRect(0, 0, 1, 1)
            const [r, g, b] = probeContext.getImageData(0, 0, 1, 1).data
            background = [r, g, b]
          } else {
            const samples: [number, number, number][] = []
            for (const f of fractions) {
              for (const dx of leftOffsets) samples.push(at(padLeft - dx, padTop + height * f))
              for (const dx of rightOffsets) {
                samples.push(at(padLeft + width + dx, padTop + height * f))
              }
            }
            // Median per channel, so one stray pixel — an antialiased glyph
            // edge, a speck of the photograph — cannot move the reference.
            const median = (values: number[]) =>
              values.slice().sort((a, b) => a - b)[Math.floor(values.length / 2)]
            background = [0, 1, 2].map((k) => median(samples.map((s) => s[k]))) as [
              number,
              number,
              number,
            ]
          }

          const band = [-5, -4, -3, -2, -1, 0, 1, 2, 3]
          const edges: [number, number, number, number][] = []
          for (const f of fractions) {
            edges.push([padLeft + width * f, padTop, 0, 1])
            edges.push([padLeft + width * f, padTop + height, 0, -1])
            edges.push([padLeft, padTop + height * f, 1, 0])
            edges.push([padLeft + width, padTop + height * f, -1, 0])
          }

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
        {
          shot,
          padLeft,
          padTop,
          width: box.width,
          height: box.height,
          surface,
          leftOffsets,
          rightOffsets,
        },
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
 * WCAG 2.2 2.4.13 is about the indicator *area*: the pixels that change between
 * unfocused and focused must contrast by 3:1, and must amount to at least a 2px
 * perimeter of the control. Two screenshots, compared — not a reading of
 * computed style about whether an outline "should" be visible.
 *
 * That distinction settled a disagreement once. By style alone, an outline the
 * same colour as the control's own fill looks invisible, and one review called
 * it "completely invisible"; by the criterion it paints a new 2px perimeter
 * over pixels that were background, which is compliant. Both arguments were
 * plausible and neither was a measurement.
 */
export async function focusChange(page: Page, selector: string) {
  const control = page.locator(selector)
  const box = await control.boundingBox()
  if (!box) throw new Error(`${selector} has no box`)

  const PAD = 10
  const clip = {
    x: Math.max(0, box.x - PAD),
    y: Math.max(0, box.y - PAD),
    width: box.width + PAD * 2,
    height: box.height + PAD * 2,
  }

  const radius = await control.evaluate((element) =>
    parseFloat(getComputedStyle(element).borderTopLeftRadius),
  )

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  const unfocused = (await page.screenshot({ clip })).toString('base64')
  await page.evaluate((sel) => (document.querySelector(sel) as HTMLElement).focus(), selector)
  const focused = (await page.screenshot({ clip })).toString('base64')
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())

  return page.evaluate(
    async ({ unfocused, focused, width, height, radius, required }) => {
      const read = async (encoded: string) => {
        const image = new Image()
        image.src = `data:image/png;base64,${encoded}`
        await image.decode()
        const canvas = document.createElement('canvas')
        canvas.width = image.width
        canvas.height = image.height
        const context = canvas.getContext('2d')!
        context.drawImage(image, 0, 0)
        return context.getImageData(0, 0, canvas.width, canvas.height).data
      }
      const before = await read(unfocused)
      const after = await read(focused)
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

      const ratios: number[] = []
      for (let i = 0; i < before.length; i += 4) {
        const a: [number, number, number] = [before[i], before[i + 1], before[i + 2]]
        const b: [number, number, number] = [after[i], after[i + 1], after[i + 2]]
        // Ignore the faint edges antialiasing leaves either side of a real
        // change; a channel has to move meaningfully to count.
        if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 30) continue
        ratios.push(ratio(a, b))
      }

      ratios.sort((a, b) => a - b)
      return {
        changed: ratios.length,
        // Only pixels that changed by enough count toward the area. These were
        // once two assertions -- total area, and median ratio -- which let one
        // cover for the other: a ring recolouring at 1.21:1 inflated the area
        // while a bright outline carried the median, so an outline regression
        // could leave too little qualifying area and still pass both.
        qualifying: ratios.filter((value) => value >= required).length,
        median: ratios.length ? ratios[Math.floor(ratios.length / 2)] : 0,
        // A 2px perimeter of the control, derived from its actual shape rather
        // than `2 * (w + h)`, which is the perimeter of a *sharp* rectangle.
        // These controls are rounded, and squaring the corners overstates the
        // ideal by enough to matter: a shipped design once measured 1410
        // qualifying pixels against a demanded 1416, failing by six on a corner
        // radius rather than on anything a user could see.
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

/** Both criteria, for every control on one surface. */
export async function expectVisibleControls(
  page: Page,
  boundaries: Boundary[],
  surface: Surface,
) {
  const readings = await boundaryContrast(page, boundaries, surface)

  // Not `readings.length === boundaries.length`, which holds by construction:
  // the walk is a loop over `boundaries`, so no state of the page makes it
  // false. What can be true and useless is a reading of zero.
  expect(
    readings.filter((reading) => reading.resting > 0).length,
    'no control boundary produced a measurement',
  ).toBe(boundaries.length)

  expect(
    readings
      .filter((reading) => reading.resting < REQUIRED_RATIO)
      .map((reading) => `${reading.name} ${reading.resting.toFixed(2)}:1`),
    `controls whose resting boundary is invisible (WCAG 1.4.11 asks ${REQUIRED_RATIO}:1)`,
  ).toEqual([])

  expect(
    readings
      .filter((reading) => reading.focused < REQUIRED_RATIO)
      .map((reading) => `${reading.name} ${reading.focused.toFixed(2)}:1`),
    'controls whose focused boundary is invisible',
  ).toEqual([])

  for (const { selector, name } of boundaries) {
    const change = await focusChange(page, selector)
    expect(
      change.qualifying,
      `${name}'s focus indicator covers ${change.qualifying} pixels that change ` +
        `by ${REQUIRED_RATIO}:1 or more, against the ${Math.round(change.required)} ` +
        `a 2px perimeter needs (${change.changed} changed at all, median ` +
        `${change.median.toFixed(2)}:1)`,
    ).toBeGreaterThanOrEqual(change.required)
  }
}

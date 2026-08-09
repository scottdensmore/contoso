import { test, expect, Page } from '@playwright/test'

/**
 * The chat launcher has to be visible against whatever it is sitting on.
 *
 * It is `position: fixed`, so it does not sit on one background — it sits on
 * whatever the visitor has scrolled to. Measured before this guard existed, a
 * white disc with a shadow read **1.04:1** against the page at nearly every
 * viewport: not a control that was hard to see, a control that was not there.
 * WCAG 2.2 1.4.11 Non-text Contrast, Level AA, asks 3:1 of a control's visual
 * boundary.
 *
 * That invisibility is what made #190 a defect rather than an annoyance. A
 * floating launcher covers page content — it is fixed and the content scrolls
 * under it, so a bottom gutter would only help at the very end of a document —
 * and covering content is tolerable. Covering it with something the eye reads
 * as part of the page is not: the hero copy is `text-zinc-100` and the disc was
 * white, so the overlap sampled at 1.1:1 and the words simply vanished.
 *
 * So this asserts the property rather than a colour. No single fill can satisfy
 * 3:1 everywhere — the accent measures 5.9:1 on the white catalogue pages and
 * 1.65:1 on the dark hero photograph — so a control that survives both needs
 * two tones, and a check pinned to one hex would forbid the fix.
 */

/**
 * Where the launcher lands on genuinely different backgrounds.
 *
 * `scrollY` is part of the surface, not an afterthought. The launcher is fixed
 * to the bottom of the viewport, so at 390x844 it sits at y=788 while the hero
 * band ends at document y=492 — it can never be over the hero at that size, and
 * an entry labelled "the hero photograph" there was measuring white page copy.
 * Four of these were the same near-white background until that was found.
 *
 * The mean brightness of the ring just outside the control is quoted for each,
 * measured on this build, so a surface that stops being what it says is
 * checkable rather than taken on trust.
 */
const SURFACES = [
  // Dark.
  { route: '/', width: 667, height: 375, scrollY: 0, on: 'the hero photograph, dark' }, // 15
  { route: '/', width: 390, height: 844, scrollY: 2400, on: 'a product photograph, dark' }, // 86
  { route: '/about', width: 390, height: 844, scrollY: 150, on: 'a photograph, dark' }, // 81
  // Mid-tone, which is the case two tones cannot cover and the reason for three.
  { route: '/', width: 390, height: 844, scrollY: 150, on: 'a photograph, mid-tone' }, // 132
  { route: '/about', width: 390, height: 844, scrollY: 0, on: 'copy over a photograph edge' }, // 225
  // Light.
  { route: '/', width: 768, height: 1024, scrollY: 0, on: 'a product card, white' }, // 250
  { route: '/faq', width: 390, height: 844, scrollY: 0, on: 'body copy, white' }, // 250
  { route: '/', width: 1440, height: 900, scrollY: 0, on: 'the page background, zinc-50' }, // 250
]

const REQUIRED_RATIO = 3

type Sample = { direction: string; best: number }

/**
 * The launcher's contrast against what is directly behind it, per side.
 *
 * Split deliberately down the middle: the control's own tones are read from
 * CSS, and only the background is sampled from a screenshot.
 *
 * Both halves have to be that way round. The background is a photograph under
 * a blend mode in some places and a flat colour in others, so nothing but
 * pixels can say what it is. The control's tones, by contrast, are 1px and 2px
 * rings on a 40px circle, and point-sampling those from a screenshot measures
 * antialiasing rather than the ring -- the first version of this did, and read
 * the white ring as 241,241,241 on one side and 147,147,148 on another, which
 * made the whole check a function of where the curve happened to fall between
 * two pixels.
 */
async function contrastAroundLauncher(page: Page): Promise<Sample[]> {
  const launcher = page.locator('[aria-label="Open chat"]')
  await expect(launcher).toBeVisible()
  const box = await launcher.boundingBox()
  if (!box) throw new Error('the launcher has no box')

  // Every opaque colour the control paints: its fill, and each solid ring in
  // the stacked box-shadow.
  //
  // Resolved through a canvas rather than parsed. Tailwind v4 serialises this
  // palette as `lab()` -- `getComputedStyle` returns
  // `lab(41.6013% -9.10804 -42.5647)` for sky-700 -- and a regex for numbers
  // reads that as rgb(42, 9, 43), a near-black plum, because it drops the
  // minus signs and L* ranges 0-100 where R ranges 0-255. That is not a
  // near-miss: *every* colour in the palette parses to something dark, so the
  // fill could never fail against a light page and the check silently became a
  // test of the white ring alone. Painting each colour and reading it back is
  // the browser's own conversion, and it costs nothing.
  //
  // The alpha channel comes back with it, which is how the translucent drop
  // shadow is excluded: a colour that lets the page through cannot be relied
  // on to contrast with it.
  const tones = await launcher.evaluate((element) => {
    const style = getComputedStyle(element)
    const COLOUR =
      /(?:rgba?|lab|lch|oklab|oklch|hsla?|color)\([^)]*\)|#[0-9a-fA-F]{3,8}/g
    const raw = [style.backgroundColor, ...(style.boxShadow.match(COLOUR) ?? [])]

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const context = canvas.getContext('2d')!
    const resolved: [number, number, number][] = []
    for (const colour of raw) {
      context.clearRect(0, 0, 1, 1)
      context.fillStyle = colour
      context.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
      if (a === 255) resolved.push([r, g, b])
    }
    return resolved
  })

  // Fail closed on a broken probe, and only that. An empty `tones` would make
  // every comparison below run against an empty set, which reads as a control
  // with no colours rather than as a parse that found nothing.
  //
  // One, not two. Requiring two would be asserting the shape of the fix rather
  // than the property -- and it did: removing the white ring failed all six
  // surfaces here instead of only the two dark ones, which made the mutation
  // look conclusive on pages where the fill alone is fine.
  expect(
    tones.length,
    'no opaque colours were read from the launcher, so nothing was compared',
  ).toBeGreaterThanOrEqual(1)

  const PAD = 16
  const clip = {
    x: Math.max(0, box.x - PAD),
    y: Math.max(0, box.y - PAD),
    width: box.width + PAD * 2,
    height: box.height + PAD * 2,
  }
  const shot = (await page.screenshot({ clip })).toString('base64')

  return page.evaluate(
    async ({ shot, pad, tones }) => {
      const image = new Image()
      image.src = `data:image/png;base64,${shot}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0)
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data
      // Throws rather than returning undefined channels off the edge of the
      // clip: `undefined` becomes NaN, `NaN < 3` is false, and a truncated
      // screenshot would then report every side as passing.
      const at = (x: number, y: number) => {
        const px = Math.round(x)
        const py = Math.round(y)
        if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) {
          throw new Error(`sampled ${px},${py} outside the ${canvas.width}x${canvas.height} clip`)
        }
        const i = (py * canvas.width + px) * 4
        return [data[i], data[i + 1], data[i + 2]] as [number, number, number]
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

      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const radius = (canvas.width - pad * 2) / 2

      // Eight directions, because the launcher can straddle an edge in the
      // page behind it -- a card boundary, the end of a paragraph -- and be
      // perfectly visible on one side while vanishing on another.
      const directions = [
        ['E', 1, 0], ['SE', 0.7071, 0.7071], ['S', 0, 1], ['SW', -0.7071, 0.7071],
        ['W', -1, 0], ['NW', -0.7071, -0.7071], ['N', 0, -1], ['NE', 0.7071, -0.7071],
      ] as const

      return directions.map(([direction, dx, dy]) => {
        // Clear of the rings, and of the antialiasing either side of them, but
        // still the colour a visitor sees touching the control. The worst of
        // the three, so a light pixel next to a dark one does not average into
        // a pass.
        const behind = [6, 8, 10].map((offset) =>
          at(cx + dx * (radius + offset), cy + dy * (radius + offset)),
        )
        const best = Math.min(
          ...behind.map((background) =>
            Math.max(...tones.map((tone) => ratio(tone, background))),
          ),
        )
        return { direction, best }
      })
    },
    { shot, pad: PAD, tones },
  )
}

test.describe('chat launcher', () => {
  for (const surface of SURFACES) {
    test(`is visible against ${surface.on} at ${surface.width}x${surface.height} on ${surface.route}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: surface.width, height: surface.height })
      await page.goto(surface.route)
      if (surface.scrollY > 0) {
        await page.evaluate((y) => window.scrollTo(0, y), surface.scrollY)
        // The document has to be long enough to have reached the position the
        // label describes; landing short puts the control back on white.
        expect(
          await page.evaluate(() => Math.round(window.scrollY)),
          `the page did not scroll to ${surface.scrollY}, so this is not the surface it claims`,
        ).toBeGreaterThanOrEqual(surface.scrollY - 1)
      }

      const samples = await contrastAroundLauncher(page)

      // A walk that sampled nothing would report no failures, and so would a
      // launcher that had stopped rendering.
      expect(samples.length, 'no directions were sampled around the launcher').toBe(8)

      const failing = samples
        .filter((sample) => sample.best < REQUIRED_RATIO)
        .map((sample) => `${sample.direction} ${sample.best.toFixed(2)}:1`)

      expect(
        failing,
        `sides where the launcher is indistinguishable from what is behind it ` +
          `(WCAG 1.4.11 asks ${REQUIRED_RATIO}:1)`,
      ).toEqual([])
    })
  }
})

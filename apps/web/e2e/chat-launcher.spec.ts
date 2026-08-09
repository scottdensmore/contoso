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
 * Position is expressed as an `anchor` — a selector for the element the
 * launcher should be sitting on — rather than as a scroll offset. A pixel
 * offset only says how far down the document to go, and how far down the
 * document a given photograph is depends on how many products the catalogue
 * holds. `scrollY: 2400` put the launcher over a product image locally and
 * over white space on CI, where the seeded catalogue is a different length.
 *
 * Two things then check that the case is still what it claims. The anchor must
 * actually end up behind the launcher, which is geometry and exact. And the
 * background must fall inside `brightness`, which is coarse — it catches a
 * surface converging on the page background, not a change in local structure.
 *
 * Both matter because this file's whole job is to arbitrate whether each ring
 * on the control is still earning its place. A suite that had quietly become
 * eight readings of the same white page would go on passing while answering
 * that question wrongly.
 */
const SURFACES = [
  // Dark. The anchored ones are bounded loosely: which photograph the anchor
  // resolves to depends on the catalogue, so the band asserts "not the page
  // background" rather than a particular picture.
  {
    route: '/',
    width: 667,
    height: 375,
    on: 'the hero photograph, dark',
    anchor: '[class*="bg-hero-image"]',
    brightness: [0, 90],
  },
  {
    route: '/about',
    width: 390,
    height: 844,
    on: 'a photograph, dark',
    anchor: 'main img',
    brightness: [0, 175],
  },
  {
    route: '/',
    width: 390,
    height: 844,
    on: 'a product photograph, dark',
    anchor: 'main img',
    brightness: [0, 175],
  },
  // Light by the mean, and mixed underneath it — which is the interesting case
  // and the one the mean cannot see. `/about` unscrolled averages 224 while
  // individual directions land on the mountain photograph, and those are the
  // mid-luminance readings two tones cannot cover: removing the hairline fails
  // here at 2.57:1 while the mean stays where it is.
  { route: '/about', width: 390, height: 844, on: 'copy over a photograph edge', brightness: [195, 245] }, // 224
  { route: '/', width: 1440, height: 900, on: 'the page background beside a card', brightness: [190, 245] }, // 220
  // White.
  { route: '/faq', width: 390, height: 844, on: 'body copy, white', brightness: [230, 255] }, // 246
  { route: '/', width: 768, height: 1024, on: 'a product card, white', brightness: [230, 255] }, // 248
]

const REQUIRED_RATIO = 3

type Sample = { direction: string; best: number }
type Reading = { samples: Sample[]; brightness: number }

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
async function contrastAroundLauncher(page: Page): Promise<Reading> {
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

      const readings = directions.map(([direction, dx, dy]) => {
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
        return { direction, best, background: behind }
      })

      // The mean of every background pixel the walk looked at, which is what
      // the surface's declared band is checked against.
      const all = readings.flatMap((reading) => reading.background)
      const brightness =
        all.reduce((total, [r, g, b]) => total + (r + g + b) / 3, 0) / all.length

      return {
        samples: readings.map(({ direction, best }) => ({ direction, best })),
        brightness,
      }
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
      if (surface.anchor) {
        // Scroll so the anchor's centre meets the launcher's centre, rather
        // than to a fixed offset that means different things on different
        // catalogues.
        const moved = await page.evaluate((selector) => {
          const launcher = document.querySelector('[aria-label="Open chat"]')
          if (!launcher) return false
          const launcherBox = launcher.getBoundingClientRect()
          // Whichever match is in the launcher's column. The launcher hugs the
          // right edge, and at 390 the product grid is two columns wide, so the
          // first `main img` is on the left and scrolling it into line puts the
          // gutter behind the control rather than the picture.
          const target = Array.from(document.querySelectorAll(selector)).find((candidate) => {
            const box = candidate.getBoundingClientRect()
            return (
              Math.min(launcherBox.right, box.right) - Math.max(launcherBox.left, box.left) > 0 &&
              box.height > 0
            )
          })
          if (!target) return false
          const targetBox = target.getBoundingClientRect()
          window.scrollBy(
            0,
            targetBox.top +
              targetBox.height / 2 -
              (launcherBox.top + launcherBox.height / 2),
          )
          return true
        }, surface.anchor)
        expect(moved, `no element matched ${surface.anchor} on ${surface.route}`).toBe(true)

        // And it is actually behind the launcher now. This is the exact half of
        // the identity check: brightness can be fooled by a coincidentally dark
        // page, an overlap cannot.
        const overlaps = await page.evaluate((selector) => {
          const launcher = document.querySelector('[aria-label="Open chat"]')!
          const a = launcher.getBoundingClientRect()
          return Array.from(document.querySelectorAll(selector)).some((candidate) => {
            const b = candidate.getBoundingClientRect()
            return (
              Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0
            )
          })
        }, surface.anchor)
        expect(
          overlaps,
          `${surface.anchor} did not end up behind the launcher, so this is not ${surface.on}`,
        ).toBe(true)
      }

      // Every image on screen has finished before anything is sampled. The
      // below-the-fold cases scroll onto lazily loaded product photographs and
      // `scrollTo` returns before those arrive, so the walk could measure the
      // empty box where the picture is going to be — which is the page
      // background, turning a dark surface into a light one.
      //
      // Insurance rather than a demonstrated fix, and worth saying which: the
      // race would not reproduce here. A cold context throttled to 400kbps and
      // 300ms of latency reads 109 either way, the same as an unthrottled run.
      // What the wait buys is that the brightness band below cannot go red on
      // a slower machine for a reason that has nothing to do with contrast.
      await page.waitForFunction(() =>
        Array.from(document.querySelectorAll('img'))
          .filter((image) => {
            const box = image.getBoundingClientRect()
            return box.bottom > 0 && box.top < window.innerHeight && box.width > 0
          })
          .every((image) => image.complete && image.naturalWidth > 0),
      )

      const { samples, brightness } = await contrastAroundLauncher(page)

      // A walk that sampled nothing would report no failures, and so would a
      // launcher that had stopped rendering.
      expect(samples.length, 'no directions were sampled around the launcher').toBe(8)

      // Still the surface this case is named after. Without this, reaching the
      // scroll offset proves only that the document is long enough, and a case
      // that drifts onto white keeps passing while testing nothing the other
      // seven do not.
      const [darkest, lightest] = surface.brightness
      expect(
        Math.round(brightness),
        `this case is meant to sit on ${surface.on}, but the background around ` +
          `the launcher averages ${Math.round(brightness)} of 255`,
      ).toBeGreaterThanOrEqual(darkest)
      expect(
        Math.round(brightness),
        `this case is meant to sit on ${surface.on}, but the background around ` +
          `the launcher averages ${Math.round(brightness)} of 255`,
      ).toBeLessThanOrEqual(lightest)

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

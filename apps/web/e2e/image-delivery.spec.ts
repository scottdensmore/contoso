import { test, expect, type Page } from '@playwright/test'

/**
 * Images are requested at the size they are displayed.
 *
 * `next/image` picks a width from the srcset ladder using the `sizes`
 * attribute, so a `sizes` that does not describe the real box makes the browser
 * fetch the wrong file — and every other check passes, because the wrong file
 * still decodes and still fills the box. Nothing here is visible: the page
 * renders identically whether it downloaded 57 KiB or 132 KiB.
 *
 * A `fill` image is where this goes wrong quietly, because it has no `width`
 * prop sitting next to `sizes` looking inconsistent. Omit `sizes` entirely and
 * Next assumes `100vw`, which is right only for an image that spans the
 * viewport.
 */

/**
 * Widths where these layouts change the box, plus the ones that sit inside a
 * gap in the ladder. 412, 414 and 430 are common phone widths and 841-900
 * common desktop windows; those land on a box just above the 384 rung, which is
 * where a too-loose assertion hides. 640, 1024 and 1280 are grid breakpoints,
 * and 1224 is where a category card crosses 384 on its own.
 *
 * 1015 and 1016 are where a home card crosses 320, so a `sizes` that overstates
 * it by under a pixel still tips those two into the next rung at 2x — a real
 * defect that survived a first fix because nothing sat between 1024 and 1152.
 * 1017
 * is the width after it, where the card is 320.328 and genuinely does need the
 * larger rung: it fails if the box is rounded before being scaled by density,
 * which is the other way to get this wrong. 1105 and 1106 sit either side of
 * the home grid's 350px cap engaging.
 */
const WIDTHS = [
  390, 412, 414, 430, 574, 640, 768, 834, 841, 860, 900, 1015, 1016, 1017, 1024, 1105, 1106,
  1152, 1224, 1280, 1440,
]

/** Densities to exercise. Most traffic is not 1x, and 1x cannot see this. */
const DENSITIES = [1, 2]

/**
 * The surfaces that serve an optimised image, and how to find one.
 *
 * Neither catalogue path is hardcoded, for the reason `browse.spec.ts` gives: a
 * slug rots silently when the catalogue changes, and the page still renders for
 * a missing one. Each is resolved once per surface — following a link on every
 * one of the three dozen measurements doubles the page loads and runs the test
 * out of time.
 *
 * The category slug comes from the catalogue data rather than from a link,
 * because nothing on the home page links to a category: it lists products
 * directly. `browse.spec.ts` carries a fallback for the same reason.
 */
/**
 * Where each surface's LCP element is an image, and how many images it could be.
 *
 * Per surface and measured, because it is not uniform: on `/about` and the
 * product detail page the LCP element at 390 is a paragraph, and on the home
 * grid it is the hero heading at every width. Asserting eagerness where the
 * image is not the LCP element asserts something that is neither true nor
 * useful.
 *
 * `among` is why the category grid appears twice. At 1440 three cards share the
 * first row, and which one LCP reports is not derivable from the markup —
 * measured, they are 397.328, 397.328 and 397.344px, so the third is largest,
 * and the second wins anyway. Pinning this at 390 alone was not enough: there
 * only one card is above the fold, so reverting the fix to prioritise just that
 * card left this test green while costing 1184ms at desktop.
 */
const LCP_SURFACES: Record<
  string,
  { prioritised: number; at: { viewport: number; among: number }[] }
> = {
  'about mission': { prioritised: 1, at: [{ viewport: 1440, among: 1 }] },
  'home grid': { prioritised: 0, at: [] },
  'product detail': { prioritised: 1, at: [{ viewport: 1440, among: 1 }] },
  'category grid': {
    prioritised: 3,
    at: [
      { viewport: 390, among: 1 },
      { viewport: 1440, among: 3 },
    ],
  },
}

const SURFACES = [
  { name: 'about mission', resolve: async () => '/about' },
  { name: 'home grid', resolve: async () => '/' },
  {
    name: 'product detail',
    resolve: async (page: Page) => {
      await page.goto('/')
      // Not `/products/category/...`, which shares the prefix.
      return page
        .locator('a[href^="/products/"]:not([href*="/category/"])')
        .first()
        .getAttribute('href')
    },
  },
  {
    name: 'category grid',
    resolve: async (page: Page) => {
      const response = await page.goto('/categories.json')
      const categories = (await response?.json()) as { slug: string }[]
      return categories?.[0]?.slug ? `/products/category/${categories[0].slug}` : null
    },
  },
]

type Delivery = {
  box: number
  requested: number | null
  /** Candidates in the srcset, before parsing. The parse is checked against it. */
  offered: number
  ladder: number[]
}

/**
 * What the page rendered, and what it offered to render.
 *
 * The rung list comes from the served `srcset` rather than from a copy of
 * Next's defaults. A copy is wrong the moment either half moves — mine had a
 * `16` in it that Next has never emitted — and it is wrong silently, because a
 * phantom rung only matters for a box small enough to select it. Parsing what
 * was actually offered cannot drift from what was actually offered.
 */
async function deliveryOf(page: Page): Promise<Delivery> {
  return page.evaluate(() => {
    // The first image the optimiser served, not the first `img` — a surface may
    // carry an unoptimised logo or icon ahead of the one under measurement.
    const image = [...document.querySelectorAll('img')].find((candidate) =>
      candidate.currentSrc.includes('/_next/image'),
    )
    if (!image) throw new Error('no optimised image on the page')
    const candidates = (image.srcset || '').split(',').filter((part) => part.trim())
    return {
      // Unrounded. A grid column is routinely fractional — 320.328px at one
      // width here — and rounding it down before multiplying by the density
      // understates the need by up to half a device pixel, which is enough to
      // expect the rung below the one the browser correctly chose.
      box: image.getBoundingClientRect().width,
      requested: Number((image.currentSrc || '').match(/[?&]w=(\d+)/)?.[1]) || null,
      offered: candidates.length,
      ladder: candidates
        .map((candidate) => Number(candidate.trim().match(/\s(\d+)w$/)?.[1]))
        .filter((width) => Number.isFinite(width) && width > 0)
        .sort((a, b) => a - b),
    }
  })
}

/** Resolved once the browser has chosen a candidate for that first image. */
const waitForSelection = (page: Page) =>
  page.waitForFunction(() =>
    [...document.querySelectorAll('img')].some((image) =>
      image.currentSrc.includes('/_next/image'),
    ),
  )

/** The smallest rung the browser was offered that covers the device pixels. */
const expectedRung = (ladder: number[], box: number, density: number): number =>
  ladder.find((rung) => rung >= box * density) ?? ladder[ladder.length - 1]

test.describe('image delivery', () => {
  for (const surface of SURFACES) {
    test(`the ${surface.name} image is sized to its box`, async ({ browser }, testInfo) => {
      // One cold browser context per width and density, so 42 page loads a
      // surface. The cost is the loads, not the resizing: the optimiser caches
      // to disk across the whole run, so the home grid's 20 images resolve to
      // about 50 distinct resizes against some 600 requests. What differs
      // between surfaces is how many subresources each load waits on — 15 on
      // the home grid against 1 on the about page — which is why home takes
      // ~80s locally where about takes ~38.
      //
      // The e2e job took 8.4 minutes with one surface and 9.7 with three,
      // against a 35-minute job budget, so the job has room and this cap is the
      // only real exposure. 240s is three times the slowest local surface, on a
      // shared CI vCPU.
      test.setTimeout(240_000)

      const overfetched: Record<string, string> = {}

      const discovery = await browser.newContext({ baseURL: testInfo.project.use.baseURL })
      let path: string | null
      try {
        path = await surface.resolve(await discovery.newPage())
      } finally {
        await discovery.close()
      }
      expect(path, `found no link to the ${surface.name} surface`).toBeTruthy()

      // A fresh context per measurement, not one page resized between them.
      // Sharing a cache lets the browser keep a larger candidate it already has
      // rather than fetch the smaller one the new width calls for, so the second
      // and later widths measure the cache instead of `sizes`. Each pass here is
      // a new visitor, which is the case that matters.
      for (const density of DENSITIES) {
        for (const width of WIDTHS) {
          const at = `${width}@${density}x`
          const context = await browser.newContext({
            viewport: { width, height: 900 },
            deviceScaleFactor: density,
            baseURL: testInfo.project.use.baseURL,
          })
          try {
            const page = await context.newPage()
            await page.goto(path!)
            // Not `networkidle`: the session poll retries in the background on a
            // stack without auth configured, so the network never goes quiet and
            // this waits out the timeout. The signal wanted is narrower anyway —
            // the browser has chosen a candidate.
            await waitForSelection(page)

            const { box, requested, offered, ladder } = await deliveryOf(page)

            expect(requested, `no optimiser width at ${at} — is the image served through next/image?`).toBeTruthy()
            expect(box, `image had no box at ${at}`).toBeGreaterThan(0)
            // Against the srcset's own candidate count, not a magic number: a
            // parse that dropped rungs would make the comparison below trivially
            // true, and any floor picked instead coupled this to the encoding
            // contract, which is free to narrow the ladder without saying
            // anything about whether `sizes` is right.
            expect(ladder.length, `dropped srcset candidates while parsing at ${at}`).toBe(offered)
            expect(ladder.length, `an empty srcset at ${at}`).toBeGreaterThan(0)

            const expected = expectedRung(ladder, box, density)
            if (requested !== expected) {
              overfetched[at] =
                `${box.toFixed(2)}px box at ${density}x needs ${Math.ceil(box * density)}, ` +
                `asked for w=${requested}, expected w=${expected}`
            }
          } finally {
            // A context from the `browser` fixture is not closed for us, and an
            // assertion above can leave the loop early.
            await context.close()
          }
        }
      }

      expect(
        overfetched,
        `${surface.name}: cases where the request is not the smallest rung covering the box`,
      ).toEqual({})
    })
  }

  // Not `LCP_SURFACES[name] ?? {...}`: a renamed surface would fall through to
  // an empty list and silently stop generating its tests, and a shorter list is
  // not something anyone reads.
  //
  // The two directions fail differently, and only one of them is this test. A
  // key here with no surface is what it catches and names. A surface with no
  // key destructures `undefined` at collection time, so the file fails to load
  // and this test never runs to say so -- still red, just less legibly.
  test('every surface has an LCP entry', () => {
    expect(Object.keys(LCP_SURFACES).sort()).toEqual(SURFACES.map((s) => s.name).sort())
  })

  for (const surface of SURFACES) {
    const { prioritised, at } = LCP_SURFACES[surface.name]
    for (const { viewport, among } of at) {
      test(`the ${surface.name} LCP image is not lazy at ${viewport}px`, async ({ page }) => {
        // Lazy-loading the LCP element defers its request until layout says it
        // is near the viewport, which is exactly the request that should start
        // first.
        //
        // Asserted in two parts, because either alone can pass while the page
        // is wrong. That LCP still lands on one of the images this page
        // prioritises — if a layout change moves it to a heading, or to a
        // fourth card, the assertion below would be measuring the wrong
        // element and should fail rather than quietly hold. And that every one
        // of those images is eager, since which of them LCP reports is not
        // predictable from the markup.
        await page.setViewportSize({ width: viewport, height: 844 })
        await page.goto((await surface.resolve(page))!)
        await page.waitForFunction(() =>
          [...document.querySelectorAll('img')].some(
            (image) => image.currentSrc.includes('/_next/image') && image.complete
          )
        )

        const result = await page.evaluate(
          () =>
            new Promise<{
              lcpIndex: number
              eager: number[]
              candidates: number
              preloads: number
            }>((resolve) => {
              let element: Element | null = null
              new PerformanceObserver((list) => {
                const entries = list.getEntries()
                element = (entries[entries.length - 1] as unknown as { element: Element }).element
              }).observe({ type: 'largest-contentful-paint', buffered: true })
              setTimeout(() => {
                const optimised = [...document.querySelectorAll('img')].filter((image) =>
                  image.currentSrc.includes('/_next/image')
                )
                resolve({
                  lcpIndex: optimised.indexOf(element as HTMLImageElement),
                  eager: optimised.flatMap((i, n) => (i.loading === 'lazy' ? [] : [n])),
                  candidates: optimised.length,
                  // Scoped to the optimiser, like `optimised` above. react-dom
                  // preloads any non-lazy `<img>`, including plain ones no
                  // `next/image` ever touched -- `components/header.tsx`
                  // already renders one for a signed-in avatar. Counting every
                  // image preload on the page would fail all four of these
                  // tests the day a shared component grows an `<img>`, for a
                  // reason that has nothing to do with LCP prioritisation.
                  preloads: [
                    ...document.querySelectorAll<HTMLLinkElement>(
                      'link[rel="preload"][as="image"]'
                    ),
                  ].filter((link) =>
                    `${link.getAttribute('imagesrcset') ?? ''}${link.href}`.includes(
                      '/_next/image'
                    )
                  ).length,
                })
              }, 700)
            })
        )

        // Without this the two assertions below do not compose: `lcpIndex <
        // among` and "the first `prioritised` are eager" only imply the LCP
        // image was eager while `among` is inside `prioritised`. A table entry
        // that widened `among` past it would pass with a lazy LCP element,
        // which is the one thing this file exists to catch.
        expect(
          prioritised,
          `${surface.name} prioritises ${prioritised} images but LCP is allowed to land within ${among}`,
        ).toBeGreaterThanOrEqual(among)
        expect(
          result.candidates,
          `fewer than ${among} optimised images on the page, so this asserts less than it reads`,
        ).toBeGreaterThanOrEqual(among)

        // The preload is what the measured gain actually comes from, so assert
        // it rather than inferring it from `img.loading`.
        //
        // What it does not catch, because it is worth knowing what is not
        // being tested: swapping `priority` for `loading="eager"`. That reads
        // like it would ship no preloads -- `get-img-props` sets
        // `meta.preload = preload || priority`, and nothing reassigns it --
        // but react-dom 19.2's server renderer preloads every `<img>` in its
        // own right unless it is `loading="lazy"`, has no string src/srcSet,
        // is `fetchPriority="low"`, or sits inside a `<picture>`/`<noscript>`.
        // So the swap emits the same three preloads and this assertion passes,
        // correctly: on this stack the two spellings are equivalent. Measured
        // both ways -- eager 3, all-lazy 0.
        //
        // Which leaves this close to implied by the eager assertion below. It
        // earns its place by pinning that equivalence: if react-dom stops
        // preloading eager images, or something adds `fetchPriority="low"`,
        // the eager count stays right and this is what fails.
        expect(
          result.preloads,
          `${surface.name} emitted ${result.preloads} image preloads, not ${prioritised}`,
        ).toBe(prioritised)

        // Which images are eager, exactly — not "at least these". Asserting
        // only that the first few are eager passes just as happily when every
        // image on the page is, and prioritising everything prioritises
        // nothing: the preloads then compete with each other for the same pipe.
        expect(
          result.eager,
          `the eager images at ${viewport}px are not exactly the first ${prioritised}`,
        ).toEqual([...Array(prioritised).keys()])

        expect(
          result.lcpIndex,
          `at ${viewport}px LCP landed on optimised image ${result.lcpIndex}, outside the first ${among} this page prioritises, so the assertion above is protecting the wrong ones`,
        ).toBeLessThan(among)
        expect(result.lcpIndex, `LCP did not land on an optimised image at all`).toBeGreaterThanOrEqual(0)
      })
    }
  }
})

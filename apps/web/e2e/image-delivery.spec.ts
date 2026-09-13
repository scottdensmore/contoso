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
 * Width and density sweeps are configured per surface on SURFACES rather than
 * shared globally. Running a single uniform sweep across all surfaces produced
 * 42 cold page loads per surface where most loads could not fail (e.g. on the
 * home grid, the card is never wider than 350px, so 1x at every width expects
 * the 384 floor and has no red phase).
 *
 * Each surface record defines only the critical widths and densities that
 * test its layout breakpoints, fixed caps, and rounding boundaries.
 */

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

type SurfaceSweep = {
  density: number
  widths: number[]
}

type Surface = {
  name: string
  resolve: (page: Page) => Promise<string | null>
  densities?: number[]
  widths?: number[]
  sweeps: SurfaceSweep[]
}

const SURFACES: Surface[] = [
  {
    name: 'about mission',
    resolve: async () => '/about',
    // Failure modes caught by width & density sweeps:
    // - 390@1x, 390@2x: Single-column mobile container layout (calc(100vw - 24px)).
    //   Catches overfetching where full viewport (100vw) is assumed without accounting for mobile margins.
    // - 1024@1x, 1024@2x: Two-column grid layout (calc(50vw - 36px)).
    //   Catches failure to halve the viewport percentage or omitting gap/margin calculations.
    // - 1280@1x, 1280@2x: Grid container cap breakpoint (xl) where the column fixes at 604px.
    //   Catches boundary condition errors at breakpoint transition.
    // - 1440@1x, 1440@2x: Wide desktop layout testing the 604px fixed cap.
    //   Catches uncapped sizes attributes that scale past 604px on wide screens.
    densities: [1, 2],
    widths: [390, 1024, 1280, 1440],
    sweeps: [
      { density: 1, widths: [390, 1024, 1280, 1440] },
      { density: 2, widths: [390, 1024, 1280, 1440] },
    ],
  },
  {
    name: 'home grid',
    resolve: async () => '/',
    // Failure modes caught by width & density sweeps:
    // The home card is never wider than 350px and the ladder floor is 384, so a 1x pass
    // at every width expects w=384 and has no red phase to catch layout regressions.
    // - Baseline 1x check (390, 1440): Verifies mobile and desktop floor selection.
    // - 900@2x: 3-column layout below breakpoint; verifies scaling before 1015.
    // - 1015@2x, 1016@2x: Card width approaches 320px (<= 640 device pixels, expects w=640).
    //   Catches sizes overstating card width by < 1px, which would prematurely tip into w=750.
    // - 1017@2x: Card width is 320.328px (> 640 device pixels, expects w=750).
    //   Catches rounding the box width down before scaling by density.
    // - 1105@2x, 1106@2x: Sits either side of the home grid's 350px cap engaging
    //   ((min-width: 1106px) 350px). 1105 tests max unconstrained width; 1106 tests cap engagement.
    // - 1440@2x: Wide desktop layout verifying that the 350px cap holds without unbounded scaling.
    densities: [1, 2],
    sweeps: [
      { density: 1, widths: [390, 1440] },
      { density: 2, widths: [900, 1015, 1016, 1017, 1105, 1106, 1440] },
    ],
  },
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
    // Failure modes caught by width & density sweeps:
    // The product detail hero image has max-w-[550px] capping the box from 574px viewport.
    // - 390@1x, 390@2x: Mobile full-width layout (calc(100vw - 24px)).
    //   Catches missing margin subtraction or unconstrained 100vw assumptions.
    // - 574@1x, 574@2x: Exact breakpoint where max-w-[550px] cap engages ((min-width: 574px) 550px).
    //   Catches premature or delayed cap activation.
    // - 1024@1x, 1024@2x: Desktop container layout with fixed 550px image box.
    //   At 2x (1100 device px), catches failure to select the ceiling rung (w=1080).
    // - 1440@1x, 1440@2x: Wide desktop layout ensuring 550px cap holds rather than expanding with viewport.
    densities: [1, 2],
    widths: [390, 574, 1024, 1440],
    sweeps: [
      { density: 1, widths: [390, 574, 1024, 1440] },
      { density: 2, widths: [390, 574, 1024, 1440] },
    ],
  },
  {
    name: 'category grid',
    resolve: async (page: Page) => {
      const response = await page.goto('/categories.json')
      const categories = (await response?.json()) as { slug: string }[]
      return categories?.[0]?.slug ? `/products/category/${categories[0].slug}` : null
    },
    // Failure modes caught by width & density sweeps:
    // Category grid columns change across breakpoints (1 col -> 2 col -> 3 col -> 398px cap at 1280px).
    // - 390@1x, 390@2x: 1-column mobile layout (calc(100vw - 24px)).
    //   Catches unconstrained full viewport requests.
    // - 640@1x, 640@2x: Boundary breakpoint transition from 1-column to 2-column (calc(50vw - 24px)).
    //   Catches off-by-one breakpoint errors.
    // - 834@1x, 834@2x: Mid-range 2-column tablet layout.
    //   Catches 2-column formula errors before the 3-column transition.
    // - 1024@1x, 1024@2x: Breakpoint transition from 2-column to 3-column (calc(100vw / 3 - 24px)).
    //   Card is ~317px; catches using desktop 398px/400px sampled width prematurely.
    // - 1224@1x, 1224@2x: Where category card crosses 384px on its own.
    //   Catches threshold crossing errors between 384 and 512/640 rungs.
    // - 1440@1x, 1440@2x: Wide desktop layout where container stops growing at xl (capped at 398px).
    //   Catches failure to cap column width at 1280px+.
    densities: [1, 2],
    widths: [390, 640, 834, 1024, 1224, 1440],
    sweeps: [
      { density: 1, widths: [390, 640, 834, 1024, 1224, 1440] },
      { density: 2, widths: [390, 640, 834, 1024, 1224, 1440] },
    ],
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
      // One cold browser context per measurement, trimmed per-surface to its
      // critical boundaries (8 to 12 page loads per surface instead of 42).
      // 60s provides generous headroom for the slowest surface (category grid at 12 loads)
      // even on a shared CI runner.
      testInfo.setTimeout(60_000)

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
      for (const { density, widths } of surface.sweeps) {
        for (const width of widths) {
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

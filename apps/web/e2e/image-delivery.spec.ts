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
 */
const WIDTHS = [
  390, 412, 414, 430, 574, 640, 768, 834, 841, 860, 900, 1024, 1152, 1224, 1280, 1440,
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
const SURFACES = [
  { name: 'about mission', resolve: async () => '/about' },
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
  loading: string
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
      box: Math.round(image.getBoundingClientRect().width),
      requested: Number((image.currentSrc || '').match(/[?&]w=(\d+)/)?.[1]) || null,
      offered: candidates.length,
      ladder: candidates
        .map((candidate) => Number(candidate.trim().match(/\s(\d+)w$/)?.[1]))
        .filter((width) => Number.isFinite(width) && width > 0)
        .sort((a, b) => a - b),
      loading: image.loading,
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
      // Thirty-two cold page loads, one per width and density, each making the
      // optimiser resize for a combination it has not cached. Locally the
      // slowest surface takes 48s; `test.slow()` would allow 90s, and CI runs
      // this inside the container on a shared vCPU where those resizes are the
      // bottleneck — near enough to the limit to time out under load rather
      // than fail for a reason worth reading.
      test.setTimeout(180_000)

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
              overfetched[at] = `${box}px box at ${density}x asked for w=${requested}, expected w=${expected}`
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

  test('the about page mission image is not lazy, because it is the LCP element', async ({ page }) => {
    // Measured rather than assumed: at every width but the narrowest, this
    // image is what largest-contentful-paint reports. Lazy-loading the LCP
    // element defers the request until layout says it is near the viewport,
    // which is exactly the request that should start first.
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/about')
    // See the note above: the session poll keeps the network busy, and the
    // signal wanted is that the image has painted.
    await page.waitForFunction(
      () => document.querySelector<HTMLImageElement>('img[alt="Our Mission"]')?.complete === true,
    )

    const isLcp = await page.evaluate(
      () =>
        new Promise<boolean>((resolve) => {
          let element: Element | null = null
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            element = (entries[entries.length - 1] as unknown as { element: Element }).element
          }).observe({ type: 'largest-contentful-paint', buffered: true })
          setTimeout(
            () => resolve(element === document.querySelector('img[alt="Our Mission"]')),
            500,
          )
        }),
    )

    expect(isLcp, 'this test is about the LCP element; it is no longer the LCP element').toBe(true)
    expect((await deliveryOf(page)).loading).not.toBe('lazy')
  })
})

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
 * Widths where this app's layout changes the box, plus the ones that sit
 * inside a gap in the ladder below. 412, 414 and 430 are common phone widths
 * and 841-900 common desktop windows; all of them land on a box just above the
 * 384 rung, which is where a too-loose assertion hides.
 */
const WIDTHS = [390, 412, 414, 430, 640, 768, 834, 841, 860, 900, 1024, 1280, 1440]

/** Densities to exercise. Most traffic is not 1x, and 1x cannot see this. */
const DENSITIES = [1, 2]

type Delivery = {
  box: number
  requested: number | null
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
async function deliveryOf(page: Page, alt: string): Promise<Delivery> {
  return page.evaluate((alt) => {
    const image = document.querySelector<HTMLImageElement>(`img[alt="${alt}"]`)
    if (!image) throw new Error(`no image with alt "${alt}"`)
    return {
      box: Math.round(image.getBoundingClientRect().width),
      requested: Number((image.currentSrc || '').match(/[?&]w=(\d+)/)?.[1]) || null,
      ladder: (image.srcset || '')
        .split(',')
        .map((candidate) => Number(candidate.trim().match(/\s(\d+)w$/)?.[1]))
        .filter((width) => Number.isFinite(width) && width > 0)
        .sort((a, b) => a - b),
      loading: image.loading,
    }
  }, alt)
}

/** The smallest rung the browser was offered that covers the device pixels. */
const expectedRung = (ladder: number[], box: number, density: number): number =>
  ladder.find((rung) => rung >= box * density) ?? ladder[ladder.length - 1]

test.describe('image delivery', () => {
  test('the about page mission image is sized to its box', async ({ browser }, testInfo) => {
    // Two dozen cold page loads, one per width and density.
    test.slow()

    const overfetched: Record<string, string> = {}
    const laddersSeen: number[] = []

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
          await page.goto('/about')
          // Not `networkidle`: the session poll retries in the background on a
          // stack without auth configured, so the network never goes quiet and
          // this waits out the timeout. The signal wanted is narrower anyway —
          // the browser has chosen a candidate.
          await page.waitForFunction(
            () => !!document.querySelector<HTMLImageElement>('img[alt="Our Mission"]')?.currentSrc,
          )

          const { box, requested, ladder } = await deliveryOf(page, 'Our Mission')

          expect(requested, `no optimiser width at ${at} — is the image served through next/image?`).toBeTruthy()
          expect(box, `image had no box at ${at}`).toBeGreaterThan(0)
          expect(ladder.length, `no w descriptors in the srcset at ${at}`).toBeGreaterThan(0)
          laddersSeen.push(ladder.length)

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

    // The rung list is parsed, so a parse that silently yielded one candidate
    // would make every comparison above trivially true.
    expect(Math.min(...laddersSeen), 'the srcset offered too few candidates to be measuring anything').toBeGreaterThan(3)
    expect(overfetched, 'cases where the request is not the smallest rung covering the box').toEqual({})
  })

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
    expect((await deliveryOf(page, 'Our Mission')).loading).not.toBe('lazy')
  })
})

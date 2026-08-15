import { test, expect, type Page } from '@playwright/test'

/**
 * The listing pages request images for cards the visitor can reach, not for
 * every card on the page.
 *
 * `loading="lazy"` is not a viewport test. Chrome fetches lazy images within a
 * threshold that is far larger than the viewport, measured here at roughly
 * 3900px: at 1440x900 the home page's document is 5038px tall and it fetched
 * 18 of its 20 product images before any scrolling, the deepest one 4.3
 * viewports down. Only about three are on screen.
 *
 * Each of those is a separate `sharp` decode-and-resize of a 1024px source. On
 * a two-core runner they measured a median of 2343ms each, and an unrelated
 * navigation issued while they were in flight went from 78ms to 500ms. In CI,
 * where the browser, database and chat service share those two cores, the same
 * contention aborted a navigation outright and failed `browse.spec.ts` (#230).
 *
 * So the defect is the count, not the cost per image: most of that work is for
 * cards nobody has scrolled to. These journeys pin the count down.
 *
 * They deliberately measure requests to `/_next/image` rather than `<img>`
 * elements or `loading` attributes. The attribute is already correct and has
 * been throughout — asserting on it would pass on today's tree and prove
 * nothing. What went wrong is only visible in what the browser actually asked
 * the server for.
 *
 * **Only the home page, for now.** The category grid is worse, not merely
 * similar: measured the same way at 1440x900, `/products/category/tents`
 * requests **21 of its 21** images before any scrolling, on a 3965px document
 * that Chrome's threshold swallows whole. It is tracked in #263 and left out
 * here as a slice boundary, not because it is hard to reach — the composed
 * stack these journeys run against has the seeded database, and
 * `image-delivery.spec.ts` already measures that surface across 21 widths.
 * What keeps it out is that its `priority={i < 3}` cutoff is an open question
 * of its own in #180, and answering both at once would tangle them.
 */

/** Distinct optimiser URLs requested, recorded from navigation onward. */
function trackOptimiserRequests(page: Page): Set<string> {
  const seen = new Set<string>()
  page.on('request', (request) => {
    const url = request.url()
    if (url.includes('/_next/image')) seen.add(url)
  })
  return seen
}

const PRODUCT_CARD =
  'a[href^="/products/"]:not([href^="/products/category/"])'

/**
 * Above this and the page is doing speculative work again; the pre-fix tree
 * measured 18. Deliberately not pinned to an exact number: the count that
 * matters is "a small multiple of what is on screen", and tying it to one
 * integer would make an unrelated layout change look like this regression.
 *
 * 12 rather than 8, because the two knobs that set the real count are tuned
 * against pop-in rather than against this bound, and 8 silently forbade both.
 * At a 1200px margin with the first two categories eager, the count measured 9
 * at desktop and tablet and 5 at phone; Chrome unaided fetches 20. A bound at
 * 8 would have made either knob look like a regression while the page was
 * getting better.
 */
const MAX_INITIAL_REQUESTS = 12

test.describe('listing image deferral', () => {
  test('the home page does not optimise every card before it is scrolled to', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const requested = trackOptimiserRequests(page)

    await page.goto('/')
    // Long enough that a browser intending to fetch these has done so: the
    // slowest optimisation measured on a constrained server was 3253ms, and
    // the request is issued long before it completes.
    await page.waitForTimeout(3000)

    const cards = await page.locator(PRODUCT_CARD).count()
    // Vacuity: with no cards, or one, the bound below is satisfied by a page
    // that renders nothing at all.
    expect(cards, 'home page rendered no product grid to measure').toBeGreaterThan(
      MAX_INITIAL_REQUESTS,
    )

    expect(
      requested.size,
      `${requested.size} optimiser requests for ${cards} cards before scrolling`,
    ).toBeLessThanOrEqual(MAX_INITIAL_REQUESTS)
  })

  test('scrolling loads the images that were deferred', async ({ page }) => {
    // The default 30s does not fit this journey on a cold cache. The largest
    // term is `page.goto`, which waits for `load` and so waits on the nine
    // optimisations the first screen starts — about a second each at two
    // cores, per the still-pending measurement in #230 — before the two 3s
    // waits and a poll that itself waits out the last row's share of eleven
    // queued jobs. Run inside the full suite it fits, because `browse.spec.ts`
    // sorts first under `workers: 1` and warms the same `w=384` variants; run
    // on its own against a fresh stack, which is what AGENTS.md step 4 asks
    // for, it does not. `image-delivery.spec.ts` raises its own for the same
    // reason.
    test.setTimeout(60_000)
    await page.setViewportSize({ width: 1440, height: 900 })
    const requested = trackOptimiserRequests(page)

    await page.goto('/')
    await page.waitForTimeout(3000)
    const initial = requested.size

    // What this catches that the first journey cannot: deferral that never
    // resolves. An image that is simply never requested also satisfies a bound
    // on the initial count, and the page would look identical until you scroll.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(3000)

    expect(
      requested.size,
      `scrolling to the bottom requested no further images (still ${initial})`,
    ).toBeGreaterThan(initial)

    // Every card that is now on screen has to have a decoded image, not just a
    // request in flight — a deferred image that 404s would still count above.
    //
    // Polled rather than waited out. The assertion above needs requests
    // *issued*, which 3s covers many times over; this one needs them
    // *decoded*, and the two are far apart on a cold cache. Landing at the
    // bottom of the document brings the remaining deferred cards inside the
    // margin at once — about eleven optimisations queued together — and the
    // measurements at the top of this file put each at a 2343ms median on two
    // cores. A fixed 3s here would fail a page that is behaving correctly,
    // with `retries: 0`, which is the class of CI failure #230 exists to
    // remove. 15s fits inside the raised budget set at the top of this test.
    await expect
      .poll(
        () =>
          page.evaluate(
            (selector) =>
              [...document.querySelectorAll(`${selector} img`)].filter((img) => {
                const image = img as HTMLImageElement
                const box = image.getBoundingClientRect()
                const onScreen = box.top < window.innerHeight && box.bottom > 0
                return onScreen && image.naturalWidth === 0
              }).length,
            PRODUCT_CARD,
          ),
        {
          timeout: 15_000,
          message: 'on-screen cards whose image did not decode',
        },
      )
      .toBe(0)
  })
})

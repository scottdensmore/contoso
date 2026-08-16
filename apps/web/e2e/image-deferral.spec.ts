import { test, expect, type Page } from '@playwright/test'

/**
 * The listing pages request images for cards the visitor can reach, not for
 * every card on the page.
 *
 * `loading="lazy"` is not a viewport test. Chrome fetches lazy images within a
 * threshold measured at roughly 3900px: at 1440x900 the home page's document
 * is 5038px tall and it fetched 18 of its 20 product images before any
 * scrolling, and the category grid's document is 3965px, so it fetched all 21.
 *
 * Each is a separate `sharp` decode-and-resize of a 1024px source. On a
 * two-core runner they measured a median of 2343ms each, and an unrelated
 * navigation issued while they were in flight went from 78ms to 500ms. In CI,
 * where the browser, database and chat service share those two cores, the same
 * contention aborted a navigation outright and failed `browse.spec.ts` (#230).
 *
 * So the defect is the count, not the cost per image. `content-visibility:
 * auto` on each card's box is what bounds it: the browser skips rendering an
 * off-screen subtree and does not fetch images inside one (#273).
 *
 * These journeys measure requests to `/_next/image` rather than `<img>`
 * elements, `loading` attributes or the CSS declaration itself. The attribute
 * was already correct throughout and the declaration is a declaration —
 * asserting on either would pass on a tree where nothing works. What went
 * wrong is only visible in what the browser actually asked the server for.
 *
 * **Both surfaces, different bounds.** They differ in card count, document
 * height and what is preloaded: the category grid keeps `priority={i < 3}`,
 * whose cutoff is argued from largest-contentful-paint rather than from
 * anything here (#180).
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
 * 12 rather than 8: with `content-visibility` the count measured 9 at desktop,
 * 12 at tablet and 5 at phone, against the 18 Chrome fetches unaided. A bound
 * at 8 would call the tablet figure a regression while the page is doing a
 * third of the work it used to.
 */
const MAX_INITIAL_REQUESTS = 12

/** The category surface, which has more cards on a shorter document. */
const CATEGORY_PATH = '/products/category/tents'

/**
 * The category grid's `priority={i < 3}` cutoff, named because the preload
 * count *is* this number and the assertion below should say so rather than
 * repeat the literal.
 *
 * It used to carry a second job — a vacuity floor for a journey that only
 * measured cards on the first screen — and that journey is gone with the
 * mechanism it guarded. What replaced it asserts about every card on the page,
 * so it needs no floor tied to this cutoff.
 */
const CATEGORY_PRIORITY_CARDS = 3

/**
 * The category grid's own bound. Higher than the home page's because the grid
 * is denser and the document shorter — 21 cards in 3965px against 20 in 5038 —
 * so a margin measured for one surface reaches proportionally more of the
 * other. Measured with `content-visibility`: 12 at desktop, 10 at tablet and 4
 * at phone, against 21, 16 and 7 before it.
 *
 * 15 leaves room for the grid gaining a row without this reading as the
 * regression it is meant to catch, which is the whole page being fetched at
 * once. Anything at or near 21 is that regression.
 */
const MAX_INITIAL_CATEGORY_REQUESTS = 15

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

  test('the category grid does not optimise every card before it is scrolled to', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    const requested = trackOptimiserRequests(page)

    await page.goto(CATEGORY_PATH)
    await page.waitForTimeout(3000)

    const cards = await page.locator(PRODUCT_CARD).count()
    // Vacuity: this surface needs a database, so an empty grid is a plausible
    // way for the bound below to be satisfied by nothing rendering at all.
    expect(cards, `${CATEGORY_PATH} rendered no product grid to measure`).toBeGreaterThan(
      MAX_INITIAL_CATEGORY_REQUESTS,
    )

    expect(
      requested.size,
      `${requested.size} optimiser requests for ${cards} cards before scrolling`,
    ).toBeLessThanOrEqual(MAX_INITIAL_CATEGORY_REQUESTS)
  })

  test('every card ships its image in the HTML, so a blocked script cannot empty the grid', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    // Scripting stays on and the chunks are blocked, which is the state this
    // asserts about: a chunk that 404s after a deploy, a content blocker, a
    // CSP rejection, a dropped request. `javaScriptEnabled: false` would be
    // the wrong tool — with scripting off, `<noscript>` content becomes live
    // DOM, so a page could pass this while shipping nothing usable to the
    // state that actually occurs.
    let aborted = 0
    await page.route('**/_next/static/**/*.js', (route) => {
      aborted += 1
      return route.abort()
    })

    await page.goto(CATEGORY_PATH)

    // The abort is the precondition, and a glob that stops matching fails
    // open: pointing it at a path Next does not use leaves every assertion
    // below passing, because nothing here needs hydration to succeed.
    expect(aborted, 'blocked no script chunks, so this proves nothing').toBeGreaterThan(0)

    const cards = await page.locator(PRODUCT_CARD).count()
    const withImage = await page.evaluate((selector) => {
      const boxes = [...document.querySelectorAll(`${selector} div.aspect-square`)]
      return boxes.filter((box) => box.querySelector('img')).length
    }, PRODUCT_CARD)

    expect(cards, `${CATEGORY_PATH} rendered no product grid to measure`).toBeGreaterThan(
      MAX_INITIAL_CATEGORY_REQUESTS,
    )

    // Every one, not just the first screen. This is what #273 bought over the
    // IntersectionObserver it replaced: that mechanism put 6 to 12 images in
    // the HTML and left the rest as empty boxes with no `<noscript>` recourse
    // when a chunk failed (#261). Deferral here costs the browser nothing to
    // undo, because it never needed JavaScript to begin with.
    expect(withImage, 'cards whose image is not in the server-rendered HTML').toBe(cards)
  })

  test('the category grid still preloads its first row', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(CATEGORY_PATH)

    // What this catches that a request count cannot: deferral swallowing the
    // `priority` cutoff. Those three preloads are tuned against
    // largest-contentful-paint — the reasoning is in the page, and it measured
    // 2892ms against 4048 at this width — and a component that deferred them
    // would leave every count here looking better while the page got slower.
    // Scoped to the optimiser, the way `image-delivery.spec.ts` scopes its
    // own preload counts and for the same reason: `header.tsx` renders the
    // signed-in avatar as a plain non-lazy `<img>`, which react-dom preloads
    // in its own right. The suite runs signed out today, so an unscoped count
    // would pass for the right reason now and fail with this message -- which
    // would then be false -- the day the shared header gains one.
    const preloaded = await page
      .locator('link[rel="preload"][as="image"][imagesrcset*="/_next/image"]')
      .count()
    expect(preloaded, 'the first row is no longer preloaded').toBe(CATEGORY_PRIORITY_CARDS)
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

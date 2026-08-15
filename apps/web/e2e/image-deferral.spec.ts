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
 * **Both listing surfaces.** The category grid was worse than the home page,
 * not merely similar: at 1440x900 `/products/category/tents` requested **21 of
 * its 21** images before any scrolling, on a 3965px document that Chrome's
 * threshold swallows whole. The two surfaces share `DeferredImage` but not
 * their bounds, because they differ in card count and in what is preloaded —
 * the category grid keeps `priority={i < 3}`, whose cutoff is measured against
 * largest-contentful-paint rather than against anything here. See #263.
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

/** The category surface, which has more cards on a shorter document. */
const CATEGORY_PATH = '/products/category/tents'

/**
 * The category grid's `priority={i < 3}` cutoff, named because two assertions
 * below depend on it meaning the same thing: the preload count *is* this
 * number, and the first-screen journey only asserts anything once a card
 * beyond it is visible. Those cards carry an image whatever `eager` is set to,
 * since `priority` implies eager, so a floor at or below this measures nothing.
 */
const CATEGORY_PRIORITY_CARDS = 3

/**
 * The category grid's own bound. Higher than the home page's because the grid
 * is denser and the document shorter — 21 cards in 3965px against 20 in 5038 —
 * so a margin measured for one surface reaches proportionally more of the
 * other. Measured after the fix: 12 at desktop, 8 at tablet, 6 at phone,
 * against 21, 16 and 7 before it. Phone is 6 rather than 4 because
 * `eager={i < 6}` covers two cards outside the margin at that width — the
 * price of a whole first screen, paid where the grid is a single column.
 *
 * 15 leaves room for the grid gaining a row without this reading as the
 * regression it is meant to catch, which is the whole page being fetched at
 * once. Anything at or near 21 is that regression.
 *
 * This bounds the count from *above* only, which is deliberately not enough on
 * its own: narrowing `eager` makes every number here smaller and every
 * assertion greener while putting first-screen cards back behind hydration.
 * That direction is held by the first-screen journey below, not by this
 * constant.
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

  test('every card on the first screen is server-rendered, not waiting on hydration', async ({
    page,
  }) => {
    // 834x1112, because that is where the hole was: the grid is
    // `sm:grid-cols-2` here, so card 3 opens the second row and sits 251px on
    // screen -- the same 251px #180 records. At 1440x900 the equivalent cards
    // are only 63px down, which is why this asserts at the tablet width.
    await page.setViewportSize({ width: 834, height: 1112 })

    // Hydration is blocked, not JavaScript. `javaScriptEnabled: false` would
    // be the obvious way and is worse than useless here: with scripting off,
    // `<noscript>` content becomes live DOM, so `DeferredImage`'s fallback
    // makes every card report an image and this passes on 21 of 21 whether or
    // not anything was server-rendered -- it passes with `eager` deleted.
    // Blocking the chunks instead leaves scripting on and the observer never
    // running, so nothing can heal the state before it is read. Measured, the
    // two approaches differ 6 against 21.
    //
    // The `*.js` suffix is deliberate, not decoration: Next 16.3 with Turbopack
    // serves the stylesheet out of `_next/static/chunks/` alongside the script
    // chunks, so the obvious `**/_next/static/chunks/**` blocks the CSS and
    // collapses the grid to one column -- which would trip the floor below
    // with a message about cards while the real cause was the stylesheet.
    let aborted = 0
    await page.route('**/_next/static/**/*.js', (route) => {
      aborted += 1
      return route.abort()
    })

    await page.goto(CATEGORY_PATH)

    // The abort is this journey's precondition, and a glob that stops matching
    // fails open: measured, pointing it at `**/*.mjs` or at `_next/chunks/**`
    // leaves `aborted` at 0 and every assertion below still passes, because on
    // a fast machine the read beats hydration anyway. That would quietly turn a
    // deterministic check into a race -- green here, and green-while-broken on
    // the two-core runner this file keeps citing. Measured at 10 aborts.
    expect(aborted, 'blocked no script chunks, so hydration was not prevented').toBeGreaterThan(0)

    const naked = await page.evaluate((selector) => {
      const boxes = [...document.querySelectorAll(`${selector} div.aspect-square`)]
      const onScreen = boxes.filter((box) => {
        const rect = box.getBoundingClientRect()
        return rect.top < window.innerHeight && rect.bottom > 0
      })
      return {
        onScreen: onScreen.length,
        withoutImage: onScreen.filter((box) => !box.querySelector('img')).length,
      }
    }, PRODUCT_CARD)

    // Vacuity, and the literal is the `priority` cutoff rather than a round
    // number: cards below it carry an image whatever `eager` is, so unless a
    // card *beyond* it is on screen this journey asserts nothing about the
    // thing it exists for. Relaxing this to `> 0` would look like loosening a
    // brittle constant and would silently restore that vacuity.
    expect(
      naked.onScreen,
      `only ${naked.onScreen} cards on the first screen, so this asserts ` +
        `nothing past the priority cutoff of ${CATEGORY_PRIORITY_CARDS}`,
    ).toBeGreaterThan(CATEGORY_PRIORITY_CARDS)

    // What this catches that the request-count journeys cannot: they bound the
    // count from above, so narrowing `eager` back makes every one of them
    // greener while returning a visitor to a grey box for up to 2.4s on a
    // throttled device. That asymmetry is how the hole got in once already.
    expect(
      naked.withoutImage,
      'cards on the first screen with no server-rendered image',
    ).toBe(0)
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

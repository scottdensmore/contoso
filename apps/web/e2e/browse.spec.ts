import { test, expect, type Locator } from '@playwright/test'

/**
 * The anonymous shopping journey, end to end against the real stack.
 *
 * `scripts/e2e_smoke.py` checks that these routes return 200. That is not the
 * same as them working: a category page rendered every product with a broken
 * image for years while returning 200, and a Next 16 upgrade once shipped
 * product pages that 404'd on every slug while the suite stayed green.
 */
test.describe('browsing', () => {
  test('home lists categories and each links to a category page', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    const categoryHeadings = page.getByRole('heading', { level: 2 })
    expect(await categoryHeadings.count()).toBeGreaterThan(0)

    // Follow a real product link rather than asserting one exists. A link to a
    // slug the database does not have still renders.
    const firstProduct = page.locator('a[href^="/products/"]').first()
    await expect(firstProduct).toBeVisible()
    await firstProduct.click()

    await expect(page).toHaveURL(/\/products\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('a category page renders its products', async ({ page }) => {
    await page.goto('/')
    const categoryLink = page.locator('a[href^="/products/category/"]').first()

    if ((await categoryLink.count()) === 0) {
      // Reached directly when the home page links only to products.
      await page.goto('/products/category/tents')
    } else {
      await categoryLink.click()
    }

    await expect(page).toHaveURL(/\/products\/category\//)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.getByRole('heading', { level: 2 }).count()).toBeGreaterThan(0)
  })

  test('every image the journey renders actually loads', async ({ page }) => {
    // The gap that let /images/placeholder.png survive: pages returned 200
    // while the assets they referenced 404'd. Status codes are collected from
    // the network rather than inferred from the DOM.
    //
    // Both shapes have to be watched. Product images never reach the browser as
    // a file path -- `next/image` requests them as
    // `/_next/image?url=%2Fimages%2F...webp&w=640&q=75`, where the extension is
    // followed by `&` and an extension-anchored pattern never matches. Only the
    // CSS backgrounds are fetched by path, so matching on extension alone
    // watched the three assets this catalogue change does not touch and none of
    // the 852 it does.
    const IMAGE_REQUEST = /\/_next\/image\?|\.(png|jpe?g|webp|gif|svg)(\?|$)/i
    const failed: string[] = []
    let optimised = 0
    page.on('response', (response) => {
      const url = response.url()
      if (!IMAGE_REQUEST.test(url)) return
      if (url.includes('/_next/image?')) optimised += 1
      if (response.status() >= 400) {
        failed.push(`${response.status()} ${url}`)
      }
    })

    await page.goto('/')

    const images = page.locator('img')
    await expect(images.first()).toBeVisible()

    // next/image lazy-loads below the fold, so scroll the page to make the rest
    // actually request. Without this the check only ever sees the hero.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    })

    // Deliberately not asserting every img is `complete`: a lazy image that
    // never entered the viewport never loads, which is correct behaviour, so
    // that assertion can never pass on a long page. What matters is that
    // nothing the page *did* request came back an error.
    await expect
      .poll(
        async () =>
          images.evaluateAll((nodes) =>
            nodes.filter((node) => (node as HTMLImageElement).complete).length,
          ),
        { timeout: 20_000, message: 'no images finished loading' },
      )
      .toBeGreaterThan(0)

    expect(await images.count()).toBeGreaterThan(0)

    // Without this, `failed` staying empty proves nothing: it is equally what a
    // pattern that matches no request at all produces.
    expect(
      optimised,
      'no /_next/image requests were observed, so the check below is vacuous',
    ).toBeGreaterThan(0)
    expect(failed, 'image requests returned an error status').toEqual([])
  })

  test('a product gallery does not announce the same thing twice', async ({ page }) => {
    // Every gallery image carried `alt={product.name}`, so a screen reader
    // heard the product's name once per picture -- five times for most
    // products -- and could not tell any of them apart. `lib/gallery-alt.ts`
    // is unit-tested against the whole catalogue; this is the part that check
    // cannot see, which is whether the page uses it.
    //
    // Sampled from a category page rather than from the home page. The home
    // page links exactly the twenty seeded products, and those twenty are
    // precisely the ones whose filenames are UUIDs -- so "follow the first
    // product link" is the one route guaranteed to miss all 190 products whose
    // shot types this is meant to be checking. The first version of this test
    // did that, and asserted that a one-element list had no duplicates.
    await page.goto('/products/category/tents')
    const links = (
      await page
        .locator('a[href^="/products/"]')
        .evaluateAll((anchors) =>
          anchors.map((anchor) => (anchor as HTMLAnchorElement).getAttribute('href') ?? ''),
        )
    ).filter((href) => href && !href.startsWith('/products/category'))

    expect(links.length, 'no product links on the category page').toBeGreaterThan(1)

    let described = 0
    for (const href of links.slice(0, 5)) {
      await page.goto(href)
      const alts = await page
        .locator('main img')
        .evaluateAll((images) => images.map((image) => (image as HTMLImageElement).alt))

      expect(alts.length, `no gallery images on ${href}`).toBeGreaterThan(2)

      // Decorative images announce nothing, and any number of those is fine.
      const spoken = alts.filter((alt) => alt !== '')
      expect(
        spoken.filter((alt, index) => spoken.indexOf(alt) !== index),
        `${href} announces something already announced`,
      ).toEqual([])
      expect(spoken.length, `${href} has an entirely silent gallery`).toBeGreaterThan(0)

      if (spoken.length > 1) described += 1
    }

    // Without this the whole test passes on unlabelled products, where a single
    // non-empty alt cannot duplicate anything and the shot-type phrasing is
    // never rendered at all.
    expect(
      described,
      'every sampled product was an unlabelled one, so no gallery with described shots was checked',
    ).toBeGreaterThan(0)
  })

  test('a product card announces what it shows, once', async ({ page }) => {
    // Both listings put `alt={product.name}` on an image inside a link whose
    // own text already names the product, so the link's accessible name was
    // the name twice -- 20 cards on the home page, and every card of every
    // category, which runs from 18 to 47. The tents page this samples is 21,
    // which is not the worst of them.
    for (const path of ['/', '/products/category/tents']) {
      await page.goto(path)

      const cards = page.locator('a[href^="/products/"]:not([href^="/products/category/"])')
      const count = await cards.count()
      expect(count, `no product cards on ${path}`).toBeGreaterThan(1)

      let withImage = 0
      let firstName = ''

      for (let index = 0; index < count; index += 1) {
        const card = cards.nth(index)
        if ((await card.locator('img').count()) > 0) withImage += 1

        const name = await accessibleName(card)
        expect(name, `card ${index} on ${path} has no accessible name`).not.toEqual('')
        if (index === 0) firstName = name

        // "The same thing twice in a row", and deliberately not "equal to the
        // card's own visible text". Equality was the first version of this and
        // it says something stronger than the defect: it rejects a badge image
        // with a real `alt`, an `aria-hidden` separator, and CSS generated
        // content, all of which are correct card designs that announce nothing
        // twice. A rule that would reject the right answer to a later problem
        // gets deleted on the day it matters rather than fixed.
        //
        // Swept over all 210 catalogue names paired with a price: none
        // contains an adjacent repeat, and both pre-fix names do.
        //
        // What it does not catch: a duplicate that is not adjacent. Move the
        // image below the price and restore its `alt` and the name reads
        // `X $250.00 X`, which this passes. Both listings render the image
        // first, so reaching that needs the defect and a reorder -- and the
        // sampled check below still catches it on card 0 of each listing.
        expect(
          repeatedPhrase(name),
          `card ${index} on ${path} announces the same thing twice: ${JSON.stringify(name)}`,
        ).toBeNull()
      }

      // A card rendering no image cannot duplicate one, so without this the
      // loop above passes on a listing that stopped rendering images at all.
      // Counted across the listing rather than required of each card, because
      // `image` is nullable on the category card and the empty state it falls
      // back to is a legitimate render, not a failure.
      expect(withImage, `no card on ${path} rendered an image`).toBeGreaterThan(0)

      // What the loop cannot see: a card that announces nothing twice because
      // it stopped naming its product at all. The name has to come from
      // outside the card to check that, so it comes from the page the card
      // links to, whose `h1` is the product's name.
      //
      // Sampled, since it costs a navigation and what it establishes is a
      // property of the markup rather than of any one product.
      const href = await cards.first().getAttribute('href')
      expect(href, `first card on ${path} has no href`).toBeTruthy()
      await page.goto(href ?? '')
      const productName = (await page.getByRole('heading', { level: 1 }).innerText()).trim()
      expect(productName, `${href} has no heading to take a name from`).not.toEqual('')
      expect(
        occurrences(firstName, productName),
        `the first card on ${path} announces ${JSON.stringify(productName)} ${occurrences(firstName, productName)} times in ${JSON.stringify(firstName)}`,
      ).toEqual(1)
    }
  })
})

/**
 * The accessible name Chromium computes for an element.
 *
 * There is no getter for it, so this reads the first line of the ARIA
 * snapshot — `- link "TrailMaster X4 Tent $250.00":` — which is Playwright's
 * own implementation of the accname algorithm rather than a reading of the
 * `alt` attribute that happens to feed it today. Callers pin the parse with
 * `toHaveAccessibleName` so a snapshot format change cannot quietly turn every
 * assertion below into one about the empty string.
 */
async function accessibleName(locator: Locator): Promise<string> {
  const [first] = (await locator.ariaSnapshot()).split('\n')
  // The quotes are optional so that an element with no accessible name comes
  // back as `''` and fails the caller's assertion about the name, rather than
  // throwing here and reporting a real defect as a parse failure. A line that
  // is not `- <role>` at all still throws, which is the format change.
  const match = /^-\s+[a-z][a-z-]*(?:\s+"(.*)")?\s*:?\s*$/.exec(first)
  if (!match) {
    throw new Error(`unreadable ARIA snapshot line ${JSON.stringify(first)}`)
  }
  const name = match[1] ?? ''
  await expect(locator).toHaveAccessibleName(name)
  return name
}

/** The first run of words that appears twice in a row, or null. */
function repeatedPhrase(text: string): string | null {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
  for (let length = 1; length <= Math.floor(words.length / 2); length += 1) {
    for (let start = 0; start + 2 * length <= words.length; start += 1) {
      const run = words.slice(start, start + length).join(' ')
      if (run === words.slice(start + length, start + 2 * length).join(' ')) return run
    }
  }
  return null
}

function occurrences(haystack: string, needle: string): number {
  return haystack.toLowerCase().split(needle.toLowerCase()).length - 1
}

import { test, expect } from '@playwright/test'

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
})

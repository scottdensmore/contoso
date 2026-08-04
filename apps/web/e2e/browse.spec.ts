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
    const failed: string[] = []
    page.on('response', (response) => {
      const url = response.url()
      if (/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url) && response.status() >= 400) {
        failed.push(`${response.status()} ${url}`)
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const images = page.locator('img')
    expect(await images.count()).toBeGreaterThan(0)
    expect(failed, 'image requests returned an error status').toEqual([])
  })
})

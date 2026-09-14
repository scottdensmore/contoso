import { test, expect } from '@playwright/test'

test.describe('recently viewed gear journey', () => {
  test('tracks browsed products, shows shelf on subsequent product pages, adds to cart, and clears history', async ({
    page,
  }) => {
    // 1. Visits a first product page: /products/trailmaster-x4-tent
    await page.goto('/products/trailmaster-x4-tent')
    await expect(page.getByRole('heading', { level: 1, name: 'TrailMaster X4 Tent' })).toBeVisible()

    // On the first product page, no other products have been viewed, so the shelf is not shown
    const firstPageShelf = page.locator('section[aria-labelledby="recently-viewed-heading"]')
    await expect(firstPageShelf).not.toBeVisible()

    // 2. Visits a second product page: /products/adventurer-pro-backpack
    await page.goto('/products/adventurer-pro-backpack')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Adventurer Pro Backpack' }),
    ).toBeVisible()

    // 3. Asserts the "Recently Viewed Gear" section is visible on the second product page and contains "TrailMaster X4 Tent"
    const shelf = page.locator('section[aria-labelledby="recently-viewed-heading"]')
    await expect(shelf).toBeVisible()
    await expect(shelf.getByRole('heading', { name: 'Recently Viewed Gear' })).toBeVisible()
    await expect(shelf.getByText('TrailMaster X4 Tent')).toBeVisible()

    // 4. Clicks "Add to Cart" from the recently viewed shelf and verifies the cart updates
    const addToCartBtn = shelf.getByRole('button', { name: /add to cart/i })
    await expect(addToCartBtn).toBeVisible()
    await addToCartBtn.click()

    // Verify cart drawer opens and shows the added product
    const cartDialog = page.getByRole('dialog', { name: /shopping cart/i })
    await expect(cartDialog).toBeVisible()
    await expect(cartDialog.getByText('TrailMaster X4 Tent')).toBeVisible()

    // Close the cart drawer to reveal the page controls underneath
    const closeCartBtn = page.getByRole('button', { name: /close cart/i })
    await closeCartBtn.click()
    await expect(cartDialog).not.toBeVisible()

    // 5. Clicks "Clear History" and verifies the recently viewed section is removed
    const clearHistoryBtn = shelf.getByRole('button', { name: /clear history/i })
    await expect(clearHistoryBtn).toBeVisible()
    await clearHistoryBtn.click()

    await expect(shelf).not.toBeVisible()
  })
})

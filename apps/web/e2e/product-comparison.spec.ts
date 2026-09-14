import { test, expect } from '@playwright/test'

test.describe('product comparison journey', () => {
  test('adds product to comparison, opens comparison view, and verifies details and actions', async ({
    page,
  }) => {
    // Visit product page
    await page.goto('/products/trailmaster-x4-tent')

    // Find and click the Compare button
    const compareButton = page.getByRole('button', {
      name: /add trailmaster x4 tent to comparison/i,
    })
    await expect(compareButton).toBeVisible()
    await compareButton.click()

    // Verify compare drawer / floating bar becomes visible
    const floatingBar = page.getByTestId('comparison-bar')
    await expect(floatingBar).toBeVisible()
    await expect(floatingBar.getByText(/comparing.*1.*of 3/i)).toBeVisible()

    // Opens the comparison view
    const openCompareBtn = floatingBar.getByRole('button', { name: /compare \(1\)/i })
    await openCompareBtn.click()

    // Assert product comparison dialog is displayed
    const dialog = page.getByRole('dialog', { name: 'Product comparison' })
    await expect(dialog).toBeVisible()

    // Assert product details (name, price) are displayed
    await expect(dialog.getByRole('link', { name: 'TrailMaster X4 Tent' })).toBeVisible()
    await expect(dialog.getByText('$250.00')).toBeVisible()

    // Assert Add to Cart button in comparison drawer is present and clickable
    const addToCartBtn = dialog.getByRole('button', { name: /add to cart/i })
    await expect(addToCartBtn).toBeVisible()
    await addToCartBtn.click()

    // Assert remove item functions properly
    const removeBtn = dialog.getByRole('button', {
      name: /remove trailmaster x4 tent from comparison/i,
    })
    await expect(removeBtn).toBeVisible()
    await removeBtn.click()

    // After removing, items count is 0, dialog and floating bar are hidden
    await expect(dialog).not.toBeVisible()
    await expect(floatingBar).not.toBeVisible()
  })
})

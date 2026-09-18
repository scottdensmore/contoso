import { test, expect } from '@playwright/test'
import { openProfileTab } from './support/session'

test.describe('Return Shipping Label Journey', () => {
  test('navigates to order details, requests return, and views printable return shipping label', async ({
    page,
  }) => {
    // Intercept order 1 to ensure order is in return window if return not yet submitted
    await page.route('**/api/profile/orders/1', async (route) => {
      const response = await route.fetch()
      if (response.ok()) {
        const json = await response.json()
        // If order has old date, make it recent so "Request Return" action is enabled
        json.date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        await route.fulfill({ response, json })
      } else {
        await route.continue()
      }
    })

    // 1. Sign in or simulate authenticated session
    await openProfileTab(page, 'Orders')

    // 2. Navigate to /profile/orders/1 (or test order)
    await page.goto('/profile/orders/1')
    await expect(page).toHaveURL(/\/profile\/orders\/1$/)
    await expect(page.getByRole('heading', { level: 1, name: /order #1/i })).toBeVisible()

    // 3. Submit return request if not already submitted
    const requestReturnBtn = page.getByRole('button', { name: /request return/i })
    if (await requestReturnBtn.isVisible()) {
      await requestReturnBtn.click()
      const returnDialog = page.getByRole('dialog', { name: /request return/i })
      await expect(returnDialog).toBeVisible()

      const submitReturnBtn = page.getByRole('button', { name: /submit return request/i })
      await submitReturnBtn.click()
      await expect(returnDialog).not.toBeVisible()
    }

    // 4. Click "Print Return Label"
    const printReturnLabelLink = page.getByRole('link', { name: /print return label/i }).first()
    await expect(printReturnLabelLink).toBeVisible()
    await printReturnLabelLink.click()

    // 5. Verify navigation to /profile/orders/1/label
    await expect(page).toHaveURL(/\/profile\/orders\/1\/label$/)

    // 6. Verify page heading Return Shipping Label
    const mainHeading = page.getByRole('heading', { level: 1, name: 'Return Shipping Label' })
    await expect(mainHeading).toBeVisible()

    // Verify structured section headings
    await expect(page.getByRole('heading', { level: 2, name: 'Shipping Details' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Return Authorization' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: 'Package Instructions' })).toBeVisible()

    // 7. Verify RMA number, tracking number, ship-to address, and package instructions are visible
    await expect(page.getByText('RMA-1')).toBeVisible()
    await expect(page.getByText('1Z-CTSO-RET-10000000')).toBeVisible()
    await expect(page.getByText('Contoso Outdoors Returns Depot')).toBeVisible()
    await expect(page.getByText(/Pack items securely in original packaging/i)).toBeVisible()

    // 8. Verify "Print Label" button is present
    const printBtn = page.getByRole('button', { name: /print label/i })
    await expect(printBtn).toBeVisible()
  })
})

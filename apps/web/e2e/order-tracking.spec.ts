import { test, expect } from '@playwright/test';

test.describe('Order Tracking Journey', () => {
  test('navigates from header to /track, validates inputs, displays milestones, handles errors, and resets', async ({
    page,
  }) => {
    // 1. Navigation to /track from page via Header link
    await page.goto('/');
    const trackOrderLink = page.getByRole('link', { name: 'Track Order' });
    await expect(trackOrderLink).toBeVisible();
    await trackOrderLink.click();
    await expect(page).toHaveURL('/track');

    // Verify page heading
    const heading = page.getByRole('heading', { level: 1, name: 'Track Your Order' });
    await expect(heading).toBeVisible();

    const orderIdInput = page.locator('#track-order-id');
    const postalCodeInput = page.locator('#track-postal-code');
    const submitButton = page.getByRole('button', { name: /track order/i });

    await expect(orderIdInput).toBeVisible();
    await expect(postalCodeInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // 2. Empty form validation preventing submission
    const isOrderIdValidInitial = await orderIdInput.evaluate(
      (el: HTMLInputElement) => el.checkValidity()
    );
    expect(isOrderIdValidInitial).toBe(false);

    await submitButton.click();
    // Milestone stepper should not appear on empty submit
    await expect(page.locator('ol[aria-label="Order milestones"]')).not.toBeVisible();

    // 3. Entering valid order (CTSO-98765, zip 98101)
    await orderIdInput.fill('CTSO-98765');
    await postalCodeInput.fill('98101');
    await submitButton.click();

    // Displays the milestone progress stepper
    const stepper = page.locator('ol[aria-label="Order milestones"]');
    await expect(stepper).toBeVisible();

    // Verifies all 5 milestone names are present
    await expect(page.getByText('Order Placed')).toBeVisible();
    await expect(page.getByText('Processing')).toBeVisible();
    await expect(page.getByText('Shipped & In Transit')).toBeVisible();
    await expect(page.getByText('Out for Delivery')).toBeVisible();
    await expect(page.getByText('Delivered')).toBeVisible();

    // Verifies active step has aria-current="step"
    const currentStep = page.locator('[aria-current="step"]');
    await expect(currentStep).toBeVisible();
    await expect(currentStep).toContainText('Shipped & In Transit');

    // Carrier details and tracking status
    await expect(page.getByText('FedEx Ground').first()).toBeVisible();
    await expect(page.getByText('FX-9876543210')).toBeVisible();
    await expect(page.getByText('Shipped', { exact: true }).first()).toBeVisible();

    // Item details
    await expect(page.getByText('Cascade Mountain Backpack 45L')).toBeVisible();

    // 4. Clicking "Track Another Order" resets to the lookup form
    const resetBtn = page.getByRole('button', { name: /track another order/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    await expect(orderIdInput).toBeVisible();
    await expect(postalCodeInput).toBeVisible();
    await expect(page.locator('ol[aria-label="Order milestones"]')).not.toBeVisible();

    // 5. Entering an invalid order displays accessible error alert
    await orderIdInput.fill('INVALID-99999');
    await postalCodeInput.fill('98101');
    await submitButton.click();

    const alert = page.locator('form').getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/no order found/i);
    await expect(alert).toContainText(/confirmation email/i);
  });

  test('direct navigation to /track renders tracker form with sample lookup tips', async ({
    page,
  }) => {
    await page.goto('/track');
    await expect(page.getByRole('heading', { level: 1, name: 'Track Your Order' })).toBeVisible();
    await expect(page.locator('#track-order-id')).toBeVisible();
    await expect(page.locator('#track-postal-code')).toBeVisible();

    // Quick lookup tip button fills form
    const sampleButton = page.getByRole('button', { name: /CTSO-98765/i });
    await expect(sampleButton).toBeVisible();
    await sampleButton.click();

    await expect(page.locator('#track-order-id')).toHaveValue('CTSO-98765');
    await expect(page.locator('#track-postal-code')).toHaveValue('98101');
  });
});

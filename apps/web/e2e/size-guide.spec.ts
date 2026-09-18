import { test, expect } from '@playwright/test';

test.describe('Size Guide & Fit Calculator Journey', () => {
  test('opens size guide modal, verifies chart, toggles units, calculates recommended fit, and closes on Escape', async ({
    page,
  }) => {
    // 1. Navigate to /products/trailmaster-x4-tent
    await page.goto('/products/trailmaster-x4-tent');

    // 2. Click "Size Guide" button and verify modal opens
    const triggerButton = page.getByRole('button', { name: /size guide/i });
    await expect(triggerButton).toBeVisible();
    await triggerButton.click();

    const dialog = page.getByRole('dialog', { name: /tents size guide/i });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /tents size guide/i })).toBeVisible();

    // 3. Verify size chart headers and rows render
    const table = dialog.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Size' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Capacity' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Floor Dimensions' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Peak Height' })).toBeVisible();

    // Verify tent rows with imperial measurements
    await expect(table.getByRole('cell', { name: '2-Person' })).toBeVisible();
    await expect(table.getByRole('cell', { name: '4-Person' })).toBeVisible();
    await expect(table.getByText(/30 sq ft/)).toBeVisible();
    await expect(table.getByText(/50" x 85"/)).toBeVisible();

    // 4. Toggle unit to "cm" and verify values update
    const unitToggle = dialog.getByRole('button', { name: /centimeters|metric|inches/i });
    await expect(unitToggle).toHaveAttribute('aria-pressed', 'false');
    await unitToggle.click();
    await expect(unitToggle).toHaveAttribute('aria-pressed', 'true');

    // Verify metric values
    await expect(table.getByText(/127 x 216 cm/)).toBeVisible();
    await expect(table.getByText(/2.8 sq m/)).toBeVisible();

    // 5. Switch to "Fit Calculator" tab, enter measurement, click "Find My Size", and verify recommendation
    const calcTab = dialog.getByRole('tab', { name: /fit calculator/i });
    await calcTab.click();
    await expect(calcTab).toHaveAttribute('aria-selected', 'true');

    const measurementInput = dialog.getByRole('spinbutton');
    await expect(measurementInput).toBeVisible();
    await measurementInput.fill('4');

    const findSizeBtn = dialog.getByRole('button', { name: /find my size/i });
    await findSizeBtn.click();

    const recommendationRegion = dialog.getByTestId('size-recommendation-live');
    await expect(recommendationRegion).toBeVisible();
    await expect(recommendationRegion.getByText('4-Person')).toBeVisible();
    await expect(recommendationRegion.getByText(/56 sq ft/)).toBeVisible();

    // 6. Press Escape to close modal and verify focus returns to trigger button
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(triggerButton).toBeFocused();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Store Locator Journey', () => {
  test('navigates to /stores, searches, filters, and resets store locations', async ({
    page,
  }) => {
    // Visits /stores
    await page.goto('/stores');

    // Verifies h1 "Find a Contoso Outdoors Store" is visible
    const heading = page.getByRole('heading', {
      level: 1,
      name: 'Find a Contoso Outdoors Store',
    });
    await expect(heading).toBeVisible();

    // Verifies initial list of stores is rendered
    await expect(page.getByText('Seattle Flagship')).toBeVisible();
    await expect(page.getByText('Denver Mountain Outpost')).toBeVisible();
    await expect(page.getByText('Portland Trailhead')).toBeVisible();
    await expect(page.getByText('Salt Lake City Basecamp')).toBeVisible();
    await expect(page.getByText('San Francisco Bay')).toBeVisible();

    // Filters by "Seattle" and asserts Seattle Flagship is displayed while others are hidden
    const searchInput = page.getByRole('searchbox', {
      name: /search stores/i,
    });
    await searchInput.fill('Seattle');

    await expect(page.getByText('Seattle Flagship')).toBeVisible();
    await expect(page.getByText('Denver Mountain Outpost')).not.toBeVisible();
    await expect(page.getByText('Portland Trailhead')).not.toBeVisible();
    await expect(page.getByText('Salt Lake City Basecamp')).not.toBeVisible();
    await expect(page.getByText('San Francisco Bay')).not.toBeVisible();

    // Toggles filter for "Gear Rental Available"
    const gearRentalCheckbox = page.getByRole('checkbox', {
      name: /gear rental available/i,
    });
    await gearRentalCheckbox.check();
    await expect(gearRentalCheckbox).toBeChecked();
    await expect(page.getByText('Seattle Flagship')).toBeVisible();

    // Resets filters and asserts all stores return
    const resetButton = page.getByRole('button', { name: /reset filters/i }).first();
    await resetButton.click();

    await expect(searchInput).toHaveValue('');
    await expect(gearRentalCheckbox).not.toBeChecked();

    await expect(page.getByText('Seattle Flagship')).toBeVisible();
    await expect(page.getByText('Denver Mountain Outpost')).toBeVisible();
    await expect(page.getByText('Portland Trailhead')).toBeVisible();
    await expect(page.getByText('Salt Lake City Basecamp')).toBeVisible();
    await expect(page.getByText('San Francisco Bay')).toBeVisible();
  });
});

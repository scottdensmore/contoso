import { test, expect } from '@playwright/test';

test.describe('Community Trail Reports & Live Field Conditions Journey', () => {
  test('navigates to /reports, checks alerts, searches, filters by condition, and submits a new report', async ({
    page,
  }) => {
    // 1. Navigates to /reports
    await page.goto('/reports');

    // 2. Verifies page title and H1 "Community Trail Reports & Live Field Conditions"
    await expect(page).toHaveTitle(/Community Trail Reports & Live Field Conditions/);
    const heading = page.getByRole('heading', {
      level: 1,
      name: 'Community Trail Reports & Live Field Conditions',
    });
    await expect(heading).toBeVisible();

    // 3. Asserts the Active Hazard Alerts banner is visible
    const alertsHeading = page.getByRole('heading', {
      level: 2,
      name: 'Active Hazard Alerts',
    });
    await expect(alertsHeading).toBeVisible();
    await expect(page.getByText(/The Enchantments Core/i)).toBeVisible();
    await expect(page.getByText('Severe')).toBeVisible();
    await expect(page.getByText(/Unstable snow bridges/i)).toBeVisible();

    // 4. Uses search input to filter for "Mount Si" or "Enchantments", verifying matching cards appear while others are filtered out
    const searchInput = page.getByRole('searchbox', { name: /search reports/i });
    await searchInput.fill('Mount Si');
    await expect(page.getByRole('heading', { level: 3, name: 'Mount Si' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Lake 22' })).not.toBeVisible();

    // Clear search
    await searchInput.fill('');

    // Also test "Enchantments" search
    await searchInput.fill('Enchantments');
    await expect(page.getByRole('heading', { level: 3, name: 'Enchantments Core Zone' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Mount Si' })).not.toBeVisible();

    // Clear search again
    await searchInput.fill('');

    // 5. Filters by "Snow & Ice" condition and verifies Skyline Trail card
    const snowFilterBtn = page.getByRole('button', { name: /^snow & ice$/i });
    await snowFilterBtn.click();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Skyline Trail (Mount Rainier)' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Mount Si' })).not.toBeVisible();

    // Reset filter to All
    const allFilterBtn = page.getByRole('button', { name: /^all$/i });
    await allFilterBtn.click();
    await expect(page.getByRole('heading', { level: 3, name: 'Mount Si' })).toBeVisible();

    // 6. Fills out the "Submit Field Report" form and submits, asserting the confirmation banner `#TRP-` appears and the new report is visible in the feed
    await page.getByLabel(/trail name/i).fill('Granite Mountain Lookout');
    await page.getByLabel(/hike date/i).fill('2026-09-18');
    await page.getByLabel(/reporter username/i).fill('summit_seeker');
    await page.getByLabel(/trail condition/i).selectOption({ label: 'Obstacles / Blowdowns' });
    await page.getByLabel(/snow depth/i).fill('4');
    await page.getByLabel(/parking status/i).selectOption({ label: 'Mostly Full' });
    await page.getByLabel(/bug rating/i).selectOption({ label: 'Low' });
    await page.getByLabel(/trip notes/i).fill('Downed trees across lower switchbacks around 2.5 miles. Fire lookout shutters closed.');

    const submitBtn = page.getByRole('button', { name: /submit report/i });
    await submitBtn.click();

    // Confirmation banner `#TRP-` appears
    const confirmationAlert = page.getByRole('alert');
    await expect(confirmationAlert).toBeVisible();
    await expect(confirmationAlert).toContainText('#TRP-');

    // New report is visible in the feed
    await expect(
      page.getByRole('heading', { level: 3, name: 'Granite Mountain Lookout' })
    ).toBeVisible();
    await expect(page.getByText('summit_seeker')).toBeVisible();
    await expect(page.getByText(/Downed trees across lower switchbacks/i)).toBeVisible();
  });
});

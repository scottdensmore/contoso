import { test, expect } from '@playwright/test';

test.describe('Trail Activity & Weather Outfitting Journey', () => {
  test('browses regional trails, selects trail, customizes outfitting checklist, packs items, and verifies safety advice', async ({
    page,
  }) => {
    // 1. Navigate to /trails
    await page.goto('/trails');

    // 2. Verify page heading Trail Activity & Weather Outfitting Guide
    const heading = page.getByRole('heading', {
      level: 1,
      name: 'Trail Activity & Weather Outfitting Guide',
    });
    await expect(heading).toBeVisible();

    // 3. Filter trails by region or difficulty
    const pnwBtn = page.getByRole('button', { name: /^pacific northwest$/i });
    await pnwBtn.click();
    await expect(page.getByText('Rattlesnake Ridge Trail')).toBeVisible();
    await expect(page.getByText('Bear Peak Summit')).not.toBeVisible();

    // Reset region filter
    const allRegionsBtn = page.getByRole('button', { name: /^all regions$/i });
    await allRegionsBtn.click();
    await expect(page.getByText('Bear Peak Summit')).toBeVisible();

    // 4. Select a trail (e.g. "Rattlesnake Ridge Trail")
    const rattlesnakeCard = page
      .locator('div')
      .filter({ has: page.getByRole('heading', { level: 3, name: 'Rattlesnake Ridge Trail' }) })
      .first();
    const selectTrailBtn = rattlesnakeCard.getByRole('button', { name: /select trail/i });
    await selectTrailBtn.click();

    // Verify selected trail banner in checklist
    await expect(page.getByText(/Selected Trail: Rattlesnake Ridge Trail/i)).toBeVisible();

    // 5. Change activity to "Day Hiking" and season to "Spring"
    const activitySelect = page.getByLabel(/activity/i);
    await activitySelect.selectOption({ label: 'Day Hiking' });

    const seasonSelect = page.getByLabel(/season/i);
    await seasonSelect.selectOption({ label: 'Spring' });

    // 6. Check off 3 essential items
    const checkboxes = page.getByRole('checkbox');
    await expect(checkboxes.first()).toBeVisible();

    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();

    // 7. Assert progress bar updates (aria-valuenow > 0 and percentage text)
    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toBeVisible();

    await expect(async () => {
      const value = Number(await progressBar.getAttribute('aria-valuenow'));
      expect(value).toBeGreaterThan(0);
    }).toPass();

    await expect(page.getByText(/3 of \d+ items packed \(\d+%\)/i)).toBeVisible();

    // 8. Verify safety advice section is visible
    const safetyHeading = page.getByRole('heading', {
      level: 2,
      name: 'Weather & Trail Safety Advice',
    });
    await expect(safetyHeading).toBeVisible();
    await expect(page.getByText('Layering & Thermoregulation')).toBeVisible();
    await expect(page.getByText('Hydration & Electrolyte Planning')).toBeVisible();
    await expect(page.getByText('Leave No Trace & Safety')).toBeVisible();
  });
});

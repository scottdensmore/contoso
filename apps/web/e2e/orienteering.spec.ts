import { test, expect } from '@playwright/test';

test.describe('Wilderness Orienteering & Off-Trail Navigation Guide Journey', () => {
  test('navigates to /orienteering, filters course difficulties, calculates magnetic bearings and pace counts, and tracks navigation kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /orienteering
    await page.goto('/orienteering');

    // 2. Verify page title and literal H1 "Wilderness Orienteering & Off-Trail Navigation Guide"
    await expect(page).toHaveTitle(
      /Wilderness Orienteering & Off-Trail Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Orienteering & Off-Trail Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Expert" or "Beginner" and verify expected cards are displayed while others are hidden
    const grid = page.getByTestId('orienteering-courses-grid');

    const beginnerBtn = page.getByRole('button', { name: /^beginner$/i });
    await beginnerBtn.click();
    await expect(grid).toContainText('Chautauqua Open Mesa');
    await expect(grid).not.toContainText('Harriman Silvermine');
    await expect(grid).not.toContainText('Mount Rainier Paradise');

    const expertBtn = page.getByRole('button', { name: /^expert$/i });
    await expertBtn.click();
    await expect(grid).toContainText('Mount Rainier Paradise');
    await expect(grid).toContainText('Linville Gorge');
    await expect(grid).not.toContainText('Chautauqua Open Mesa');
    await expect(grid).not.toContainText('Harriman Silvermine');

    const allBtn = page.getByRole('button', { name: /^all courses$/i });
    await allBtn.click();
    await expect(grid).toContainText('Harriman Silvermine');
    await expect(grid).toContainText("Devil's Lake Quartzite");
    await expect(grid).toContainText('Mount Rainier Paradise');
    await expect(grid).toContainText('Linville Gorge');
    await expect(grid).toContainText('Chautauqua Open Mesa');

    // 4. Selects Harriman Silvermine in calculator, adjusts leg distance and bearing, asserts live status reflects magnetic bearing, double paces, and technique advisory
    const courseSelect = page.getByLabel(/select.*course/i);
    await courseSelect.selectOption('harriman-silvermine-classic');

    const resultPanel = page.getByTestId('orienteering-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Harriman Silvermine Classic Orienteering Course');

    const distanceInput = page.getByLabel(/leg distance/i);
    await distanceInput.fill('500');

    const bearingInput = page.getByLabel(/map bearing/i);
    await bearingInput.fill('60');

    // 60 - (-12.5) = 72.5° magnetic bearing
    await expect(resultPanel).toContainText('72.5°');
    // Harriman open forest (64 * 1.10 = 70 paces/100m). For 500m: 5 * 70 = 350 double paces
    await expect(resultPanel).toContainText('350');
    // Open forest technique: Thumbing the map
    await expect(resultPanel).toContainText('Thumbing the map');

    // 5. Interacts with the Navigation Kit checklist and verifies orienteering-gear-counter
    const counter = page.getByTestId('orienteering-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const compassCheckbox = page.getByLabel(/adjustable declination mirrored sighting compass/i);
    await compassCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const mapCheckbox = page.getByLabel(/waterproof 1:24,000 usgs topographic map/i);
    await mapCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await compassCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

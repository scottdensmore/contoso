import { test, expect } from '@playwright/test';

test.describe('Wilderness Foraging & Wild Edible Plants Field Identifier Journey', () => {
  test('navigates to /foraging, filters by category, evaluates specimen safety, and interacts with gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /foraging
    await page.goto('/foraging');

    // 2. Verify page title and literal H1 "Wilderness Foraging & Wild Edible Plants Guide"
    await expect(page).toHaveTitle(
      /Wilderness Foraging & Edible Plants \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Foraging & Wild Edible Plants Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Berries" and verify "Pacific Mountain Huckleberry" is visible while Chanterelle is hidden
    const berriesFilter = page.getByRole('button', { name: /^Berries/i });
    await berriesFilter.click();

    const speciesList = page.getByTestId('species-directory-list');
    await expect(speciesList).toContainText('Pacific Mountain Huckleberry');
    await expect(speciesList).not.toContainText('Pacific Golden Chanterelle');

    // 4. Runs the Foraging Safety Screener for mushroom with false gills and hollow stem, and verifies the result status panel
    const categorySelect = page.getByLabel(/specimen category/i);
    await categorySelect.selectOption('mushroom');

    const falseGillsCheckbox = page.getByLabel(/blunt false gills/i);
    await falseGillsCheckbox.check();

    const hollowStemCheckbox = page.getByLabel(/completely hollow stem interior/i);
    await hollowStemCheckbox.check();

    const statusPanel = page.getByRole('status');
    await expect(statusPanel).toBeVisible();
    await expect(statusPanel.getByTestId('warning-level-badge')).toContainText('SAFE CANDIDATE IDENTIFIED');
    await expect(statusPanel).toContainText('Forest Service');

    // 5. Interacts with the Forager's Gear Checklist and verifies progress counter
    const counter = page.getByTestId('gear-packing-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const meshCheckbox = page.getByLabel(/Mesh collection basket/i);
    await meshCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const knifeCheckbox = page.getByLabel(/Opinel mushroom knife/i);
    await knifeCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await meshCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

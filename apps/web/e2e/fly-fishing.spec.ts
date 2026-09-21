import { test, expect } from '@playwright/test';

test.describe('Alpine Fly Fishing & Mountain Angling Guide Journey', () => {
  test('navigates to /fly-fishing, filters waters, calculates match advisor with thermal warning, and interacts with gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /fly-fishing
    await page.goto('/fly-fishing');

    // 2. Verify page title and literal H1 "Alpine Fly Fishing & Mountain Angling Guide"
    await expect(page).toHaveTitle(
      /Alpine Fly Fishing & Mountain Angling Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Fly Fishing & Mountain Angling Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Alpine Lake" and verify Enchantments Crystal Tarns is displayed while rivers are hidden
    const alpineLakeFilter = page.getByRole('button', { name: /filter by alpine lake/i });
    await alpineLakeFilter.click();

    const watersGrid = page.getByTestId('fishing-locations-grid');
    await expect(watersGrid).toContainText('Enchantments Crystal Tarns');
    await expect(watersGrid).not.toContainText('Upper Yakima River Canyon');
    await expect(watersGrid).not.toContainText('Lower Deschutes River');

    // Reset filter to All Waters
    const allWatersFilter = page.getByRole('button', { name: /filter by all waters/i });
    await allWatersFilter.click();
    await expect(watersGrid).toContainText('Upper Yakima River Canyon');

    // 4. Select Upper Yakima Canyon in advisor, adjust water temperature to 68°F, and assert thermal warning in live region
    const locationSelect = page.getByLabel(/select fishing water/i);
    await locationSelect.selectOption('upper-yakima-canyon');

    const tempInput = page.getByLabel(/water temperature/i);
    await tempInput.fill('68');

    const resultPanel = page.getByTestId('angling-match-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Upper Yakima River Canyon');

    // Assert thermal warning alert is displayed
    const alert = resultPanel.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(
      /Hoot Owl Alert: Water temperature exceeds 65°F/i
    );

    // 5. Interacts with the Catch & Release checklist and verifies fly-fishing-gear-counter updates
    const counter = page.getByTestId('fly-fishing-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const firstGearCheckbox = page.getByLabel(/knotless rubber mesh catch-and-release net/i);
    await firstGearCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const secondGearCheckbox = page.getByLabel(/hemostats \/ forceps with line cutter/i);
    await secondGearCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await firstGearCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

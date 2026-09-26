import { test, expect } from '@playwright/test';

test.describe('Wilderness Sea Glass & Coastal Beachcombing Foraging Journey', () => {
  test('navigates to /beachcombing, filters shoreline types, calculates flotsam yield, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /beachcombing
    await page.goto('/beachcombing');

    // 2. Verify page title and literal H1 "Wilderness Sea Glass & Coastal Beachcombing Foraging"
    await expect(page).toHaveTitle(
      /Wilderness Sea Glass & Coastal Beachcombing Foraging \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Sea Glass & Coastal Beachcombing Foraging',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by shoreline type and verify expected cards
    const grid = page.getByTestId('beachcombing-sites-grid');

    const highEnergyBtn = page.getByRole('button', { name: /^High Energy Strand$/i });
    await highEnergyBtn.click();
    await expect(grid).toContainText('Monashka Bay & Mill Bay Strands');
    await expect(grid).not.toContainText('Glass Beach & MacKerricher Coves');
    await expect(grid).not.toContainText('Cape May Point & Sunset Beach');

    const barrierBtn = page.getByRole('button', { name: /^Barrier Island Sandspit$/i });
    await barrierBtn.click();
    await expect(grid).toContainText('Cape May Point & Sunset Beach');
    await expect(grid).not.toContainText('Monashka Bay & Mill Bay Strands');

    const rockyBtn = page.getByRole('button', { name: /^Rocky Intertidal Shelf$/i });
    await rockyBtn.click();
    await expect(grid).toContainText('Ruby Beach & Destruction Island Drift');
    await expect(grid).not.toContainText('Cape May Point & Sunset Beach');

    const gravelBtn = page.getByRole('button', { name: /^Gravel Pebble Cove$/i });
    await gravelBtn.click();
    await expect(grid).toContainText('Glass Beach & MacKerricher Coves');
    await expect(grid).toContainText('Monhegan Island Pebble Shingle Coves');
    await expect(grid).not.toContainText('Ruby Beach & Destruction Island Drift');

    const allBtn = page.getByRole('button', { name: /^All Shorelines$/i });
    await allBtn.click();
    await expect(grid).toContainText('Glass Beach & MacKerricher Coves');
    await expect(grid).toContainText('Monashka Bay & Mill Bay Strands');
    await expect(grid).toContainText('Cape May Point & Sunset Beach');
    await expect(grid).toContainText('Ruby Beach & Destruction Island Drift');
    await expect(grid).toContainText('Monhegan Island Pebble Shingle Coves');

    // 4. Selects Glass Beach in calculator, adjusts search hours, asserts live status reflects expected yield and patina status
    const siteSelect = page.getByLabel(/Select Coastal Beachcombing Site/i);
    await siteSelect.selectOption('glass-beach-fort-bragg');

    const resultPanel = page.getByTestId('beachcombing-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Glass Beach & MacKerricher Coves');
    await expect(resultPanel).toContainText('22 pieces');
    await expect(resultPanel).toContainText('Ancient C-Fractured Frost');
    await expect(resultPanel).toContainText('95%');
    await expect(resultPanel).toContainText('Prime Low-Tide Wrack Window');

    // Adjust search hours to 5
    const searchHoursInput = page.getByLabel(/Search Duration/i);
    await searchHoursInput.fill('5');
    // Expected: 5 * 3.5 * (8.4 / 5.0) * (2.5 / 2.0) = 36.75 -> 37 pieces
    await expect(resultPanel).toContainText('37 pieces');
    await expect(resultPanel).toContainText('Ancient C-Fractured Frost');
    await expect(resultPanel).toContainText('95%');
    await expect(resultPanel).toContainText('Prime Low-Tide Wrack Window');

    // 5. Interacts with the Beachcombing Checklist and verifies beachcombing-gear-counter updates
    const counter = page.getByTestId('beachcombing-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const uvCheckbox = page.getByLabel(/365nm Longwave UV Blacklight Torch/i);
    const scoopCheckbox = page.getByLabel(/Marine Stainless Steel Sand-Sifting Mesh Scoop/i);

    await expect(uvCheckbox).not.toBeChecked();
    await uvCheckbox.check();
    await expect(uvCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await scoopCheckbox.check();
    await expect(scoopCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await uvCheckbox.uncheck();
    await expect(uvCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

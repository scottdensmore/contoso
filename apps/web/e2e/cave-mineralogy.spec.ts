import { test, expect } from '@playwright/test';

test.describe('Wilderness Caving Cave Pearl Karst Mineralogy & Speleothem Survey Journey', () => {
  test('navigates to /cave-mineralogy, filters speleothem types, models hydrochemical accretion kinetics, and tracks survey gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /cave-mineralogy
    await page.goto('/cave-mineralogy');

    // 2. Verify page title and literal H1 "Wilderness Caving Cave Pearl Karst Mineralogy & Speleothem Survey"
    await expect(page).toHaveTitle(
      /Wilderness Caving Cave Pearl Karst Mineralogy & Speleothem Survey \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Caving Cave Pearl Karst Mineralogy & Speleothem Survey',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Gypsum Flower & Needle" and verifies expected cards are displayed while other caves are hidden
    const grid = page.getByTestId('cave-mineralogy-grid');

    const gypsumBtn = page.getByRole('button', { name: /gypsum flower & needle/i });
    await gypsumBtn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /Lechuguilla Chandelier Ballroom/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Carlsbad Caverns Rookery Nest/i })).not.toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Organ Cave Anthodite Hall/i })).not.toBeVisible();

    const allBtn = page.getByRole('button', { name: /all types/i });
    await allBtn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /Carlsbad Caverns Rookery Nest/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Lechuguilla Chandelier Ballroom/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Organ Cave Anthodite Hall/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Mammoth Cave Travertine Cascades/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Blanchard Springs Coral & Helictite Grotto/i })).toBeVisible();

    // 4. Selects Carlsbad Caverns in calculator, tests high drip rate (60 DPM) asserting active polishing rotation, then tests low drip rate (2 DPM) asserting critical desiccation triage
    const siteSelect = page.getByLabel(/select.*site/i);
    await siteSelect.selectOption('carlsbad-rookery-chamber');

    const resultPanel = page.getByTestId('mineral-accretion-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Carlsbad Caverns Rookery Nest');

    // Test high drip rate (60 DPM) asserting active polishing rotation
    const dripRateInput = page.getByLabel(/^drip rate \(dpm\)$/i);
    await dripRateInput.fill('60');
    await expect(resultPanel).toContainText(/Active Polishing Rotation/i);

    // Test low drip rate (2 DPM) asserting critical desiccation triage
    await dripRateInput.fill('2');
    await expect(resultPanel).toContainText(/Critical Desiccation Halt Traffic/i);

    // 5. Interacts with the Gear Checklist and verifies cave-mineralogy-gear-counter updates
    const counter = page.getByTestId('cave-mineralogy-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const uvLampCheckbox = page.getByLabel(/365nm filtered uv speleothem luminescence lamp/i);
    await uvLampCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const caliperCheckbox = page.getByLabel(/laser profile gauge/i);
    await caliperCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await uvLampCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

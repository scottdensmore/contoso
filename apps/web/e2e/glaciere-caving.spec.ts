import { test, expect } from '@playwright/test';

test.describe('Subterranean Ice-Filled Lava Tube & Permafrost Glacière Cave Navigation Guide Journey', () => {
  test('loads /glaciere-caving, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /glaciere-caving
    await page.goto('/glaciere-caving');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Subterranean Ice-Filled Lava Tube & Permafrost Glacière Cave Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Subterranean Ice-Filled Lava Tube & Permafrost Glacière Cave Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Glacière Morphology
    const morphologySelect = page.getByLabel(/Glacière Morphology/i);
    await morphologySelect.selectOption('stratified-firn-plug-pit');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Peștera Scărișoara Stratified Firn-Block Cold Trap/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Eisriesenwelt Dynamic Wind-Chimney Ice Labyrinth/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Eisriesenwelt Dynamic Wind-Chimney Ice Labyrinth/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const lofthellirCard = page.getByTestId(
      'glaciere-site-card-lofthellir-lava-glaciere-iceland'
    );
    await lofthellirCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Floor Ice Slope \(deg\)/i)).toHaveValue('34');
    await expect(page.getByLabel(/Cave Air Temperature \(°C\)/i)).toHaveValue(
      '-0.8'
    );

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('glaciere-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Slope Cryotic Floor Baseline/i,
      })
      .click();
    await expect(resultPanel).toContainText('microspikes-10pt');

    await page
      .getByRole('button', {
        name: /Moderate Firn-Ramp & Cold-Trap Corridor/i,
      })
      .click();
    await expect(resultPanel).toContainText('steel-12pt-crampons-ice-axe');

    await page
      .getByRole('button', {
        name: /High Wet-Glaze Ramp & CO2 Sump/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'front-point-dual-tools-ice-screws'
    );

    await page
      .getByRole('button', {
        name: /Critical Thermal-Thaw Hoarfrost & Hypoxic Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText('abort-glaze-co2-collapse-hazard');

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('glaciere-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const cramponCheckbox = page.getByLabel(
      /12-Point Chromoly Steel Crampons with Full Anti-Balling Plates/i
    );
    await cramponCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const co2Checkbox = page.getByLabel(
      /NDIR Dual-Channel CO2 & O2 Subterranean Sump Gas Monitor/i
    );
    await co2Checkbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

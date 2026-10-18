import { test, expect } from '@playwright/test';

test.describe('High-Alpine Talus & Boulder-Field Periglacial Rock-Glacier Navigation Guide Journey', () => {
  test('loads /rock-glacier-navigation, verifies heading, filters sites, loads site into calculator, tests presets, and verifies gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /rock-glacier-navigation
    await page.goto('/rock-glacier-navigation');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /High-Alpine Talus & Boulder-Field Periglacial Rock-Glacier Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'High-Alpine Talus & Boulder-Field Periglacial Rock-Glacier Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Rock-Glacier Morphology
    const morphologySelect = page.getByLabel(/Rock-Glacier Morphology/i);
    await morphologySelect.selectOption('active_lobate_ice_cored_carapace');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Sourdough Peak & McCarthy Creek Lobate Rock Glacier/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Glaciar de Escombros Dos Lenguas/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Glaciar de Escombros Dos Lenguas/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const muraglCard = page.getByTestId(
      'rock-glacier-site-card-muragl-upper-engadine-permafrost-carapace'
    );
    await muraglCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Mean Block Diameter \(cm\)/i)).toHaveValue(
      '84'
    );
    await expect(page.getByLabel(/Slope Angle \(deg\)/i)).toHaveValue('25');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('rock-glacier-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Cryo-Cemented Compression Ridge Corridor/i,
      })
      .click();
    await expect(resultPanel).toContainText('nominal_cryo_cemented_carapace');

    await page
      .getByRole('button', {
        name: /Midday Active-Layer Thaw & Void Caution/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'caution_perched_block_and_void_hazard'
    );

    await page
      .getByRole('button', {
        name: /Oversteepened Frontal Scarp & Thaw-Slump Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort_oversteepened_scarp_or_thaw_rotation'
    );

    // 6. Verify 6-item Mandatory Ankle/Tibial Armor & Block Extrication Gear Checklist
    const gearCounter = page.getByTestId('rock-glacier-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 mandatory items verified');

    const bootCheckbox = page.getByLabel(
      /Full\/3-Quarter Shank Vibram Megagrip B2\/B3 Mountaineering Boots/i
    );
    await bootCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 mandatory items verified');

    const staffCheckbox = page.getByLabel(
      /Fixed-Wall Chromoly\/7075-T6 Scrambling Staff/i
    );
    await staffCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 mandatory items verified');
  });
});

import { test, expect } from '@playwright/test';

test.describe('High-Altitude Páramo & Frailejón Cushion-Bog Moorland Navigation Guide Journey', () => {
  test('loads /paramo-navigation, verifies heading, filters sites, loads site into calculator, tests presets, and verifies gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /paramo-navigation
    await page.goto('/paramo-navigation');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /High-Altitude Páramo & Frailejón Cushion-Bog Moorland Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'High-Altitude Páramo & Frailejón Cushion-Bog Moorland Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Páramo Substrate Morphology
    const substrateSelect = page.getByLabel(/Páramo Substrate Morphology/i);
    await substrateSelect.selectOption('plantago_distichia_cushion_bog_dome');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Reserva Ecológica El Ángel & Voladero Cushion-Bog Basin/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Páramo de Sumapaz & Lagunas de Chisacá Frailejón Moorland/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Páramo de Sumapaz & Lagunas de Chisacá Frailejón Moorland/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const cajasCard = page.getByTestId(
      'paramo-site-card-cajas-toreadora-glacial-turbera-labyrinth'
    );
    await cajasCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Cushion Mat Thickness \(cm\)/i)).toHaveValue(
      '14'
    );
    await expect(
      page.getByLabel(/Histosol Water Saturation \(%\)/i)
    ).toHaveValue('92');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('paramo-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Morning Clear Distichia Cushion Corridor/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'nominal_morning_window_cushion_corridor'
    );

    await page
      .getByRole('button', {
        name: /Orographic Drizzle Whiteout & Turbera Caution/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'caution_whiteout_fog_and_turbera_breakthrough'
    );

    await page
      .getByRole('button', {
        name: /Freezing Sleet Squall & Saturated Peat Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort_hypothermic_squall_and_peat_mire_entrapment'
    );

    // 6. Verify 6-item Mandatory Turbera Footwear, Probing & Hypothermia Gear Checklist
    const gearCounter = page.getByTestId('paramo-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 mandatory items verified');

    const pantanerasCheckbox = page.getByLabel(
      /Knee-High Neoprene-Lined Vulcanized Rubber Páramo Pantaneras/i
    );
    await pantanerasCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 mandatory items verified');

    const polesCheckbox = page.getByLabel(
      /Dual-Probe Carbon\/Alloy Trekking Poles with 85 mm Snow Baskets/i
    );
    await polesCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 mandatory items verified');
  });
});

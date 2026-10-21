import { test, expect } from '@playwright/test';

test.describe('High-Alpine Snowfield Sun-Cup & Penitentes Crampon Navigation Guide Journey', () => {
  test('loads /penitentes-navigation, verifies heading, filters sites, loads site into calculator, tests presets, and verifies gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /penitentes-navigation
    await page.goto('/penitentes-navigation');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /High-Alpine Snowfield Sun-Cup & Penitentes Crampon Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'High-Alpine Snowfield Sun-Cup & Penitentes Crampon Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Ablation Morphology
    const morphologySelect = page.getByLabel(/Ablation Morphology/i);
    await morphologySelect.selectOption('mature_cathedral_nieves_penitentes');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Aconcagua Polish Glacier & Upper Guanacos Penitentes Labyrinth/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Volcán Tupungato High-Puna Cathedral Penitente Forest/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Rainier Late-Summer Muir Snowfield Sun-Cup Matrix/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Rainier Late-Summer Muir Snowfield Sun-Cup Matrix/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const aconcaguaCard = page.getByTestId(
      'penitentes-site-card-aconcagua-polish-glacier-penitentes'
    );
    await aconcaguaCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Blade Height \(cm\)/i)).toHaveValue('185');
    await expect(page.getByLabel(/Slope Angle \(deg\)/i)).toHaveValue('34');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('penitentes-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', { name: /Predawn Frozen Trough Corridor/i })
      .click();
    await expect(resultPanel).toContainText('optimal_predawn_frozen_corridor');

    await page
      .getByRole('button', { name: /Midday Sun-Cup Crest Labyrinth/i })
      .click();
    await expect(resultPanel).toContainText(
      'caution_crampon_balling_and_ankle_torque'
    );

    await page
      .getByRole('button', { name: /Rotten Isothermal Penitentes Collapse/i })
      .click();
    await expect(resultPanel).toContainText('abort_isothermal_blade_collapse');

    // 6. Verify 6-item Mandatory Crampon & Lower-Limb Armor Gear Checklist
    const gearCounter = page.getByTestId('penitentes-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 mandatory items verified');

    const cramponCheckbox = page.getByLabel(
      /Chromoly 12-Point Mountaineering Crampons/i
    );
    await cramponCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 mandatory items verified');

    const gaiterCheckbox = page.getByLabel(
      /Hardshell Kevlar-Reinforced Padded Shin Armor/i
    );
    await gaiterCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 mandatory items verified');
  });
});

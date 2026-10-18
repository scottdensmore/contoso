import { test, expect } from '@playwright/test';

test.describe('Subarctic River Aufeis (Icings) & Overflow Ice Sheet Crossing Guide Journey', () => {
  test('loads /aufeis-crossing, verifies heading, filters sites, loads site into calculator, tests presets, and verifies gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /aufeis-crossing
    await page.goto('/aufeis-crossing');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Subarctic River Aufeis \(Icings\) & Overflow Ice Sheet Crossing Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Subarctic River Aufeis (Icings) & Overflow Ice Sheet Crossing Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Aufeis Morphology
    const morphologySelect = page.getByLabel(/Aufeis Morphology/i);
    await morphologySelect.selectOption('perennial_tundra_spring_naled');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Canning River & Shublik Springs Perennial Aufeis Field/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Moma River Valley Ulakhan-Taryn Great Naled/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Firth River & Joe Creek Braided Naled Sheet/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Firth River & Joe Creek Braided Naled Sheet/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const deltaCard = page.getByTestId(
      'aufeis-site-card-delta-river-black-rapids-overflow-sheet'
    );
    await deltaCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Upper Crust Thickness \(cm\)/i)).toHaveValue(
      '11'
    );
    await expect(page.getByLabel(/Slush Water Lens Depth \(cm\)/i)).toHaveValue(
      '45'
    );

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('aufeis-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', { name: /Cryolocked Laminar Sheet Corridor/i })
      .click();
    await expect(resultPanel).toContainText('nominal_cryolocked_laminar_sheet');

    await page
      .getByRole('button', {
        name: /Active Overflow Slush Accretion Caution/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'caution_overflow_slush_accretion_hazard'
    );

    await page
      .getByRole('button', {
        name: /Pressurized Frost-Blister & Hollow Vault Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort_pressurized_lens_or_cavity_collapse'
    );

    // 6. Verify 6-item Mandatory Ice Sounding & Slush Accretion Gear Checklist
    const gearCounter = page.getByTestId('aufeis-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 mandatory items verified');

    const soundingBarCheckbox = page.getByLabel(
      /Graduated Chisel-Tip Steel Ice Sounding Bar/i
    );
    await soundingBarCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 mandatory items verified');

    const overbootsCheckbox = page.getByLabel(
      /Vapor-Barrier Neoprene & Coated-Nylon Insulated Overboots/i
    );
    await overbootsCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 mandatory items verified');
  });
});

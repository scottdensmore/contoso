import { test, expect } from '@playwright/test';

test.describe('Backcountry Geothermal Fumarole Field & Solfatara Gas Hazard Navigation Guide Journey', () => {
  test('loads /solfatara-navigation, verifies heading, filters sites, loads site into calculator, tests presets, and verifies gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /solfatara-navigation
    await page.goto('/solfatara-navigation');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Backcountry Geothermal Fumarole Field & Solfatara Gas Hazard Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Geothermal Fumarole Field & Solfatara Gas Hazard Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Boundary-Layer Wind State
    const windSelect = page.getByLabel(/Boundary-Layer Wind State/i);
    await windSelect.selectOption('katabatic_calms_inversion_trap');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /El Tatio High-Andean Geyser & Sinter Terrace Field/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mutnovsky Volcano Active Crater & Donnoe Solfatara Field/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Valley of Ten Thousand Smokes & Novarupta Vent Dome/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Valley of Ten Thousand Smokes & Novarupta Vent Dome/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const bumpassCard = page.getByTestId(
      'solfatara-site-card-lassens-bumpass-hell-devil-kitchen-solfatara'
    );
    await bumpassCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Sinter Crust Thickness \(cm\)/i)).toHaveValue(
      '14'
    );
    await expect(page.getByLabel(/10 cm Subsurface Temp \(°C\)/i)).toHaveValue(
      '84'
    );

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('solfatara-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', { name: /Ventilated Sinter Shield Corridor/i })
      .click();
    await expect(resultPanel).toContainText('nominal_upwind_sinter_corridor');

    await page
      .getByRole('button', { name: /Acid Plume Downwash Caution/i })
      .click();
    await expect(resultPanel).toContainText(
      'caution_acid_plume_respirator_required'
    );

    await page
      .getByRole('button', {
        name: /Calm Inversion Mofette & Thin Mudpot Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort_lethal_gas_pool_or_crust_collapse'
    );

    // 6. Verify 6-item Mandatory Gas Telemetry & Crust Probing Gear Checklist
    const gearCounter = page.getByTestId('solfatara-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 mandatory items verified');

    const detectorCheckbox = page.getByLabel(
      /Pumped 4-Gas Electrochemical & NDIR Detector/i
    );
    await detectorCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 mandatory items verified');

    const respiratorCheckbox = page.getByLabel(
      /NIOSH OV\/AG\/P100 Acid-Gas Elastomeric Half-Mask Respirator/i
    );
    await respiratorCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 mandatory items verified');
  });
});

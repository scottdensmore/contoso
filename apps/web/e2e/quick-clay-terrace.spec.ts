import { test, expect } from '@playwright/test';

test.describe('Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation Guide Journey', () => {
  test('loads /quick-clay-terrace, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /quick-clay-terrace
    await page.goto('/quick-clay-terrace');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Coastal Fjord Quick-Clay \(Kvikkleire\) Marine-Terrace & Retrogressive Slump Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Quick-Clay Deposit Type
    const depositSelect = page.getByLabel(/Quick-Clay Deposit Type/i);
    await depositSelect.selectOption('fjord-delta-subaqueous-scarp');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Romerike & Nittedal-Gjerdrum Dissected Quick-Clay Plateau/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Gauldalen & Rissa Trondheimsfjord Kvikkleire Marine-Terrace Ravines/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Gauldalen & Rissa Trondheimsfjord Kvikkleire Marine-Terrace Ravines/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const gauldalenCard = page.getByTestId(
      'quick-clay-terrace-site-card-gauldalen-trondheimsfjord-kvikkleire-norway'
    );
    await gauldalenCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Sensitivity Ratio St/i)).toHaveValue('120');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId(
      'quick-clay-terrace-calculator-result'
    );
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Bedrock Ridge Above Marine Limit/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'bedrock-ridge-above-marine-limit'
    );

    await page
      .getByRole('button', {
        name: /Moderate Wide-Setback Dry-Crust March/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'wide-setback-dry-crust-terrace-march'
    );

    await page
      .getByRole('button', {
        name: /High Evacuate Ravine Floor to High Ground/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'evacuate-ravine-floor-lateral-high-ground'
    );

    await page
      .getByRole('button', {
        name: /Critical Abort Imminent Flake-Flow Liquefaction/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-imminent-flake-flow-liquefaction'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('quick-clay-terrace-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const probeCheckbox = page.getByLabel(
      /Portable Field Vane-Shear & Conductivity Pore-Salinity Probe/i
    );
    await probeCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const skisCheckbox = page.getByLabel(
      /Wide Backcountry Skis or High-Flotation Bog Snowshoes/i
    );
    await skisCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

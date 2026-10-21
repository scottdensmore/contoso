import { test, expect } from '@playwright/test';

test.describe('Arctic Polygon-Tundra Ice-Wedge Trough & Thermokarst Thaw-Slump Navigation Guide Journey', () => {
  test('loads /thermokarst-tundra, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /thermokarst-tundra
    await page.goto('/thermokarst-tundra');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Arctic Polygon-Tundra Ice-Wedge Trough & Thermokarst Thaw-Slump Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Arctic Polygon-Tundra Ice-Wedge Trough & Thermokarst Thaw-Slump Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Thermokarst Morphology
    const morphologySelect = page.getByLabel(/Thermokarst Morphology/i);
    await morphologySelect.selectOption('retrogressive-thaw-slump-headwall');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Batagaika & Yana Highlands Retrogressive Thaw-Slump Headwall/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Tuktoyaktuk Peninsula Ice-Wedge Polygon & Pingo Littoral Tundra/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Tuktoyaktuk Peninsula Ice-Wedge Polygon & Pingo Littoral Tundra/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const batagaikaCard = page.getByTestId(
      'thermokarst-site-card-batagaika-mega-slump-yakutia'
    );
    await batagaikaCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Active-Layer Thaw Depth \(cm\)/i)
    ).toHaveValue('135');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('thermokarst-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Polygon Rim Levee/i,
      })
      .click();
    await expect(resultPanel).toContainText('walk-polygon-rim-levees');

    await page
      .getByRole('button', {
        name: /Moderate High-Center Polygon Trough/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'probe-frost-table-diagonal-trough-hop'
    );

    await page
      .getByRole('button', {
        name: /High Eriophorum Tussock & Deep Trough/i,
      })
      .click();
    await expect(resultPanel).toContainText('gravel-esker-ridge-detour');

    await page
      .getByRole('button', {
        name: /Critical Yedoma Thaw-Slump Liquefaction/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-retrogressive-slump-mudflow-hazard'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('thermokarst-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const probeCheckbox = page.getByLabel(
      /Graduated 160 cm Carbon-Steel Permafrost Frost-Table Tile Probe/i
    );
    await probeCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const bootsCheckbox = page.getByLabel(
      /Knee-High Neoprene-Lined Tundra Wading Boots & Locking Lace Gaiters/i
    );
    await bootsCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

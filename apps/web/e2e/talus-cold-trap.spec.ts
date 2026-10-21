import { test, expect } from '@playwright/test';

test.describe('Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation Guide Journey', () => {
  test('loads /talus-cold-trap, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /talus-cold-trap
    await page.goto('/talus-cold-trap');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Talus Cold-Trap Regime
    const regimeSelect = page.getByLabel(/Talus Cold-Trap Regime/i);
    await regimeSelect.selectOption('algific-dolomite-cold-vent-slope');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Driftless Area Algific Talus Cold-Air Vent Slopes/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /King Ravine Subway & Mahoosuc Notch Balch-Ice Megatalus/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /King Ravine Subway & Mahoosuc Notch Balch-Ice Megatalus/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const kingRavineCard = page.getByTestId(
      'talus-cold-trap-site-card-king-ravine-mahosuc-notch-white-mountains-nh'
    );
    await kingRavineCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Crevice Void Depth \(m\)/i)).toHaveValue(
      '18'
    );

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('talus-cold-trap-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Three-Point Dry Granite Hop/i,
      })
      .click();
    await expect(resultPanel).toContainText('three-point-dry-granite-hop');

    await page
      .getByRole('button', {
        name: /Moderate Sphagnum Probe & Microspike Transition/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'probe-sphagnum-mats-microspike-transition'
    );

    await page
      .getByRole('button', {
        name: /High Chockstone Crawl & Deep-Vent Avoidance/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'belay-chockstone-crawl-avoid-deep-vents'
    );

    await page
      .getByRole('button', {
        name: /Critical Glazed Megatalus Entrapment Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-glazed-megatalus-entrapment-hazard'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('talus-cold-trap-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const spikesCheckbox = page.getByLabel(
      /Stainless-Steel Torsional Chain Microspikes & Carbide Talus Probe/i
    );
    await spikesCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const helmetCheckbox = page.getByLabel(
      /UIAA-Rated Sub-Talus Caving Helmet & Dual-Beam Headlamp/i
    );
    await helmetCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

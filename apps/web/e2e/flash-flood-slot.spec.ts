import { test, expect } from '@playwright/test';

test.describe('High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Navigation Guide Journey', () => {
  test('loads /flash-flood-slot, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /flash-flood-slot
    await page.goto('/flash-flood-slot');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Slot Canyon Lithology
    const lithologySelect = page.getByLabel(/Slot Canyon Lithology/i);
    await lithologySelect.selectOption('wingate-vertical-fissure');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Little Wild Horse & Bell Canyon San Rafael Reef Narrows/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Buckskin Gulch & Wire Pass Navajo Sandstone Constriction/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Buckskin Gulch & Wire Pass Navajo Sandstone Constriction/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const buckskinCard = page.getByTestId(
      'flash-flood-site-card-buckskin-gulch-paria-usa'
    );
    await buckskinCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Catchment Area \(km²\)/i)).toHaveValue(
      '1050'
    );
    await expect(page.getByLabel(/Slot Width \(m\)/i)).toHaveValue('1.2');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('flash-flood-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Blue-Sky Baseline/i,
      })
      .click();
    await expect(resultPanel).toContainText('normal-transit-monitor-sky');

    await page
      .getByRole('button', {
        name: /Moderate Distant Virga & Slickrock Drip/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'accelerate-to-exit-stage-alcoves'
    );

    await page
      .getByRole('button', {
        name: /High Upstream Cell Burst — Ascend Ledge/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'ascend-high-water-escape-ledge-immediately'
    );

    await page
      .getByRole('button', {
        name: /Critical Monsoon Flash-Flood Bore Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-do-not-enter-flash-flood-imminent'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('flash-flood-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const satCheckbox = page.getByLabel(
      /Dual-Band Iridium Satellite Communicator & NOAA NEXRAD Mesoscale Alerts/i
    );
    await satCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const ropeCheckbox = page.getByLabel(
      /60 m 8.5 mm Hydrophobic Aramid-Sheath Canyon Static Rope & Mechanical Ascenders/i
    );
    await ropeCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

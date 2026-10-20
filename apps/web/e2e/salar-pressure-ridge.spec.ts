import { test, expect } from '@playwright/test';

test.describe('High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking Guide Journey', () => {
  test('loads /salar-pressure-ridge, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /salar-pressure-ridge
    await page.goto('/salar-pressure-ridge');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Salar Morphology
    const morphologySelect = page.getByLabel(/Salar Morphology/i);
    await morphologySelect.selectOption('polygonal-halite-pressure-crust');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Salar de Arizaro & Cono de Arita Black-Halite Pressure-Ridge Basin/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Salar de Uyuni Isla Incahuasi & Colchani Ojos del Salar Corridor/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Salar de Uyuni Isla Incahuasi & Colchani Ojos del Salar Corridor/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const uyuniCard = page.getByTestId(
      'salar-site-card-uyuni-incahuasi-ojos-bolivia'
    );
    await uyuniCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Halite Crust Thickness \(cm\)/i)
    ).toHaveValue('28');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('salar-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Polygonal Plate March/i,
      })
      .click();
    await expect(resultPanel).toContainText('direct-polygonal-plate-march');

    await page
      .getByRole('button', {
        name: /Moderate Ojos Margin Detour/i,
      })
      .click();
    await expect(resultPanel).toContainText('probe-ojos-margin-30m-detour');

    await page
      .getByRole('button', {
        name: /High Gypsum Ridge Pulk & Goggles/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'snowshoe-pulk-load-spread-glacier-goggles'
    );

    await page
      .getByRole('button', {
        name: /Critical Thin Mirabilite Brine Crust/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-thin-mirabilite-brine-crust'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('salar-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const gogglesCheckbox = page.getByLabel(
      /Category 4 Glacier Goggles with Leather Side-Shields & Nose Guard/i
    );
    await gogglesCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const probeCheckbox = page.getByLabel(
      /Graduated Carbon-Steel Halite Crust Probe Rod \(200 cm\)/i
    );
    await probeCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

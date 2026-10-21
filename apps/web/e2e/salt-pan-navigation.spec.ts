import { test, expect } from '@playwright/test';

test.describe('Arid Playas & Salt Pan Crust Bearing-Capacity & Mirage Compass Navigation Guide Journey', () => {
  test('loads /salt-pan-navigation, verifies heading, filters sites, loads site into calculator, tests presets, and verifies gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /salt-pan-navigation
    await page.goto('/salt-pan-navigation');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Arid Playas & Salt Pan Crust Bearing-Capacity & Mirage Compass Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Arid Playas & Salt Pan Crust Bearing-Capacity & Mirage Compass Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Evaporite Crust Type
    const crustSelect = page.getByLabel(/Evaporite Crust Type/i);
    await crustSelect.selectOption('polygonal_halite_pressure_ridge');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Salar de Uyuni & Isla Incahuasi Polygonal Halite Core/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Badwater Basin & Devil's Golf Course Serrated Halite Pan/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Badwater Basin & Devil's Golf Course Serrated Halite Pan/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const badwaterCard = page.getByTestId(
      'salt-pan-site-card-badwater-devils-golf-course-halite-pan'
    );
    await badwaterCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Halite Crust Thickness \(cm\)/i)
    ).toHaveValue('16');
    await expect(page.getByLabel(/Water Table Depth \(cm\)/i)).toHaveValue(
      '28'
    );

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('salt-pan-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', { name: /Predawn Crystalline Halite Corridor/i })
      .click();
    await expect(resultPanel).toContainText(
      'nominal_crystalline_halite_corridor'
    );

    await page
      .getByRole('button', {
        name: /Midday Inferior Mirage & Gypsum Crust Caution/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'caution_mirage_azimuth_drift_and_brine_crust'
    );

    await page
      .getByRole('button', {
        name: /Capillary Brine Margin & Liquefied Silt Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort_subsurface_brine_mud_breakthrough'
    );

    // 6. Verify 6-item Mandatory Crust Sounding & Optical Navigation Gear Checklist
    const gearCounter = page.getByTestId('salt-pan-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 mandatory items verified');

    const augerCheckbox = page.getByLabel(
      /Graduated Stainless Evaporite Crust Core Auger/i
    );
    await augerCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 mandatory items verified');

    const compassCheckbox = page.getByLabel(
      /Fluid-Damped Prismatic Sighting Compass/i
    );
    await compassCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 mandatory items verified');
  });
});

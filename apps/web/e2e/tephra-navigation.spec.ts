import { test, expect } from '@playwright/test';

test.describe('Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator Guide Journey', () => {
  test('loads /tephra-navigation, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /tephra-navigation
    await page.goto('/tephra-navigation');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Tephra Lithology
    const lithologySelect = page.getByLabel(/Tephra Lithology/i);
    await lithologySelect.selectOption('vesicular-pumice');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Tarawera Chasm & Basaltic Scoria Scree/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Yasur Ash Plain & Scoria Cone Apron/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Yasur Ash Plain & Scoria Cone Apron/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const chaitenCard = page.getByTestId(
      'tephra-site-card-chaiten-rhyolite-pumice-chile'
    );
    await chaitenCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Slope Angle \(deg\)/i)).toHaveValue('35');
    await expect(page.getByLabel(/Cristobalite Ash \(%\)/i)).toHaveValue('19');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('tephra-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Dust Coarse Lapilli Baseline/i,
      })
      .click();
    await expect(resultPanel).toContainText('N95-goggles');

    await page
      .getByRole('button', {
        name: /Moderate Scoria Plunge-Step Corridor/i,
      })
      .click();
    await expect(resultPanel).toContainText('P100-elastomeric-sealed-goggles');

    await page
      .getByRole('button', {
        name: /High Ash Resuspension & Lapilli Chute/i,
      })
      .click();
    await expect(resultPanel).toContainText('P100-full-face-APR');

    await page
      .getByRole('button', {
        name: /Critical Cristobalite Dome & Grain-Flow Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText('abort-silicosis-grainflow-hazard');

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('tephra-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const p100Checkbox = page.getByLabel(
      /NIOSH P100 Elastomeric Half-Mask Respirator & Spare Particulate Cartridges/i
    );
    await p100Checkbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const gogglesCheckbox = page.getByLabel(
      /Non-Vented Sealed Polycarbonate Ash & Lapilli Goggles/i
    );
    await gogglesCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

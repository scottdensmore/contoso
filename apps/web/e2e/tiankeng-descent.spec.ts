import { test, expect } from '@playwright/test';

test.describe('Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent Guide Journey', () => {
  test('loads /tiankeng-descent, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /tiankeng-descent
    await page.goto('/tiankeng-descent');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Karst Tiankeng \(Giant Collapse Sinkhole\) & Vertical Cloud-Forest Rim Descent Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Tiankeng Morphology
    const morphologySelect = page.getByLabel(/Tiankeng Morphology/i);
    await morphologySelect.selectOption('twin-window-karst-chasm');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Dashiwei Tiankeng Subterranean Cloud-Forest Rim/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Xiaozhai Tiankeng Double-Nested Collapse Mega-Doline/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Xiaozhai Tiankeng Double-Nested Collapse Mega-Doline/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const xiaozhaiCard = page.getByTestId(
      'tiankeng-site-card-xiaozhai-tiankeng-chongqing-china'
    );
    await xiaozhaiCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Vertical Drop \(m\)/i)).toHaveValue('662');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('tiankeng-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Overhung Multi-Rebelay Baseline/i,
      })
      .click();
    await expect(resultPanel).toContainText('single-pitch-rack-descender');

    await page
      .getByRole('button', {
        name: /Moderate Cloud-Forest Rebelay Pitch/i,
      })
      .click();
    await expect(resultPanel).toContainText('multi-rebelay-deviation-srt');

    await page
      .getByRole('button', {
        name: /High Deep-Shaft Thermal & Spall Exposure/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'expedition-6-bar-rack-water-deviation'
    );

    await page
      .getByRole('button', {
        name: /Critical Unbroken Mega-Shaft Waterfall Plume/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-plummet-spall-hypothermia-hazard'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('tiankeng-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const rackCheckbox = page.getByLabel(
      /6-Bar Stainless U-Rack with Hyper-Bar & Stainless Heat-Sink Spacers/i
    );
    await rackCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const rebelayCheckbox = page.getByLabel(
      /10.5 mm Low-Stretch Polyamide SRT Static Line, Dyneema Rebelay Slings & Canvas Edge Rollers/i
    );
    await rebelayCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

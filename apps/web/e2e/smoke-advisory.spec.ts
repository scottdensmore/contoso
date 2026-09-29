import { test, expect } from '@playwright/test';

test.describe('Wilderness Forest Fire Smoke Drift & Alpine Air Quality Advisor Journey', () => {
  test('navigates to /smoke-advisory, verifies title & H1, filters elevation layers, computes exposure & dose reduction, and interacts with gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /smoke-advisory
    await page.goto('/smoke-advisory');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Wilderness Forest Fire Smoke Drift & Alpine Air Quality Advisor \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Forest Fire Smoke Drift & Alpine Air Quality Advisor',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Mid-Slope Thermal Belt" and verifies expected cards are displayed while other stations are hidden
    const stationsGrid = page.getByTestId('smoke-stations-grid');
    await expect(stationsGrid).toContainText('Pasayten Boundary Fire Telemetry');
    await expect(stationsGrid).toContainText('Sawtooth Valley Inversion & Ridge Station');
    await expect(stationsGrid).toContainText('San Juan Wetterhorn Alpine Air Basin');

    const midSlopeBtn = page.getByRole('button', { name: /^Mid-Slope Thermal Belt/i });
    await midSlopeBtn.click();

    await expect(stationsGrid).toContainText('Sawtooth Valley Inversion & Ridge Station');
    await expect(stationsGrid).not.toContainText('Pasayten Boundary Fire Telemetry');
    await expect(stationsGrid).not.toContainText('San Juan Wetterhorn Alpine Air Basin');

    const allBtn = page.getByRole('button', { name: /^All Layers/i });
    await allBtn.click();
    await expect(stationsGrid).toContainText('Pasayten Boundary Fire Telemetry');

    // 4. Selects Pasayten Boundary Fire in calculator, sets activity to "Strenuous Alpine Ascent" and respirator to "None"
    const stationSelect = page.getByLabel(/^monitoring station$/i);
    const activitySelect = page.getByLabel(/^activity intensity$/i);
    const respiratorSelect = page.getByLabel(/^respiratory protection$/i);
    const statusPanel = page.getByRole('status');

    await stationSelect.selectOption('pasayten-boundary-fire');
    await activitySelect.selectOption('strenuous_alpine_ascent');
    await respiratorSelect.selectOption('none');

    // Asserts live status reflects critical hazard status and high particulate dose
    await expect(statusPanel).toContainText('Critical Hazard Cease Exertion');
    await expect(statusPanel).toContainText('3148.8 µg');

    // Sets respirator to "P100 Elastomeric Half-Mask" and asserts dose reduction
    await respiratorSelect.selectOption('p100_elastomeric_half_mask');
    await expect(statusPanel).toContainText('3.1 µg');

    // 5. Interacts with the Gear Checklist and verifies smoke-advisory-gear-counter updates
    const counter = page.getByTestId('smoke-advisory-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const firstCheckbox = page.getByRole('checkbox').first();
    await firstCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const secondCheckbox = page.getByRole('checkbox').nth(1);
    await secondCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await firstCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

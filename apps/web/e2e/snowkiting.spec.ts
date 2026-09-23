import { test, expect } from '@playwright/test';

test.describe('Backcountry Snowkiting & Polar Kite Expeditions Guide Journey', () => {
  test('navigates to /snowkiting, filters terrain types, models kite aerodynamics, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /snowkiting
    await page.goto('/snowkiting');

    // 2. Verify page title and literal H1 "Backcountry Snowkiting & Polar Kite Expeditions Guide"
    await expect(page).toHaveTitle(
      /Backcountry Snowkiting & Polar Kite Expeditions Guide \| Contoso Outdoors/,
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Snowkiting & Polar Kite Expeditions Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Polar Plateau" or "Ice Sheet" and verify expected cards
    const grid = page.getByTestId('snowkiting-spots-grid');

    const plateauBtn = page.getByRole('button', { name: /polar plateau/i });
    await plateauBtn.click();
    await expect(grid).toContainText('Hardangervidda Polar Plateau');
    await expect(grid).not.toContainText('Camas Prairie High Basin');
    await expect(grid).not.toContainText('Col du Lautaret Alpine Basin');
    await expect(grid).not.toContainText('Lake Mille Lacs Frozen Expanse');
    await expect(grid).not.toContainText('Greenland Ice Sheet South-to-North Route');

    const iceSheetBtn = page.getByRole('button', { name: /ice sheet/i });
    await iceSheetBtn.click();
    await expect(grid).toContainText('Greenland Ice Sheet South-to-North Route');
    await expect(grid).not.toContainText('Hardangervidda Polar Plateau');
    await expect(grid).not.toContainText('Camas Prairie High Basin');

    const allBtn = page.getByRole('button', { name: /all spots/i });
    await allBtn.click();
    await expect(grid).toContainText('Hardangervidda Polar Plateau');
    await expect(grid).toContainText('Greenland Ice Sheet South-to-North Route');
    await expect(grid).toContainText('Col du Lautaret Alpine Basin');

    // 4. Selects Hardangervidda or Greenland in calculator, adjusts wind speed to 35 knots, asserts live status reflects hazardous storm force warning
    const spotSelect = page.getByLabel(/select.*snowkiting spot/i);
    await spotSelect.selectOption('hardangervidda-plateau-norway');

    const resultPanel = page.getByTestId('snowkiting-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Hardangervidda Polar Plateau');
    await expect(resultPanel).toContainText('Approved');

    const windInput = page.getByLabel(/wind speed/i);
    await windInput.fill('35');
    await expect(resultPanel).toContainText('Hazardous: Storm Force');
    await expect(resultPanel).toContainText('STORM FORCE HAZARD');

    // Also verify Greenland selection
    await spotSelect.selectOption('greenland-icecap-traverse');
    await expect(resultPanel).toContainText('Greenland Ice Sheet South-to-North Route');

    // 5. Interacts with the Snowkiting Safety Kit checklist and verifies snowkiting-gear-counter
    const counter = page.getByTestId('snowkiting-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const kiteCheckbox = page.getByLabel(/Closed-Cell High-Depower Ultralight Foil Kite/i);
    await kiteCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const harnessCheckbox = page.getByLabel(/CE Certified Mountaineering\/Snowkite Seat Harness/i);
    await harnessCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await kiteCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

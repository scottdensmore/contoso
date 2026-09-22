import { test, expect } from '@playwright/test';

test.describe('Desert Trekking & Arid Wilderness Survival Advisor Journey', () => {
  test('navigates to /desert-trekking, filters aridity zones, tests water cache & heat index calculator, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /desert-trekking
    await page.goto('/desert-trekking');

    // 2. Verify page title and literal H1 "Desert Trekking & Arid Wilderness Survival Advisor"
    await expect(page).toHaveTitle(
      /Desert Trekking & Arid Wilderness Survival Advisor \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Desert Trekking & Arid Wilderness Survival Advisor',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Canyon Wash" or "Salt Playa" and verifies expected cards are displayed while others are hidden
    const grid = page.getByTestId('desert-routes-grid');

    // Filter by Salt Playa
    const saltPlayaBtn = page.getByRole('button', { name: /salt playa/i });
    await saltPlayaBtn.click();
    await expect(grid.getByRole('heading', { name: /Badwater Basin/i })).toBeVisible();
    await expect(grid.getByRole('heading', { name: /Black Rock Desert/i })).toBeVisible();
    await expect(grid.getByRole('heading', { name: /Buckskin Gulch/i })).not.toBeVisible();
    await expect(grid.getByRole('heading', { name: /Mazatzal Divide/i })).not.toBeVisible();

    // Filter by Canyon Wash
    const canyonWashBtn = page.getByRole('button', { name: /canyon wash/i });
    await canyonWashBtn.click();
    await expect(grid.getByRole('heading', { name: /Buckskin Gulch/i })).toBeVisible();
    await expect(grid.getByRole('heading', { name: /Badwater Basin/i })).not.toBeVisible();
    await expect(grid.getByRole('heading', { name: /Black Rock Desert/i })).not.toBeVisible();

    // Reset to All Routes
    const allBtn = page.getByRole('button', { name: /all routes/i });
    await allBtn.click();
    await expect(grid.getByRole('heading', { name: /Badwater Basin/i })).toBeVisible();
    await expect(grid.getByRole('heading', { name: /Buckskin Gulch/i })).toBeVisible();
    await expect(grid.getByRole('heading', { name: /Mazatzal Divide/i })).toBeVisible();
    await expect(grid.getByRole('heading', { name: /Black Rock Desert/i })).toBeVisible();
    await expect(grid.getByRole('heading', { name: /Mariscal Canyon/i })).toBeVisible();

    // 4. Selects Badwater Traverse in calculator, tests high temperature (>105°F) or high hours, asserts live status reflects water cache mandatory or extreme heat warning and total liters
    const routeSelect = page.getByLabel(/select.*desert route/i);
    await routeSelect.selectOption('badwater-telescope-peak-traverse');

    const resultPanel = page.getByTestId('desert-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel.getByRole('heading', { name: /Badwater Basin/i })).toBeVisible();

    // Increase temperature and hours to test high heat and water cache mandatory (> 7L)
    const tempInput = page.getByLabel(/ambient temperature/i);
    await tempInput.fill('106');

    const hoursInput = page.getByLabel(/hours in direct sun/i);
    await hoursInput.fill('8');

    await expect(resultPanel).toContainText('Water Cache Mandatory');
    await expect(resultPanel).toContainText('Liters');
    await expect(resultPanel).toContainText('MANDATORY WATER CACHE REQUIRED');

    // Test extreme heat no travel (> 110°F felt heat index)
    await tempInput.fill('120');
    await expect(resultPanel).toContainText('Extreme Heat No Travel');
    await expect(resultPanel).toContainText('HEAT WARNING');

    // 5. Interacts with the Desert Trekking Kit checklist and verifies desert-gear-counter updates
    const counter = page.getByTestId('desert-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const hatCheckbox = page.getByLabel(/upf 50\+ wide-brim desert sun hat/i);
    await hatCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const umbrellaCheckbox = page.getByLabel(/reflective chrome uv-block trekking sun umbrella/i);
    await umbrellaCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await hatCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

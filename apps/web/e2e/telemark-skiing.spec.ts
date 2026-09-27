import { test, expect } from '@playwright/test';

test.describe('Alpine Telemark Skiing & Freeheel Backcountry Descending Guide Journey', () => {
  test('navigates to /telemark-skiing, filters binding systems, calculates freeheel physics, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigates to /telemark-skiing
    await page.goto('/telemark-skiing');

    // 2. Verifies page title and literal H1 "Alpine Telemark Skiing & Freeheel Backcountry Descending"
    await expect(page).toHaveTitle(
      /Alpine Telemark Skiing & Freeheel Backcountry Descending \| Contoso Outdoors/,
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Telemark Skiing & Freeheel Backcountry Descending',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "75mm Duckbill Cable" and verifies expected cards are displayed while other zones are hidden
    const grid = page.getByTestId('telemark-zones-grid');
    const duckbillBtn = page.getByRole('button', { name: /^75mm Duckbill Cable$/i });
    await duckbillBtn.click();

    await expect(grid).toContainText('Mad River Glen Gen Stark Ridge Telemark Glades');
    await expect(grid).not.toContainText('Silverton Mountain High Alpine Freeheel Bowls');
    await expect(grid).not.toContainText('Alta Backcountry Catherine');
    await expect(grid).not.toContainText('Rogers Pass Asulkan Valley');
    await expect(grid).not.toContainText('Mount Washington Tuckerman Ravine');

    // Reset back to All Systems
    const allBtn = page.getByRole('button', { name: /^All Systems$/i });
    await allBtn.click();
    await expect(grid).toContainText('Silverton Mountain High Alpine Freeheel Bowls');
    await expect(grid).toContainText('Mad River Glen Gen Stark Ridge Telemark Glades');
    await expect(grid).toContainText('Alta Backcountry Catherine');
    await expect(grid).toContainText('Rogers Pass Asulkan Valley');
    await expect(grid).toContainText('Mount Washington Tuckerman Ravine');

    // 4. Selects Silverton Mountain in calculator, sets tension level to 5, asserts live status reflects active carving or stiff race lockout
    const zoneSelect = page.getByLabel(/select.*telemark zone/i);
    await zoneSelect.selectOption('silverton-mountain-powder');

    const tensionInput = page.getByLabel(/cartridge spring tension level/i);
    await tensionInput.fill('5');

    const resultPanel = page.getByTestId('telemark-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Silverton Mountain High Alpine Freeheel Bowls');
    await expect(resultPanel).toContainText(/Active Carving Power|Stiff Race Lockout/i);
    await expect(resultPanel).toContainText('57.0 Nm');

    // 5. Interacts with the Gear Checklist and verifies telemark-gear-counter updates
    const counter = page.getByTestId('telemark-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const bootsCheckbox = page.getByLabel(/Triple-Injection Pebax Bellows Telemark Boots/i);
    await bootsCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const skinsCheckbox = page.getByLabel(/High-Traction Mohair-Nylon Blend Backcountry Climbing Skins/i);
    await skinsCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await bootsCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

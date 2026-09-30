import { test, expect } from '@playwright/test';

test.describe('Alpine Glacial Sledging & Crevasse Pulk Expedition Logistics Journey', () => {
  test('navigates to /crevasse-pulk, filters routes, calculates pulk tow dynamics & arrest safety, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /crevasse-pulk
    await page.goto('/crevasse-pulk');

    // 2. Verify page title and literal H1 "Alpine Glacial Sledging & Crevasse Pulk Expedition Logistics"
    await expect(page).toHaveTitle(
      /Alpine Glacial Sledging & Crevasse Pulk Expedition Logistics \| Contoso Outdoors/,
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Glacial Sledging & Crevasse Pulk Expedition Logistics',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Crevassed Icefall Labyrinth" and verify expected cards are displayed while other routes are hidden
    const grid = page.getByTestId('crevasse-pulk-routes-grid');

    const labyrinthBtn = page.getByRole('button', { name: /crevassed icefall labyrinth/i });
    await labyrinthBtn.click();
    await expect(grid).toContainText('Denali Kahiltna Glacier Pulk Ascent');
    await expect(grid).not.toContainText('Bagley Icefield Polar Traverse');
    await expect(grid).not.toContainText('Ruth Glacier Great Gorge Sled Haul');
    await expect(grid).not.toContainText('Columbia Icefield Glacial Plateau');
    await expect(grid).not.toContainText('Mount Rainier Ingraham Direct');

    const allBtn = page.getByRole('button', { name: /all terrains/i });
    await allBtn.click();
    await expect(grid).toContainText('Denali Kahiltna Glacier Pulk Ascent');
    await expect(grid).toContainText('Bagley Icefield Polar Traverse');
    await expect(grid).toContainText('Ruth Glacier Great Gorge Sled Haul');
    await expect(grid).toContainText('Columbia Icefield Glacial Plateau');
    await expect(grid).toContainText('Mount Rainier Ingraham Direct');

    // 4. Selects Denali Kahiltna in calculator, adjusts incline and rigging to test dynamic arrest safety and alert triggers
    const routeSelect = page.getByLabel(/select glacial route/i);
    await routeSelect.selectOption('denali-kahiltna-glacier-highway');

    const resultPanel = page.getByTestId('crevasse-pulk-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Denali Kahiltna Glacier Pulk Ascent');
    await expect(resultPanel).toContainText('Nominal Dynamic Hold');

    // Adjust incline and non-rigid rigging to trigger Critical Arrest Failure Alert
    const inclineInput = page.getByLabel(/glacier slope incline/i);
    const riggingSelect = page.getByLabel(/pulk rigging system/i);

    await inclineInput.fill('16');
    await riggingSelect.selectOption('rope_trace_with_brake_fin');
    await expect(resultPanel).toContainText('Critical Arrest Failure Alert');
    await expect(resultPanel).toContainText('CRITICAL');

    // Switch back to rigid fiberglass shaft harness -> should clear critical failure alert
    await riggingSelect.selectOption('rigid_fiberglass_shaft_harness');
    await expect(resultPanel).toContainText('Nominal Dynamic Hold');

    // Test Caution Overrun Risk trigger (payload > 70kg, crevasse hazard extreme)
    const payloadInput = page.getByLabel(/sled payload/i);
    const hazardSelect = page.getByLabel(/crevasse hazard level/i);

    await inclineInput.fill('10');
    await payloadInput.fill('85');
    await hazardSelect.selectOption('extreme');
    await expect(resultPanel).toContainText('Caution Overrun Risk');
    await expect(resultPanel).toContainText('CAUTION');

    // 5. Interacts with the Gear Checklist and verifies crevasse-pulk-gear-counter updates
    const counter = page.getByTestId('crevasse-pulk-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const pulkCheckbox = page.getByLabel(/UHMWPE Heavy-Duty Glacial Expedition Pulk/i);
    await pulkCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const shaftCheckbox = page.getByLabel(/Locking Aluminum-Jointed Fiberglass Haul Shafts/i);
    await shaftCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await pulkCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

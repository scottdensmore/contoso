import { test, expect } from '@playwright/test';

test.describe('Coastal Sea Cliff Coasteering & Ocean Traverse Journey', () => {
  test('navigates to /coasteering, filters coasteering grades, tests swell & surge jump safety calculator, and tracks mandatory kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /coasteering
    await page.goto('/coasteering');

    // 2. Verify page title and literal H1 "Coastal Sea Cliff Coasteering & Ocean Traverse Explorer"
    await expect(page).toHaveTitle(
      /Coastal Sea Cliff Coasteering & Ocean Traverse Explorer \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Coastal Sea Cliff Coasteering & Ocean Traverse Explorer',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Grade 3 (Advanced Swell)" or "Grade 4 (Extreme Surge)" and verify expected cards
    const grid = page.getByTestId('coasteering-routes-grid');

    const grade3Btn = page.getByRole('button', { name: /grade 3 \(advanced swell\)/i });
    await grade3Btn.click();
    await expect(grid).toContainText('Depoe Bay');
    await expect(grid).not.toContainText('Point Lobos');
    await expect(grid).not.toContainText('Cape Flattery');
    await expect(grid).not.toContainText('La Jolla');

    const grade4Btn = page.getByRole('button', { name: /grade 4 \(extreme surge\)/i });
    await grade4Btn.click();
    await expect(grid).toContainText('Cape Flattery');
    await expect(grid).not.toContainText('Depoe Bay');
    await expect(grid).not.toContainText('Point Lobos');
    await expect(grid).not.toContainText('La Jolla');

    const allBtn = page.getByRole('button', { name: /all routes/i });
    await allBtn.click();
    await expect(grid).toContainText('Point Lobos');
    await expect(grid).toContainText('Depoe Bay');
    await expect(grid).toContainText('Acadia Otter Cliffs');
    await expect(grid).toContainText('La Jolla');
    await expect(grid).toContainText('Cape Flattery');

    // 4. Selects Depoe Bay in calculator, tests high jump with shallow water or high swell, asserts live status reflects critical shallow or extreme surge warning
    const routeSelect = page.getByLabel(/select.*coasteering route/i);
    await routeSelect.selectOption('depoe-bay-spouting-horn-surge');

    const resultPanel = page.getByTestId('coasteering-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Depoe Bay');

    // Test high jump with shallow water -> critical shallow hazard
    const jumpHeightInput = page.getByLabel(/jump height/i);
    await jumpHeightInput.fill('8.0');

    const waterDepthInput = page.getByLabel(/water depth/i);
    await waterDepthInput.fill('2.5');

    await expect(resultPanel).toContainText('Critical Shallow Hazard');
    await expect(resultPanel).toContainText('DO NOT ENTER');

    // Test high swell -> extreme surge warning
    await waterDepthInput.fill('7.0');
    const swellHeightInput = page.getByLabel(/swell height/i);
    await swellHeightInput.fill('3.0');

    await expect(resultPanel).toContainText('Extreme Surge Warning');

    // 5. Interacts with the Coasteering Kit checklist and verifies coasteering-gear-counter
    const counter = page.getByTestId('coasteering-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const helmetCheckbox = page.getByLabel(/en 1385 certified watersports helmet/i);
    await helmetCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const wetsuitCheckbox = page.getByLabel(/heavy-duty neoprene steamer wetsuit/i);
    await wetsuitCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await helmetCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

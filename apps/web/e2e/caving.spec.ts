import { test, expect } from '@playwright/test';

test.describe('Alpine Caving & Karst Speleology Expedition Guide Journey', () => {
  test('navigates to /caving, filters caving classes, tests SRT rigging calculator, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /caving
    await page.goto('/caving');

    // 2. Verify page title and literal H1 "Alpine Caving & Karst Speleology Expedition Guide"
    await expect(page).toHaveTitle(
      /Alpine Caving & Karst Speleology Expedition Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Caving & Karst Speleology Expedition Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Class 4 (Vertical SRT)" or "Class 5 (Complex Alpine)" and verifies expected cards are displayed while others are hidden
    const grid = page.getByTestId('caving-routes-grid');

    const class4Btn = page.getByRole('button', { name: /class 4 \(vertical srt\)/i });
    await class4Btn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /Fantastic Pit/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Mammoth Cave/i })).not.toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Great X Pit/i })).not.toBeVisible();

    const class5Btn = page.getByRole('button', { name: /class 5 \(complex alpine\)/i });
    await class5Btn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /Great X Pit/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Fantastic Pit/i })).not.toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Mammoth Cave/i })).not.toBeVisible();

    const allBtn = page.getByRole('button', { name: /all caves/i });
    await allBtn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /Fantastic Pit/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Mammoth Cave/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Great X Pit/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Slaughter Canyon/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Tumbling Rock Cave/i })).toBeVisible();

    // 4. Selects Fantastic Pit in calculator, tests severe rub risk without rebelay, asserts live status reflects critical rope shear warning and rack descender recommendation
    const caveSelect = page.getByLabel(/select.*cave/i);
    await caveSelect.selectOption('fantastic-pit-ellisons-cave');

    const resultPanel = page.getByTestId('srt-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText("Fantastic Pit & Ellison's Cave System");

    // Select severe rub point with rebelay off
    const abrasionSelect = page.getByLabel(/abrasion risk/i);
    await abrasionSelect.selectOption('severe_rub_point');

    const rebelayCheckbox = page.getByLabel(/rebelay configured/i);
    if (await rebelayCheckbox.isChecked()) {
      await rebelayCheckbox.uncheck();
    }

    await expect(resultPanel).toContainText(/critical rope shear risk/i);
    await expect(resultPanel).toContainText(/Rappel Rack/i);

    // 5. Interacts with the Caving Kit checklist and verifies caving-gear-counter updates
    const counter = page.getByTestId('caving-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const helmetCheckbox = page.getByLabel(/en 12492 certified caving helmet/i);
    await helmetCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const headlampCheckbox = page.getByLabel(/independent 300\+ lumen backup headlamp/i);
    await headlampCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await helmetCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

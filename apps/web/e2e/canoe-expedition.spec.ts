import { test, expect } from '@playwright/test';

test.describe('Whitewater Pack-Canoeing & Open Canoe Expedition Guide Journey', () => {
  test('navigates to /canoe-expedition, filters whitewater classes, tests trim & freeboard calculator, and tracks kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /canoe-expedition
    await page.goto('/canoe-expedition');

    // 2. Verify page title and literal H1 "Whitewater Pack-Canoeing & Open Canoe Expedition Guide"
    await expect(page).toHaveTitle(
      /Whitewater Pack-Canoeing & Open Canoe Expedition Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Whitewater Pack-Canoeing & Open Canoe Expedition Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Class IV (Expert)" or "Class I (Easy)" and verify expected cards
    const grid = page.getByTestId('canoe-routes-grid');

    const classIVBtn = page.getByRole('button', { name: /Class IV \(Expert\)/i });
    await classIVBtn.click();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Missinaibi River/i })
    ).toBeVisible();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Allagash Wilderness Waterway/i })
    ).not.toBeVisible();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Granite River/i })
    ).not.toBeVisible();

    const classIBtn = page.getByRole('button', { name: /Class I \(Easy\)/i });
    await classIBtn.click();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Granite River/i })
    ).toBeVisible();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Missinaibi River/i })
    ).not.toBeVisible();

    const allBtn = page.getByRole('button', { name: /All Routes/i });
    await allBtn.click();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Allagash Wilderness Waterway/i })
    ).toBeVisible();
    await expect(
      grid.getByRole('heading', { level: 3, name: /South Nahanni River/i })
    ).toBeVisible();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Granite River/i })
    ).toBeVisible();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Missinaibi River/i })
    ).toBeVisible();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Rio Grande Wild & Scenic/i })
    ).toBeVisible();

    // 4. Selects Allagash or Nahanni in calculator, adjusts cargo weight and placement, asserts live status reflects freeboard inches, trim status, and swamping risk
    const routeSelect = page.getByLabel(/Select Expedition Route/i);
    await routeSelect.selectOption('nahanni-river-canyon-run');

    const resultPanel = page.getByTestId('canoe-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('South Nahanni River');

    const gearWeightInput = page.getByLabel(/Gear & Cargo Weight/i);
    await gearWeightInput.fill('120');

    const placementSelect = page.getByLabel(/Cargo Weight Placement/i);
    await placementSelect.selectOption('forward');

    const rapidLevelSelect = page.getByLabel(/River Whitewater Rapid Level/i);
    await rapidLevelSelect.selectOption('class_iv');

    // Assert live status reflects freeboard inches, trim status, and swamping risk
    await expect(resultPanel).toContainText('Bow-Heavy');
    await expect(resultPanel).toContainText('Critical');
    await expect(resultPanel).toContainText('in');

    // 5. Interacts with the Open Canoe Kit checklist and verifies canoe-gear-counter updates
    const counter = page.getByTestId('canoe-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const sprayDeckCheckbox = page.getByLabel(
      /Full-Length Cordura Canoe Spray Deck Cover/i
    );
    await sprayDeckCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const floatBagsCheckbox = page.getByLabel(
      /3D End Flotation Air Bags with Nylon Lacing Cages/i
    );
    await floatBagsCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await sprayDeckCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

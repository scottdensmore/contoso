import { test, expect } from '@playwright/test';

test.describe('Alpine Ski Mountaineering & Steep Couloir Descent Guide Journey', () => {
  test('navigates to /steep-skiing, filters couloir grades, calculates kinematics, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /steep-skiing
    await page.goto('/steep-skiing');

    // 2. Verify page title and literal H1 "Alpine Ski Mountaineering & Steep Couloir Descent"
    await expect(page).toHaveTitle(
      /Alpine Ski Mountaineering & Steep Couloir Descent \| Contoso Outdoors/,
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Ski Mountaineering & Steep Couloir Descent',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by grade and verify expected cards
    const grid = page.getByTestId('steep-skiing-couloirs-grid');

    const class3Btn = page.getByRole('button', { name: /class 3/i });
    await class3Btn.click();
    await expect(grid).toContainText('Tuckerman Ravine — The Lip & Center Headwall');
    await expect(grid).toContainText('Mount Superior — South Face & Suicide Chute');
    await expect(grid).not.toContainText("Corbet's Couloir & S&S Chute");
    await expect(grid).not.toContainText('Terminal Cancer Couloir');

    const class2Btn = page.getByRole('button', { name: /class 2/i });
    await class2Btn.click();
    await expect(grid).toContainText("Corbet's Couloir & S&S Chute");
    await expect(grid).toContainText('Silver Couloir — Buffalo Mountain');
    await expect(grid).toContainText('Terminal Cancer Couloir');
    await expect(grid).not.toContainText('Tuckerman Ravine');

    const allBtn = page.getByRole('button', { name: /all grades/i });
    await allBtn.click();
    await expect(grid).toContainText("Corbet's Couloir & S&S Chute");
    await expect(grid).toContainText('Mount Superior — South Face & Suicide Chute');

    // 4. Selects Corbet's Couloir in calculator, adjusts slope angle to 52°, asserts live status reflects sluff velocity, catastrophic fall consequence, and ski-belay recommendation
    const couloirSelect = page.getByLabel(/select.*couloir/i);
    await couloirSelect.selectOption('corbets-couloir-jackson');

    const slopeSlider = page.getByLabel(/slope angle/i);
    await slopeSlider.fill('52');

    const snowSurfaceSelect = page.getByLabel(/snow surface/i);
    await snowSurfaceSelect.selectOption('corn_ice_firm');

    const resultPanel = page.getByTestId('steep-skiing-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText("Corbet's Couloir & S&S Chute");
    await expect(resultPanel).toContainText('km/h');
    await expect(resultPanel).toContainText('Catastrophic Unmitigated');
    await expect(resultPanel).toContainText('Ski Belay / Rappel');

    // Also verify Terminal Cancer selection and choke warning
    await couloirSelect.selectOption('terminal-cancer-couloir');
    await slopeSlider.fill('44');
    await snowSurfaceSelect.selectOption('packed_powder');
    await expect(resultPanel).toContainText('Side Slipping Choke');
    await expect(resultPanel).toContainText('Extreme choke restriction (<2.5m)');

    // 5. Interacts with the Steep Skiing Checklist and verifies steep-skiing-gear-counter updates
    const counter = page.getByTestId('steep-skiing-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const axesCheckbox = page.getByLabel(/Curved Ski Mountaineering Ice Axes/i);
    await axesCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const cramponsCheckbox = page.getByLabel(/CNC Machined High-Angle Ski Crampons/i);
    await cramponsCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    const helmetCheckbox = page.getByLabel(/Dual\/Triple-Certified Climbing & Ski Mountaineering Helmet/i);
    await helmetCheckbox.check();
    await expect(counter).toContainText('3 of 6 packed');

    await axesCheckbox.uncheck();
    await expect(counter).toContainText('2 of 6 packed');
  });
});

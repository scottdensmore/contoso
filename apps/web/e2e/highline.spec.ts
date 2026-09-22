import { test, expect } from '@playwright/test';

test.describe('Alpine Highline & Slackline Rigging Guide Journey', () => {
  test('navigates to /highline, filters spans, tests sag & tension calculator, and tracks rigging kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /highline
    await page.goto('/highline');

    // 2. Verify page title and literal H1 "Alpine Highline & Slackline Rigging Guide"
    await expect(page).toHaveTitle(
      /Alpine Highline & Slackline Rigging Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Highline & Slackline Rigging Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Beginner" or "Expert" and verifies expected cards are displayed while others are hidden
    const grid = page.getByTestId('highline-spans-grid');

    const beginnerBtn = page.getByRole('button', { name: /^beginner$/i });
    await beginnerBtn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /Lower Town Wall/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Taft Point/i })).not.toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Moab Fruit Bowl/i })).not.toBeVisible();

    const expertBtn = page.getByRole('button', { name: /^expert$/i });
    await expertBtn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /Moab Fruit Bowl/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Priest-to-Rectory/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Lower Town Wall/i })).not.toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Taft Point/i })).not.toBeVisible();

    const allBtn = page.getByRole('button', { name: /all spans/i });
    await allBtn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /Taft Point/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Moab Fruit Bowl/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Monkey Face/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Priest-to-Rectory/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Lower Town Wall/i })).toBeVisible();

    // 4. Selects Taft Point in calculator, adjusts sag and anchor angle, asserts live status reflects tension kN and safety advisory
    const spanSelect = page.getByLabel(/select.*span/i);
    await spanSelect.selectOption('yosemite-taft-point-highline');

    const resultPanel = page.getByTestId('highline-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel.getByRole('heading', { level: 3, name: /Taft Point/i })).toBeVisible();

    const sagInput = page.getByLabel(/standing sag/i);
    await sagInput.fill('6');

    const angleInput = page.getByLabel(/anchor.*angle/i);
    await angleInput.fill('45');

    await expect(resultPanel).toContainText('1.9 kN');
    await expect(resultPanel).toContainText(/Safe Rigging Profile/i);

    // Adjust anchor angle to critical (>90°)
    await angleInput.fill('100');
    await expect(resultPanel).toContainText(/Critical Risk Warning/i);
    await expect(resultPanel).toContainText(/Anchor angle \(100°\) exceeds 90° limit/i);

    // 5. Interacts with the Highline Rigging Kit checklist and verifies highline-gear-counter updates
    const counter = page.getByTestId('highline-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const leashCheckbox = page.getByLabel(/climbing-rated highline dynamic leash with dual steel rings/i);
    await leashCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const weblockCheckbox = page.getByLabel(/high-efficiency webbing anchor friction weblocks/i);
    await weblockCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await leashCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Wilderness Canyon Zipline Canopy Aerial Traversing Journey', () => {
  test('navigates to /zipline, filters courses, tests dynamics calculator, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigates to /zipline
    await page.goto('/zipline');

    // 2. Verifies page title and literal H1 "Wilderness Canyon Zipline Canopy Aerial Traversing"
    await expect(page).toHaveTitle(
      /Wilderness Canyon Zipline Canopy Aerial Traversing \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Canyon Zipline Canopy Aerial Traversing',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Extreme Gravity Zipline" and verifies Royal Gorge card is displayed while Haleakala is hidden
    const grid = page.getByTestId('zipline-courses-grid');

    const extremeBtn = page.getByRole('button', { name: /^extreme gravity zipline$/i });
    await extremeBtn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /Royal Gorge/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Haleakala/i })).not.toBeVisible();

    const allBtn = page.getByRole('button', { name: /^all courses$/i });
    await allBtn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /Royal Gorge/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Haleakala/i })).toBeVisible();

    // 4. Selects Royal Gorge in calculator, sets slope to 24% and payload to 250 lbs, asserts live status reflects excessive velocity hazard or heavy braking required, then sets slope to 8% and payload to 120 lbs, asserting status updates to optimal descent dynamics
    const courseSelect = page.getByLabel(/select.*course/i);
    await courseSelect.selectOption('royal-gorge-canyon-extreme');

    const resultPanel = page.getByTestId('zipline-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel.getByRole('heading', { level: 3, name: /Royal Gorge/i })).toBeVisible();

    const slopeInput = page.getByLabel(/slope grade/i);
    await slopeInput.fill('24');

    const payloadInput = page.getByLabel(/rider payload/i);
    await payloadInput.fill('250');

    await expect(resultPanel).toContainText(/excessive velocity hazard|heavy braking required/i);

    await slopeInput.fill('8');
    await payloadInput.fill('120');

    await expect(resultPanel).toContainText(/optimal descent dynamics/i);

    // 5. Interacts with the Zipline Gear checklist and verifies zipline-gear-counter updates
    const counter = page.getByTestId('zipline-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const harnessCheckbox = page.getByLabel(/full-body canyon aerial suspension harness/i);
    await harnessCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const trolleyCheckbox = page.getByLabel(/high-speed dual tandem steel pulley trolley/i);
    await trolleyCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await harnessCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

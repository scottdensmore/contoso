import { test, expect } from '@playwright/test';

test.describe('Backcountry Sandboarding & Desert Dune Gliding Journey', () => {
  test('navigates to /sandboarding, filters by board style, tests glide & wax calculator, and tracks safety checklist', async ({
    page,
  }) => {
    // 1. Navigate to /sandboarding
    await page.goto('/sandboarding');

    // 2. Verify page title and literal H1 "Backcountry Sandboarding & Desert Dune Gliding"
    await expect(page).toHaveTitle(
      /Backcountry Sandboarding & Desert Dune Gliding \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Sandboarding & Desert Dune Gliding',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Directional Carver" and verifies expected cards are displayed while other dunes are hidden
    const grid = page.getByTestId('sandboarding-dunes-grid');
    const carverBtn = page.getByRole('button', { name: 'Directional Carver' });
    await carverBtn.click();

    await expect(grid.getByRole('heading', { name: /Great Sand Dunes/i })).toBeVisible();
    await expect(grid.getByRole('heading', { name: /Bruneau Dunes/i })).toBeVisible();
    await expect(grid.getByRole('heading', { name: /Oregon Dunes/i })).not.toBeVisible();
    await expect(grid.getByRole('heading', { name: /Coral Pink Dunes/i })).not.toBeVisible();
    await expect(grid.getByRole('heading', { name: /White Sands/i })).not.toBeVisible();

    // 4. Selects Great Sand Dunes in calculator, adjusts wax type to "Unwaxed Raw Base", asserts live status reflects severe drag or high friction warning and reduced top speed
    const duneSelect = page.getByLabel(/select sand dune/i);
    await duneSelect.selectOption('great-sand-dunes-star-dune');

    const waxSelect = page.getByLabel(/wax type/i);
    await waxSelect.selectOption('unwaxed_raw_base');

    const resultPanel = page.getByTestId('sandboarding-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel.getByRole('heading', { name: /Great Sand Dunes/i })).toBeVisible();
    await expect(resultPanel).toContainText(/14(\.0)?\s*mph/i);
    await expect(resultPanel).toContainText(/high friction drag|severe drag|severe base scorch/i);

    // 5. Interacts with the Gear Checklist and verifies sandboarding-gear-counter updates
    const counter = page.getByTestId('sandboarding-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const gogglesCheckbox = page.getByLabel(/full-seal anti-scratch sandboarding goggles/i);
    await gogglesCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const waxCheckbox = page.getByLabel(/dual-temperature high-friction sand speed wax bar/i);
    await waxCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await gogglesCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

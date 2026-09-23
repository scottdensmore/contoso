import { test, expect } from '@playwright/test';

test.describe('Alpine Big Wall Aid Climbing & Portaledge Systems Guide Journey', () => {
  test('navigates to /big-wall, filters routes, tests haul calculator system switch, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /big-wall
    await page.goto('/big-wall');

    // 2. Verify page title and literal H1 "Alpine Big Wall Aid Climbing & Portaledge Systems"
    await expect(page).toHaveTitle(
      /Alpine Big Wall Aid Climbing & Portaledge Systems \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Big Wall Aid Climbing & Portaledge Systems',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by aid rating and verifies expected cards
    const grid = page.getByTestId('big-wall-routes-grid');

    const c1Btn = page.getByRole('button', { name: /^c1$/i });
    await c1Btn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /Regular Northwest Face/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /The Nose/i })).not.toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /The Titan/i })).not.toBeVisible();

    const c2Btn = page.getByRole('button', { name: /^c2$/i });
    await c2Btn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /The Nose/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Prodigal Son/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Regular Northwest Face/i })).not.toBeVisible();

    const allBtn = page.getByRole('button', { name: /all routes/i });
    await allBtn.click();
    await expect(grid.getByRole('heading', { level: 3, name: /The Nose/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Regular Northwest Face/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /The Titan/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /Prodigal Son/i })).toBeVisible();
    await expect(grid.getByRole('heading', { level: 3, name: /West Face — Leaning Tower/i })).toBeVisible();

    // 4. Selects El Capitan Nose in calculator, tests haul system switch from 1:1 to 3:1 Z-rig, asserts live status reflects reduced pull force and counterweight status
    const routeSelect = page.getByLabel(/select.*route/i);
    await routeSelect.selectOption('el-capitan-nose');

    const resultPanel = page.getByTestId('big-wall-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel.getByRole('heading', { level: 3, name: /The Nose/i })).toBeVisible();

    const haulSystemSelect = page.getByLabel(/haul system/i);
    await haulSystemSelect.selectOption('1:1_direct');

    await expect(resultPanel).toContainText('108.6 kg');
    await expect(resultPanel).toContainText(/Insufficient Counterweight/i);
    await expect(resultPanel).toContainText(/Extreme \/ 2-Person Required/i);

    // Switch to 3:1 Z-rig
    await haulSystemSelect.selectOption('3:1_z_rig');
    await expect(resultPanel).toContainText('40.7 kg');
    await expect(resultPanel).toContainText(/Sufficient Counterweight/i);
    await expect(resultPanel).toContainText(/Moderate Effort/i);

    // 5. Interacts with the Big Wall Checklist and verifies big-wall-gear-counter updates
    const counter = page.getByTestId('big-wall-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const portaledgeCheckbox = page.getByLabel(/heavy-duty expedition portaledge & sealed storm fly/i);
    await portaledgeCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const pulleyCheckbox = page.getByLabel(/progress-capture hauling pulley/i);
    await pulleyCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await portaledgeCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

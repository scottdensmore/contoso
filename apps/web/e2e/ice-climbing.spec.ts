import { test, expect } from '@playwright/test';

test.describe('Waterfall Ice Climbing & Mixed Ascents Guide Journey', () => {
  test('navigates to /ice-climbing, filters ice grades, tests rigging & anchor calculator, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /ice-climbing
    await page.goto('/ice-climbing');

    // 2. Verify page title and literal H1 "Waterfall Ice Climbing & Mixed Ascents Guide"
    await expect(page).toHaveTitle(
      /Waterfall Ice Climbing & Mixed Ascents Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Waterfall Ice Climbing & Mixed Ascents Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "WI5 (Expert)" or "WI6 (Extreme)" and verify expected cards
    const grid = page.getByTestId('ice-routes-grid');

    const wi5Btn = page.getByRole('button', { name: /wi5/i });
    await wi5Btn.click();
    await expect(grid).toContainText('The Promised Land');
    await expect(grid).not.toContainText('Pic of the Vic');
    await expect(grid).not.toContainText('The Fang');

    const wi6Btn = page.getByRole('button', { name: /wi6/i });
    await wi6Btn.click();
    await expect(grid).toContainText('The Fang');
    await expect(grid).not.toContainText('The Promised Land');
    await expect(grid).not.toContainText('Genesis II');

    const allBtn = page.getByRole('button', { name: /all routes/i });
    await allBtn.click();
    await expect(grid).toContainText('Pic of the Vic');
    await expect(grid).toContainText('Genesis II');
    await expect(grid).toContainText('The Weeping Wall');
    await expect(grid).toContainText('The Promised Land');
    await expect(grid).toContainText('The Fang');

    // 4. Selects Ouray Ice Park in calculator, tests warm temperature (>32°F) or single screw bail, asserts live status reflects caution/hazardous warning and holding force
    const routeSelect = page.getByLabel(/select.*ice climbing route/i);
    await routeSelect.selectOption('ouray-ice-park-pic-of-the-vic');

    const resultPanel = page.getByTestId('ice-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Pic of the Vic & Upper Bridge Area');
    await expect(resultPanel).toContainText('Approved Belay Anchor');

    // Warm temperature test (>32°F)
    const tempInput = page.getByLabel(/ice temperature/i);
    await tempInput.fill('36');
    await expect(resultPanel).toContainText('Wet melting risk');
    await expect(resultPanel).toContainText('Hazardous Thin or Melting');
    await expect(resultPanel).toContainText('Melting hazard');

    // Single screw bail test
    await tempInput.fill('20');
    const anchorSelect = page.getByLabel(/anchor configuration/i);
    await anchorSelect.selectOption('single_screw_bail');
    await expect(resultPanel).toContainText('Caution Conditions');
    await expect(resultPanel).toContainText('WARNING: Single screw');

    // 5. Interacts with the Ice Climbing Gear checklist and verifies ice-gear-counter
    const counter = page.getByTestId('ice-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const toolsCheckbox = page.getByLabel(/Pair of Ergonomic Technical Ice Tools/i);
    await toolsCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const cramponsCheckbox = page.getByLabel(/Rigid or Semi-Rigid Steel Ice Climbing Crampons/i);
    await cramponsCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await toolsCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

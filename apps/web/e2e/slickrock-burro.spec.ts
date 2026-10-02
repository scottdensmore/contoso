import { test, expect } from '@playwright/test';

test.describe('Wilderness High-Desert Dry Wash Pack-Burro Logistics Journey', () => {
  test('navigates to /slickrock-burro, filters routes, models burro dynamics & slip risk, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /slickrock-burro
    await page.goto('/slickrock-burro');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Wilderness High-Desert Dry Wash Pack-Burro Logistics \| Contoso Outdoors/,
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness High-Desert Dry Wash Pack-Burro Logistics',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Deep Alluvial Sand" and verify expected cards
    const grid = page.getByTestId('slickrock-burro-routes-grid');

    const sandBtn = page.getByRole('button', { name: /deep alluvial sand/i });
    await sandBtn.click();
    await expect(grid).toContainText('Grand Gulch Primitive Desert Wash Packing Route');
    await expect(grid).not.toContainText('San Rafael Swell Chute Canyon');
    await expect(grid).not.toContainText('Death Valley Cottonwood-Marble');
    await expect(grid).not.toContainText('Escalante River & Baker Canyon');
    await expect(grid).not.toContainText('Big Bend Mesa de Anguila');

    // Reset to "All Terrains"
    const allBtn = page.getByRole('button', { name: /all terrains/i });
    await allBtn.click();
    await expect(grid).toContainText('San Rafael Swell Chute Canyon');
    await expect(grid).toContainText('Grand Gulch Primitive Desert Wash Packing Route');
    await expect(grid).toContainText('Death Valley Cottonwood-Marble');
    await expect(grid).toContainText('Escalante River & Baker Canyon');
    await expect(grid).toContainText('Big Bend Mesa de Anguila');

    // 4. Calculator interaction & live updates
    const routeSelect = page.getByLabel(/select canyon route/i);
    await routeSelect.selectOption('death-valley-cottonwood-marble');

    const resultPanel = page.getByTestId('burro-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Death Valley Cottonwood-Marble Desert Canyons');

    // Adjust parameters towards optimal baseline
    const tempInput = page.getByLabel(/ambient peak temperature/i);
    const distInput = page.getByLabel(/daily trek distance/i);
    const cargoInput = page.getByLabel(/cargo weight per burro/i);
    const deltaInput = page.getByLabel(/pannier weight delta/i);
    const terrainSelect = page.getByLabel(/^canyon terrain/i);
    const waterSelect = page.getByLabel(/water availability source/i);

    await tempInput.fill('20');
    await distInput.fill('10');
    await cargoInput.fill('20');
    await deltaInput.fill('0.5');
    await terrainSelect.selectOption('deep_alluvial_sand');
    await waterSelect.selectOption('spring_fed_potholes');

    await expect(resultPanel).toContainText('Optimal Conditioned Trek');
    await expect(resultPanel).toContainText('22.5 L');

    // Adjust pannier imbalance to trigger Critical Overload & Dehydration Hazard
    await deltaInput.fill('5');
    await expect(resultPanel).toContainText('Critical: Overload & Dehydration Hazard');
    await expect(resultPanel).toContainText('CRITICAL IMBALANCE');

    // 5. Gear checklist interaction and live counter
    const counter = page.getByTestId('burro-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const saddleCheckbox = page.getByLabel(/Hand-Crafted Ash Wood Sawbuck Pack Saddle/i);
    await saddleCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const pannierCheckbox = page.getByLabel(/Reinforced 24oz Duck Canvas Pack Panniers/i);
    await pannierCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await saddleCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

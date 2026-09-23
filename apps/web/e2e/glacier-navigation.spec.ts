import { test, expect } from '@playwright/test';

test.describe('Glacier Crevasse Navigation & Icefall Routefinding Guide Journey', () => {
  test('navigates to /glacier-navigation, filters hazard levels, models snow bridge risk, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /glacier-navigation
    await page.goto('/glacier-navigation');

    // 2. Verify page title and literal H1 "Glacier Crevasse Navigation & Icefall Routefinding Guide"
    await expect(page).toHaveTitle(
      /Glacier Crevasse Navigation & Icefall Routefinding Guide \| Contoso Outdoors/,
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Glacier Crevasse Navigation & Icefall Routefinding Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Extreme" hazard and verify expected cards
    const grid = page.getByTestId('glacier-zones-grid');

    const extremeBtn = page.getByRole('button', { name: /extreme/i });
    await extremeBtn.click();
    await expect(grid).toContainText('Khumbu Icefall Lower Maze');
    await expect(grid).not.toContainText('Ingraham Direct');
    await expect(grid).not.toContainText('Mer de Glace');
    await expect(grid).not.toContainText('Root & Kennicott');
    await expect(grid).not.toContainText('Upper Tasman Glacier');

    const allBtn = page.getByRole('button', { name: /all zones/i });
    await allBtn.click();
    await expect(grid).toContainText('Khumbu Icefall Lower Maze');
    await expect(grid).toContainText('Ingraham Direct');
    await expect(grid).toContainText('Mer de Glace');
    await expect(grid).toContainText('Root & Kennicott');
    await expect(grid).toContainText('Upper Tasman Glacier');

    // 4. Selects Khumbu Icefall or Ingraham Glacier in calculator, adjusts ambient temperature (>34°F) or thin snow bridge (<0.5m with wide crevasse), asserts live status reflects hazardous warning and recommended action
    const zoneSelect = page.getByLabel(/select.*glacier zone/i);
    await zoneSelect.selectOption('khumbu-icefall-everest');

    const resultPanel = page.getByTestId('crevasse-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Khumbu Icefall Lower Maze');
    await expect(resultPanel).toContainText('Safe Crossing');

    // Warm temperature test (>34°F)
    const tempInput = page.getByLabel(/ambient temperature/i);
    await tempInput.fill('38');
    await expect(resultPanel).toContainText('Hazardous: Bypass Required');
    await expect(resultPanel).toContainText('Isothermal melting state');
    await expect(resultPanel).toContainText('Do not cross');

    // Thin snow bridge (<0.5m with wide crevasse) test on Ingraham Glacier
    await zoneSelect.selectOption('ingraham-glacier-rainier');
    await tempInput.fill('20');
    const depthInput = page.getByLabel(/snow bridge depth/i);
    const widthInput = page.getByLabel(/crevasse width/i);
    await depthInput.fill('0.4');
    await widthInput.fill('2.5');
    await expect(resultPanel).toContainText('Hazardous: Bypass Required');
    await expect(resultPanel).toContainText('Bridge failure hazard imminent');

    // 5. Interacts with the Glacier Safety Kit checklist and verifies glacier-gear-counter
    const counter = page.getByTestId('glacier-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const probeCheckbox = page.getByLabel(/320cm Graduated Aluminum Snow & Crevasse Probe/i);
    await probeCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const pulleyCheckbox = page.getByLabel(/Micro Traxion, Tibloc, and Prusik Cord/i);
    await pulleyCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await probeCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

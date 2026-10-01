import { test, expect } from '@playwright/test';

test.describe('Backcountry Desert Slot Canyon Pot-Hole Escape & Ghost Rigging Journey', () => {
  test('navigates to /pothole-escape, filters techniques, calculates escape dynamics, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /pothole-escape
    await page.goto('/pothole-escape');

    // 2. Verify page title and literal H1 "Backcountry Desert Slot Canyon Pot-Hole Escape & Ghost Rigging"
    await expect(page).toHaveTitle(
      /Backcountry Desert Slot Canyon Pot-Hole Escape & Ghost Rigging \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Desert Slot Canyon Pot-Hole Escape & Ghost Rigging',
    });
    await expect(h1).toBeVisible();

    // 3. Technique filtering in routes grid
    const grid = page.getByTestId('pothole-routes-grid');
    await expect(grid).toBeVisible();

    // Filter by SandTrap Ghost Anchor
    const sandtrapBtn = page.getByRole('button', { name: /sandtrap ghost anchor/i });
    await sandtrapBtn.click();
    await expect(grid).toContainText('Neon Canyon & The Golden Cathedral');
    await expect(grid).toContainText('Heaps Canyon Final Pothole Drop');
    await expect(grid).not.toContainText('Choprock Canyon');
    await expect(grid).not.toContainText('Imlay Canyon');

    // Filter by Pot-Hole Escape Hook
    const hookBtn = page.getByRole('button', { name: /pot-hole escape hook/i });
    await hookBtn.click();
    await expect(grid).toContainText('Choprock Canyon Severe Waterpocket Maze');
    await expect(grid).not.toContainText('Neon Canyon');

    // Filter by Cheater Stick Reach
    const stickBtn = page.getByRole('button', { name: /cheater stick reach/i });
    await stickBtn.click();
    await expect(grid).toContainText('Imlay Canyon Sneffels & Cathedral');
    await expect(grid).not.toContainText('Choprock Canyon');

    // Reset to All Techniques
    const allBtn = page.getByRole('button', { name: /all techniques/i });
    await allBtn.click();
    await expect(grid).toContainText('Neon Canyon');
    await expect(grid).toContainText('Choprock Canyon');
    await expect(grid).toContainText('White Canyon Black Hole');
    await expect(grid).toContainText('Imlay Canyon');
    await expect(grid).toContainText('Heaps Canyon');

    // 4. Test interactive calculator
    const routeSelect = page.getByLabel(/select canyon route/i);
    await routeSelect.selectOption('imlay-canyon-sneffels');

    const resultPanel = page.getByTestId('pothole-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Imlay Canyon Sneffels & Cathedral');

    // Adjust parameters
    const waterLevelSelect = page.getByLabel(/water level condition/i);
    await waterLevelSelect.selectOption('flooded_swimming_flume');

    // Flooded swimming flume triggers critical keeper hazard
    await expect(resultPanel).toContainText('Critical Keeper Trap Hazard');
    await expect(resultPanel).toContainText('CRITICAL KEEPER ESCAPE PROTOCOL');

    // Check hoist force and pack counterweight are displayed
    await expect(resultPanel.getByText(/\d+\s*N/i).first()).toBeVisible();
    await expect(resultPanel.getByText(/\d+(\.\d+)?\s*kg/i).first()).toBeVisible();

    // 5. Test mandatory gear checklist and live counter
    const counter = page.getByTestId('pothole-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const sandtrapCheckbox = page.getByLabel(/retrievable sandtrap canyoneering anchor fabric bag/i);
    await sandtrapCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const cheaterStickCheckbox = page.getByLabel(/carbon fiber telescoping cheater stick/i);
    await cheaterStickCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await sandtrapCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

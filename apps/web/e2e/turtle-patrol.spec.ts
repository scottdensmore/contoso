import { test, expect } from '@playwright/test';

test.describe('Wilderness Sea Turtle Hatchling Conservation & Barrier Beach Patrolling Journey', () => {
  test('navigates to /turtle-patrol, filters sectors, calculates emergence dynamics, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigates to /turtle-patrol
    await page.goto('/turtle-patrol');

    // 2. Verifies page title and literal H1 "Wilderness Sea Turtle Hatchling Conservation & Barrier Beach Patrolling"
    await expect(page).toHaveTitle(
      /Wilderness Sea Turtle Hatchling Conservation & Barrier Beach Patrolling \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Sea Turtle Hatchling Conservation & Barrier Beach Patrolling',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Remote Cays & Atoll" and verifies Culebra Resaca card is displayed while Cape Hatteras is hidden
    const grid = page.getByTestId('turtle-patrol-sectors-grid');
    const caysBtn = page.getByRole('button', { name: /^Remote Cays & Atoll$/i });
    await caysBtn.click();

    await expect(grid).toContainText('Culebra Resaca & Brava Coastal Cays');
    await expect(grid).not.toContainText('Cape Hatteras North Spit Barrier Beach');

    // Reset filter to All Sectors to ensure all sectors are accessible
    const allBtn = page.getByRole('button', { name: /^All Sectors$/i });
    await allBtn.click();
    await expect(grid).toContainText('Cape Hatteras North Spit Barrier Beach');

    // 4. Selects Cape Hatteras in calculator, sets predator pressure to "Critical" and moon phase to 80%
    const sectorSelect = page.getByLabel(/Select Nesting Sector/i);
    await sectorSelect.selectOption('cape-hatteras-barrier-spit');

    const predatorSelect = page.getByLabel(/Predator Pressure/i);
    const moonPhaseInput = page.getByLabel(/Moon Phase Illumination/i);

    await predatorSelect.selectOption('critical');
    await moonPhaseInput.fill('80');

    // Asserts live status reflects critical tidal washout hazard or elevated risk
    const resultPanel = page.getByTestId('turtle-patrol-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Cape Hatteras North Spit Barrier Beach');
    await expect(resultPanel).toContainText('Critical Tidal Washout Hazard');
    await expect(resultPanel).toContainText('54% loss risk');

    // Then sets predator pressure to "Low" and moon phase to 5%
    await predatorSelect.selectOption('low');
    await moonPhaseInput.fill('5');

    // Asserts status updates to optimal nesting conditions
    await expect(resultPanel).toContainText('Optimal Nesting Conditions');
    await expect(resultPanel).toContainText('9% loss risk');

    // 5. Interacts with the Conservation Patrol Gear checklist and verifies turtle-patrol-gear-counter updates
    const counter = page.getByTestId('turtle-patrol-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const headlampCheckbox = page.getByLabel(
      /Narrow-Spectrum Red LED Headlamp/i
    );
    const cagesCheckbox = page.getByLabel(
      /Stainless Self-Anchoring Predator Exclusion Wire Cages/i
    );

    await expect(headlampCheckbox).not.toBeChecked();
    await headlampCheckbox.check();
    await expect(headlampCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await cagesCheckbox.check();
    await expect(cagesCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await headlampCheckbox.uncheck();
    await expect(headlampCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

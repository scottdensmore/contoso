import { test, expect } from '@playwright/test';

test.describe('Deep Water Soloing & Psicobloc Sea Cliff Guide Journey', () => {
  test('navigates to /psicobloc, filters rock types, tests impact velocity calculator, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /psicobloc
    await page.goto('/psicobloc');

    // 2. Verify page title and literal H1 "Deep Water Soloing & Psicobloc Sea Cliff Guide"
    await expect(page).toHaveTitle(
      /Deep Water Soloing & Psicobloc Sea Cliff Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Deep Water Soloing & Psicobloc Sea Cliff Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Pocketed Limestone" and "Karst Limestone" and verify expected cards
    const grid = page.getByTestId('psicobloc-crags-grid');

    const pocketedBtn = page.getByRole('button', { name: /pocketed limestone/i });
    await pocketedBtn.click();
    await expect(grid).toContainText('Es Pontàs Natural Sea Arch');
    await expect(grid).toContainText('Conner Cove & Portland Coast');
    await expect(grid).not.toContainText('Cala Barques & Cova del Diable');
    await expect(grid).not.toContainText('Railay Beach & Tonsai Towers');
    await expect(grid).not.toContainText("Pirate's Cove & Long Point");

    const karstBtn = page.getByRole('button', { name: /karst limestone/i });
    await karstBtn.click();
    await expect(grid).toContainText('Railay Beach & Tonsai Towers');
    await expect(grid).not.toContainText('Es Pontàs Natural Sea Arch');
    await expect(grid).not.toContainText('Conner Cove & Portland Coast');

    const allBtn = page.getByRole('button', { name: /all crags/i });
    await allBtn.click();
    await expect(grid).toContainText('Es Pontàs Natural Sea Arch');
    await expect(grid).toContainText('Cala Barques & Cova del Diable');
    await expect(grid).toContainText('Railay Beach & Tonsai Towers');
    await expect(grid).toContainText('Conner Cove & Portland Coast');
    await expect(grid).toContainText("Pirate's Cove & Long Point");

    // 4. Selects Es Pontàs in calculator, adjusts body entry position to Flat Back or Belly Flop, asserts live status reflects hazardous warning
    const cragSelect = page.getByLabel(/select.*crag/i);
    await cragSelect.selectOption('es-pontas-mallorca');

    const resultPanel = page.getByTestId('psicobloc-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Es Pontàs Natural Sea Arch');

    // Default should be Approved
    await expect(resultPanel).toContainText('Approved');

    // Adjust body entry position to Flat Back or Belly Flop
    const bodyEntrySelect = page.getByLabel(/body entry position/i);
    await bodyEntrySelect.selectOption('flat_back_or_belly');

    await expect(resultPanel).toContainText('Hazardous: Prohibited Dive');
    await expect(resultPanel).toContainText('CATASTROPHIC IMPACT TRAUMA HAZARD');

    // Return to pencil entry and test shallow water depth hazard
    await bodyEntrySelect.selectOption('pencil_feet_first_pointed');
    const waterDepthInput = page.getByLabel(/^water depth/i);
    await waterDepthInput.fill('3.0');

    await expect(resultPanel).toContainText('Hazardous: Prohibited Dive');
    await expect(resultPanel).toContainText('Water depth is below the minimum deceleration buffer');

    // 5. Interacts with the Psicobloc Safety Kit checklist and verifies psicobloc-gear-counter updates
    const counter = page.getByTestId('psicobloc-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const liquidChalkCheckbox = page.getByLabel(/quick-drying resin-enhanced liquid chalk tube/i);
    await liquidChalkCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const climbingShoesCheckbox = page.getByLabel(/multiple pairs of snug synthetic climbing shoes/i);
    await climbingShoesCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await liquidChalkCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

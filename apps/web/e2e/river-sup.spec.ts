import { test, expect } from '@playwright/test';

test.describe('Whitewater Stand-Up Paddleboarding & River SUP Guide Journey', () => {
  test('navigates to /river-sup, filters reaches, calculates buoyancy and safety, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /river-sup
    await page.goto('/river-sup');

    // 2. Verify page title and literal H1 "Whitewater Stand-Up Paddleboarding & River SUP Guide"
    await expect(page).toHaveTitle(
      /Whitewater Stand-Up Paddleboarding & River SUP Guide \| Contoso Outdoors/,
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Whitewater Stand-Up Paddleboarding & River SUP Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Class IV" and verify expected cards are displayed while others are hidden
    const grid = page.getByTestId('river-sup-runs-grid');

    const class4Btn = page.getByRole('button', { name: /^class iv$/i });
    await class4Btn.click();
    await expect(grid).toContainText('Middle White Salmon River');
    await expect(grid).toContainText('Soča River (Kobarid Reach)');
    await expect(grid).not.toContainText('Browns Canyon National Monument');
    await expect(grid).not.toContainText('French Broad River (Section 9)');
    await expect(grid).not.toContainText('Lower Deschutes (Maupin Reach)');

    const allBtn = page.getByRole('button', { name: /^all runs$/i });
    await allBtn.click();
    await expect(grid).toContainText('Browns Canyon National Monument');
    await expect(grid).toContainText('Middle White Salmon River');
    await expect(grid).toContainText('French Broad River (Section 9)');
    await expect(grid).toContainText('Lower Deschutes (Maupin Reach)');
    await expect(grid).toContainText('Soča River (Kobarid Reach)');

    // 4. Selects Arkansas River or White Salmon in calculator, changes leash type to "Fixed Ankle Leash" or fin type to "Long Touring Fin", asserts live status reflects hazardous warning and prohibited status
    const runSelect = page.getByLabel(/select.*river.*run/i);
    await runSelect.selectOption('arkansas-river-browns-canyon');

    const resultPanel = page.getByTestId('river-sup-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Browns Canyon National Monument');
    await expect(resultPanel).toContainText('Approved');

    // Change leash to Fixed Ankle Leash -> asserts live status reflects hazardous warning and prohibited status
    const leashSelect = page.getByLabel(/leash system/i);
    await leashSelect.selectOption('ankle_fixed_coiled');
    await expect(resultPanel).toContainText('Hazardous: Prohibited Setup');
    await expect(resultPanel).toContainText('DANGER: Lethal Ankle Entrapment Hazard');
    await expect(resultPanel).toContainText('Prohibited river setup');

    // Select White Salmon and test Long Touring Fin strike risk
    await runSelect.selectOption('white-salmon-husum');
    await leashSelect.selectOption('torso_quick_release');
    const finSelect = page.getByLabel(/fin configuration/i);
    await finSelect.selectOption('standard_long_touring_fin');
    await expect(resultPanel).toContainText('Hazardous: Prohibited Setup');
    await expect(resultPanel).toContainText('DANGER: Severe Fin Strike');
    await expect(resultPanel).toContainText('Prohibited river setup');

    // 5. Interacts with the River SUP Safety Kit checklist and verifies river-sup-gear-counter updates
    const counter = page.getByTestId('river-sup-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const leashCheckbox = page.getByLabel(/Chest-Harness Quick-Release River Leash Belt/i);
    await leashCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const pfdCheckbox = page.getByLabel(/Type V High-Buoyancy Whitewater PFD/i);
    await pfdCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await leashCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

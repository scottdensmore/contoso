import { test, expect } from '@playwright/test';

test.describe('Backcountry Nordic Speedskating & Wild Ice Touring Guide Journey', () => {
  test('navigates to /wild-ice, filters ice types, evaluates bearing capacity calculator, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /wild-ice
    await page.goto('/wild-ice');

    // 2. Verify page title and literal H1 "Backcountry Nordic Speedskating & Wild Ice Touring"
    await expect(page).toHaveTitle(
      /Backcountry Nordic Speedskating & Wild Ice Touring \| Contoso Outdoors/,
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Nordic Speedskating & Wild Ice Touring',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "White Snow Ice" and verify Lake Moraine card is displayed while Black Ice cards are hidden
    const grid = page.getByTestId('wild-ice-venues-grid');
    const whiteSnowIceBtn = page.getByRole('button', { name: /white snow ice/i });
    await whiteSnowIceBtn.click();

    await expect(grid).toContainText('Lake Moraine & Bow Valley Alpine Tarns');
    await expect(grid).not.toContainText('Lake Mälaren & Stockholm Archipelago');
    await expect(grid).not.toContainText('Lake Siljan & Orsa Wild Ice Circuit');
    await expect(grid).not.toContainText('Lake Baikal & Olkhon Island Strait');
    await expect(grid).not.toContainText('Chequamegon Bay & Apostle Islands Wild Ice');

    const allVenuesBtn = page.getByRole('button', { name: /all venues/i });
    await allVenuesBtn.click();
    await expect(grid).toContainText('Lake Mälaren & Stockholm Archipelago');
    await expect(grid).toContainText('Lake Moraine & Bow Valley Alpine Tarns');

    // 4. Selects Lake Mälaren in calculator, sets measured thickness to 3.0 cm, asserts live status reflects unsafe warning, then raises thickness to 10.0 cm and asserts status updates to "Safe Touring Window"
    const venueSelect = page.getByLabel(/select.*wild ice venue/i);
    await venueSelect.selectOption('lake-malaren-archipelago');

    const resultPanel = page.getByTestId('wild-ice-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Lake Mälaren & Stockholm Archipelago');

    const thicknessInput = page.getByLabel(/measured ice thickness/i);
    await thicknessInput.fill('3.0');
    await expect(resultPanel).toContainText(/submersion hazard|unsafe/i);

    await thicknessInput.fill('10.0');
    await expect(resultPanel).toContainText('Safe Touring Window');

    // 5. Interacts with the Nordic Safety Kit checklist and verifies wild-ice-gear-counter updates
    const counter = page.getByTestId('wild-ice-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const clawsCheckbox = page.getByLabel(/Dual Hand Ice Claws/i);
    await clawsCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const pikeCheckbox = page.getByLabel(/Hardened Chisel-Tip Ice Probing Pole/i);
    await pikeCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await clawsCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

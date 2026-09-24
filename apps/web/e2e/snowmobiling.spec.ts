import { test, expect } from '@playwright/test';

test.describe('Backcountry Snowmobiling & Avalanche Mountain Riding Journey', () => {
  test('navigates to /snowmobiling, verifies title & H1, filters zones, calculates mountain sled performance, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigates to /snowmobiling
    await page.goto('/snowmobiling');

    // 2. Verifies page title and literal H1 "Backcountry Snowmobiling & Avalanche Mountain Riding"
    await expect(page).toHaveTitle(
      /Backcountry Snowmobiling & Avalanche Mountain Riding \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Snowmobiling & Avalanche Mountain Riding',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by riding style and verifies expected cards
    const chutePill = page.getByRole('button', { name: /^Chute Climbing$/i });
    await chutePill.click();

    const cookeCard = page.getByTestId('snowmobile-zone-card-cooke-city-daisy-pass');
    await expect(cookeCard).toBeVisible();

    const revelstokeCard = page.getByTestId('snowmobile-zone-card-revelstoke-boulder-mountain');
    await expect(revelstokeCard).not.toBeVisible();

    const boondockPill = page.getByRole('button', { name: /^Boondocking Meadows$/i });
    await boondockPill.click();

    const togwoteeCard = page.getByTestId('snowmobile-zone-card-togwotee-pass-brooks-lake');
    await expect(togwoteeCard).toBeVisible();
    await expect(cookeCard).not.toBeVisible();

    const allPill = page.getByRole('button', { name: /^All Zones$/i });
    await allPill.click();
    await expect(cookeCard).toBeVisible();
    await expect(revelstokeCard).toBeVisible();

    // 4. Selects Cooke City Daisy Pass in calculator, toggles engine from Naturally Aspirated to Factory Turbo,
    // asserts live status reflects horsepower restoration and flotation index
    const zoneSelect = page.getByLabel(/Select Mountain Zone/i);
    await zoneSelect.selectOption('cooke-city-daisy-pass');

    const engineSelect = page.getByLabel(/Engine Type/i);
    await engineSelect.selectOption('naturally_aspirated_850');

    const status = page.getByTestId('snowmobiling-calculator-result');
    await expect(status).toBeVisible();
    await expect(status).toContainText(/Daisy Pass & Henderson Mountain/i);
    await expect(status).toContainText(/107.3 HP/i);
    await expect(status).toContainText(/35% Loss/i);
    await expect(status).toContainText(/78/i); // Flotation index: 78 / 100

    // Toggle engine to Factory Turbo
    await engineSelect.selectOption('factory_turbo_850');
    await expect(status).toContainText(/165 HP/i);
    await expect(status).toContainText(/0% Loss/i);
    await expect(status).toContainText(/78/i);

    // 5. Interacts with the Avalanche Sled Checklist and verifies snowmobiling-gear-counter updates
    const counter = page.getByTestId('snowmobiling-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const airbagCheckbox = page.getByLabel(/Electronic Fan-Drive Avalanche Airbag/i);
    const beaconCheckbox = page.getByLabel(/Digital 3-Antenna Avalanche Transceiver/i);
    const tetherCheckbox = page.getByLabel(/Magnetic Engine Safety Cutoff Tether/i);

    await expect(airbagCheckbox).not.toBeChecked();
    await airbagCheckbox.check();
    await expect(airbagCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await expect(beaconCheckbox).not.toBeChecked();
    await beaconCheckbox.check();
    await expect(beaconCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await expect(tetherCheckbox).not.toBeChecked();
    await tetherCheckbox.check();
    await expect(tetherCheckbox).toBeChecked();
    await expect(counter).toHaveText('3 of 6 packed');

    await airbagCheckbox.uncheck();
    await expect(airbagCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});

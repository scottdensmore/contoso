import { test, expect } from '@playwright/test';

test.describe('High-Altitude Mountain Weather Routing & Jet Stream Forecasting Journey', () => {
  test('navigates to /mountain-weather, filters synoptic levels, evaluates venturi wind & storm trends, and tracks weather kit', async ({
    page,
  }) => {
    // 1. Navigate to /mountain-weather
    await page.goto('/mountain-weather');

    // 2. Verify page title and literal H1 "High-Altitude Mountain Weather Routing & Jet Stream Forecasting"
    await expect(page).toHaveTitle(
      /High-Altitude Mountain Weather Routing & Jet Stream Forecasting \| Contoso Outdoors/,
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'High-Altitude Mountain Weather Routing & Jet Stream Forecasting',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "500mb Polar Synoptic" and verify Denali card is displayed while 700mb / 300mb cards are hidden
    const grid = page.getByTestId('mountain-weather-sectors-grid');

    const filter500 = page.getByRole('button', { name: /500mb Polar Synoptic/i });
    await filter500.click();

    await expect(grid).toContainText('Denali Upper Kahiltna & South Buttress');
    await expect(grid).not.toContainText('Mount Washington Presidential Range Summit');
    await expect(grid).not.toContainText('Mount Everest South Col & Geneva Spur Sector');

    // Reset back to all sectors to confirm full catalog visibility
    const filterAll = page.getByRole('button', { name: /All Sectors/i });
    await filterAll.click();
    await expect(grid).toContainText('Mount Washington Presidential Range Summit');
    await expect(grid).toContainText('Mount Everest South Col & Geneva Spur Sector');

    // 4. Selects Denali in calculator, sets baseline wind to 35 mph and barometric drop to 3.5 hPa,
    //    asserts live status reflects abort/warning condition, then lowers wind to 10 mph and drop to 0.5 hPa
    //    with jet stream offset 200 km, asserting status updates to "Go: Summit Window Clear".
    const sectorSelect = page.getByLabel(/select mountain weather sector/i);
    await sectorSelect.selectOption('denali-south-buttress');

    const windInput = page.getByLabel('Baseline Wind (mph)');
    await windInput.fill('35');

    const baroInput = page.getByLabel('3-Hour Barometric Drop (hPa)');
    await baroInput.fill('3.5');

    const resultPanel = page.getByTestId('mountain-weather-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Denali Upper Kahiltna & South Buttress');
    await expect(resultPanel).toContainText('Abort: Severe Storm & Whiteout');
    await expect(resultPanel).toContainText('Rapid Storm Warning');

    // Now lower wind to 10 mph, drop to 0.5 hPa, and jet stream offset to 200 km
    await windInput.fill('10');
    await baroInput.fill('0.5');
    const jetInput = page.getByLabel('Jet Stream Core Offset (km)');
    await jetInput.fill('200');

    await expect(resultPanel).toContainText('Go: Summit Window Clear');
    await expect(resultPanel).toContainText('Steady / Fair');

    // 5. Interacts with the Weather Gear checklist and verifies weather-gear-counter updates
    const counter = page.getByTestId('weather-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const watchCheckbox = page.getByLabel(
      /Triple-Sensor Barometric Pressure Altimeter Watch with Storm Alarm/i,
    );
    await watchCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const anemometerCheckbox = page.getByLabel(
      /Calibrated Digital Vane Anemometer with Wind Chill Thermometer/i,
    );
    await anemometerCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await watchCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

import { test, expect } from '@playwright/test';

test.describe('High-Altitude Mountaineering Weather Station Telemetry & Alpine Anemometry Journey', () => {
  test('navigates to /weather-station, verifies headings, filters by zone, tests telemetry calculator, and tracks rigging gear', async ({
    page,
  }) => {
    // 1. Navigates to /weather-station
    await page.goto('/weather-station');

    // 2. Verifies page title and literal H1 "High-Altitude Mountaineering Weather Station Telemetry & Alpine Anemometry"
    await expect(page).toHaveTitle(
      /High-Altitude Mountaineering Weather Station Telemetry & Alpine Anemometry \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'High-Altitude Mountaineering Weather Station Telemetry & Alpine Anemometry',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Glacier Basin Camp" and verifies Denali station is displayed while Everest is hidden
    const glacierFilterBtn = page.getByRole('button', { name: /^Glacier Basin Camp$/i });
    await glacierFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Denali Football Field High Camp Station/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Everest South Col Alpine Weather Station/i })
    ).toBeHidden();

    // 4. Selects Denali in calculator, sets ambient temp to -45°C, wind speed to 175 kph, and rime icing to 85%, asserts live status reflects critical sensor freeze power loss
    const stationSelect = page.getByLabel(/select alpine weather station/i);
    await stationSelect.selectOption('denali-football-field-station');

    const tempInput = page.getByLabel(/ambient temperature/i);
    await tempInput.fill('-45');

    const windInput = page.getByLabel(/wind speed/i);
    await windInput.fill('175');

    const rimeInput = page.getByLabel(/rime icing probability/i);
    await rimeInput.fill('85');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText(/Denali Football Field High Camp Station/i);
    await expect(liveStatus).toContainText(/Critical.*Sensor Freeze.*Power Loss/i);

    // Then sets temp to -5°C, wind speed to 25 kph, and rime icing to 10%, asserting status updates to nominal transmission
    await tempInput.fill('-5');
    await windInput.fill('25');
    await rimeInput.fill('10');

    await expect(liveStatus).toContainText(/Nominal Transmission/i);

    // 5. Interacts with the Weather Station Gear checklist and verifies weather-station-gear-counter updates
    const counter = page.getByTestId('weather-station-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const anemometerCheckbox = page.getByLabel(
      /Heated Ultrasonic Solid-State Alpine Anemometer/i
    );
    await anemometerCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const batteryCheckbox = page.getByLabel(
      /Cold-Temperature Insulated LiFePO4 Station Battery/i
    );
    await batteryCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await anemometerCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

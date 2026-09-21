import { test, expect } from '@playwright/test';

test.describe('Wilderness Bikepacking & Cycle Touring Guide Journey', () => {
  test('navigates to /bikepacking, verifies headings, filters routes, configures rig, and checks gear list', async ({
    page,
  }) => {
    // 1. Navigate to /bikepacking
    await page.goto('/bikepacking');

    // 2. Verify page title and literal H1 "Wilderness Bikepacking & Cycle Touring Guide"
    await expect(page).toHaveTitle(
      /Wilderness Bikepacking & Cycle Touring Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Bikepacking & Cycle Touring Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Rugged Singletrack" and verifies Olympic Discovery & Adventure Singletrack is displayed while others are hidden
    const routesGrid = page.getByTestId('bikepacking-routes-grid');
    await expect(routesGrid).toContainText('Cross-Washington Mountain Bike Route');
    await expect(routesGrid).toContainText('Olympic Discovery & Adventure Singletrack');

    const singletrackBtn = page.getByRole('button', {
      name: /^Rugged Singletrack/i,
    });
    await singletrackBtn.click();

    await expect(routesGrid).toContainText('Olympic Discovery & Adventure Singletrack');
    await expect(routesGrid).not.toContainText('Cross-Washington Mountain Bike Route');
    await expect(routesGrid).not.toContainText('Oregon Outback Gravel Epic');

    // Reset filter to All Routes
    const allBtn = page.getByRole('button', { name: /^All Routes/i });
    await allBtn.click();
    await expect(routesGrid).toContainText('Oregon Outback Gravel Epic');

    // 4. Selects Oregon Outback in rig calculator, adjusts duration/rider weight, and asserts live status reflects tire pressures and bag volume
    const routeSelect = page.getByLabel(/Select Route/i);
    await routeSelect.selectOption('oregon-outback');

    const durationInput = page.getByLabel(/Trip Duration \(Days\)/i);
    await durationInput.fill('4');

    const weightInput = page.getByLabel(/Rider Weight \(lbs\)/i);
    await weightInput.fill('180');

    const resultsPanel = page.getByRole('status');
    await expect(resultsPanel).toBeVisible();
    await expect(resultsPanel).toContainText('Oregon Outback Gravel Epic');
    await expect(resultsPanel).toContainText('Recommended Tire Pressure');
    await expect(resultsPanel).toContainText('PSI Front');
    await expect(resultsPanel).toContainText('PSI Rear');
    await expect(resultsPanel).toContainText('Total Bag Volume Required');
    await expect(resultsPanel).toContainText('Liters');
    await expect(resultsPanel).toContainText('Daily Caloric Demand');

    // 5. Interacts with the Trailside Repair checklist and verifies bikepacking-gear-counter updates
    const gearCounter = page.getByTestId('bikepacking-gear-counter');
    await expect(gearCounter).toHaveText('0 of 6 packed');

    const multiToolCheckbox = page.getByLabel(
      /Multi-tool with integrated chain breaker/i
    );
    await multiToolCheckbox.check();
    await expect(gearCounter).toHaveText('1 of 6 packed');

    const tubelessPlugsCheckbox = page.getByLabel(
      /Tubeless plug puncture kit/i
    );
    await tubelessPlugsCheckbox.check();
    await expect(gearCounter).toHaveText('2 of 6 packed');

    await multiToolCheckbox.uncheck();
    await expect(gearCounter).toHaveText('1 of 6 packed');
  });
});

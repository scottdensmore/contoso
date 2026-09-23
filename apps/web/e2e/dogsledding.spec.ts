import { test, expect } from '@playwright/test';

test.describe('Winter Wilderness Dogsledding & Mushing Planner Journey', () => {
  test('navigates to /dogsledding, verifies title & H1, filters trails, calculates pacing and calories, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigates to /dogsledding
    await page.goto('/dogsledding');

    // 2. Verifies page title and literal H1 "Winter Wilderness Dogsledding & Mushing Planner"
    await expect(page).toHaveTitle(
      /Winter Wilderness Dogsledding & Mushing Planner \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Winter Wilderness Dogsledding & Mushing Planner',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Beginner" or "Expedition Extreme" and verifies expected cards are displayed while others are hidden
    const beginnerPill = page.getByRole('button', { name: /^Beginner$/i });
    await beginnerPill.click();

    const allagashCard = page.getByTestId('route-card-maine-north-woods-allagash');
    await expect(allagashCard).toBeVisible();

    const iditarodCard = page.getByTestId('route-card-iditarod-historic-trail-traverse');
    await expect(iditarodCard).not.toBeVisible();

    const extremePill = page.getByRole('button', { name: /^Expedition Extreme$/i });
    await extremePill.click();

    await expect(iditarodCard).toBeVisible();
    await expect(allagashCard).not.toBeVisible();

    const allPill = page.getByRole('button', { name: /^All Trails$/i });
    await allPill.click();
    await expect(iditarodCard).toBeVisible();
    await expect(allagashCard).toBeVisible();

    // 4. Selects Iditarod in calculator, adjusts ambient temperature and team size, asserts live status reflects speed, calories, and trail advisory
    const routeSelect = page.getByLabel(/Select Expedition Route/i);
    await routeSelect.selectOption('iditarod-historic-trail-traverse');

    const dogCountInput = page.getByLabel(/Team Dog Count/i);
    await dogCountInput.fill('14');

    const tempInput = page.getByLabel(/Ambient Temperature/i);
    await tempInput.fill('-15');

    const status = page.getByTestId('dogsledding-calculator-result');
    await expect(status).toBeVisible();
    await expect(status).toContainText(/Iditarod National Historic Trail Mushing Traverse/i);
    await expect(status).toContainText(/12.8 km\/h/i);
    await expect(status).toContainText(/Optimal/i);
    await expect(status).toContainText(/56 L/i);
    await expect(status).toContainText(/224 booties/i);

    // Adjust temperature to extreme deep freeze (-50°F) to trigger critical hazard
    await tempInput.fill('-50');
    await expect(status).toContainText(/Critical Hazard/i);
    await expect(status).toContainText(/Extreme arctic deep freeze/i);

    // Return to safe winter temp (-10°F)
    await tempInput.fill('-10');
    await expect(status).toContainText(/Optimal/i);

    // 5. Interacts with the Mushing Kit checklist and verifies dogsled-gear-counter updates
    const counter = page.getByTestId('dogsled-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const bootiesCheckbox = page.getByLabel(/Cordura \/ Polar Fleece Sled Dog Booties/i);
    const hookCheckbox = page.getByLabel(/Dual-Claw Welded Steel Snow Hook/i);
    const cookerCheckbox = page.getByLabel(/5-Gallon Multi-Fuel Dog Cooker/i);

    await expect(bootiesCheckbox).not.toBeChecked();
    await bootiesCheckbox.check();
    await expect(bootiesCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await expect(hookCheckbox).not.toBeChecked();
    await hookCheckbox.check();
    await expect(hookCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await expect(cookerCheckbox).not.toBeChecked();
    await cookerCheckbox.check();
    await expect(cookerCheckbox).toBeChecked();
    await expect(counter).toHaveText('3 of 6 packed');

    await bootiesCheckbox.uncheck();
    await expect(bootiesCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});

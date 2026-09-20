import { test, expect } from '@playwright/test';

test.describe('Backcountry Wildlife & Bear Safety Wilderness Tracker Journey', () => {
  test('navigates to /wildlife, verifies headings, filters fauna, evaluates encounter screener, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigates to /wildlife
    await page.goto('/wildlife');

    // 2. Verifies page title and literal H1 "Backcountry Wildlife & Bear Safety Wilderness Tracker"
    await expect(page).toHaveTitle(
      /Backcountry Wildlife & Bear Safety Tracker \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Wildlife & Bear Safety Wilderness Tracker',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Large Ungulates" and verifies Shiras Moose is visible while Grizzly Bear is filtered
    const speciesGrid = page.getByTestId('species-grid');
    await expect(speciesGrid).toContainText('Grizzly Bear');
    await expect(speciesGrid).toContainText('Shiras Moose');

    const ungulateBtn = page.getByRole('button', { name: /Large Ungulates/i });
    await ungulateBtn.click();

    await expect(speciesGrid).toContainText('Shiras Moose');
    await expect(speciesGrid).not.toContainText('Grizzly Bear');
    await expect(speciesGrid).not.toContainText('American Black Bear');

    // Reset filter
    const allBtn = page.getByRole('button', { name: /All Species/i });
    await allBtn.click();
    await expect(speciesGrid).toContainText('Grizzly Bear');

    // 4. Runs the Encounter Safety Screener for Grizzly Bear at 25 yards with cubs present and approaching
    const speciesSelect = page.getByLabel(/Select Encounter Species/i);
    await speciesSelect.selectOption('grizzly-bear');

    const distanceInput = page.getByLabel(/Estimated Distance \(yards\)/i);
    await distanceInput.fill('25');

    const approachingCheckbox = page.getByLabel(/Animal is approaching/i);
    await approachingCheckbox.check();

    const cubsCheckbox = page.getByLabel(/Cubs or food carcass present/i);
    await cubsCheckbox.check();

    // Verifies the "CRITICAL - IMMINENT CHARGE HAZARD" status panel
    const statusPanel = page.getByRole('status');
    await expect(statusPanel).toBeVisible();
    await expect(statusPanel).toContainText('CRITICAL - IMMINENT CHARGE HAZARD');
    await expect(statusPanel).toContainText('STAND YOUR GROUND');
    await expect(statusPanel).toContainText('30-40 ft');

    // 5. Interacts with the Wildlife Safety Gear Checklist and asserts the packing counter
    const gearCounter = page.getByTestId('wildlife-gear-counter');
    await expect(gearCounter).toHaveText('0 of 5 packed');

    const bearSprayCheckbox = page.getByLabel(/Pack EPA-Registered Bear Spray/i);
    await bearSprayCheckbox.check();
    await expect(bearSprayCheckbox).toBeChecked();
    await expect(gearCounter).toHaveText('1 of 5 packed');

    const canisterCheckbox = page.getByLabel(/Pack IGBC-Certified Bear Resistant Canister/i);
    await canisterCheckbox.check();
    await expect(canisterCheckbox).toBeChecked();
    await expect(gearCounter).toHaveText('2 of 5 packed');

    await bearSprayCheckbox.uncheck();
    await expect(bearSprayCheckbox).not.toBeChecked();
    await expect(gearCounter).toHaveText('1 of 5 packed');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Wilderness Sea Kayaking & Coastal Expedition Planner Journey', () => {
  test('navigates to /sea-kayaking, verifies title & H1, filters routes, calculates tide crossing plan, and toggles safety checklist', async ({
    page,
  }) => {
    // 1. Navigate to /sea-kayaking
    await page.goto('/sea-kayaking');

    // 2. Verify page title and literal H1 "Wilderness Sea Kayaking & Coastal Expedition Planner"
    await expect(page).toHaveTitle(
      /Wilderness Sea Kayaking & Coastal Expedition Planner \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Sea Kayaking & Coastal Expedition Planner',
    });
    await expect(h1).toBeVisible();

    // 3. Filter routes by "Grade 4 (Exposed Ocean)" and verify Gwaii Haanas is shown while San Juan Islands is hidden
    const exposedOceanBtn = page.getByRole('button', { name: /Grade 4 \(Exposed Ocean\)/i });
    await exposedOceanBtn.click();

    const gwaiiHeading = page.getByRole('heading', {
      level: 3,
      name: /Gwaii Haanas Coastal Wilderness Expedition/i,
    });
    await expect(gwaiiHeading).toBeVisible();

    const sanJuanHeading = page.getByRole('heading', {
      level: 3,
      name: /San Juan Islands Archipelago Traverse/i,
    });
    await expect(sanJuanHeading).not.toBeVisible();

    // Filter by "Grade 3 (Open Crossing)" and verify Prince William Sound is shown
    const openCrossingBtn = page.getByRole('button', { name: /Grade 3 \(Open Crossing\)/i });
    await openCrossingBtn.click();

    const pwsHeading = page.getByRole('heading', {
      level: 3,
      name: /Prince William Sound Glaciated Fjords/i,
    });
    await expect(pwsHeading).toBeVisible();
    await expect(gwaiiHeading).not.toBeVisible();

    // Reset to all routes
    const allRoutesBtn = page.getByRole('button', { name: /All Routes/i });
    await allRoutesBtn.click();
    await expect(sanJuanHeading).toBeVisible();
    await expect(pwsHeading).toBeVisible();
    await expect(gwaiiHeading).toBeVisible();

    // 4. Operates Tidal Window & Open Crossing Calculator: selects San Juan Islands, adjusts current and wind, asserts live status
    const routeSelect = page.getByLabel(/select coastal route/i);
    await routeSelect.selectOption('san-juan-islands-crossing');

    const skillSelect = page.getByLabel(/paddler skill level/i);
    await skillSelect.selectOption('intermediate');

    const currentInput = page.getByLabel(/tidal current speed/i);
    await currentInput.fill('2.5');

    const windInput = page.getByLabel(/wind speed/i);
    await windInput.fill('12');

    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText('60°');
    await expect(statusRegion).toContainText('2.9 kt');
    await expect(statusRegion).toContainText('Ch 16');
    await expect(statusRegion).toContainText('Exercise caution: Active tidal currents and moderate chop');

    // 5. Interacts with the Coastal Safety Kit checklist and verifies sea-kayak-gear-counter updates
    const counter = page.getByTestId('sea-kayak-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const pfdCheckbox = page.getByLabel(/USCG\/Transport Canada Type III\/V/i);
    const drysuitCheckbox = page.getByLabel(/Waterproof breathable dry suit/i);
    const vhfCheckbox = page.getByLabel(/Marine VHF waterproof radio/i);

    await expect(pfdCheckbox).not.toBeChecked();
    await pfdCheckbox.check();
    await expect(pfdCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await expect(drysuitCheckbox).not.toBeChecked();
    await drysuitCheckbox.check();
    await expect(drysuitCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await expect(vhfCheckbox).not.toBeChecked();
    await vhfCheckbox.check();
    await expect(vhfCheckbox).toBeChecked();
    await expect(counter).toHaveText('3 of 6 packed');

    await pfdCheckbox.uncheck();
    await expect(pfdCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});

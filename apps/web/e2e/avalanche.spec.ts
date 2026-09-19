import { test, expect } from '@playwright/test';

test.describe('Backcountry Avalanche Safety & Snowpack Assessment Journey', () => {
  test('navigates to /avalanche, verifies title & H1, selects forecast zone, evaluates slope terrain safety, and toggles companion rescue checklist', async ({
    page,
  }) => {
    // 1. Navigates to /avalanche
    await page.goto('/avalanche');

    // 2. Verifies page title and literal H1 "Backcountry Avalanche Safety & Snowpack Assessment"
    await expect(page).toHaveTitle(
      /Backcountry Avalanche Safety & Snowpack \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Avalanche Safety & Snowpack Assessment',
    });
    await expect(h1).toBeVisible();

    // 3. Selects "Stevens Pass / Cascade Crest" and asserts elevation danger ratings (e.g. "CONSIDERABLE" or Level 3) are displayed
    const zoneSelect = page.getByLabel(/select avalanche forecast zone/i);
    await zoneSelect.selectOption('stevens-pass');

    const stevensHeading = page.getByRole('heading', {
      level: 3,
      name: 'Stevens Pass / Cascade Crest',
    });
    await expect(stevensHeading).toBeVisible();
    await expect(page.getByText(/Level 3 - CONSIDERABLE/i).first()).toBeVisible();

    // 4. Tests Slope Angle Evaluator at 37° and verifies "PRIME AVALANCHE TERRAIN" badge is displayed
    const angleNumberInput = page.getByLabel('Slope Angle Number');
    await angleNumberInput.fill('37');

    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText('PRIME AVALANCHE TERRAIN (30°-45°)');
    await expect(statusRegion).toContainText('Travel one at a time across avalanche paths');

    // 5. Changes slope angle to 25° and verifies "LOW-ANGLE TERRAIN" safe category appears
    await angleNumberInput.fill('25');
    await expect(statusRegion).toContainText('LOW-ANGLE TERRAIN (<30°)');
    await expect(statusRegion).toContainText('FAVORABLE');

    // 6. Toggles items in the Companion Rescue Gear checklist
    const transceiverCheck = page.getByLabel(/avalanche transceiver/i);
    const probeCheck = page.getByLabel(/collapsible avalanche probe/i);
    const shovelCheck = page.getByLabel(/extendable metal snow shovel/i);

    await expect(transceiverCheck).not.toBeChecked();
    await transceiverCheck.check();
    await expect(transceiverCheck).toBeChecked();

    await probeCheck.check();
    await expect(probeCheck).toBeChecked();

    await shovelCheck.check();
    await expect(shovelCheck).toBeChecked();

    await expect(page.getByText(/3 of 5 Essential Items Verified/i)).toBeVisible();
  });
});

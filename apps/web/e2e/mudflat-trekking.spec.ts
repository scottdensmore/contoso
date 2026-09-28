import { test, expect } from '@playwright/test';

test.describe('Wilderness Tidal Flat Mud-Trekking & Estuary Silt Traversing Journey', () => {
  test('navigates to /mudflat-trekking, filters terrain profiles, simulates tidal dynamics, and tracks safety checklist', async ({
    page,
  }) => {
    // 1. Navigate to /mudflat-trekking
    await page.goto('/mudflat-trekking');

    // 2. Verify page title and literal H1 "Wilderness Tidal Flat Mud-Trekking & Estuary Silt Traversing"
    await expect(page).toHaveTitle(
      /Wilderness Tidal Flat Mud-Trekking & Estuary Silt Traversing \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Tidal Flat Mud-Trekking & Estuary Silt Traversing',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Deep Quicksilt Ooze" and verify Bay of Fundy card is displayed while Wadden Sea is hidden
    const grid = page.getByTestId('mudflat-routes-grid');
    const deepOozeBtn = page.getByRole('button', { name: /^Deep Quicksilt Ooze$/i });
    await deepOozeBtn.click();

    await expect(grid).toContainText('Bay of Fundy Minas Basin Mud Traverse');
    await expect(grid).toContainText("Morecambe Bay Queen's Guide Crossing");
    await expect(grid).toContainText('Turnagain Arm Silt Flats & Bore Tide');
    await expect(grid).not.toContainText('Wadden Sea Cuxhaven-Neuwerk Traverse');
    await expect(grid).not.toContainText('Mont-Saint-Michel Bay Silt Crossing');

    // 4. Select Bay of Fundy in calculator, test hazardous quicksilt entrapment, then safe low tide window
    const routeSelect = page.getByLabel(/Select Tidal Flat Route/i);
    await routeSelect.selectOption('bay-of-fundy-miners-marsh');

    const siltDepthInput = page.getByLabel(/Silt Depth \(cm\)/i);
    const elapsedTimeInput = page.getByLabel(/Elapsed Time \(minutes\)/i);
    const tidalPhaseSelect = page.getByLabel(/Tidal Current Phase/i);

    // Set hazardous entrapment conditions: 52cm silt, 130 min elapsed, Spring Bore Incoming
    await siltDepthInput.fill('52');
    await elapsedTimeInput.fill('130');
    await tidalPhaseSelect.selectOption('spring_bore_incoming');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText('Hazardous Quicksilt Tidal Entrapment');
    await expect(liveStatus).toContainText('20 min remaining');
    await expect(liveStatus).toContainText('Drag Index: 10/10');
    await expect(liveStatus).toContainText('138 cm wading depth');

    // Reset to safe conditions: 15cm silt, 10 min elapsed, Slack Low Tide
    await siltDepthInput.fill('15');
    await elapsedTimeInput.fill('10');
    await tidalPhaseSelect.selectOption('slack_low_tide');

    await expect(liveStatus).toContainText('Safe Low Tide Window');
    await expect(liveStatus).toContainText('140 min remaining');
    await expect(liveStatus).toContainText('Drag Index: 7/10');
    await expect(liveStatus).toContainText('31 cm wading depth');

    // 5. Interacts with the Mudflat Trekking Safety Kit checklist and verifies mudflat-trekking-gear-counter
    const counter = page.getByTestId('mudflat-trekking-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const bootiesCheckbox = page.getByLabel(
      /High-Tension Lace-Locked Neoprene Mudflat Booties/i
    );
    const poleCheckbox = page.getByLabel(
      /Calibrated Depth-Graduated Aluminum Silt Probe Pole/i
    );

    await expect(bootiesCheckbox).not.toBeChecked();
    await bootiesCheckbox.check();
    await expect(bootiesCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await poleCheckbox.check();
    await expect(poleCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await bootiesCheckbox.uncheck();
    await expect(bootiesCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Backcountry Ski Touring & Splitboard Route Planner Journey', () => {
  test('navigates to /ski-touring, verifies title & H1, filters routes, calculates skinning pace, verifies etiquette and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /ski-touring
    await page.goto('/ski-touring');

    // 2. Verify page title and literal H1 "Backcountry Ski Touring & Splitboard Route Planner"
    await expect(page).toHaveTitle(
      /Backcountry Ski Touring & Splitboard \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Ski Touring & Splitboard Route Planner',
    });
    await expect(h1).toBeVisible();

    // 3. Filter routes by "Intermediate" and verify Kendall Lakes Peak is shown and others hidden
    const intermediatePill = page.getByRole('button', { name: /^Intermediate$/i });
    await intermediatePill.click();

    const kendallHeading = page.getByRole('heading', {
      level: 3,
      name: /Kendall Lakes Peak & Knob/i,
    });
    await expect(kendallHeading).toBeVisible();

    const muirHeading = page.getByRole('heading', {
      level: 3,
      name: /Camp Muir Snowfield/i,
    });
    await expect(muirHeading).not.toBeVisible();

    // Reset to all routes
    const allPill = page.getByRole('button', { name: /^All Routes$/i });
    await allPill.click();
    await expect(muirHeading).toBeVisible();

    // 4. Operates the Skinning Pace Calculator selecting Camp Muir and Athletic pace, verifying estimated uphill time and vertical ascent rate
    const routeSelect = page.getByLabel(/select backcountry route/i);
    await routeSelect.selectOption('muir-snowfield');

    const fitnessSelect = page.getByLabel(/touring fitness level/i);
    await fitnessSelect.selectOption('athletic');

    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText('1575 ft/hr');
    await expect(statusRegion).toContainText('175 min');
    await expect(statusRegion).toContainText('267 min');

    // 5. Verifies Skin Track Etiquette and toggles Touring Gear Checklist items
    await expect(page.getByText(/Never bootpack in established skin tracks/i)).toBeVisible();
    await expect(page.getByText(/Yield to downhill traffic/i)).toBeVisible();
    await expect(page.getByText(/Set efficient kick turns on mellow gradients/i)).toBeVisible();

    const skinsCheckbox = page.getByLabel(/Climbing Skins/i);
    const skiCramponsCheckbox = page.getByLabel(/Ski Crampons/i);
    const beaconCheckbox = page.getByLabel(/Beacon \/ Probe \/ Shovel/i);

    await expect(skinsCheckbox).not.toBeChecked();
    await skinsCheckbox.check();
    await expect(skinsCheckbox).toBeChecked();

    await expect(skiCramponsCheckbox).not.toBeChecked();
    await skiCramponsCheckbox.check();
    await expect(skiCramponsCheckbox).toBeChecked();

    await expect(beaconCheckbox).not.toBeChecked();
    await beaconCheckbox.check();
    await expect(beaconCheckbox).toBeChecked();

    await expect(page.getByText(/3 of 7 Essential Items Checked/i)).toBeVisible();
  });
});

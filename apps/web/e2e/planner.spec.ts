import { test, expect } from '@playwright/test';

test.describe('Wilderness Trip Planner & Packing Checklist Journey', () => {
  test('configures backcountry expedition, calculates nutrition, interacts with checklist, toggles cold climate, and reviews Leave No Trace principles', async ({
    page,
  }) => {
    // 1. Navigates to /planner
    await page.goto('/planner');

    // 2. Verifies page title and H1 "Wilderness Trip Planner & Packing Checklist"
    await expect(page).toHaveTitle(/Wilderness Trip Planner & Packing Checklist/);
    const heading = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Trip Planner & Packing Checklist',
    });
    await expect(heading).toBeVisible();

    // 3. Selects "Weekend Backpacking" preset, adjusts duration to 3 days and group size to 2
    const weekendPreset = page.getByRole('button', { name: /weekend backpacking/i });
    await weekendPreset.click();

    const durationInput = page.getByLabel(/trip duration \(1-14 days\)/i);
    await durationInput.fill('3');

    const groupSizeInput = page.getByLabel(/group size \(1-10 persons\)/i);
    await groupSizeInput.fill('2');

    // 4. Verifies nutrition metrics update (e.g. ~18,000 - 20,000 total kcal)
    await expect(page.getByText(/18,000\s*kcal/i)).toBeVisible();

    // 5. Checks items in the Ten Essentials and Shelter categories, asserting the completion counter increases
    const essentialsTab = page.getByRole('button', { name: /^ten essentials$/i });
    await essentialsTab.click();

    await expect(page.getByText(/0 of \d+ items packed/i)).toBeVisible();

    const essentialsCheckboxes = page.getByRole('checkbox');
    await essentialsCheckboxes.first().check();
    await expect(page.getByText(/1 of \d+ items packed/i)).toBeVisible();

    const shelterTab = page.getByRole('button', { name: /^shelter$/i });
    await shelterTab.click();

    const shelterCheckboxes = page.getByRole('checkbox');
    await shelterCheckboxes.first().check();
    await expect(page.getByText(/2 of \d+ items packed/i)).toBeVisible();

    // 6. Toggles climate to "Cold & Freezing" and asserts cold-weather items (e.g., 4-season tent or microspikes) appear in the checklist
    const allTab = page.getByRole('button', { name: /^all$/i });
    await allTab.click();

    await expect(page.getByText('4-Season Mountaineering Geodesic Tent')).not.toBeVisible();
    await expect(page.getByText('Traction Microspikes / Crampons')).not.toBeVisible();

    const coldRadio = page.getByLabel(/cold & freezing/i);
    await coldRadio.check();

    await expect(page.getByText('4-Season Mountaineering Geodesic Tent')).toBeVisible();
    await expect(page.getByText('Traction Microspikes / Crampons')).toBeVisible();

    // 7. Asserts the Leave No Trace planning principles section is displayed
    const lntHeading = page.getByRole('heading', {
      level: 2,
      name: /leave no trace & wilderness prep/i,
    });
    await expect(lntHeading).toBeVisible();
    await expect(page.getByText(/Plan Ahead and Prepare/i)).toBeVisible();
    await expect(page.getByText(/Travel and Camp on Durable Surfaces/i)).toBeVisible();
    await expect(page.getByText(/Dispose of Waste Properly/i)).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Trail Running & Mountain Ultra Route Guide Journey', () => {
  test('navigates to /trail-running, verifies title & H1, filters routes, calculates ultra pacing & fuel, and interacts with gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /trail-running
    await page.goto('/trail-running');

    // 2. Verify page title and literal H1 "Trail Running & Mountain Ultra Route Guide"
    await expect(page).toHaveTitle(
      /Trail Running & Mountain Ultra Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Trail Running & Mountain Ultra Route Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter routes by "High Mountain" and verify Wonderland Trail is visible while others are filtered
    const highMountainPill = page.getByRole('button', { name: /^High Mountain$/i });
    await highMountainPill.click();

    const wonderlandHeading = page.getByRole('heading', {
      level: 3,
      name: /Wonderland Trail Fastpack/i,
    });
    await expect(wonderlandHeading).toBeVisible();

    const enchantmentsHeading = page.getByRole('heading', {
      level: 3,
      name: /The Enchantments Thru-Run/i,
    });
    await expect(enchantmentsHeading).not.toBeVisible();

    const timberlineHeading = page.getByRole('heading', {
      level: 3,
      name: /Timberline Trail Around Mt. Hood/i,
    });
    await expect(timberlineHeading).not.toBeVisible();

    // Reset filter
    const allPill = page.getByRole('button', { name: /^All Routes$/i });
    await allPill.click();
    await expect(timberlineHeading).toBeVisible();

    // 4. Run the Ultra Pacing & Fuel Calculator for Timberline Trail, adjust target pace, and verify caloric/fluid output updates
    const routeSelect = page.getByLabel(/Select Mountain Route/i);
    await routeSelect.selectOption('timberline-trail-ultra');

    const paceInput = page.getByLabel(/Target Pace \(min\/mile\)/i);
    await paceInput.fill('12.0');

    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText('9.8 hrs');
    await expect(statusRegion).toContainText('6548 kcal');
    await expect(statusRegion).toContainText('6.1 L');

    // Adjust target pace
    await paceInput.fill('10.0');
    await expect(statusRegion).toContainText('8.5 hrs');

    // 5. Interact with the Mandatory Gear Checklist and assert the packing counter updates
    const counter = page.getByTestId('trail-running-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const vestCheckbox = page.getByLabel(/Hydration vest/i);
    const bivyCheckbox = page.getByLabel(/Ultralight emergency bivy/i);
    const microspikesCheckbox = page.getByLabel(/Running microspikes/i);

    await expect(vestCheckbox).not.toBeChecked();
    await vestCheckbox.check();
    await expect(vestCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await bivyCheckbox.check();
    await microspikesCheckbox.check();
    await expect(counter).toHaveText('3 of 6 packed');

    await bivyCheckbox.uncheck();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});

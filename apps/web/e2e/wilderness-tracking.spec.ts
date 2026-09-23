import { test, expect } from '@playwright/test';

test.describe('Wilderness Tracking & Animal Sign Reading Guide Journey', () => {
  test('navigates to /wilderness-tracking, verifies title & H1, filters species by family, calculates track aging & predator alert, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /wilderness-tracking
    await page.goto('/wilderness-tracking');

    // 2. Verify page title and literal H1 "Wilderness Tracking & Animal Sign Reading Guide"
    await expect(page).toHaveTitle(
      /Wilderness Tracking & Animal Sign Reading Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Tracking & Animal Sign Reading Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Ursids" or "Felids" and verifies expected cards are displayed while others are hidden
    const ursidsPill = page.getByRole('button', { name: /^Ursids$/i });
    await ursidsPill.click();

    const grizzlyHeading = page.getByRole('heading', {
      level: 3,
      name: /Interior Grizzly Bear/i,
    });
    await expect(grizzlyHeading).toBeVisible();

    const wolfHeading = page.getByRole('heading', {
      level: 3,
      name: /Northwestern Gray Wolf/i,
    });
    await expect(wolfHeading).not.toBeVisible();

    const cougarHeading = page.getByRole('heading', {
      level: 3,
      name: /North American Cougar/i,
    });
    await expect(cougarHeading).not.toBeVisible();

    // Filter by "Felids"
    const felidsPill = page.getByRole('button', { name: /^Felids$/i });
    await felidsPill.click();

    await expect(cougarHeading).toBeVisible();
    await expect(grizzlyHeading).not.toBeVisible();
    await expect(wolfHeading).not.toBeVisible();

    // Reset to "All Species"
    const allPill = page.getByRole('button', { name: /^All Species$/i });
    await allPill.click();
    await expect(wolfHeading).toBeVisible();
    await expect(grizzlyHeading).toBeVisible();
    await expect(cougarHeading).toBeVisible();

    // 4. Selects Grizzly Bear or Cougar in calculator, sets sharpness to "Razor Crisp", asserts live status reflects heightened predator alert
    const speciesSelect = page.getByLabel(/select wildlife species/i);
    await speciesSelect.selectOption('grizzly-brown-bear');

    const wallSelect = page.getByLabel(/track wall sharpness/i);
    await wallSelect.selectOption('razor_crisp_undisturbed');

    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText(/Heightened Predator Alert!/i);
    await expect(statusRegion).toContainText(/Interior Grizzly Bear/i);
    await expect(statusRegion).toContainText(/CRITICAL PREDATOR ALERT/i);

    // 5. Interacts with the Tracking Safety Kit checklist and verifies tracking-gear-counter updates
    const counter = page.getByTestId('tracking-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const stickCheckbox = page.getByLabel(/60-Inch Graduated Tracker's Measuring Stick/i);
    const lightCheckbox = page.getByLabel(/500-Lumen High-CRI LED Flashlight/i);
    const sprayCheckbox = page.getByLabel(/EPA-Certified 10.2oz 2.0% Major Capsaicinoid Bear Deterrent Spray/i);

    await expect(stickCheckbox).not.toBeChecked();
    await stickCheckbox.check();
    await expect(stickCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await expect(lightCheckbox).not.toBeChecked();
    await lightCheckbox.check();
    await expect(lightCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await expect(sprayCheckbox).not.toBeChecked();
    await sprayCheckbox.check();
    await expect(sprayCheckbox).toBeChecked();
    await expect(counter).toHaveText('3 of 6 packed');

    await stickCheckbox.uncheck();
    await expect(stickCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});

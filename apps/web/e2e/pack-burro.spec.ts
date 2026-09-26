import { test, expect } from '@playwright/test';

test.describe('Wilderness Pack-Burro Racing & High-Altitude Ass Packing Journey', () => {
  test('navigates to /pack-burro, verifies title & H1, filters courses, tests scree calculator compliance & braking, and toggles regulation gear checklist', async ({
    page,
  }) => {
    // 1. Navigates to /pack-burro
    await page.goto('/pack-burro');

    // 2. Verifies page title and literal H1 "Wilderness Pack-Burro Racing & High-Altitude Ass Packing"
    await expect(page).toHaveTitle(
      /Wilderness Pack-Burro Racing & High-Altitude Ass Packing \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Pack-Burro Racing & High-Altitude Ass Packing',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Mammoth Donkey" and verifies Georgetown card is displayed while Leadville cards are hidden
    const mammothBtn = page.getByRole('button', { name: /Mammoth Donkey/i });
    await mammothBtn.click();

    const georgetownHeading = page.getByRole('heading', {
      level: 3,
      name: /Georgetown Silver Plume Mining District Run/i,
    });
    await expect(georgetownHeading).toBeVisible();

    const leadvilleHeading = page.getByRole('heading', {
      level: 3,
      name: /Leadville Boom Days World Championship/i,
    });
    await expect(leadvilleHeading).not.toBeVisible();

    const fairplayHeading = page.getByRole('heading', {
      level: 3,
      name: /Fairplay World Championship Burro Race/i,
    });
    await expect(fairplayHeading).not.toBeVisible();

    // 4. Selects Leadville Boom Days in calculator, sets pack weight to 28 lbs, asserts live status reflects underweight disqualification, then raises weight to 35 lbs with 15% grade, asserting status updates to "Regulation Compliant" and "Optimal Race Cadence"
    const courseSelect = page.getByRole('combobox', { name: /Select Course/i });
    await courseSelect.selectOption('leadville-boom-days-mosquito-pass');

    const weightInput = page.getByLabel(/Pack Saddle Weight/i);
    await weightInput.fill('28');

    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText(/Disqualified: Underweight Pack/i);
    await expect(statusRegion).toContainText(/underweight/i);

    // Raise weight to 35 lbs with 15% grade
    await weightInput.fill('35');
    const slopeInput = page.getByLabel(/Descent Slope Gradient/i);
    await slopeInput.fill('15');

    await expect(statusRegion).toContainText(/Regulation Compliant/i);
    await expect(statusRegion).toContainText(/Optimal Race Cadence/i);

    // 5. Interacts with the Burro Gear checklist and verifies burro-gear-counter updates
    const counter = page.getByTestId('burro-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const saddleCheckbox = page.getByLabel(/Regulation Wood Sawbuck Pack Saddle/i);
    const kitCheckbox = page.getByLabel(/Steel Mining Pick, Flat Shovel, & 14-Inch Steel Gold Pan/i);
    const ropeCheckbox = page.getByLabel(/15-Foot Heavy-Duty Braided Cotton Lead Rope/i);

    await expect(saddleCheckbox).not.toBeChecked();
    await saddleCheckbox.check();
    await expect(saddleCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await expect(kitCheckbox).not.toBeChecked();
    await kitCheckbox.check();
    await expect(kitCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await expect(ropeCheckbox).not.toBeChecked();
    await ropeCheckbox.check();
    await expect(ropeCheckbox).toBeChecked();
    await expect(counter).toHaveText('3 of 6 packed');

    await saddleCheckbox.uncheck();
    await expect(saddleCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});

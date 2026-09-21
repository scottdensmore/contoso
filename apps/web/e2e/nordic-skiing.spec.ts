import { test, expect } from '@playwright/test';

test.describe('Nordic & Cross-Country Ski Touring Trail Explorer Journey', () => {
  test('navigates to /nordic-skiing, verifies title & H1, filters trails, calculates kick wax & klister alert, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /nordic-skiing
    await page.goto('/nordic-skiing');

    // 2. Verify page title and literal H1 "Nordic & Cross-Country Ski Touring Trail Explorer"
    await expect(page).toHaveTitle(
      /Nordic & Cross-Country Ski Touring Trail Explorer \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Nordic & Cross-Country Ski Touring Trail Explorer',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Skate Skiing" and verifies expected cards are displayed while others are hidden
    const skatePill = page.getByRole('button', { name: /^Skate Skiing$/i });
    await skatePill.click();

    const devilsThumbHeading = page.getByRole('heading', {
      level: 3,
      name: /Devil's Thumb Ranch High Lonesome Loop/i,
    });
    await expect(devilsThumbHeading).toBeVisible();

    const royalGorgeHeading = page.getByRole('heading', {
      level: 3,
      name: /Royal Gorge Rainbow Ridge Scenic Rim/i,
    });
    await expect(royalGorgeHeading).toBeVisible();

    const methowHeading = page.getByRole('heading', {
      level: 3,
      name: /Methow Valley Community Trail/i,
    });
    await expect(methowHeading).not.toBeVisible();

    // Filter by "Classic Track"
    const classicPill = page.getByRole('button', { name: /^Classic Track$/i });
    await classicPill.click();

    await expect(methowHeading).toBeVisible();
    const trappHeading = page.getByRole('heading', {
      level: 3,
      name: /Trapp Family Lodge Sugar Road/i,
    });
    await expect(trappHeading).toBeVisible();
    await expect(devilsThumbHeading).not.toBeVisible();

    // Reset to All Trails
    const allPill = page.getByRole('button', { name: /^All Trails$/i });
    await allPill.click();
    await expect(methowHeading).toBeVisible();
    await expect(devilsThumbHeading).toBeVisible();

    // 4. Selects Methow Valley or Devil's Thumb Ranch in calculator, adjusts temperature and snow condition,
    // and asserts live status reflects wax recommendation and klister alert
    const trailSelect = page.getByLabel(/select nordic trail/i);
    await trailSelect.selectOption('methow-valley-community-trail');

    const tempInput = page.getByLabel(/air temperature/i);
    await tempInput.fill('38');

    const snowSelect = page.getByLabel(/snow condition/i);
    await snowSelect.selectOption('wet_slush');

    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText(/Klister Alert/i);
    await expect(statusRegion).toContainText(/Swix Red Wet Klister/i);
    await expect(statusRegion).toContainText(/slow sticky/i);

    // Adjust to sub-freezing dry powder
    await tempInput.fill('12');
    await snowSelect.selectOption('packed_powder');
    await expect(statusRegion).toContainText(/Swix Green Hardwax/i);
    await expect(page.getByText(/Klister Alert/i)).not.toBeVisible();

    // 5. Interacts with the Nordic Safety Kit checklist and verifies nordic-gear-counter updates
    const counter = page.getByTestId('nordic-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const skisCheckbox = page.getByLabel(/NNN \/ Prolink \/ SNS Profil boot-binding compatible cross-country skis/i);
    const polesCheckbox = page.getByLabel(/High-modulus carbon composite cross-country ski poles/i);
    const jacketCheckbox = page.getByLabel(/Breathable windproof cross-country softshell jacket/i);

    await expect(skisCheckbox).not.toBeChecked();
    await skisCheckbox.check();
    await expect(skisCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await expect(polesCheckbox).not.toBeChecked();
    await polesCheckbox.check();
    await expect(polesCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await expect(jacketCheckbox).not.toBeChecked();
    await jacketCheckbox.check();
    await expect(jacketCheckbox).toBeChecked();
    await expect(counter).toHaveText('3 of 6 packed');

    await skisCheckbox.uncheck();
    await expect(skisCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});

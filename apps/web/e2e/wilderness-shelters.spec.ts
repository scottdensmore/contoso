import { test, expect } from '@playwright/test';

test.describe('Wilderness Survival Shelters & Snow Bivouac Guide Journey', () => {
  test('navigates to /wilderness-shelters, verifies title & H1, filters shelters, calculates thermodynamics, and updates kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /wilderness-shelters
    await page.goto('/wilderness-shelters');

    // 2. Verify page title and literal H1 "Wilderness Survival Shelters & Snow Bivouac Guide"
    await expect(page).toHaveTitle(
      /Wilderness Survival Shelters & Snow Bivouac Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Survival Shelters & Snow Bivouac Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Advanced" or "Beginner" and verifies expected cards are displayed while others are hidden
    const beginnerBtn = page.getByRole('button', { name: /^Beginner$/i });
    await beginnerBtn.click();

    const trenchCard = page.getByRole('heading', {
      level: 3,
      name: /Emergency Hypothermia Snow Trench with Ski Roof/i,
    });
    await expect(trenchCard).toBeVisible();

    const treeWellCard = page.getByRole('heading', {
      level: 3,
      name: /Conifer Tree-Well Natural Snow Shelter/i,
    });
    await expect(treeWellCard).toBeVisible();

    const alpineCaveCard = page.getByRole('heading', {
      level: 3,
      name: /Deep Drift Alpine Snow Cave with Cold-Air Well/i,
    });
    await expect(alpineCaveCard).not.toBeVisible();

    // Filter by Advanced
    const advancedBtn = page.getByRole('button', { name: /^Advanced$/i });
    await advancedBtn.click();

    await expect(alpineCaveCard).toBeVisible();
    await expect(trenchCard).not.toBeVisible();
    await expect(treeWellCard).not.toBeVisible();

    // Reset to All Shelters
    const allBtn = page.getByRole('button', { name: /^All Shelters$/i });
    await allBtn.click();
    await expect(alpineCaveCard).toBeVisible();
    await expect(trenchCard).toBeVisible();

    // 4. Selects Alpine Snow Cave in calculator, adjusts ambient temperature, wall thickness, and platform height,
    // asserts live status reflects interior temp, cold trap differential, and thermal advisory.
    const shelterSelect = page.getByLabel(/Select Survival Shelter Model/i);
    await shelterSelect.selectOption('alpine-snow-cave-bivouac');

    const ambientInput = page.getByLabel(/Ambient Air Temperature/i);
    await ambientInput.fill('-15');

    const wallInput = page.getByLabel(/Snow Wall \/ Roof Thickness/i);
    await wallInput.fill('40');

    const platformInput = page.getByLabel(/Sleeping Shelf Height Above Floor/i);
    await platformInput.fill('45');

    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText(/Deep Drift Alpine Snow Cave with Cold-Air Well/i);
    await expect(statusRegion).toContainText(/Sleeping Shelf Temp/i);
    await expect(statusRegion).toContainText(/°F/i);
    await expect(statusRegion).toContainText(/\+18°F/i);
    await expect(statusRegion).toContainText(/Survival Advisory/i);

    // 5. Interacts with the Survival Shelter Kit checklist and verifies shelter-gear-counter updates
    const counter = page.getByTestId('shelter-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const shovelCheckbox = page.getByLabel(/Tempered Aluminum Extendable D-Grip Snow Shovel/i);
    const sawCheckbox = page.getByLabel(/35cm Stainless Steel Aggressive Tooth Snow & Wood Saw/i);
    const bivyCheckbox = page.getByLabel(/Waterproof Breathable Reflective Thermal Survival Bivy Sack/i);

    await expect(shovelCheckbox).not.toBeChecked();
    await shovelCheckbox.check();
    await expect(shovelCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await expect(sawCheckbox).not.toBeChecked();
    await sawCheckbox.check();
    await expect(sawCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await expect(bivyCheckbox).not.toBeChecked();
    await bivyCheckbox.check();
    await expect(bivyCheckbox).toBeChecked();
    await expect(counter).toHaveText('3 of 6 packed');

    await shovelCheckbox.uncheck();
    await expect(shovelCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});

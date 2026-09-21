import { test, expect } from '@playwright/test';

test.describe('Wilderness Bushcraft & Primitive Survival Craft Hub Journey', () => {
  test('navigates to /bushcraft, verifies title & H1, filters projects, calculates shelter thermal safety & ground chill, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /bushcraft
    await page.goto('/bushcraft');

    // 2. Verify page title and literal H1 "Wilderness Bushcraft & Primitive Survival Craft Hub"
    await expect(page).toHaveTitle(
      /Wilderness Bushcraft & Primitive Survival Craft Hub \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Bushcraft & Primitive Survival Craft Hub',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Shelter Craft" or "Friction Fire" and verifies expected cards are displayed while others are hidden
    const shelterPill = page.getByRole('button', { name: /^Shelter Craft$/i });
    await shelterPill.click();

    const borealHeading = page.getByRole('heading', {
      level: 3,
      name: /Boreal Forest Debris Hut & Insulated Raised Bed/i,
    });
    await expect(borealHeading).toBeVisible();

    const morsHeading = page.getByRole('heading', {
      level: 3,
      name: /Mors Kochanski Polar Super Shelter/i,
    });
    await expect(morsHeading).toBeVisible();

    const frictionHeading = page.getByRole('heading', {
      level: 3,
      name: /Northern White Cedar Bow Drill Friction Fire/i,
    });
    await expect(frictionHeading).not.toBeVisible();

    // Filter by "Friction Fire"
    const firePill = page.getByRole('button', { name: /^Friction Fire$/i });
    await firePill.click();

    await expect(frictionHeading).toBeVisible();
    await expect(borealHeading).not.toBeVisible();
    await expect(morsHeading).not.toBeVisible();

    // Reset to All Crafts
    const allPill = page.getByRole('button', { name: /^All Crafts$/i });
    await allPill.click();
    await expect(borealHeading).toBeVisible();
    await expect(frictionHeading).toBeVisible();

    // 4. Selects Boreal Debris Hut in calculator, tests low debris thickness (<4 in) or low bedding (0 in),
    // and asserts live status reflects warning/hazardous state and R-value
    const projectSelect = page.getByLabel(/select bushcraft project/i);
    await projectSelect.selectOption('boreal-debris-hut-shelter');

    const debrisInput = page.getByLabel(/debris thickness/i);
    await debrisInput.fill('3');

    const beddingInput = page.getByLabel(/bedding elevation/i);
    await beddingInput.fill('0');

    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText(/Critical conductive ground chill detected/i);
    await expect(statusRegion).toContainText(/Hazardous Sub-Freezing/i);
    await expect(statusRegion).toContainText(/R-/i);

    // 5. Interacts with the Bushcraft Kit checklist and verifies bushcraft-gear-counter updates
    const counter = page.getByTestId('bushcraft-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const knifeCheckbox = page.getByLabel(/High-Carbon Steel Full-Tang Bushcraft Knife/i);
    const sawCheckbox = page.getByLabel(/Aggressive Cross-Cut Folding Saw/i);
    const ferroCheckbox = page.getByLabel(/Heavy-Duty 1\/2-Inch Ferrocerium Rod/i);

    await expect(knifeCheckbox).not.toBeChecked();
    await knifeCheckbox.check();
    await expect(knifeCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await expect(sawCheckbox).not.toBeChecked();
    await sawCheckbox.check();
    await expect(sawCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await expect(ferroCheckbox).not.toBeChecked();
    await ferroCheckbox.check();
    await expect(ferroCheckbox).toBeChecked();
    await expect(counter).toHaveText('3 of 6 packed');

    await knifeCheckbox.uncheck();
    await expect(knifeCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});

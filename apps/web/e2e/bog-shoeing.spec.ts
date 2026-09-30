import { test, expect } from '@playwright/test';

test.describe('Wilderness Boreal Peatland Bog-Shoeing & Muskeg Navigation Journey', () => {
  test('navigates to /bog-shoeing, verifies headings, filters routes, calculates peat flotation, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /bog-shoeing
    await page.goto('/bog-shoeing');

    // 2. Verify page title and literal H1 "Wilderness Boreal Peatland Bog-Shoeing & Muskeg Navigation"
    await expect(page).toHaveTitle(
      /Wilderness Boreal Peatland Bog-Shoeing & Muskeg Navigation \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Boreal Peatland Bog-Shoeing & Muskeg Navigation',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Quaking Sphagnum Mat" and verify expected cards are displayed while other zones are hidden
    const quakingFilterBtn = page.getByRole('button', { name: /^Quaking Sphagnum Mat$/i });
    await quakingFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Great Dismal Sphagnum Quake Corridor/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Boundary Waters Black Spruce Muskeg Traverse/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Kenai Peninsula Patterned Fen & Flark System/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Adirondack High Peaks Spring Mire Basin/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Algonquin Highland Floating Tussock Fen/i })
    ).toBeHidden();

    // Reset filter to All Terrains
    const allFilterBtn = page.getByRole('button', { name: /^All Terrains$/i });
    await allFilterBtn.click();
    await expect(
      page.getByRole('heading', { level: 3, name: /Boundary Waters Black Spruce Muskeg Traverse/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Kenai Peninsula Patterned Fen & Flark System/i })
    ).toBeVisible();

    // 4. Select Kenai Peninsula Fen in calculator, adjust weight/water table, asserts live status reflects critical sinking hazard
    const siteSelect = page.getByLabel(/select peatland route/i);
    await siteSelect.selectOption('kenai-peninsula-patterned-fen');

    const shoeSelect = page.getByLabel(/select bog-shoe model/i);
    await shoeSelect.selectOption('composite_mud_flotation_deck');

    const hikerWeightInput = page.getByLabel(/hiker body weight/i);
    await hikerWeightInput.fill('85');

    const backpackWeightInput = page.getByLabel(/backpack load weight/i);
    await backpackWeightInput.fill('20');

    const waterTableInput = page.getByLabel(/water table depth/i);
    await waterTableInput.fill('10');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText('0.77 psi');
    await expect(liveStatus).toContainText('0.26 psi');
    await expect(liveStatus).toContainText('Critical Quaking Mire Submersion');
    await expect(liveStatus).toContainText('CRITICAL SUBMERSION HAZARD');

    // 5. Interacts with the Gear Checklist and verifies bog-shoeing-gear-counter updates
    const counter = page.getByTestId('bog-shoeing-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const bogShoesCheckbox = page.getByLabel(
      /36x12-Inch High-Flotation Webbed Sphagnum Bog-Shoes/i
    );
    await bogShoesCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const probingPoleCheckbox = page.getByLabel(
      /3.5-Meter Segmented Carbon Peat Sounding & Probing Pole/i
    );
    await probingPoleCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await bogShoesCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

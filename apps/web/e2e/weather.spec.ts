import { test, expect } from '@playwright/test';

test.describe('Wilderness Weather & Alpine Microclimate Advisor Journey', () => {
  test('navigates to /weather, verifies title & H1, selects forecast zone, calculates microclimate, and reviews protocols', async ({
    page,
  }) => {
    // 1. Navigates to /weather
    await page.goto('/weather');

    // 2. Verifies page title and literal H1 "Wilderness Weather & Alpine Microclimate Advisor"
    await expect(page).toHaveTitle(
      /Wilderness Weather & Alpine Microclimate \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Weather & Alpine Microclimate Advisor',
    });
    await expect(h1).toBeVisible();

    // 3. Selects "Mount Rainier (Paradise to Summit)" and asserts freezing level (7,500 ft) and storm warning banner appear
    const zoneSelect = page.getByLabel(/select mountain forecast zone/i);
    await zoneSelect.selectOption({ label: 'Mount Rainier (Paradise to Summit)' });

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: 'Mount Rainier (Paradise to Summit)',
      })
    ).toBeVisible();
    await expect(page.getByText('7,500 ft')).toBeVisible();
    await expect(page.getByText(/storm warning active/i)).toBeVisible();

    // 4. Adjusts target elevation to 10,000 ft on "Exposed Ridge" and asserts "BELOW FREEZING" badge and hypothermia risk rating appear
    const elevationInput = page.getByLabel('Target Elevation Number (ft)');
    await elevationInput.fill('10000');

    const exposureSelect = page.getByLabel('Terrain Exposure Level');
    await exposureSelect.selectOption('exposed_ridge');

    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText('BELOW FREEZING');
    await expect(statusRegion).toContainText('CRITICAL HYPOTHERMIA RISK');
    await expect(statusRegion).toContainText('28°F');
    await expect(statusRegion).toContainText('10°F');

    // 5. Verifies 3-layer clothing recommendations and severe weather protocols section are visible
    const clothingHeading = page.getByRole('heading', {
      level: 3,
      name: '3-Layer Mountain Clothing Recommendation',
    });
    await expect(clothingHeading).toBeVisible();
    await expect(
      page.getByText(/merino wool or synthetic moisture-wicking next-to-skin/i)
    ).toBeVisible();
    await expect(
      page.getByText(/active breathable fleece or 800-fill down\/synthetic puffy/i)
    ).toBeVisible();
    await expect(
      page.getByText(/3-layer gore-tex \/ hardshell windproof and waterproof jacket & pants/i)
    ).toBeVisible();

    const protocolsSection = page.getByRole('heading', {
      level: 2,
      name: 'Wilderness Severe Weather Protocols',
    });
    await expect(protocolsSection).toBeVisible();

    const lightningHeading = page.getByRole('heading', {
      level: 3,
      name: 'Lightning Safety Guidelines',
    });
    await expect(lightningHeading).toBeVisible();
    await expect(page.getByText(/adhere to the 30\/30 rule/i)).toBeVisible();

    const whiteoutHeading = page.getByRole('heading', {
      level: 3,
      name: 'Whiteout Navigation & High Winds Protocol',
    });
    await expect(whiteoutHeading).toBeVisible();
    await expect(page.getByText(/halt travel immediately upon loss of horizon/i)).toBeVisible();
  });
});

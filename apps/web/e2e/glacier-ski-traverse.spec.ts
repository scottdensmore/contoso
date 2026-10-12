import { test, expect } from '@playwright/test';

test.describe('Alpine Crevasse Glacier Ski-Traverse & Serac Zone Descent Logistics Journey', () => {
  test('navigates to /glacier-ski-traverse, verifies headings, filters terrain zone, calculates glacier dynamics, and tracks rescue checklist', async ({
    page,
  }) => {
    // 1. Navigate to /glacier-ski-traverse
    await page.goto('/glacier-ski-traverse');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Alpine Crevasse Glacier Ski-Traverse & Serac Zone Descent Logistics \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Crevasse Glacier Ski-Traverse & Serac Zone Descent Logistics',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Bergschrund Headwall Chute" and verify matching site is visible while others are hidden
    const bergschrundFilterBtn = page.getByRole('button', { name: /^Bergschrund Headwall Chute$/i });
    await bergschrundFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Spearhead Horseshoe Glacier Ski-Traverse/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Classic Haute Route Glacier Ski-Traverse/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Wapta Icefield Continental Divide Ski-Traverse/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Bernese Oberland Jungfrau-Aletsch Glacier Ski-Traverse/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Bagley Icefield & St. Elias Wilderness Glacier Ski Expedition/i,
      })
    ).toBeHidden();

    // Reset filter to All Terrain Zones
    const allFilterBtn = page.getByRole('button', { name: /^All Terrain Zones$/i });
    await allFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Classic Haute Route Glacier Ski-Traverse/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Spearhead Horseshoe Glacier Ski-Traverse/i,
      })
    ).toBeVisible();

    // 4. Interact with the Glacier Dynamics Calculator
    const siteSelect = page.getByLabel(/select traverse route/i);
    await siteSelect.selectOption('berner-oberland-ski-traverse');

    const packInput = page.getByLabel(/pack weight/i);
    await packInput.fill('32');

    const tempInput = page.getByLabel(/ambient temperature/i);
    await tempInput.fill('3');

    const resultPanel = page.getByTestId('glacier-ski-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Bernese Oberland Jungfrau-Aletsch Glacier Ski-Traverse');
    await expect(resultPanel).toContainText('Rope Travel & Spacing Advisory');
    await expect(resultPanel).toContainText('Emergency Ski Rescue Protocol');

    // 5. Interact with the Rescue Gear Checklist and verify counter updates
    const counter = page.getByTestId('glacier-ski-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const harnessCheckbox = page.getByLabel(
      /Ultralight Glacier Skimo Harness with Clip-In Ski Slots/i
    );
    await harnessCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const rescueCordCheckbox = page.getByLabel(
      /Lightweight Hyperstatic Crevasse Rescue Cord/i
    );
    await rescueCordCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await harnessCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

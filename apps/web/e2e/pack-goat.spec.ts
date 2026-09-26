import { test, expect } from '@playwright/test';

test.describe('Backcountry Pack-Goat Alpine Packing & High-Pass Trekking Journey', () => {
  test('navigates to /pack-goat, verifies headings, filters routes, calculates payload balance, and tracks safety tack', async ({
    page,
  }) => {
    // 1. Navigates to /pack-goat
    await page.goto('/pack-goat');

    // 2. Verifies page title and literal H1 "Backcountry Pack-Goat Alpine Packing & High-Pass Trekking"
    await expect(page).toHaveTitle(
      /Backcountry Pack-Goat Alpine Packing & High-Pass Trekking \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Pack-Goat Alpine Packing & High-Pass Trekking',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Crossbuck Sawbuck" and verifies expected cards are displayed while other routes are hidden
    const crossbuckFilterBtn = page.getByRole('button', { name: /^Crossbuck Sawbuck$/i });
    await crossbuckFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Sawtooth Wilderness Alice-Toxaway Loop/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Maroon Bells Snowmass Four Pass Alpine Loop/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Wind River High Basin & Titcomb Lakes Goat Trek/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Eagle Cap Wilderness Lakes Basin Traverse/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /High Uintas Kings Peak Timberline Expedition/i })
    ).toBeHidden();

    // Reset filter to All Saddles
    const allFilterBtn = page.getByRole('button', { name: /^All Saddles$/i });
    await allFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Wind River High Basin & Titcomb Lakes Goat Trek/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Sawtooth Wilderness Alice-Toxaway Loop/i })
    ).toBeVisible();

    // 4. Selects Wind River route in calculator, adjusts left pannier (e.g. 26 lbs) vs right pannier (12 lbs), asserts live status reflects unbalanced warning and recommended adjustment
    const routeSelect = page.getByLabel(/select alpine trekking route/i);
    await routeSelect.selectOption('wind-river-titcomb-basin');

    const leftPannierInput = page.getByLabel(/left pannier weight/i);
    await leftPannierInput.fill('26');

    const rightPannierInput = page.getByLabel(/right pannier weight/i);
    await rightPannierInput.fill('12');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText('Wind River High Basin & Titcomb Lakes Goat Trek');
    await expect(liveStatus).toContainText('Unbalanced - Roll Risk');
    await expect(liveStatus).toContainText('14 lbs');
    await expect(liveStatus).toContainText('Warning: Side pannier weight difference of 14 lbs');
    await expect(liveStatus).toContainText('Recommended adjustment');

    // 5. Interacts with the Tack Checklist and verifies pack-goat-gear-counter updates
    const counter = page.getByTestId('pack-goat-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const forageCheckbox = page.getByLabel(/Weed-Free Certified Alfalfa\/Timothy Pellets/i);
    await forageCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const vestCheckbox = page.getByLabel(/Blaze Orange Goat Hunting-Season ID Vest/i);
    await vestCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await forageCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

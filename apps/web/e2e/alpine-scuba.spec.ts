import { test, expect } from '@playwright/test';

test.describe('Wilderness High-Altitude Scuba & Alpine Lake Ice Diving Journey', () => {
  test('navigates to /alpine-scuba, verifies headings, filters sites, calculates decompression profile, and tracks safety gear', async ({
    page,
  }) => {
    // 1. Navigates to /alpine-scuba
    await page.goto('/alpine-scuba');

    // 2. Verifies page title and literal H1 "Wilderness High-Altitude Scuba & Alpine Lake Ice Diving"
    await expect(page).toHaveTitle(
      /Wilderness High-Altitude Scuba & Alpine Lake Ice Diving \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness High-Altitude Scuba & Alpine Lake Ice Diving',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by water type and verifies expected cards
    const glacialFilterBtn = page.getByRole('button', { name: /^Glacial Melt Ice$/i });
    await glacialFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Emerald Lake & Burgess Shale/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Lac aux Américains Glacial Cirque/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Rubicon Wall & Emerald Bay/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Wizard Island & Cleetwood Cove/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Homestake Reservoir & Gold Dredge/i })
    ).toBeHidden();

    // Filter by Freshwater Alpine
    const freshwaterFilterBtn = page.getByRole('button', { name: /^Freshwater Alpine$/i });
    await freshwaterFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Rubicon Wall & Emerald Bay/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Emerald Lake & Burgess Shale/i })
    ).toBeHidden();

    // Reset filter to All Sites
    const allFilterBtn = page.getByRole('button', { name: /^All Sites$/i });
    await allFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Rubicon Wall & Emerald Bay/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Emerald Lake & Burgess Shale/i })
    ).toBeVisible();

    // 4. Selects Lake Tahoe in calculator, adjusts depth to 30m, asserts live status reflects ESLD, altitude-adjusted NDL, and freeze risk
    const siteSelect = page.getByLabel(/select dive site/i);
    await siteSelect.selectOption('lake-tahoe-rubicon-wall');

    const depthInput = page.getByLabel(/target dive depth/i);
    await depthInput.fill('30');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText('Rubicon Wall & Emerald Bay');
    await expect(liveStatus).toContainText('37.5 m');
    await expect(liveStatus).toContainText('7 min');
    await expect(liveStatus).toContainText('Freeze Risk: MODERATE');
    await expect(liveStatus).toContainText('24 hours');
    await expect(liveStatus).toContainText('Decompression Required');

    // 5. Interacts with the Ice Diving Checklist and verifies alpine-scuba-gear-counter updates
    const counter = page.getByTestId('alpine-scuba-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const regulatorCheckbox = page.getByLabel(
      /Dual Balanced Diaphragm Coldwater Regulators/i
    );
    await regulatorCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const drysuitCheckbox = page.getByLabel(
      /Kevlar-Reinforced Crushed Neoprene Drysuit/i
    );
    await drysuitCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await regulatorCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

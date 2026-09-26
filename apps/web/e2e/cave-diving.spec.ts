import { test, expect } from '@playwright/test';

test.describe('Wilderness Spelunking Siphon Cave Diving & Sump Penetration Journey', () => {
  test('navigates to /cave-diving, verifies headings, filters sites, calculates gas profile, and tracks safety gear', async ({
    page,
  }) => {
    // 1. Navigates to /cave-diving
    await page.goto('/cave-diving');

    // 2. Verifies page title and literal H1 "Wilderness Spelunking Siphon Cave Diving & Sump Penetration"
    await expect(page).toHaveTitle(
      /Wilderness Spelunking Siphon Cave Diving & Sump Penetration \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Spelunking Siphon Cave Diving & Sump Penetration',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Sidemount Dual Cylinder" and verifies expected cards are displayed while other sites are hidden
    const sidemountFilterBtn = page.getByRole('button', { name: /^Sidemount Dual Cylinder$/i });
    await sidemountFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Peacock Springs Karst Siphon & Grand Traverse/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Lost Creek Siphon Sump Penetration/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Smoky Mountain Tuckaleechee Siphon Resurgence/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Devil's Eye & Ear Spring Trunk Conduit/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Phantom Lake Cave Siphon Deep Conduit/i })
    ).toBeHidden();

    // Reset filter to All Riggings
    const allFilterBtn = page.getByRole('button', { name: /^All Riggings$/i });
    await allFilterBtn.click();
    await expect(
      page.getByRole('heading', { level: 3, name: /Devil's Eye & Ear Spring Trunk Conduit/i })
    ).toBeVisible();

    // 4. Selects Lost Creek Siphon in calculator, sets flow regime to "Inflowing Siphon Suction" and reserve rule to "Rule of Thirds", asserts live status reflects critical gas reserve alert
    const siteSelect = page.getByLabel(/select dive site/i);
    await siteSelect.selectOption('cholla-sump-lost-creek');

    const flowSelect = page.getByLabel(/flow regime/i);
    await flowSelect.selectOption('inflowing_siphon_suction');

    const reserveSelect = page.getByLabel(/gas reserve rule/i);
    await reserveSelect.selectOption('rule_of_thirds');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText('Lost Creek Siphon Sump Penetration');
    await expect(liveStatus).toContainText('Critical Gas Reserve Alert');
    await expect(liveStatus).toContainText('Extreme Clay Zero Vis');
    await expect(liveStatus).toContainText('2000 psi');
    await expect(liveStatus).toContainText('1000 psi');

    // 5. Interacts with the Gear Checklist and verifies cave-diving-gear-counter updates
    const counter = page.getByTestId('cave-diving-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const reelCheckbox = page.getByLabel(
      /400ft Anodized Aluminum Primary Reel/i
    );
    await reelCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const lightsCheckbox = page.getByLabel(
      /1500-Lumen Primary Canister Light/i
    );
    await lightsCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await reelCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Coastal Intertidal Kelp Forest Free-Diving & Holdfast Ecology Guide Journey', () => {
  test('navigates to /kelp-freediving, verifies headings, filters kelp strata, calculates freediving dynamics, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /kelp-freediving
    await page.goto('/kelp-freediving');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Coastal Intertidal Kelp Forest Free-Diving & Holdfast Ecology Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Coastal Intertidal Kelp Forest Free-Diving & Holdfast Ecology Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Floating Pneumatocyst Canopy" and verify matching site is visible while others are hidden
    const canopyFilterBtn = page.getByRole('button', {
      name: /^Floating Pneumatocyst Canopy$/i,
    });
    await canopyFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Point Lobos State Natural Reserve & Carmel Pinnacles/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Anacapa Island Cathedral Cove & Landing Cove Holdfast Reefs/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Barkley Sound Broken Group Islands Bull Kelp Surge Channels/i,
      })
    ).toBeHidden();

    // Reset filter to All Kelp Strata
    const allFilterBtn = page.getByRole('button', {
      name: /^All Kelp Strata$/i,
    });
    await allFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Point Lobos State Natural Reserve & Carmel Pinnacles/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Anacapa Island Cathedral Cove & Landing Cove Holdfast Reefs/i,
      })
    ).toBeVisible();

    // 4. Interact with the Kelp Forest Ballast, Surge & Holdfast Dynamics Calculator
    const siteSelect = page.getByLabel(/select kelp forest site/i);
    await siteSelect.selectOption('barkley-sound-broken-group-bull-kelp');

    const depthInput = page.getByLabel(/target depth/i);
    await depthInput.fill('16');

    const surgeInput = page.getByLabel(/surge velocity/i);
    await surgeInput.fill('1.4');

    const resultPanel = page.getByTestId('kelp-freediving-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText(
      'Barkley Sound Broken Group Islands Bull Kelp Surge Channels'
    );
    await expect(resultPanel).toContainText('Canopy Entry & Ascent Protocol');
    await expect(resultPanel).toContainText(
      'Benthic Holdfast Survey Advisory'
    );

    // 5. Interact with the Gear Checklist and verify counter updates
    const counter = page.getByTestId('kelp-freediving-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const wetsuitCheckbox = page.getByLabel(
      /Open-Cell 7mm Two-Piece Hooded Freedive Wetsuit/i
    );
    await wetsuitCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const cutterCheckbox = page.getByLabel(
      /Dual-Sheathed Blunt-Tip Titanium Kelp & Line Cutter/i
    );
    await cutterCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await wetsuitCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

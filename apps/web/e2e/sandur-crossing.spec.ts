import { test, expect } from '@playwright/test';

test.describe('Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Guide Journey', () => {
  test('loads /sandur-crossing, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /sandur-crossing
    await page.goto('/sandur-crossing');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Sandur Morphology
    const morphologySelect = page.getByLabel(/Sandur Morphology/i);
    await morphologySelect.selectOption('anastomosing-glacial-silt-braid');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Kaskawulsh & Slims River \(Ä'äy Chù\) Glacial Silt Outwash/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Skeiðarársandur & Þórsmörk Krossá Braided Outwash Plain/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Skeiðarársandur & Þórsmörk Krossá Braided Outwash Plain/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const icelandCard = page.getByTestId(
      'sandur-site-card-skeidararsandur-krossa-iceland'
    );
    await icelandCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Silt Flour Concentration \(mg\/L\)/i)
    ).toHaveValue('3800');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('sandur-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Dawn Shallow Riffle Baseline/i,
      })
      .click();
    await expect(resultPanel).toContainText('solo-diagonal-downstream-pole');

    await page
      .getByRole('button', {
        name: /Moderate Midday Multi-Thread Riffle/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'tripod-wedge-linked-belt-unbuckled'
    );

    await page
      .getByRole('button', {
        name: /High Afternoon Melt & Silt-Bar Liquefaction/i,
      })
      .click();
    await expect(resultPanel).toContainText('wait-for-dawn-low-melt-window');

    await page
      .getByRole('button', {
        name: /Critical Evening Glacial Surge Torrent/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-impassable-glacial-torrent'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('sandur-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const staffCheckbox = page.getByLabel(
      /Carbide-Tipped Collapsible Wading Staff & Dual Flick-Lock Trekking Poles/i
    );
    await staffCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const linerCheckbox = page.getByLabel(
      /Submersible Roll-Top TPU Pack Liner & Quick-Release Hipbelt Buckle Check/i
    );
    await linerCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

import { test, expect } from '@playwright/test';

test.describe('High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling Guide Journey', () => {
  test('loads /obsidian-coulee, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /obsidian-coulee
    await page.goto('/obsidian-coulee');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Obsidian Lithology
    const lithologySelect = page.getByLabel(/Obsidian Lithology/i);
    await lithologySelect.selectOption('pumiceous-carapace-glass-dome');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Glass Mountain & Little Glass Mountain Dacite-Rhyolite Obsidian Flow/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Big Obsidian Flow & Paulina Peak Rhyolite Coulee/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Big Obsidian Flow & Paulina Peak Rhyolite Coulee/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const newberryCard = page.getByTestId(
      'obsidian-coulee-site-card-big-obsidian-flow-newberry-caldera-oregon'
    );
    await newberryCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Coulee Crest Relief \(m\)/i)).toHaveValue(
      '42'
    );

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('obsidian-coulee-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Step Massive Flow-Banded Ribs/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'step-massive-flow-banded-ribs-avoid-flakes'
    );

    await page
      .getByRole('button', {
        name: /Moderate Kevlar Gauntlet & 3-Point Test/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'kevlar-gauntlet-shinguard-three-point-test'
    );

    await page
      .getByRole('button', {
        name: /High Bypass Pumice Carapace Trough/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'bypass-pumice-carapace-trough-detour'
    );

    await page
      .getByRole('button', {
        name: /Critical Abort Glass-Breccia Spine/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-glass-breccia-spine-imminent-shear'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('obsidian-coulee-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const gauntletsCheckbox = page.getByLabel(
      /ANSI\/ISEA A6\/A7 Para-Aramid Kevlar Scrambling Gauntlets/i
    );
    await gauntletsCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const bootsCheckbox = page.getByLabel(
      /Full-Shank Mountaineering Boots with High-Durometer Vibram Mont Compound/i
    );
    await bootsCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

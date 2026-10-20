import { test, expect } from '@playwright/test';

test.describe('Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology Guide Journey', () => {
  test('loads /gypsum-karst, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /gypsum-karst
    await page.goto('/gypsum-karst');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Gypsum Maze Morphology
    const morphologySelect = page.getByLabel(/Gypsum Maze Morphology/i);
    await morphologySelect.selectOption('messinian-selenite-epigenetic-gorge');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Sistema Spipola-Acquafredda & Vena del Gesso Messinian Selenite Karst/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Optimisticeskaja \(Optymistychna\) & Ozerna Artesian Gypsum Mega-Labyrinth/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Optimisticeskaja \(Optymistychna\) & Ozerna Artesian Gypsum Mega-Labyrinth/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const podoliaCard = page.getByTestId(
      'gypsum-karst-site-card-optimisticeskaja-ozerna-podolia-ukraine'
    );
    await podoliaCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Junction Density per 100m/i)
    ).toHaveValue('36');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('gypsum-karst-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Retro-Reflective Spool Survey/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'continuous-retro-reflective-spool-survey'
    );

    await page
      .getByRole('button', {
        name: /Moderate Single-File Hydration-Buckle Bypass/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'silent-single-file-bypass-hydration-buckles'
    );

    await page
      .getByRole('button', {
        name: /High Upper-Phreatic Tier Retreat & Compass Lock/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'retreat-upper-phreatic-tier-lock-compass'
    );

    await page
      .getByRole('button', {
        name: /Critical Slab Delamination & Siphon Flood Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-evaporite-slab-collapse-siphon-closure'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('gypsum-karst-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const spoolCheckbox = page.getByLabel(
      /Continuous 400m Dyneema Labyrinth Spool & Retro-Reflective Directional Cookies/i
    );
    await spoolCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const glovesCheckbox = page.getByLabel(
      /ANSI A5 Kevlar-Palm Caving Gloves & Cordura Selenite-Guard Knee Pads/i
    );
    await glovesCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

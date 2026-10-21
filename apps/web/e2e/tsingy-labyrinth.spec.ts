import { test, expect } from '@playwright/test';

test.describe('Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling Guide Journey', () => {
  test('loads /tsingy-labyrinth, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /tsingy-labyrinth
    await page.goto('/tsingy-labyrinth');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Tropical Tsingy \(Pinnacle Karst Labyrinth\) & Razor-Limestone Arête Scrambling Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Karst Morphology
    const morphologySelect = page.getByLabel(/Karst Morphology/i);
    await morphologySelect.selectOption('diaclase-slot-corridor-maze');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Massif de l'Ankarana Tsingy Rary & Sunken Diaclase Forest/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Tsingy de Bemaraha Grand Tsingy & Andamozavaky Razor Labyrinth/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Tsingy de Bemaraha Grand Tsingy & Andamozavaky Razor Labyrinth/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const bemarahaCard = page.getByTestId(
      'tsingy-site-card-bemaraha-grand-tsingy-madagascar'
    );
    await bemarahaCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Blade Edge Radius \(mm\)/i)).toHaveValue(
      '0.5'
    );

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('tsingy-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Dolomitic Stone Forest/i,
      })
      .click();
    await expect(resultPanel).toContainText('kevlar-gloves-approach-boots');

    await page
      .getByRole('button', {
        name: /Moderate Via-Ferrata Slot Scramble/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'via-ferrata-energy-absorber-lanyards'
    );

    await page
      .getByRole('button', {
        name: /High Razor-Arête Steel-Core Traverse/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'twin-steel-core-tethers-edge-protectors'
    );

    await page
      .getByRole('button', {
        name: /Critical Knife-Edge & Solar-Bake Crest/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-razor-karst-hyperthermia-hazard'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('tsingy-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const glovesCheckbox = page.getByLabel(
      /ANSI Cut-Level A5 Kevlar-Palm Scrambling Gloves & Forearm Sleeves/i
    );
    await glovesCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const lanyardCheckbox = page.getByLabel(
      /EN 958 Energy-Absorbing Via-Ferrata Lanyard with Steel-Core Tethers & Canvas Edge Rollers/i
    );
    await lanyardCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

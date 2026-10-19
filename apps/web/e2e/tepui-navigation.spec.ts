import { test, expect } from '@playwright/test';

test.describe('Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation Guide Journey', () => {
  test('loads /tepui-navigation, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /tepui-navigation
    await page.goto('/tepui-navigation');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Tepui Morphology
    const morphologySelect = page.getByLabel(/Tepui Morphology/i);
    await morphologySelect.selectOption('brocchinia-bog-sinkhole-mesa');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Auyán-Tepui Devil's Canyon & Churún Orthoquartzite Mesa/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Roraima Maverick Summit & Labyrinth Pseudokarst Plateau/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Roraima Maverick Summit & Labyrinth Pseudokarst Plateau/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const roraimaCard = page.getByTestId(
      'tepui-site-card-mount-roraima-maverick-plateau'
    );
    await roraimaCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Cyanobacteria Biofilm Coverage \(%\)/i)
    ).toHaveValue('82');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('tepui-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Bleached Quartzite Window/i,
      })
      .click();
    await expect(resultPanel).toContainText('sticky-rubber-cairn-bearing');

    await page
      .getByRole('button', {
        name: /Moderate Peat-Bog & Biofilm Slab/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'felt-overboot-probe-peat-bridges'
    );

    await page
      .getByRole('button', {
        name: /High Pseudokarst Fissure & Cloud Fog/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'belayed-fissure-jump-gps-breadcrumb'
    );

    await page
      .getByRole('button', {
        name: /Critical Orographic Deluge & Black-Algae Slip/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-shelter-under-el-hotel-overhang'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('tepui-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const overbootsCheckbox = page.getByLabel(
      /Polypropylene Felt-Soled Biofilm Overboots & Sticky-Rubber Approach Shoes/i
    );
    await overbootsCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const probeCheckbox = page.getByLabel(
      /Graduated Carbon Fissure-Bridge Probe Pole & 30m Static Belay Line/i
    );
    await probeCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

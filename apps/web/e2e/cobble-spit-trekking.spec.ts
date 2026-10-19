import { test, expect } from '@playwright/test';

test.describe('Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking Guide Journey', () => {
  test('loads /cobble-spit-trekking, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /cobble-spit-trekking
    await page.goto('/cobble-spit-trekking');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Cobble Spit Morphology
    const morphologySelect = page.getByLabel(/Cobble Spit Morphology/i);
    await morphologySelect.selectOption('storm-berm-cobble-bar');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Chesil Beach Graded Flint & Chert Storm-Berm Tombolo/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Dungeness Cuspate Shingle Spit & Drift-Log Berm/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Dungeness Cuspate Shingle Spit & Drift-Log Berm/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const wctCard = page.getByTestId(
      'cobble-site-card-west-coast-trail-boulder-reef-canada'
    );
    await wctCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Median Cobble Diameter \(mm\)/i)
    ).toHaveValue('260');
    await expect(page.getByLabel(/Kelp Wrack Depth \(cm\)/i)).toHaveValue('85');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('cobble-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Swell Pea-Shingle Baseline/i,
      })
      .click();
    await expect(resultPanel).toContainText('trail-runner-trekking-poles');

    await page
      .getByRole('button', {
        name: /Moderate Shingle Berm & Wrack Band/i,
      })
      .click();
    await expect(resultPanel).toContainText('high-cuff-scree-boot-dual-poles');

    await page
      .getByRole('button', {
        name: /High Kelp-Mucilage Boulder Reef/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'tungsten-studded-felt-boot-wading-staff'
    );

    await page
      .getByRole('button', {
        name: /Critical Storm-Swell Overwash Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText('abort-swash-overwash-entrapment');

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('cobble-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const bootCheckbox = page.getByLabel(
      /Tungsten-Carbide Studded Felt-Sole Intertidal Wading Boots/i
    );
    await bootCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const staffCheckbox = page.getByLabel(
      /Basketless Carbon-Chromoly Wading Staffs with Carbide Tips/i
    );
    await staffCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

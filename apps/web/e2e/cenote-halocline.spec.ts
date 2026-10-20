import { test, expect } from '@playwright/test';

test.describe('Subterranean Cenote Halocline & Anchialine Phreatic Cave-Passage Navigation Guide Journey', () => {
  test('loads /cenote-halocline, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /cenote-halocline
    await page.goto('/cenote-halocline');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Subterranean Cenote Halocline & Anchialine Phreatic Cave-Passage Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Subterranean Cenote Halocline & Anchialine Phreatic Cave-Passage Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Cenote Morphology
    const morphologySelect = page.getByLabel(/Cenote Morphology/i);
    await morphologySelect.selectOption('meromictic-h2s-cloud-bell-sinkhole');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Cenote Angelita Meromictic Hydrogen-Sulfide Cloud Shaft/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Sistema Ox Bel Ha Anchialine Halocline Labyrinth/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Sistema Ox Bel Ha Anchialine Halocline Labyrinth/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const angelitaCard = page.getByTestId(
      'cenote-site-card-angelita-h2s-cloud-tulum-mexico'
    );
    await angelitaCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Halocline Salinity Delta \(ppt\)/i)
    ).toHaveValue('33');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('cenote-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Cavern Daylight Zone/i,
      })
      .click();
    await expect(resultPanel).toContainText('visual-daylight-cavern-zone-line');

    await page
      .getByRole('button', {
        name: /Moderate Halocline Phreatic Traverse/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'continuous-guideline-frog-kick-above-halocline'
    );

    await page
      .getByRole('button', {
        name: /High Schlieren Blur & Clay Resuspension/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'blind-tactile-line-cookies-zero-vis-drill'
    );

    await page
      .getByRole('button', {
        name: /Critical Meromictic H2S & Zero-Vis Siltout/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-toxic-h2s-siltout-entrapment-hazard'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('cenote-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const reelCheckbox = page.getByLabel(
      /Primary 120 m Braided Nylon Cave Reel, Directional Line Arrows & REM Cookies/i
    );
    await reelCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const canisterCheckbox = page.getByLabel(
      /2,500-Lumen Tight-Beam 6° Canister Primary Light & Dual Backup Torches/i
    );
    await canisterCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

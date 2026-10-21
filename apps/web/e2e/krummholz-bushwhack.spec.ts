import { test, expect } from '@playwright/test';

test.describe('Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking Guide Journey', () => {
  test('loads /krummholz-bushwhack, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /krummholz-bushwhack
    await page.goto('/krummholz-bushwhack');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Krummholz Ecotype
    const ecotypeSelect = page.getByLabel(/Krummholz Ecotype/i);
    await ecotypeSelect.selectOption('mountain-pine-latschen-labyrinth');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Karwendel Pinus mugo \(Latschenkiefer\) Limestone Bench Labyrinth/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Presidential Range Abies balsamea Krummholz Wave Zone/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Presidential Range Abies balsamea Krummholz Wave Zone/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const presidentialCard = page.getByTestId(
      'krummholz-site-card-presidential-krummholz-whitemtns-usa'
    );
    await presidentialCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Stem Density \(stems\/m²\)/i)).toHaveValue(
      '34'
    );
    await expect(page.getByLabel(/Canopy Mat Height \(m\)/i)).toHaveValue(
      '1.7'
    );
    await expect(page.getByLabel(/Snow Moat Depth \(cm\)/i)).toHaveValue(
      '165'
    );

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('krummholz-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Frost-Heave Lead Baseline/i,
      })
      .click();
    await expect(resultPanel).toContainText('follow-frost-heave-rock-leads');

    await page
      .getByRole('button', {
        name: /Moderate Waist-Deep Fir Thicket/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'streamline-pack-eye-shield-crawl'
    );

    await page
      .getByRole('button', {
        name: /High Deep-Snow Spruce-Moat Labyrinth/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'snowshoe-float-probe-spruce-moats'
    );

    await page
      .getByRole('button', {
        name: /Critical Impenetrable Spruce-Trap Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText('abort-reroute-to-scree-drainage');

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('krummholz-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const eyeCheckbox = page.getByLabel(
      /ANSI Z87\.1 Ballistic Polycarbonate Wrap-Around Eye Shield & Mesh Face Visor/i
    );
    await eyeCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const packCheckbox = page.getByLabel(
      /Slick-Faced Cordura 500D Internal-Frame Pack with Zero External Lash Points/i
    );
    await packCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

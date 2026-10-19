import { test, expect } from '@playwright/test';

test.describe('Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Guide Journey', () => {
  test('loads /yardang-navigation, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /yardang-navigation
    await page.goto('/yardang-navigation');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Aeolian Morphology
    const morphologySelect = page.getByLabel(/Aeolian Morphology/i);
    await morphologySelect.selectOption('star-dune-multi-arm-slipface');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Badain Jaran Bilutu Peak Mega-Star-Dune & Interdune Lakes/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Dasht-e Lut Gandom Beryan & Shahr-e Lut Mega-Yardang \(Kalut\) Corridors/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Dasht-e Lut Gandom Beryan & Shahr-e Lut Mega-Yardang \(Kalut\) Corridors/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const lutCard = page.getByTestId(
      'yardang-site-card-dasht-e-lut-kaluts-iran'
    );
    await lutCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Slip-Face Angle \(°\)/i)).toHaveValue('34');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('yardang-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Windward Stoss Ridge/i,
      })
      .click();
    await expect(resultPanel).toContainText('follow-windward-stoss-ridge');

    await page
      .getByRole('button', {
        name: /Moderate Inter-Yardang Gassi Corridor/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'inter-yardang-gassi-corridor-bearing'
    );

    await page
      .getByRole('button', {
        name: /High Star-Dune Slip-Face & Venturi Gale/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'diagonal-switchback-avoid-leeward-horn'
    );

    await page
      .getByRole('button', {
        name: /Critical Haboob Blackout & 34° Avalanche/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-haboob-sheltered-lee-trench'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('yardang-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const gogglesCheckbox = page.getByLabel(
      /Foam-Sealed Ballistic Sand Goggles & P100 Fine-Silica Particulate Respirator/i
    );
    await gogglesCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const compassCheckbox = page.getByLabel(
      /Sighting Mirror Baseplate Compass, Pace-Bead Counter & Dual-Band GNSS Logger/i
    );
    await compassCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Coastal Blowhole, Surge Channel & Sea-Cave Pneumatic Wave-Hazard Navigation Guide Journey', () => {
  test('loads /sea-cave-pneumatics, verifies heading, filters sites, loads site into calculator, tests presets, and verifies gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /sea-cave-pneumatics
    await page.goto('/sea-cave-pneumatics');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Coastal Blowhole, Surge Channel & Sea-Cave Pneumatic Wave-Hazard Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Coastal Blowhole, Surge Channel & Sea-Cave Pneumatic Wave-Hazard Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Littoral Conduit Morphology
    const morphologySelect = page.getByLabel(/Littoral Conduit Morphology/i);
    await morphologySelect.selectOption('constricted_pneumatic_blowhole_shaft');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Kiama & Bombo Headland Columnar Basalt Blowhole Conduit/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Russian Gulch Devil's Punchbowl & Mendocino Headland Surge Caverns/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Russian Gulch Devil's Punchbowl & Mendocino Headland Surge Caverns/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const staffaCard = page.getByTestId(
      'sea-cave-pneumatics-site-card-staffa-fingals-cave-columnar-basalt-surge-vault'
    );
    await staffaCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Portal Ceiling Clearance \(m\)/i)).toHaveValue(
      '6.5'
    );
    await expect(page.getByLabel(/Significant Wave Height \(m\)/i)).toHaveValue(
      '1.4'
    );

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId(
      'sea-cave-pneumatics-calculator-result'
    );
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Vented Slack-Tide Arch Window/i,
      })
      .click();
    await expect(resultPanel).toContainText('nominal_vented_slack_swell_window');

    await page
      .getByRole('button', {
        name: /Moderate Groundswell Clapotis Caution/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'caution_acoustic_overpressure_and_rebound_surge'
    );

    await page
      .getByRole('button', {
        name: /Long-Period Forerunner Piston-Seal Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort_pneumatic_piston_seal_and_blowhole_eruption'
    );

    // 6. Verify 6-item Mandatory Impact, Barotrauma & Buoyancy Gear Checklist
    const gearCounter = page.getByTestId('sea-cave-pneumatics-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 mandatory items verified');

    const helmetCheckbox = page.getByLabel(
      /CE EN 1385 Multi-Impact Whitewater & Littoral Surf Helmet/i
    );
    await helmetCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 mandatory items verified');

    const earplugsCheckbox = page.getByLabel(
      /Vented Acoustic-Attenuation & Barotrauma Defense Surf Earplugs/i
    );
    await earplugsCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 mandatory items verified');
  });
});

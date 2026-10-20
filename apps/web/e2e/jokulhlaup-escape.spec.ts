import { test, expect } from '@playwright/test';

test.describe('Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape Guide Journey', () => {
  test('loads /jokulhlaup-escape, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /jokulhlaup-escape
    await page.goto('/jokulhlaup-escape');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Outburst Trigger Mechanism
    const triggerSelect = page.getByLabel(/Outburst Trigger Mechanism/i);
    await triggerSelect.selectOption('supraglacial-englacial-conduit');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Lago Cachet II & Glaciar Colonia Proglacial Canyon/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Grímsvötn & Skeiðarárjökull Subglacial Caldera Outburst Corridor/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Grímsvötn & Skeiðarárjökull Subglacial Caldera Outburst Corridor/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const grimsvotnCard = page.getByTestId(
      'jokulhlaup-site-card-grimsvotn-skeidararsandur-vatnajokull-iceland'
    );
    await grimsvotnCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Vertical Gain to Safe Terrace \(m\)/i)
    ).toHaveValue('95');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('jokulhlaup-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Proglacial Terrace Watch/i,
      })
      .click();
    await expect(resultPanel).toContainText('routine-proglacial-terrace-watch');

    await page
      .getByRole('button', {
        name: /Moderate H2S Plume & Conductivity Watch/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'halt-canyon-entry-monitor-h2s-plume'
    );

    await page
      .getByRole('button', {
        name: /High R-Channel Lateral Moraine Sprint/i,
      })
      .click();
    await expect(resultPanel).toContainText('immediate-lateral-moraine-sprint');

    await page
      .getByRole('button', {
        name: /Critical Subglacial Outburst Scree Scramble/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'emergency-vertical-scree-scramble-abandon-loads'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('jokulhlaup-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const gasDetectorCheckbox = page.getByLabel(
      /Clip-On H2S \/ SO2 Subglacial Gas Detector & Conductivity Probe/i
    );
    await gasDetectorCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const cramponsCheckbox = page.getByLabel(
      /Quick-Deploy Micro-Crampons & Whippet Self-Arrest Pole/i
    );
    await cramponsCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation Guide Journey', () => {
  test('loads /bentonite-badlands, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /bentonite-badlands
    await page.goto('/bentonite-badlands');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Bentonite Morphology
    const morphologySelect = page.getByLabel(/Bentonite Morphology/i);
    await morphologySelect.selectOption('caprock-hoodoo-pedestal');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Cainville Reef & North Cainville Mesa Mancos-Morrison Bentonite Hills/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Badlands National Park Sage Creek & Chadron Smectite Pinnacles/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Badlands National Park Sage Creek & Chadron Smectite Pinnacles/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const dinosaurCard = page.getByTestId(
      'bentonite-badlands-site-card-dinosaur-red-deer-bearpaw-badlands-alberta-canada'
    );
    await dinosaurCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByTestId('bentonite-badlands-selected-site-banner')
    ).toContainText(
      'Dinosaur Provincial Park & Red Deer River Bearpaw Bentonite Badlands'
    );

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId(
      'bentonite-badlands-calculator-result'
    );
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Dry Desiccated Crest Traverse/i,
      })
      .click();
    await expect(resultPanel).toContainText('Risk: low');

    await page
      .getByRole('button', {
        name: /Moderate Popcorn-Crust Probe March/i,
      })
      .click();
    await expect(resultPanel).toContainText('Risk: moderate');

    await page
      .getByRole('button', {
        name: /High Piping-Bridge Bypass to Sandstone Caprock/i,
      })
      .click();
    await expect(resultPanel).toContainText('Risk: high');

    await page
      .getByRole('button', {
        name: /Critical Abort Wet Gumbo & Sinkhole Roof Collapse/i,
      })
      .click();
    await expect(resultPanel).toContainText('Risk: critical');

    // 6. Verify Gear Checklist toggling
    const gearCounter = page.getByTestId('bentonite-badlands-gear-counter');
    await expect(gearCounter).toHaveText('0 / 5 items verified');

    const probeCheckbox = page.getByLabel(
      /Graduated 1\.8m T-Handle Piping-Void Sounding Staff/i
    );
    await probeCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 5 items verified');
  });
});

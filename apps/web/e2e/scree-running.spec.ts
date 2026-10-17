import { test, expect } from '@playwright/test';

test.describe('High-Altitude Alpine Scramble Ridge Crest Scree Running Guide Journey', () => {
  test('navigates to /scree-running, verifies headings, filters scree grading, calculates scree kinematics, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /scree-running
    await page.goto('/scree-running');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /High-Altitude Alpine Scramble Ridge Crest Scree Running Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'High-Altitude Alpine Scramble Ridge Crest Scree Running Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Fine Shale Pea Scree" and verify matching site is visible while others are hidden
    const fineShaleFilterBtn = page.getByRole('button', {
      name: /^Fine Shale Pea Scree$/i,
    });
    await fineShaleFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Teide Montaña Blanca Pumice & Cinder Scree Fan/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Sneffels Lavender Col & South Scree Gully/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Stephen Burgess Shale & Fossil Scree Slope/i,
      })
    ).toBeHidden();

    // Reset filter to All Scree Gradings
    const allFilterBtn = page.getByRole('button', {
      name: /^All Scree Gradings$/i,
    });
    await allFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Sneffels Lavender Col & South Scree Gully/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Mount Teide Montaña Blanca Pumice & Cinder Scree Fan/i,
      })
    ).toBeVisible();

    // 4. Interact with the Scree Kinematics Calculator
    const siteSelect = page.getByLabel(/select scree corridor/i);
    await siteSelect.selectOption('mount-teide-volcanic-cinder-scree');

    const slopeInput = page.getByLabel(/slope angle/i);
    await slopeInput.fill('30');

    const depthInput = page.getByLabel(/scree depth/i);
    await depthInput.fill('24');

    const resultPanel = page.getByTestId('scree-running-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText(
      'Mount Teide Montaña Blanca Pumice & Cinder Scree Fan'
    );
    await expect(resultPanel).toContainText('Braking Technique Advisory');
    await expect(resultPanel).toContainText('Gaiter & Protection Protocol');

    // 5. Interact with the Gear Checklist and verify counter updates
    const counter = page.getByTestId('scree-running-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const gaitersCheckbox = page.getByLabel(
      /High-Cuff Cordura Scree & Volcanic Dust Gaiters/i
    );
    await gaitersCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const helmetCheckbox = page.getByLabel(
      /Ultra-Light EN 12492 Hybrid Polycarbonate Scree Helmet/i
    );
    await helmetCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await gaitersCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

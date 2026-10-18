import { test, expect } from '@playwright/test';

test.describe('Subterranean Lava Tube Biospeleology & Troglomorphic Fauna Guide Journey', () => {
  test('navigates to /lava-tube-biospeleology, verifies headings, filters ecological zones, calculates biospeleology dynamics, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /lava-tube-biospeleology
    await page.goto('/lava-tube-biospeleology');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Subterranean Lava Tube Biospeleology & Troglomorphic Fauna Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Subterranean Lava Tube Biospeleology & Troglomorphic Fauna Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Subterranean Root Curtain Gallery" and verify matching site is visible while others are hidden
    const rootCurtainFilterBtn = page.getByRole('button', {
      name: /^Subterranean Root Curtain Gallery$/i,
    });
    await rootCurtainFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Kazumura Cave Kilauea Metrosideros Root Curtain Galleries/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Ape Cave Mount St\. Helens Subterranean Basalt Tube/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Cueva de los Verdes & Monte Corona Subterranean Tube/i,
      })
    ).toBeHidden();

    // Reset filter to All Ecological Zones
    const allFilterBtn = page.getByRole('button', {
      name: /^All Ecological Zones$/i,
    });
    await allFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Kazumura Cave Kilauea Metrosideros Root Curtain Galleries/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Cueva de los Verdes & Monte Corona Subterranean Tube/i,
      })
    ).toBeVisible();

    // 4. Interact with the Lava Tube Microclimate & Trophic Dynamics Calculator
    const siteSelect = page.getByLabel(/select lava tube system/i);
    await siteSelect.selectOption('ape-cave-mount-st-helens-basalt');

    const humidityInput = page.getByLabel(/relative humidity/i);
    await humidityInput.fill('82');

    const co2Input = page.getByLabel(/ambient co2/i);
    await co2Input.fill('1950');

    const resultPanel = page.getByTestId('lava-tube-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText(
      'Ape Cave Mount St. Helens Subterranean Basalt Tube'
    );
    await expect(resultPanel).toContainText('Non-Contact Traversal Protocol');
    await expect(resultPanel).toContainText(
      'Biocontamination & Decon Advisory'
    );

    // 5. Interact with the Gear Checklist and verify counter updates
    const counter = page.getByTestId('lava-tube-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const helmetCheckbox = page.getByLabel(
      /EN 12492 Low-Profile ABS\/EPP Basalt Speleology Helmet/i
    );
    await helmetCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const deconCheckbox = page.getByLabel(
      /Quaternary Ammonium & Virkon-S Biospeleology Boot Decon Kit/i
    );
    await deconCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await helmetCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

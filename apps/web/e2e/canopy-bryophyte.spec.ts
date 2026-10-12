import { test, expect } from '@playwright/test';

test.describe('Backcountry Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Ecology Guide Journey', () => {
  test('navigates to /canopy-bryophyte, verifies headings, filters stratum, calculates canopy dynamics, and tracks field checklist', async ({
    page,
  }) => {
    // 1. Navigate to /canopy-bryophyte
    await page.goto('/canopy-bryophyte');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Backcountry Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Ecology Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Ecology Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Tree-Fern Caudex Skirt" and verify matching site is visible while others are hidden
    const treeFernFilterBtn = page.getByRole('button', { name: /^Tree-Fern Caudex Skirt$/i });
    await treeFernFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Tarkine \/ takayna Ancient Cool Temperate Rainforest/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Hoh River Hall of Mosses Temperate Rain Forest/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Fiordland Milford Sound Hanging Bryosphere/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Yakushima Ancient Sugi & Cloud Inversion Bryosphere/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Great Bear Rainforest Emergent Canopy Estuary/i,
      })
    ).toBeHidden();

    // Reset filter to All Strata
    const allFilterBtn = page.getByRole('button', { name: /^All Strata$/i });
    await allFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Hoh River Hall of Mosses Temperate Rain Forest/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Tarkine \/ takayna Ancient Cool Temperate Rainforest/i,
      })
    ).toBeVisible();

    // 4. Interact with the Canopy Dynamics Calculator
    const siteSelect = page.getByLabel(/select study site/i);
    await siteSelect.selectOption('tarkine-takayna-rainforest');

    const humidityInput = page.getByLabel(/ambient relative humidity/i);
    await humidityInput.fill('60');

    const resultPanel = page.getByTestId('canopy-bryophyte-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Tarkine / takayna Ancient Cool Temperate Rainforest');
    await expect(resultPanel).toContainText('Microclimate Desiccation Warning');
    await expect(resultPanel).toContainText('Canopy Access & Rigging Protocol');
    await expect(resultPanel).toContainText('Microscope Identification Advisory');

    // 5. Interact with the Field Checklist and verify counter updates
    const counter = page.getByTestId('canopy-bryophyte-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const cambiumSaverCheckbox = page.getByLabel(
      /Arborist Non-Invasive Friction Cambium Saver/i
    );
    await cambiumSaverCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const srtKitCheckbox = page.getByLabel(
      /Lightweight SRT Canopy Ascent System/i
    );
    await srtKitCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await cambiumSaverCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

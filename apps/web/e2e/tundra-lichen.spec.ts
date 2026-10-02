import { test, expect } from '@playwright/test';

test.describe('Wilderness Subarctic Tundra Lichenology & Bryophyte Ecology Journey', () => {
  test('navigates to /tundra-lichen, verifies headings, filters morphology, calculates lichen dynamics, and tracks field checklist', async ({
    page,
  }) => {
    // 1. Navigate to /tundra-lichen
    await page.goto('/tundra-lichen');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Wilderness Subarctic Tundra Lichenology & Bryophyte Ecology \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Subarctic Tundra Lichenology & Bryophyte Ecology',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Crustose Saxicolous" and verify matching site is visible while others are hidden
    const crustoseFilterBtn = page.getByRole('button', { name: /^Crustose Saxicolous$/i });
    await crustoseFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Polychrome Pass Permafrost Tundra & Saxicolous Fellfield/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Torngat Mountains Arctic Fjord Lichen Barrens/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Root Glacier Lateral Moraine Bryophyte Succession Basin/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Beartooth Plateau High-Alpine Cryoturbation Flats/i,
      })
    ).toBeHidden();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Anaktuvuk Pass Arctic Foothills Tundra Bryoflora/i,
      })
    ).toBeHidden();

    // Reset filter to All Morphologies
    const allFilterBtn = page.getByRole('button', { name: /^All Morphologies$/i });
    await allFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Torngat Mountains Arctic Fjord Lichen Barrens/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Root Glacier Lateral Moraine Bryophyte Succession Basin/i,
      })
    ).toBeVisible();

    // 4. Interact with the Lichen Dynamics Calculator
    const siteSelect = page.getByLabel(/select study site/i);
    await siteSelect.selectOption('brooks-range-anaktuvuk-pass');

    const diameterInput = page.getByLabel(/colony diameter/i);
    await diameterInput.fill('120');

    const growthRateInput = page.getByLabel(/annual radial growth rate/i);
    await growthRateInput.fill('0.40');

    const airSelect = page.getByLabel(/air quality & deposition/i);
    await airSelect.selectOption('elevated_anthropogenic');

    const resultPanel = page.getByTestId('lichen-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Anaktuvuk Pass Arctic Foothills Tundra Bryoflora');
    // 120 mm / 0.40 mm/yr = 300 years
    await expect(resultPanel).toContainText('300 years');
    await expect(resultPanel).toContainText('Critical Cryoturbation Disturbance');
    await expect(resultPanel).toContainText('Chemical Spot Test Protocol');

    // 5. Interact with the Field Checklist and verify counter updates
    const counter = page.getByTestId('lichen-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const loupeCheckbox = page.getByLabel(
      /20x Hastings Triplet Achromatic Field Hand Lens with LED/i
    );
    await loupeCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const chiselCheckbox = page.getByLabel(
      /Hardened Geological Cold Chisel & Rubber-Grip Masonry Hammer/i
    );
    await chiselCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await loupeCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

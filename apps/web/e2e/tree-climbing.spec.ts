import { test, expect } from '@playwright/test';

test.describe('Backcountry Tree Climbing & Arboreal Canopy Expedition Systems Journey', () => {
  test('navigates to /tree-climbing, filters groves, tests anchor load calculator, and tracks arboreal canopy kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /tree-climbing
    await page.goto('/tree-climbing');

    // 2. Verify page title and literal H1 "Backcountry Tree Climbing & Arboreal Canopy Expedition Systems"
    await expect(page).toHaveTitle(
      /Backcountry Tree Climbing & Arboreal Canopy Expedition Systems \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Tree Climbing & Arboreal Canopy Expedition Systems',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Moving Rope Technique (MRT/DRT)" and verifies Appalachian White Oak card is displayed while Redwood cards are hidden
    const grid = page.getByTestId('canopy-groves-grid');
    const mrtBtn = page.getByRole('button', { name: /Moving Rope Technique \(MRT\/DRT\)/i });
    await mrtBtn.click();

    await expect(
      grid.getByRole('heading', { level: 3, name: /Smoky Mountains Grand White Oak Canopy/i })
    ).toBeVisible();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Prairie Creek Redwoods Canopy Expedition/i })
    ).not.toBeVisible();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Giant Forest Sierra Redwood Ascent/i })
    ).not.toBeVisible();

    // Reset filter to All Groves
    const allBtn = page.getByRole('button', { name: /All Groves/i });
    await allBtn.click();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Prairie Creek Redwoods Canopy Expedition/i })
    ).toBeVisible();

    // 4. Selects Prairie Creek Redwoods in calculator, sets branch diameter to 11 cm, asserts live status reflects prohibited failure risk, then raises diameter to 24 cm with Basal Anchor, asserting status updates to "Approved: Cambium Saver Required"
    const groveSelect = page.getByLabel(/Canopy Grove Expedition/i);
    await groveSelect.selectOption('redwood-canopy-prairie-creek');

    const anchorSelect = page.getByLabel(/Anchor Rigging Style/i);
    await anchorSelect.selectOption('basal_anchor');

    const diameterInput = page.getByLabel(/Branch Diameter/i);
    await diameterInput.fill('11');

    const resultPanel = page.getByTestId('tree-climbing-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText(/Prohibited: Structural Failure Risk/i);

    // Raise branch diameter to 24 cm with Basal Anchor
    await diameterInput.fill('24');
    await expect(resultPanel).toContainText(/Approved: Cambium Saver Required/i);
    await expect(resultPanel).toContainText(/456\s*lbs\s*\(2\.03\s*kN\)/i);

    // 5. Interacts with the Canopy Kit checklist and verifies tree-gear-counter updates
    const counter = page.getByTestId('tree-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const cambiumCheckbox = page.getByLabel(/Leather Cambium Friction Saver/i);
    await cambiumCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const throwlineCheckbox = page.getByLabel(/55m Dyneema Throwline/i);
    await throwlineCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await cambiumCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

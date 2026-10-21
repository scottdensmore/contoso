import { test, expect } from '@playwright/test';

test.describe('Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking Guide Journey', () => {
  test('loads /laterite-duricrust, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /laterite-duricrust
    await page.goto('/laterite-duricrust');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Duricrust Type
    const typeSelect = page.getByLabel(/Duricrust Type/i);
    await typeSelect.selectOption('canga-hematite-rupestre-plateau');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Serra dos Carajás & Campos Rupestres de Canga Hematite Mesa/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Fouta Djallon & Labé Ferricrete Bowé \(Cuirasse Latéritique\) Escarpment/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Fouta Djallon & Labé Ferricrete Bowé \(Cuirasse Latéritique\) Escarpment/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const foutaCard = page.getByTestId(
      'laterite-duricrust-site-card-fouta-djallon-bowe-labe-guinea'
    );
    await foutaCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Saprolite Undercut Span \(m\)/i)
    ).toHaveValue('2.8');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId(
      'laterite-duricrust-calculator-result'
    );
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Inland Cuirasse Slab & GNSS/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'inland-cuirasse-slab-gnss-bearing'
    );

    await page
      .getByRole('button', {
        name: /Moderate Sweep Pisolite Pea-Gravel with Poles/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'sweep-pisolite-pea-gravel-trekking-poles'
    );

    await page
      .getByRole('button', {
        name: /High 6m Setback from Saprolite Cornice/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'setback-6m-undercut-saprolite-cornice'
    );

    await page
      .getByRole('button', {
        name: /Critical Abort Rim & Descend Gully/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-rim-descend-gully-lightning-collapse'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('laterite-duricrust-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const bootsCheckbox = page.getByLabel(
      /Deep-Lug Vibram Megagrip Approach Boots & Carbide-Tip Trekking Poles/i
    );
    await bootsCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const gnssCheckbox = page.getByLabel(
      /Multi-Band Dual-Frequency GNSS Receiver & Optical Sun-Shadow Compass/i
    );
    await gnssCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

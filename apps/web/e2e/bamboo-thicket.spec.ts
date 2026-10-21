import { test, expect } from '@playwright/test';

test.describe('Montane Bamboo-Thicket (Chusquea / Sasa) & Cloud-Forest Ridge-Crest Bushwhacking Guide Journey', () => {
  test('loads /bamboo-thicket, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /bamboo-thicket
    await page.goto('/bamboo-thicket');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Montane Bamboo-Thicket \(Chusquea \/ Sasa\) & Cloud-Forest Ridge-Crest Bushwhacking Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Montane Bamboo-Thicket (Chusquea / Sasa) & Cloud-Forest Ridge-Crest Bushwhacking Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Bamboo Ecotype
    const ecotypeSelect = page.getByLabel(/Bamboo Ecotype/i);
    await ecotypeSelect.selectOption('yushania-alpina-montane-belt');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Rwenzori & Virunga Yushania alpina Montane Bamboo Belt/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Cordillera de Talamanca & Cerro Kamuk Chusquea Cloud-Ridge/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Cordillera de Talamanca & Cerro Kamuk Chusquea Cloud-Ridge/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const chirripoCard = page.getByTestId(
      'bamboo-site-card-chirripo-talamanca-chusquea-costa-rica'
    );
    await chirripoCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Culm Density \(culms\/m²\)/i)
    ).toHaveValue('82');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('bamboo-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Tapir Tunnel Lead/i,
      })
      .click();
    await expect(resultPanel).toContainText('follow-tapir-bear-tunnel-leads');

    await page
      .getByRole('button', {
        name: /Moderate Sasa Crest Culm Swim/i,
      })
      .click();
    await expect(resultPanel).toContainText('hand-over-hand-culm-belay-swim');

    await page
      .getByRole('button', {
        name: /High Chusquea Ridge Node-Saw Prune/i,
      })
      .click();
    await expect(resultPanel).toContainText('flush-node-saw-prune-4m-spacing');

    await page
      .getByRole('button', {
        name: /Critical Spiny Impaction & Cornice Overhang/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-cornice-drop-spiny-impaction'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('bamboo-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const gogglesCheckbox = page.getByLabel(
      /Polycarbonate Forestry Mesh Goggles & Ballistic Eye-Whip Visor/i
    );
    await gogglesCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const sawCheckbox = page.getByLabel(
      /Folding Japanese Pull-Saw \(Silky Gomboy\) for Flush Node Cuts/i
    );
    await sawCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

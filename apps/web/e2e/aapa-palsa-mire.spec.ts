import { test, expect } from '@playwright/test';

test.describe('Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing Guide Journey', () => {
  test('loads /aapa-palsa-mire, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /aapa-palsa-mire
    await page.goto('/aapa-palsa-mire');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Boreal String-Bog \(Aapa Mire\) Flark-Pool & Palsa Permafrost-Mound Crossing Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Mire Morphology
    const morphologySelect = page.getByLabel(/Mire Morphology/i);
    await morphologySelect.selectOption('ice-cored-palsa-dome-plateau');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Tavvavuoma & Vissátvuopmi Giant Palsa-Mound Plateau/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Viiankiaapa & Sodankylä Concentric String-Bog \(Aapasuo\) Labyrinth/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Viiankiaapa & Sodankylä Concentric String-Bog \(Aapasuo\) Labyrinth/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const viiankiaapaCard = page.getByTestId(
      'aapa-palsa-mire-site-card-voda-viiankiaapa-sodankyla-lapland-finland'
    );
    await viiankiaapaCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Sträng Ridge Width \(m\)/i)).toHaveValue(
      '1.4'
    );

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('aapa-palsa-mire-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Continuous Betula Sträng Crests/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'thread-continuous-betula-strang-crests'
    );

    await page
      .getByRole('button', {
        name: /Moderate Sedge-Mat Probe & Load Distribution/i,
      })
      .click();
    await expect(resultPanel).toContainText('probe-sedge-mat-distribute-load');

    await page
      .getByRole('button', {
        name: /High Wide-Berth Palsa Lagg-Moat Detour/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'wide-berth-palsa-lagg-moat-detour'
    );

    await page
      .getByRole('button', {
        name: /Critical Quaking Flark Abort & Esker Bypass/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-quaking-flark-basin-route-esker'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('aapa-palsa-mire-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const probeCheckbox = page.getByLabel(
      /240cm Graduated Peat-Depth Probe Staff & Wide-Basket Mire Trekking Poles/i
    );
    await probeCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const throwBagCheckbox = page.getByLabel(
      /20m Floating Dyneema Mire-Rescue Throw Bag & Chest-Harness Tow Tether/i
    );
    await throwBagCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

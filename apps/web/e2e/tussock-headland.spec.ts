import { test, expect } from '@playwright/test';

test.describe('Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation Guide Journey', () => {
  test('loads /tussock-headland, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /tussock-headland
    await page.goto('/tussock-headland');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Tussock Morphology
    const morphologySelect = page.getByLabel(/Tussock Morphology/i);
    await morphologySelect.selectOption('chionochloa-megaherb-peat-terrace');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Enderby & Adams Island Chionochloa Tussock & Megaherb Bog/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Fortuna Bay & Shackleton Gap Poa flabellata Tussock Headland/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Fortuna Bay & Shackleton Gap Poa flabellata Tussock Headland/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const fortunaCard = page.getByTestId(
      'tussock-site-card-fortuna-bay-stromness-south-georgia'
    );
    await fortunaCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Pedestal Height \(m\)/i)).toHaveValue('2.2');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('tussock-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Raised Pedestal Crown-Hop/i,
      })
      .click();
    await expect(resultPanel).toContainText('crown-hop-raised-peat-pedestals');

    await page
      .getByRole('button', {
        name: /Moderate Leeward Trench Probe/i,
      })
      .click();
    await expect(resultPanel).toContainText('low-crawl-leeward-trench-probe');

    await page
      .getByRole('button', {
        name: /High Katabatic & Fur-Seal Maze/i,
      })
      .click();
    await expect(resultPanel).toContainText('detour-inland-feldmark-bench');

    await page
      .getByRole('button', {
        name: /Critical Williwaw & Deep Wallow Trap/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-katabatic-bivouac-lee-tussock'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('tussock-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const probeCheckbox = page.getByLabel(
      /150 cm Graduated Carbon Peat-Bog & Seal-Wallow Depth Probe Staff/i
    );
    await probeCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const biosecurityCheckbox = page.getByLabel(
      /Virkon-S Biocide Boot Scrub Kit, Seed-Trap Gaiters & Acoustic Fur-Seal Deterrent Bodkin/i
    );
    await biosecurityCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

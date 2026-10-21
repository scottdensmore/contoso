import { test, expect } from '@playwright/test';

test.describe('Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing Guide Journey', () => {
  test('loads /barnacle-ledge, verifies heading, filters catalog, exercises calculator, and toggles gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /barnacle-ledge
    await page.goto('/barnacle-ledge');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Intertidal Substrate Type
    const substrateSelect = page.getByLabel(/Intertidal Substrate Type/i);
    await substrateSelect.selectOption('porphyra-ulva-glazed-shelf');

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Owen Point & Thrasher Cove Wave-Cut Porphyra-Barnacle Shelf/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Cape Perpetua & Thor's Well Basalt Mussel-Barnacle Bench/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Cape Perpetua & Thor's Well Basalt Mussel-Barnacle Bench/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const duckpoolCard = page.getByTestId(
      'barnacle-ledge-site-card-duckpool-bude-sabellaria-reef-cornwall-uk'
    );
    await duckpoolCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(
      page.getByLabel(/Sabellariid Colony Density \(%\)/i)
    ).toHaveValue('88');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId('barnacle-ledge-calculator-result');
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /Low-Risk Bare Basalt & Worm-Tube Avoidance/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'step-bare-basalt-avoid-worm-tubes'
    );

    await page
      .getByRole('button', {
        name: /Moderate Algal Glaze & Studded Felt Stance/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'carbide-stud-felt-bootie-low-stance'
    );

    await page
      .getByRole('button', {
        name: /High Surge Channel & Ebb Slack Belay/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'wait-ebb-slack-belay-surge-gulley'
    );

    await page
      .getByRole('button', {
        name: /Critical Infragravity Set Overwash Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort-infragravity-set-sweep-hazard'
    );

    // 6. Verify 6-item Gear Checklist toggling
    const gearCounter = page.getByTestId('barnacle-ledge-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 items verified');

    const glovesCheckbox = page.getByLabel(
      /ANSI A5 Kevlar-Palm Neoprene Intertidal Rock Gloves & Shin Guards/i
    );
    await glovesCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 items verified');

    const bootiesCheckbox = page.getByLabel(
      /Tungsten-Carbide Studded Felt-Sole Intertidal Reef Booties/i
    );
    await bootiesCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 items verified');
  });
});

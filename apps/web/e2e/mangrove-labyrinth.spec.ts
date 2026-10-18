import { test, expect } from '@playwright/test';

test.describe('Sub-Canopy Mangroves & Pneumatophore Prop-Root Tidal Labyrinth Navigation Guide Journey', () => {
  test('loads /mangrove-labyrinth, verifies heading, filters sites, loads site into calculator, tests presets, and verifies gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /mangrove-labyrinth
    await page.goto('/mangrove-labyrinth');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Sub-Canopy Mangroves & Pneumatophore Prop-Root Tidal Labyrinth Navigation Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Sub-Canopy Mangroves & Pneumatophore Prop-Root Tidal Labyrinth Navigation Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter sites by Mangrove Root Morphology
    const morphologySelect = page.getByLabel(/Mangrove Root Morphology/i);
    await morphologySelect.selectOption(
      'avicennia_dense_pencil_pneumatophore_mat'
    );

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Harbhanga & Matla Estuarine Pneumatophore Creek Labyrinth/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Hell Bay & Whitewater Bay Rhizophora Prop-Root Wilderness/i,
      })
    ).toBeHidden();

    // Reset filters
    await page.getByRole('button', { name: /Reset Filters/i }).click();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Hell Bay & Whitewater Bay Rhizophora Prop-Root Wilderness/i,
      })
    ).toBeVisible();

    // 4. Load a site into the calculator
    const sundarbansCard = page.getByTestId(
      'mangrove-labyrinth-site-card-sundarbans-harbhanga-tidal-creek-nexus'
    );
    await sundarbansCard
      .getByRole('button', { name: /Load into Calculator/i })
      .click();

    await expect(page.getByLabel(/Prop-Root Density \(stems\/m²\)/i)).toHaveValue(
      '42'
    );
    await expect(
      page.getByLabel(/Tidal Current Velocity \(knots\)/i)
    ).toHaveValue('2.4');

    // 5. Exercise calculator preset buttons and live output panel
    const resultPanel = page.getByTestId(
      'mangrove-labyrinth-calculator-result'
    );
    await expect(resultPanel).toBeVisible();

    await page
      .getByRole('button', {
        name: /High-Slack Canopy Tunnel Float/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'nominal_high_slack_canopy_corridor'
    );

    await page
      .getByRole('button', {
        name: /Mid-Ebb Prop-Root Strainer Caution/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'caution_prop_root_pinning_and_oyster_laceration'
    );

    await page
      .getByRole('button', {
        name: /Spring-Low Sulfidic Mud & Stranding Abort/i,
      })
      .click();
    await expect(resultPanel).toContainText(
      'abort_ebb_stranding_or_anoxic_silt_entrapment'
    );

    // 6. Verify 6-item Mandatory Oyster Armor & Sub-Canopy Wayfinding Gear Checklist
    const gearCounter = page.getByTestId('mangrove-labyrinth-gear-counter');
    await expect(gearCounter).toHaveText('0 / 6 mandatory items verified');

    const glovesCheckbox = page.getByLabel(
      /Kevlar-Armored Cut-Resistant Oyster Gloves & Puncture-Proof Booties/i
    );
    await glovesCheckbox.check();
    await expect(gearCounter).toHaveText('1 / 6 mandatory items verified');

    const paddleCheckbox = page.getByLabel(
      /Compact 115 cm Double-Blade Breakdown Canopy-Tunnel Paddle/i
    );
    await paddleCheckbox.check();
    await expect(gearCounter).toHaveText('2 / 6 mandatory items verified');
  });
});

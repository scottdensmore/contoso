import { test, expect } from '@playwright/test';

test.describe('Alpine Via Ferrata & Iron Way Route Explorer Journey', () => {
  test('navigates to /via-ferrata, verifies headings, filters routes by grade, calculates rigging fall arrest safety, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /via-ferrata
    await page.goto('/via-ferrata');

    // 2. Verify page title and literal H1 "Alpine Via Ferrata & Iron Way Route Explorer"
    await expect(page).toHaveTitle(
      /Alpine Via Ferrata & Iron Way Route Explorer \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Via Ferrata & Iron Way Route Explorer',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Grade D (Very Difficult)" or "Grade E (Extremely Difficult)" and verify expected cards are displayed while others are hidden
    const gradeDFilterBtn = page.getByRole('button', { name: /Grade D/i });
    await gradeDFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: 'Ouray Via Ferrata Gold Mountain' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Telluride Via Ferrata' })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Mount Olympus Iron Way Ridge' })
    ).toBeHidden();

    const gradeEFilterBtn = page.getByRole('button', { name: /Grade E/i });
    await gradeEFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: 'Mammoth Mountain Iron Crest Wall' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Ouray Via Ferrata Gold Mountain' })
    ).toBeHidden();

    // Reset filter to All Routes
    const allFilterBtn = page.getByRole('button', { name: /^All Routes$/i });
    await allFilterBtn.click();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Telluride Via Ferrata' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Mount Olympus Iron Way Ridge' })
    ).toBeVisible();

    // 4. Select Telluride Via Ferrata in calculator, test underweight or legacy brake inputs, asserts live status reflects warning or outdated notice and estimated kN
    const routeSelect = page.getByLabel(/Select Via Ferrata Route/i);
    await routeSelect.selectOption('telluride-via-ferrata');

    const weightInput = page.getByLabel(/^Climber Body Weight/i);
    await weightInput.fill('35');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText('35 kg');
    await expect(liveStatus).toContainText('Underweight Risk');
    await expect(liveStatus).toContainText('Warning: Top-Rope Backup Required');
    await expect(liveStatus).toContainText('3.6 kN');

    // Test legacy brake input
    await weightInput.fill('75');
    const absorberSelect = page.getByLabel(/Energy Absorber Type/i);
    await absorberSelect.selectOption('friction_brake_legacy');

    await expect(liveStatus).toContainText('Outdated & Unsafe');
    await expect(liveStatus).toContainText('CRITICAL SAFETY HAZARD');
    await expect(liveStatus).toContainText(/9(\.0)? kN/);

    // 5. Interact with the Via Ferrata Safety Kit checklist and verify ferrata-gear-counter updates
    const counter = page.getByTestId('ferrata-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const lanyardCheckbox = page.getByLabel(/EN 958:2017 Certified Y-Lanyard/i);
    await lanyardCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const carabinerCheckbox = page.getByLabel(/Dual Ergonomic Palm-Squeeze/i);
    await carabinerCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await lanyardCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

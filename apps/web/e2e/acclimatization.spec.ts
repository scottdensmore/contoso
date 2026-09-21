import { test, expect } from '@playwright/test';

test.describe('High-Altitude Mountaineering & Acclimatization Health Advisor Journey', () => {
  test('navigates to /acclimatization, verifies headings, filters peaks, calculates ascent pacing, and tracks medical gear', async ({
    page,
  }) => {
    // 1. Navigate to /acclimatization
    await page.goto('/acclimatization');

    // 2. Verify page title and literal H1 "High-Altitude Mountaineering & Acclimatization Health Advisor"
    await expect(page).toHaveTitle(
      /High-Altitude Mountaineering & Acclimatization Health Advisor \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'High-Altitude Mountaineering & Acclimatization Health Advisor',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Extreme (18k+)" and verify Denali is displayed while others are hidden
    const extremeFilterBtn = page.getByRole('button', { name: /^Extreme \(18k\+\)$/i });
    await extremeFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Denali \/ Mount McKinley/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Mount Rainier/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Mount Elbert/i })
    ).toBeHidden();

    // Filter by "High (12k-14k)" and verify Rainier & Elbert are visible while Denali is hidden
    const highFilterBtn = page.getByRole('button', { name: /^High \(12k-14k\)$/i });
    await highFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Mount Rainier/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Mount Elbert/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Denali \/ Mount McKinley/i })
    ).toBeHidden();

    // Reset filter to All Peaks
    const allFilterBtn = page.getByRole('button', { name: /^All Peaks$/i });
    await allFilterBtn.click();
    await expect(
      page.getByRole('heading', { level: 3, name: /Denali \/ Mount McKinley/i })
    ).toBeVisible();

    // 4. Select Denali in calculator, adjust days and current altitude, and assert live status
    const peakSelect = page.getByLabel(/select target peak/i);
    await peakSelect.selectOption('alaska-denali');

    const currentAltInput = page.getByLabel(/current acclimatized altitude/i);
    await currentAltInput.fill('7200');

    const daysInput = page.getByLabel(/days allowed for ascent/i);
    await daysInput.fill('14');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText('936 ft/day');
    await expect(liveStatus).toContainText('Denali');
    await expect(liveStatus).toContainText('rest days required');

    // Adjust days to 3 (rushed ascent) and assert updated daily ascent rate and severe AMS risk
    await daysInput.fill('3');
    await expect(liveStatus).toContainText('4,370 ft/day');
    await expect(liveStatus).toContainText('AMS Risk: SEVERE');

    // 5. Interact with the High-Altitude Medical Kit checklist and verify altitude-gear-counter updates
    const counter = page.getByTestId('altitude-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const oximeterCheckbox = page.getByLabel(
      /clinical fingertip pulse oximeter with SpO2 and pulse rate monitoring/i
    );
    await oximeterCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const diamoxCheckbox = page.getByLabel(
      /acetazolamide \(diamox\) prescription prophylaxis/i
    );
    await diamoxCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await oximeterCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

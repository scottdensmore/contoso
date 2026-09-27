import { test, expect } from '@playwright/test';

test.describe('Wilderness Falconry Raptor Handling & Mountain Free-Flight Hunting Journey', () => {
  test('navigates to /falconry, verifies headings, filters grounds, calculates calibration, and tracks safety furniture', async ({
    page,
  }) => {
    // 1. Navigates to /falconry
    await page.goto('/falconry');

    // 2. Verifies page title and literal H1 "Wilderness Falconry Raptor Handling & Mountain Free-Flight Hunting"
    await expect(page).toHaveTitle(
      /Wilderness Falconry Raptor Handling & Mountain Free-Flight Hunting \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Falconry Raptor Handling & Mountain Free-Flight Hunting',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Gyrfalcon" and verifies expected cards are displayed while other grounds are hidden
    const gyrfalconBtn = page.getByRole('button', { name: /^Gyrfalcon$/i });
    await gyrfalconBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Red Desert High Steppe & Sagebrush Sea/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Morley Nelson Snake River Birds of Prey NCA/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /San Luis Valley High Desert Falconry Grounds/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Sonoran Saguaro Scrub & Bajada Washes/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Bighorn Basin Rimrock & Shoshone Ridge/i })
    ).toBeHidden();

    // Reset filter
    const allBtn = page.getByRole('button', { name: /^All Species$/i });
    await allBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Morley Nelson Snake River Birds of Prey NCA/i })
    ).toBeVisible();

    // 4. Selects Red Desert in calculator, adjusts target flying weight to create high weight deviation, asserts live status reflects starvation warning
    const groundSelect = page.getByLabel(/select falconry ground/i);
    await groundSelect.selectOption('sagebrush-sea-wyoming');

    const targetWeightInput = page.getByLabel(/target flying weight/i);
    await targetWeightInput.fill('700');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText('Red Desert High Steppe & Sagebrush Sea');
    await expect(liveStatus).toContainText('Starvation Danger Lethal');

    // Adjust target flying weight to prime condition (e.g. 800g with 900g base = -11.1%)
    await targetWeightInput.fill('800');
    await expect(liveStatus).toContainText('Prime Hunting Condition');

    // 5. Interacts with the Gear Checklist and verifies falconry-gear-counter updates
    const counter = page.getByTestId('falconry-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const telemetryCheckbox = page.getByLabel(
      /Dual-Frequency 216MHz VHF Tail-Mount & Micro-GPS Backpack/i
    );
    await telemetryCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const gauntletCheckbox = page.getByLabel(
      /Reinforced Triple-Layer Elk-Hide Gauntlet with D-Ring Tether/i
    );
    await gauntletCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await telemetryCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

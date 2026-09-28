import { test, expect } from '@playwright/test';

test.describe('Wilderness Canyon Bouldering & Highball Sandstone Crash Pad Logistics Journey', () => {
  test('navigates to /canyon-bouldering, filters bouldering styles, tests fall dynamics calculator, and tracks crash pad checklist', async ({
    page,
  }) => {
    // 1. Navigate to /canyon-bouldering
    await page.goto('/canyon-bouldering');

    // 2. Verify page title and literal H1 "Wilderness Canyon Bouldering & Highball Sandstone Crash Pad Logistics"
    await expect(page).toHaveTitle(
      /Wilderness Canyon Bouldering & Highball Sandstone Crash Pad Logistics \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Canyon Bouldering & Highball Sandstone Crash Pad Logistics',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Highball Sandstone Pinnacle" and verify Buttermilks card is displayed while Joe's Valley is hidden
    const grid = page.getByTestId('canyon-bouldering-sectors-grid');

    const highballBtn = page.getByRole('button', { name: /highball sandstone pinnacle/i });
    await highballBtn.click();
    await expect(grid).toContainText('Buttermilks Peabody Highball Boulders');
    await expect(grid).not.toContainText("Joe's Valley");

    // 4. Selects Buttermilks in calculator, sets fall height to 12m and crash pads to 2, asserts live status reflects hazardous highball groundfall risk, then sets fall height to 3m and crash pads to 4, asserting status updates to safe cushioned drop
    const sectorSelect = page.getByLabel(/select.*bouldering sector/i);
    await sectorSelect.selectOption('buttermilks-peabody-highballs');

    const heightInput = page.getByLabel(/fall height/i);
    await heightInput.fill('12');

    const padsInput = page.getByLabel(/crash pads/i);
    await padsInput.fill('2');

    const resultPanel = page.getByTestId('canyon-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText(/hazardous highball groundfall risk/i);

    // Set fall height to 3m and crash pads to 4
    await heightInput.fill('3');
    await padsInput.fill('4');
    await expect(resultPanel).toContainText(/safe cushioned drop/i);

    // 5. Interacts with the Crash Pad Gear checklist and verifies canyon-bouldering-gear-counter
    const counter = page.getByTestId('canyon-bouldering-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const padCheckbox = page.getByLabel(/high-impact triple-density foam highball crash pad/i);
    await padCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const blubberCheckbox = page.getByLabel(/modular full-coverage foam blubber pad/i);
    await blubberCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await padCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

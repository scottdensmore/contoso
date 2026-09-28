import { test, expect } from '@playwright/test';

test.describe('Alpine Via Ferrata Night Suspension & Moonlight Traverse Journey', () => {
  test('navigates to /night-via-ferrata, filters routes, tests nocturnal calculator dynamics, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /night-via-ferrata
    await page.goto('/night-via-ferrata');

    // 2. Verify page title and literal H1 "Alpine Via Ferrata Night Suspension & Moonlight Traverse"
    await expect(page).toHaveTitle(
      /Alpine Via Ferrata Night Suspension & Moonlight Traverse \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Via Ferrata Night Suspension & Moonlight Traverse',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Vertical Granite Face" and verifies Ouray Uncompahgre card is displayed while Dolomites is hidden
    const grid = page.getByTestId('night-via-ferrata-routes-grid');
    const graniteBtn = page.getByRole('button', { name: /vertical granite face/i });
    await graniteBtn.click();

    await expect(
      grid.getByRole('heading', { level: 3, name: /Ouray Uncompahgre/i })
    ).toBeVisible();
    await expect(
      grid.getByRole('heading', { level: 3, name: /Dolomites/i })
    ).not.toBeVisible();

    // 4. Selects Dolomites in calculator, sets moonlight to "New Moon Pitch Black", headlamp to 250 lumens, wind gusts to 65 kph, asserts live status reflects hazardous zero visibility abort, then sets moonlight to "Full Moon Glare", headlamp to 1400 lumens, wind gusts to 15 kph, asserting status updates to optimal moonlight ascent
    const routeSelect = page.getByLabel(/select.*route/i);
    await routeSelect.selectOption('dolomites-kellner-night-traverse');

    const resultPanel = page.getByTestId('night-via-ferrata-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(
      resultPanel.getByRole('heading', { level: 3, name: /Dolomites Ivano Dibona/i })
    ).toBeVisible();

    const moonSelect = page.getByLabel(/moonlight/i);
    await moonSelect.selectOption('new_moon_pitch_black');

    const lumensInput = page.getByLabel(/headlamp lumens/i);
    await lumensInput.fill('250');

    const windInput = page.getByLabel(/wind gusts/i);
    await windInput.fill('65');

    await expect(resultPanel).toContainText(/hazardous.*zero visibility abort/i);

    // Reconfigure to optimal conditions
    await moonSelect.selectOption('full_moon_glare');
    await lumensInput.fill('1400');
    await windInput.fill('15');

    await expect(resultPanel).toContainText(/optimal.*moonlight ascent/i);

    // 5. Interacts with the Night Gear checklist and verifies night-via-ferrata-gear-counter updates
    const counter = page.getByTestId('night-via-ferrata-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const headlampCheckbox = page.getByLabel(/high-output dual-beam 1200-lumen/i);
    await headlampCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const helmetCheckbox = page.getByLabel(
      /photoluminescent high-impact mountaineering helmet/i
    );
    await helmetCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await headlampCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

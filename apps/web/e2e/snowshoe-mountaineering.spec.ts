import { test, expect } from '@playwright/test';

test.describe('Alpine Snowshoe Mountaineering & Technical Winter Ascent Guide Journey', () => {
  test('navigates to /snowshoe-mountaineering, filters technical grades, evaluates slope mechanics calculator, and tracks safety kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /snowshoe-mountaineering
    await page.goto('/snowshoe-mountaineering');

    // 2. Verify page title and literal H1 "Alpine Snowshoe Mountaineering & Technical Winter Ascent"
    await expect(page).toHaveTitle(
      /Alpine Snowshoe Mountaineering & Technical Winter Ascent \| Contoso Outdoors/,
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Snowshoe Mountaineering & Technical Winter Ascent',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Glaciated High Altitude" and verify Mount Rainier card is displayed while Mount Washington is hidden
    const grid = page.getByTestId('snowshoe-routes-grid');
    const glaciatedBtn = page.getByRole('button', { name: /glaciated high altitude/i });
    await glaciatedBtn.click();

    await expect(grid).toContainText('Mount Rainier Camp Muir Winter Route');
    await expect(grid).not.toContainText('Mount Washington Lion Head Winter Ridge');
    await expect(grid).not.toContainText('Flattop Mountain & Hallett Peak Winter Traverse');
    await expect(grid).not.toContainText('Mount Shasta Avalanche Gulch Winter Ascent');
    await expect(grid).not.toContainText('Red Mountain Pass & Commodore Basin');

    const allRoutesBtn = page.getByRole('button', { name: /all routes/i });
    await allRoutesBtn.click();
    await expect(grid).toContainText('Mount Washington Lion Head Winter Ridge');
    await expect(grid).toContainText('Mount Rainier Camp Muir Winter Route');

    // 4. Selects Mount Washington in calculator, sets snowpack to "Boilerplate Ice" or slope to 42°,
    // asserts live status reflects hazardous transition to crampons and ice axe,
    // then changes snowpack to "Windslab Crust" and slope to 24°, asserting status updates to "Optimal Snowshoe Ascent"
    const routeSelect = page.getByLabel(/select.*route/i);
    await routeSelect.selectOption('mount-washington-tuckerman-ridge');

    const resultPanel = page.getByTestId('snowshoe-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Mount Washington Lion Head Winter Ridge');

    const snowpackSelect = page.getByLabel(/snowpack surface/i);
    const slopeInput = page.getByLabel(/slope angle/i);

    // Set snowpack to Boilerplate Ice -> Hazardous transition
    await snowpackSelect.selectOption('boilerplate_ice');
    await expect(resultPanel).toContainText(/Hazardous: Transition to Crampons & Ice Axe/i);

    // Change snowpack to Windslab Crust and slope to 24 -> Optimal Snowshoe Ascent
    await snowpackSelect.selectOption('windslab_crust');
    await slopeInput.fill('24');
    await expect(resultPanel).toContainText('Optimal Snowshoe Ascent');

    // Set slope to 42 -> Hazardous transition
    await slopeInput.fill('42');
    await expect(resultPanel).toContainText(/Hazardous: Transition to Crampons & Ice Axe/i);

    // Change back to 24 -> Optimal
    await slopeInput.fill('24');
    await expect(resultPanel).toContainText('Optimal Snowshoe Ascent');

    // 5. Interacts with the Snowshoe Gear checklist and verifies snowshoe-gear-counter updates
    const counter = page.getByTestId('snowshoe-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const snowshoesCheckbox = page.getByLabel(/Aggressive 3D Perimeter Serrated Steel Traction Snowshoes/i);
    await snowshoesCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const tailsCheckbox = page.getByLabel(/5-Inch Modular Flotation Tail Extensions/i);
    await tailsCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await snowshoesCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Backcountry Fire Lookout Tower Wilderness Spotting Guide Journey', () => {
  test('navigates to /fire-lookout, verifies headings, filters towers by structure, calculates triangulation bearings and plume alert levels, and tracks observer kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /fire-lookout
    await page.goto('/fire-lookout');

    // 2. Verify page title and literal H1 "Backcountry Fire Lookout Tower Wilderness Spotting"
    await expect(page).toHaveTitle(
      /Backcountry Fire Lookout Tower Wilderness Spotting \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Fire Lookout Tower Wilderness Spotting',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by tower structure and verify expected cards
    const towersList = page.getByTestId('fire-lookout-towers-list');
    await expect(towersList).toBeVisible();
    await expect(towersList).toContainText('Winchester Mountain Lookout (L-4 Cab)');
    await expect(towersList).toContainText('Desolation Peak Fire Lookout');
    await expect(towersList).toContainText('Mount Cammerer Octagonal Stone Lookout');
    await expect(towersList).toContainText('Black Elk Peak Stone Tower');
    await expect(towersList).toContainText('Sundance Mountain Steel Tower');

    // Filter by Steel Skeletal
    const steelFilter = page.getByRole('button', { name: /^Steel Skeletal/i });
    await steelFilter.click();
    await expect(towersList).toContainText('Sundance Mountain Steel Tower');
    await expect(towersList).not.toContainText('Winchester Mountain Lookout');
    await expect(towersList).not.toContainText('Mount Cammerer Octagonal Stone Lookout');

    // Filter by Stone Cupola
    const stoneFilter = page.getByRole('button', { name: /^Stone Cupola/i });
    await stoneFilter.click();
    await expect(towersList).toContainText('Mount Cammerer Octagonal Stone Lookout');
    await expect(towersList).toContainText('Black Elk Peak Stone Tower');
    await expect(towersList).not.toContainText('Sundance Mountain Steel Tower');

    // Filter by L-4 Cab
    const l4Filter = page.getByRole('button', { name: /^L-4 Cab/i });
    await l4Filter.click();
    await expect(towersList).toContainText('Winchester Mountain Lookout (L-4 Cab)');
    await expect(towersList).toContainText('Desolation Peak Fire Lookout');
    await expect(towersList).not.toContainText('Mount Cammerer Octagonal Stone Lookout');

    // Reset to All Towers
    const allFilter = page.getByRole('button', { name: /^All Towers/i });
    await allFilter.click();
    await expect(towersList).toContainText('Winchester Mountain Lookout (L-4 Cab)');
    await expect(towersList).toContainText('Sundance Mountain Steel Tower');

    // 4. Selects Winchester Mountain in calculator, adjusts azimuth, asserts live status reflects bearing and alert status
    const towerSelect = page.getByLabel(/observation lookout tower/i);
    await towerSelect.selectOption('winchester-mountain-lookout');

    const resultPanel = page.getByTestId('fire-lookout-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Winchester Mountain Lookout (L-4 Cab)');

    const azimuthInput = page.getByLabel(/azimuth bearing/i);
    await azimuthInput.fill('135');

    // Live status reflects bearing 135° (SE) and default observation watch
    await expect(resultPanel).toContainText('135° (SE)');
    await expect(resultPanel).toContainText('OBSERVATION WATCH');
    await expect(resultPanel).toContainText(
      'Osborne Triangulation: Sighting cross-bearing verified at 135°'
    );

    // Adjust smoke behavior to dense vertical convection
    const smokeSelect = page.getByLabel(/smoke behavior/i);
    await smokeSelect.selectOption('dense_vertical_convection');
    await expect(resultPanel).toContainText('CONFIRMED WILDFIRE DISPATCH');

    // 5. Interacts with the Lookout Checklist and verifies fire-lookout-gear-counter
    const counter = page.getByTestId('fire-lookout-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const alidadeCheckbox = page.getByLabel(
      /Brass Osborne Fire Finder Peep Sights & Graduated Ring/i
    );
    await alidadeCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const binocularsCheckbox = page.getByLabel(
      /10x50 Waterproof ED High-Transmission Spotting Binoculars/i
    );
    await binocularsCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    const radioCheckbox = page.getByLabel(
      /VHF Multi-Channel Forest Service Band Radio & Whip Antenna/i
    );
    await radioCheckbox.check();
    await expect(counter).toContainText('3 of 6 packed');

    await alidadeCheckbox.uncheck();
    await expect(counter).toContainText('2 of 6 packed');
  });
});

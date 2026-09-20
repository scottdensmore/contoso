import { test, expect } from '@playwright/test';

test.describe('Night Sky & Dark Sky Sanctuary Stargazing Guide Journey', () => {
  test('navigates to /stargazing, checks title and h1, filters sites, calculates seeing quality, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /stargazing
    await page.goto('/stargazing');

    // 2. Verify page title and literal H1 "Night Sky & Dark Sky Sanctuary Stargazing Guide"
    await expect(page).toHaveTitle(
      /Night Sky & Dark Sky Stargazing Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Night Sky & Dark Sky Sanctuary Stargazing Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Pristine Dark Sky (Bortle 1-2)" and verify John Day Fossil Beds is visible while Artist Point is filtered
    const pristineFilter = page.getByRole('button', { name: /Pristine Dark Sky \(Bortle 1-2\)/i });
    await pristineFilter.click();

    await expect(page.getByText('John Day Fossil Beds - Painted Hills')).toBeVisible();
    await expect(page.getByText('Artist Point at Mount Baker')).not.toBeVisible();

    // 4. Run the Seeing Quality Calculator for Copper Ridge with New Moon and 0% clouds, and verify "OPTIMAL VIEWING"
    const siteSelect = page.getByLabel(/Select Observing Site/i);
    await siteSelect.selectOption('copper-ridge-cascades');

    const moonSelect = page.getByLabel(/Select Moon Phase/i);
    await moonSelect.selectOption('new_moon');

    const cloudInput = page.getByLabel(/Cloud Cover/i);
    await cloudInput.fill('0');

    const statusPanel = page.getByRole('status');
    await expect(statusPanel).toBeVisible();
    await expect(statusPanel).toContainText('OPTIMAL VIEWING');

    // 5. Interact with the Dark Sky Gear Checklist and assert the packing counter
    const counter = page.getByTestId('stargazing-gear-counter');
    await expect(counter).toHaveText('0 of 9 packed');

    const firstCheckbox = page.locator('#gear-optics-binoculars-10x50');
    await firstCheckbox.check();
    await expect(counter).toHaveText('1 of 9 packed');

    const secondCheckbox = page.locator('#gear-lighting-red-headlamp');
    await secondCheckbox.check();
    await expect(counter).toHaveText('2 of 9 packed');

    await firstCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 9 packed');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Backcountry Hot Springs & Geothermal Soaking Guide Journey', () => {
  test('navigates to /hot-springs, verifies headings, filters springs, calculates trip soaking plan, and updates packing checklist', async ({
    page,
  }) => {
    // 1. Navigate to /hot-springs
    await page.goto('/hot-springs');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      'Backcountry Hot Springs & Geothermal Guide | Contoso Outdoors'
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Hot Springs & Geothermal Soaking Guide',
    });
    await expect(h1).toBeVisible();

    // Verify all 5 hot springs initially present
    await expect(
      page.getByRole('heading', { level: 3, name: 'Scenic Hot Springs' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Goldmyer Hot Springs' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Bagby Hot Springs' })
    ).toBeVisible();

    // 3. Filter by "Rugged Backcountry" and verify Goldmyer Hot Springs is displayed while others are hidden
    const ruggedButton = page.getByRole('button', { name: /^Rugged Backcountry$/i });
    await ruggedButton.click();

    await expect(
      page.getByRole('heading', { level: 3, name: 'Goldmyer Hot Springs' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Scenic Hot Springs' })
    ).not.toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Bagby Hot Springs' })
    ).not.toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Travertine Hot Springs' })
    ).not.toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Kirkham Hot Springs' })
    ).not.toBeVisible();

    // Reset filter to All Springs
    const allSpringsButton = page.getByRole('button', { name: /^All Springs$/i });
    await allSpringsButton.click();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Scenic Hot Springs' })
    ).toBeVisible();

    // 4. Select Scenic Hot Springs in planner, adjust party size / duration, assert live status reflects calculated hydration
    const springSelect = page.getByLabel(/select hot spring/i);
    await springSelect.selectOption('scenic-hot-springs');

    const partySizeInput = page.getByLabel(/party size/i);
    await partySizeInput.fill('4');

    const durationInput = page.getByLabel(/soak duration/i);
    await durationInput.fill('60');

    const statusPanel = page.getByRole('status');
    await expect(statusPanel).toBeVisible();
    await expect(statusPanel).toContainText('Scenic Hot Springs');
    await expect(statusPanel).toContainText('30 min');
    await expect(statusPanel).toContainText('5.2 L');

    // 5. Interacts with the Ethics & Packing checklist and verifies progress counter updates
    const gearCounter = page.getByTestId('hot-springs-gear-counter');
    await expect(gearCounter).toHaveText('0 of 6 packed');

    const bootiesCheckbox = page.getByLabel(/Neoprene water booties/i);
    await expect(bootiesCheckbox).not.toBeChecked();
    await bootiesCheckbox.check();
    await expect(bootiesCheckbox).toBeChecked();
    await expect(gearCounter).toHaveText('1 of 6 packed');

    const towelCheckbox = page.getByLabel(/Fast-drying ultralight microfiber towel/i);
    await expect(towelCheckbox).not.toBeChecked();
    await towelCheckbox.check();
    await expect(towelCheckbox).toBeChecked();
    await expect(gearCounter).toHaveText('2 of 6 packed');

    // Uncheck booties and confirm decrement
    await bootiesCheckbox.uncheck();
    await expect(bootiesCheckbox).not.toBeChecked();
    await expect(gearCounter).toHaveText('1 of 6 packed');
  });
});

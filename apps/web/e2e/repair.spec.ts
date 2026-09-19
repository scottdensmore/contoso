import { test, expect } from '@playwright/test';

test.describe('Gear Maintenance & Repair Service Portal Journey', () => {
  test('navigates to repair portal, searches and filters services, configures estimate, submits intake, and reviews care guide', async ({
    page,
  }) => {
    // 1. Navigates to /repair
    await page.goto('/repair');

    // 2. Verifies page title and H1 "Gear Maintenance & Repair Services"
    await expect(page).toHaveTitle(/Gear Maintenance & Repair Services \| Contoso Outdoors/);
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Gear Maintenance & Repair Services',
    });
    await expect(h1).toBeVisible();

    // 3. Searches for "zipper" and filters services by category, verifying matching cards appear
    const searchInput = page.getByRole('searchbox', {
      name: /search repair services/i,
    });
    await searchInput.fill('zipper');

    // Matching services appear while non-matching winter tuning card is hidden
    await expect(page.getByTestId('service-card-tent-zipper-replacement')).toBeVisible();
    await expect(page.getByTestId('service-card-apparel-zipper-replacement')).toBeVisible();
    await expect(page.getByTestId('service-card-pack-zipper-restitch')).toBeVisible();
    await expect(page.getByTestId('service-card-winter-wax-edge-tune')).not.toBeVisible();

    // Filter by Tents & Shelters category
    const tentsTab = page.getByRole('button', { name: /^tents & shelters$/i });
    await tentsTab.click();
    await expect(page.getByTestId('service-card-tent-zipper-replacement')).toBeVisible();
    await expect(page.getByTestId('service-card-apparel-zipper-replacement')).not.toBeVisible();

    // Reset filters
    const allTab = page.getByRole('button', { name: /^all$/i });
    await allTab.click();
    await searchInput.fill('');

    // 4. Selects a repair service in the intake estimator
    await page.getByTestId('select-service-tent-zipper-replacement').click();
    const serviceSelect = page.getByRole('combobox', { name: /select repair service/i });
    await expect(serviceSelect).toHaveValue('tent-zipper-replacement');

    // 5. Toggles fulfillment method between in-store and mail-in, verifying price updates accordingly
    const inStoreRadio = page.getByRole('radio', { name: /in-store drop-off/i });
    const mailInRadio = page.getByRole('radio', { name: /prepaid mail-in box/i });

    await inStoreRadio.click();
    await expect(page.getByTestId('estimate-shipping-fee')).toHaveText('$0');
    await expect(page.getByTestId('estimate-total-price')).toHaveText('$25');

    await mailInRadio.click();
    await expect(page.getByTestId('estimate-shipping-fee')).toHaveText('$10');
    await expect(page.getByTestId('estimate-total-price')).toHaveText('$35');

    // 6. Submits the repair intake and asserts the confirmation banner with reference number appears
    await page.getByLabel(/customer name/i).fill('Jane Doe');
    await page.getByLabel(/customer email/i).fill('jane.doe@example.com');
    await page.getByLabel(/repair notes/i).fill('Zipper teeth split open near bottom stop on mountain trip.');
    await page.getByRole('button', { name: /submit repair request/i }).click();

    const banner = page.getByTestId('repair-confirmation-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Repair Request Submitted! Confirmation #REP-');
    await expect(banner).toContainText('Jane Doe');
    await expect(banner).toContainText('$35');

    // 7. Verifies the Warranty & Care Guide section displays preventative care tips
    await expect(
      page.getByRole('heading', { level: 2, name: 'Warranty & Preventative Care Guide' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Manufacturer Warranty Coverage vs. Tune-ups' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Eco-Friendly Maintenance & Gear Longevity' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /DWR Wash-In & Reactivation/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Proper Tent Drying to Prevent Mildew/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Zipper Cleaning & Lubrication/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Off-Season Down Sleeping Bag Storage/i })
    ).toBeVisible();
  });
});

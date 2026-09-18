import { test, expect } from '@playwright/test';

test.describe('Gear Rentals Booking Journey', () => {
  test('browses rental packages, filters by category, selects package, fills booking form, and verifies confirmation', async ({
    page,
  }) => {
    // 1. Navigate to /rentals
    await page.goto('/rentals');

    // 2. Verify page heading Gear Rentals & Outfitting
    const heading = page.getByRole('heading', {
      level: 1,
      name: 'Gear Rentals & Outfitting',
    });
    await expect(heading).toBeVisible();

    // 3. Filter packages by category
    const paddlingBtn = page.getByRole('button', { name: /^paddling$/i });
    await paddlingBtn.click();
    await expect(page.getByText('Touring Kayak & Paddle Set')).toBeVisible();
    await expect(page.getByText('4-Person Deluxe Camping Package')).not.toBeVisible();

    const campingBtn = page.getByRole('button', { name: /^camping$/i });
    await campingBtn.click();
    await expect(page.getByText('4-Person Deluxe Camping Package')).toBeVisible();
    await expect(page.getByText('Touring Kayak & Paddle Set')).not.toBeVisible();

    // 4. Select a package (e.g., "4-Person Deluxe Camping Package")
    const selectPackageBtn = page.getByRole('button', {
      name: /select package: 4-person deluxe camping package/i,
    });
    await selectPackageBtn.click();

    // 5. Fill in booking form: choose pickup store (e.g., Seattle Flagship), choose dates (3 days duration)
    const storeSelect = page.getByLabel(/pickup location/i);
    await storeSelect.selectOption({ label: 'Seattle Flagship' });

    const startDateInput = page.getByLabel(/start date/i);
    const endDateInput = page.getByLabel(/end date/i);

    await startDateInput.fill('2026-10-01');
    await endDateInput.fill('2026-10-03');

    // 6. Verify live pricing displays 10% discount and calculated total ($221)
    const livePricing = page.getByRole('status');
    await expect(livePricing).toBeVisible();
    await expect(livePricing).toContainText('10% multi-day discount applied');
    await expect(livePricing).toContainText('$221');

    // 7. Enter customer name, email, and phone, and submit reservation
    await page.getByLabel(/full name/i).fill('Alex Morgan');
    await page.getByLabel(/email address/i).fill('alex.morgan@example.com');
    await page.getByLabel(/phone number/i).fill('(206) 555-0199');

    const submitBtn = page.getByRole('button', { name: /confirm reservation/i });
    await submitBtn.click();

    // 8. Verify confirmation view shows reservation code RNT-, selected store, and pickup details
    await expect(page.getByText('Reservation Confirmed!')).toBeVisible();
    await expect(page.getByText(/RNT-\d{5}/)).toBeVisible();
    await expect(page.getByText('Seattle Flagship').first()).toBeVisible();
    await expect(page.getByText('Store Pickup Instructions:')).toBeVisible();
    await expect(page.getByRole('button', { name: /book another rental/i })).toBeVisible();
  });
});

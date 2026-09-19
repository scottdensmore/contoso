import { test, expect } from '@playwright/test';

test.describe('Backcountry Huts & Alpine Shelters Journey', () => {
  test('browses huts catalog, filters by difficulty, books bunks, verifies confirmation, and cancels reservation', async ({
    page,
  }) => {
    // 1. Navigate to /huts
    await page.goto('/huts');

    // 2. Assert page title and literal H1
    await expect(page).toHaveTitle(
      /Backcountry Huts & Alpine Shelters \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Huts & Alpine Shelters',
    });
    await expect(h1).toBeVisible();

    // 3. Filter huts by difficulty "Strenuous"
    const strenuousFilter = page.getByRole('button', { name: /^strenuous$/i });
    await strenuousFilter.click();

    await expect(page.getByText('Asgard Pass High Alpine Refuge')).toBeVisible();
    await expect(page.getByText('Red Mountain Backcountry Yurt')).toBeVisible();
    await expect(page.getByText('Mueller Ridge Backcountry Cabin')).not.toBeVisible();
    await expect(page.getByText('Cirque of the Towers Alpine Shelter')).not.toBeVisible();

    // 4. Click "Book Bunks" on "Asgard Pass High Alpine Refuge"
    const bookButtons = page.getByRole('button', { name: /book bunks/i });
    await bookButtons.first().click();

    // 5. In booking form, choose check-in date, set nights to 2, guests to 2
    await page.getByLabel(/check-in date/i).fill('2026-10-15');
    await page.getByLabel(/duration \(nights\)|nights/i).fill('2');
    await page.getByLabel(/guests \/ bunks|number of guests/i).fill('2');

    // 6. Assert live price displays "$180"
    const livePrice = page.getByTestId('live-quote-price');
    await expect(livePrice).toContainText('$180');

    // 7. Fill in guest name "Alex Honnold", email "alex@example.com", phone "555-0199", and submit booking
    await page.getByLabel(/lead guest name/i).fill('Alex Honnold');
    await page.getByLabel(/lead guest email/i).fill('alex@example.com');
    await page.getByLabel(/lead guest phone/i).fill('555-0199');

    const submitBtn = page.getByRole('button', {
      name: /confirm hut reservation/i,
    });
    await submitBtn.click();

    // 8. Assert reservation confirmation card appears with code HUT-, hut name, 2 bunks, and total $180
    await expect(page.getByText(/HUT-\d{5}/).first()).toBeVisible();
    await expect(page.getByText('Asgard Pass High Alpine Refuge').first()).toBeVisible();
    await expect(page.getByText('Alex Honnold')).toBeVisible();
    await expect(page.getByText(/2 bunks/i).first()).toBeVisible();
    await expect(page.getByText('$180').first()).toBeVisible();
    await expect(page.getByText('confirmed')).toBeVisible();

    // 9. Review mandatory gear and stewardship section
    const stewardshipHeading = page.getByRole('heading', {
      level: 2,
      name: /alpine hut guidelines & stewardship/i,
    });
    await expect(stewardshipHeading).toBeVisible();
    await expect(page.getByText(/pack-it-in/i).first()).toBeVisible();
    await expect(page.getByText(/21:00/i).first()).toBeVisible();
    await expect(page.getByText(/sleeping bag liner/i).first()).toBeVisible();

    // 10. Click "Cancel Reservation" and verify the reservation is cancelled/updated
    const cancelReservationBtn = page.getByRole('button', {
      name: /cancel reservation/i,
    });
    await cancelReservationBtn.click();

    await expect(page.getByText('cancelled')).toBeVisible();
    await expect(cancelReservationBtn).not.toBeVisible();
  });
});

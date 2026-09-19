import { test, expect } from '@playwright/test';

test.describe('Trailhead Shuttle & Backcountry Rideshare Journey', () => {
  test('browses routes, filters through-hike connectors, books shuttle reservation, posts carpool offer, and cancels reservation', async ({
    page,
  }) => {
    // 1. Navigate to /shuttles
    await page.goto('/shuttles');

    // 2. Assert page title and literal H1
    await expect(page).toHaveTitle(
      /Trailhead Shuttles & Backcountry Rideshare \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Trailhead Shuttles & Backcountry Rideshare',
    });
    await expect(h1).toBeVisible();

    // 3. Filter routes by "Through-Hike Connectors Only" and select "Enchantments Through-Hike Connector"
    const throughHikeCheckbox = page.getByLabel(/through-hike connectors only/i);
    await throughHikeCheckbox.check();

    await expect(page.getByText('Enchantments Through-Hike Connector')).toBeVisible();
    await expect(page.getByText('Mount Rainier Skyline & Paradise Shuttle')).not.toBeVisible();

    const bookButtons = page.getByRole('button', { name: /book shuttle/i });
    await bookButtons.first().click();

    // 4. In booking form, choose date, departure time (06:00 AM), set seats to 2
    await page.getByLabel(/departure date/i).first().fill('2026-10-05');
    await page.getByLabel(/departure time/i).selectOption('06:00 AM');
    await page.getByLabel(/number of seats/i).fill('2');

    // 5. Assert live price displays "$60"
    const quotePrice = page.getByTestId('live-quote-price');
    await expect(quotePrice).toContainText('$60');

    // 6. Fill in passenger name "Alex Honnold", email "alex@example.com", phone "555-0199", and submit booking
    await page.getByLabel(/passenger name/i).fill('Alex Honnold');
    await page.getByLabel(/passenger email/i).fill('alex@example.com');
    await page.getByLabel(/passenger phone/i).fill('555-0199');

    const submitBookingBtn = page.getByRole('button', {
      name: /confirm shuttle reservation/i,
    });
    await submitBookingBtn.click();

    // 7. Assert reservation confirmation card appears with code SHT-, route name, 2 seats, and total $60
    await expect(page.getByText(/SHT-\d{5}/).first()).toBeVisible();
    await expect(page.getByText('Alex Honnold')).toBeVisible();
    await expect(page.getByText(/2 seats/i).first()).toBeVisible();
    await expect(page.getByText('$60').first()).toBeVisible();
    await expect(page.getByText('confirmed')).toBeVisible();

    // 8. Navigate to Carpool section, submit a ride offer (Origin "Seattle", Destination "Snow Lakes Trailhead", 3 seats, Driver "Alex")
    await page.getByLabel(/origin city/i).fill('Seattle');
    await page.getByLabel(/destination trailhead/i).fill('Snow Lakes Trailhead');
    await page.getByLabel(/carpool date/i).fill('2026-10-12');
    await page.getByLabel(/seats available/i).fill('3');
    await page.getByLabel(/driver name/i).fill('Alex');
    await page.getByLabel(/driver contact/i).fill('555-0199');

    const postCarpoolBtn = page.getByRole('button', {
      name: /post carpool offer/i,
    });
    await postCarpoolBtn.click();

    // 9. Assert new ride offer appears on the Carpool Board
    await expect(page.getByText(/Alex \(555-0199\)/)).toBeVisible();
    await expect(page.getByText('Seattle → Snow Lakes Trailhead')).toBeVisible();

    // 10. Click "Cancel Reservation" on the booked shuttle and assert the reservation status updates or removes
    const cancelReservationBtn = page.getByRole('button', {
      name: /cancel reservation/i,
    });
    await cancelReservationBtn.click();

    await expect(page.getByText('cancelled')).toBeVisible();
    await expect(cancelReservationBtn).not.toBeVisible();
  });
});

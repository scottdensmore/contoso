import { test, expect } from '@playwright/test';

test.describe('Wilderness Safety Beacon Registry & Emergency Protocols Journey', () => {
  test('registers beacon, reviews SAR response card, performs check-in, explores protocols, and deregisters', async ({
    page,
  }) => {
    // 1. Navigate to /safety
    await page.goto('/safety');

    // 2. Expect page title and <h1>Wilderness Safety & Emergency Beacon Registry</h1>
    await expect(page).toHaveTitle(
      /Wilderness Safety & Emergency Beacon Registry \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Safety & Emergency Beacon Registry',
    });
    await expect(h1).toBeVisible();

    // 3. Fill in registration form
    const deviceSelect = page.getByLabel(/device type/i);
    await deviceSelect.selectOption('garmin_inreach');

    await page.getByLabel(/device imei/i).fill('300434061234560');
    await page.getByLabel(/owner name/i).fill('Alex Honnold');
    await page.getByLabel(/owner phone/i).fill('555-0199');
    await page.getByLabel(/emergency contact name/i).fill('Climbing Team');
    await page.getByLabel(/emergency contact phone/i).fill('555-0198');
    await page.getByLabel(/backcountry zone|trip backcountry zone/i).fill('Cascades - Mount Rainier');
    await page.getByLabel(/departure date/i).fill('2026-10-01');
    await page.getByLabel(/return date/i).fill('2026-10-05');

    // 4. Click "Register Beacon & Generate SAR Card"
    const registerBtn = page.getByRole('button', {
      name: /register beacon & generate sar card/i,
    });
    await registerBtn.click();

    // 5. Verify SAR card appears showing registration code SBR-, owner name, IMEI, and status badge ACTIVE_MONITORING
    await expect(page.getByText(/SBR-\d{5}/).first()).toBeVisible();
    await expect(page.getByText('Alex Honnold')).toBeVisible();
    await expect(page.getByText('300434061234560')).toBeVisible();
    await expect(page.getByText('ACTIVE_MONITORING')).toBeVisible();

    // 6. Click "Submit Status Check-in: OK"
    const checkinBtn = page.getByRole('button', {
      name: /submit status check-in: ok/i,
    });
    await checkinBtn.click();

    // 7. Verify badge updates to CHECKED_IN with recent check-in timestamp
    await expect(page.getByText('CHECKED_IN')).toBeVisible();
    await expect(page.getByText(/last check-in:/i)).toBeVisible();

    // 8. Switch to "Wilderness Emergency Field Protocols" section / tab (e.g. Hypothermia) and assert protocol steps and SAR signaling instructions are visible
    const hypothermiaTab = page.getByRole('tab', { name: /hypothermia/i });
    await hypothermiaTab.click();
    await expect(page.getByRole('heading', { level: 3, name: /Hypothermia & Cold Shock Protocol/i })).toBeVisible();
    await expect(page.getByText(/Primary Field Response Steps/i)).toBeVisible();
    await expect(page.getByText(/Search & Rescue \(SAR\) Signaling Instructions/i)).toBeVisible();
    await expect(page.getByText(/burrito/i)).toBeVisible();

    // 9. Click "Deregister Beacon" and assert the card is removed
    const deregisterBtn = page.getByRole('button', {
      name: /deregister beacon/i,
    });
    await deregisterBtn.click();

    await expect(page.getByText('Alex Honnold')).not.toBeVisible();
    await expect(page.getByText(/no active beacons registered/i)).toBeVisible();
  });
});

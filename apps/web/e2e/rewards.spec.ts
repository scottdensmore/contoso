import { test, expect } from '@playwright/test';
import { openProfileTab } from './support/session';

test.describe('Customer Loyalty Rewards Journey', () => {
  test('navigates to /profile/rewards, views tier status and points, redeems voucher, and verifies benefits table', async ({
    page,
  }) => {
    // 1. Authenticate user session
    await openProfileTab(page, 'General');

    // Reset rewards profile to default state for a clean test run
    await page.evaluate(() => {
      localStorage.removeItem('contoso_rewards_profile');
    });

    // 2. Navigate to /profile/rewards
    await page.goto('/profile/rewards');
    await expect(page).toHaveURL(/\/profile\/rewards$/);

    // 3. Verify page heading Loyalty Rewards & Member Perks
    const heading = page.getByRole('heading', {
      level: 1,
      name: 'Loyalty Rewards & Member Perks',
    });
    await expect(heading).toBeVisible();

    // 4. Verify tier badge "Pathfinder" and points balance (650 pts)
    const tierBadge = page.getByTestId('tier-badge');
    await expect(tierBadge).toBeVisible();
    await expect(tierBadge).toContainText('Pathfinder');

    const pointsBalance = page.getByTestId('points-balance');
    await expect(pointsBalance).toBeVisible();
    await expect(pointsBalance).toContainText('650');
    await expect(pointsBalance).toContainText('pts');

    // 5. Locate the "$10 Off Any Purchase" voucher (costs 200 pts) and click "Redeem Voucher"
    const voucherCard = page
      .locator('div')
      .filter({ hasText: '$10 Off Any Purchase' })
      .filter({ hasText: '200 pts' })
      .last();
    const redeemBtn = voucherCard.getByRole('button', { name: /redeem voucher/i });
    await expect(redeemBtn).toBeVisible();
    await expect(redeemBtn).toBeEnabled();
    await redeemBtn.click();

    // 6. Assert live message confirms redemption and promo code REWARD10 is displayed
    const liveRegion = page.locator('[role="status"][aria-live="polite"]');
    await expect(liveRegion).toBeVisible();
    await expect(liveRegion).toContainText(/successfully redeemed.*\$10 off any purchase/i);

    await expect(page.getByText('REWARD10')).toBeVisible();

    // 7. Assert points balance updates from 650 to 450 pts
    await expect(pointsBalance).toContainText('450');

    // 8. Verify the tier benefits comparison table is visible
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Member Tier Benefits' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /Trailblazer/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /Pathfinder/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /Summit Explorer/i })).toBeVisible();
  });
});

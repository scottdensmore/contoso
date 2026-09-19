import { test, expect } from '@playwright/test';

test.describe('Wilderness Permits & National Parks Pass Guide Journey', () => {
  test('navigates to permits advisor, searches lotteries, browses passes, checks readiness items, and verifies regulations', async ({
    page,
  }) => {
    // 1. Navigates to /permits
    await page.goto('/permits');

    // 2. Verifies page title and H1 "Wilderness Permits & National Parks Passes"
    await expect(page).toHaveTitle(/Wilderness Permits & National Parks Passes/);
    const heading = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Permits & National Parks Passes',
    });
    await expect(heading).toBeVisible();

    // 3. Uses search input to filter for "Enchantments" or "Whitney" and asserts matching lottery card is shown while others are filtered out
    const searchInput = page.getByRole('searchbox', {
      name: /search backcountry lotteries and passes/i,
    });
    await searchInput.fill('Whitney');
    await expect(page.getByRole('heading', { level: 3, name: 'Mount Whitney (Main Trail)' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'The Enchantments (Core Zone)' })).not.toBeVisible();

    // 4. Switches to the "Passes" tab/filter and verifies "America the Beautiful" pass card with $80 pricing and features
    const passesTab = page.getByRole('button', { name: /^passes$/i });
    await passesTab.click();
    await expect(page.getByRole('heading', { level: 3, name: 'America the Beautiful Annual Pass' })).toBeVisible();
    await expect(page.getByText('$80').first()).toBeVisible();
    await expect(
      page.getByText(/Access to over 2,000 federal recreation sites nationwide/i)
    ).toBeVisible();

    // 5. Switches to the "Trip Checklist" tab/filter, checks items in the Backcountry Readiness Checklist and asserts the completion count increases
    const checklistTab = page.getByRole('button', { name: /trip checklist/i });
    await checklistTab.click();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Backcountry Readiness Checklist' })
    ).toBeVisible();
    await expect(page.getByText('0 of 5 items completed')).toBeVisible();

    const checkboxes = page.getByRole('checkbox');
    await expect(checkboxes.first()).toBeVisible();

    await checkboxes.nth(0).check();
    await expect(page.getByText('1 of 5 items completed')).toBeVisible();

    await checkboxes.nth(1).check();
    await expect(page.getByText('2 of 5 items completed')).toBeVisible();

    await checkboxes.nth(2).check();
    await expect(page.getByText('3 of 5 items completed')).toBeVisible();

    // 6. Switches to "Regulations" tab/filter and verifies wilderness regulations section displays bear canister and campfire rules
    const regulationsTab = page.getByRole('button', { name: /^regulations$/i });
    await regulationsTab.click();
    await expect(
      page.getByRole('heading', { level: 2, name: 'Wilderness Regulations & Safety' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Bear-Resistant Food Canisters/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Interagency Grizzly Bear Committee \(IGBC\)/i)
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Campfire Bans/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Campfires are banned above designated subalpine elevations/i)
    ).toBeVisible();
  });
});

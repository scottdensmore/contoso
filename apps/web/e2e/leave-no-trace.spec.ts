import { test, expect } from '@playwright/test';

test.describe('Leave No Trace & Wilderness Waste Regulations Advisor Journey', () => {
  test('navigates to /leave-no-trace, views principles, evaluates waste regulations, updates supplies, and interacts with checklist', async ({
    page,
  }) => {
    // 1. Navigates to /leave-no-trace
    await page.goto('/leave-no-trace');

    // 2. Verifies page title and literal H1 "Leave No Trace & Wilderness Waste Regulations"
    await expect(page).toHaveTitle(
      /Leave No Trace & Wilderness Waste Regulations \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Leave No Trace & Wilderness Waste Regulations',
    });
    await expect(h1).toBeVisible();

    // 3. Selects / views the "Dispose of Waste Properly" principle card
    const disposeCard = page.getByTestId('lnt-principle-card-dispose-waste');
    await expect(disposeCard).toBeVisible();
    await disposeCard.click();
    await expect(
      page.getByText(/Always pack out toilet paper, wet wipes, and feminine hygiene supplies/i)
    ).toBeVisible();

    // 4. Selects "Enchantments Core Alpine Zone" from the zone selector and verifies the "WAG BAG PACK-OUT REQUIRED" badge and "BEAR CANISTER MANDATORY" rule appear
    const zoneSelect = page.getByLabel(/select wilderness zone/i);
    await zoneSelect.selectOption('enchantments-core');

    const statusPanel = page.getByRole('status');
    await expect(statusPanel).toContainText('WAG BAG PACK-OUT REQUIRED');
    await expect(statusPanel).toContainText('BEAR CANISTER MANDATORY');

    // 5. Changes party size to 4 and duration to 4 days, asserting that WAG bags calculation updates to 32 bags (4 * 4 * 2)
    const groupInput = page.getByLabel(/group size/i);
    const durationInput = page.getByLabel(/stay duration/i);

    await groupInput.fill('4');
    await durationInput.fill('4');

    const wagCount = page.getByTestId('supply-wag-bags-count');
    await expect(wagCount).toHaveText('32');

    // 6. Interacts with the Pack-It-Out checklist items
    const wagCheckbox = page.getByLabel(/WAG Bags/i);
    await expect(wagCheckbox).not.toBeChecked();
    await wagCheckbox.check();
    await expect(wagCheckbox).toBeChecked();

    const trowelCheckbox = page.getByLabel(/Backcountry Trowel/i);
    await expect(trowelCheckbox).not.toBeChecked();
    await trowelCheckbox.check();
    await expect(trowelCheckbox).toBeChecked();

    const odorCheckbox = page.getByLabel(/Odor-Proof Barrier Bags/i);
    await expect(odorCheckbox).not.toBeChecked();
    await odorCheckbox.check();
    await expect(odorCheckbox).toBeChecked();
  });
});

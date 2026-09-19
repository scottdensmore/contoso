import { test, expect } from '@playwright/test';

test.describe('Backcountry Campfire Regulations & Fire Danger Safety Advisor Journey', () => {
  test('navigates to /fire-safety, verifies headings, filters zones, checks stove compliance, submits hazard report, and verifies LNT guidelines', async ({
    page,
  }) => {
    // 1. Navigate to /fire-safety
    await page.goto('/fire-safety');

    // 2. Verify page title and literal H1 "Backcountry Campfire Regulations & Fire Danger Advisor"
    await expect(page).toHaveTitle(
      /Backcountry Campfire Regulations & Fire Danger \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Campfire Regulations & Fire Danger Advisor',
    });
    await expect(h1).toBeVisible();

    // 3. Filter zones by region or danger level
    const zonesList = page.getByTestId('fire-zones-list');
    await expect(zonesList).toContainText('Alpine Lakes Wilderness');
    await expect(zonesList).toContainText('Olympic National Park Backcountry');

    const cascadesPill = page.getByRole('button', { name: /^Cascades/i });
    await cascadesPill.click();

    await expect(zonesList).toContainText('Alpine Lakes Wilderness');
    await expect(zonesList).toContainText('Mount Baker-Snoqualmie');
    await expect(zonesList).not.toContainText('Olympic National Park Backcountry');

    const allPill = page.getByRole('button', { name: /^All Regions/i });
    await allPill.click();
    await expect(zonesList).toContainText('Olympic National Park Backcountry');

    // 4. Test the Stove Compliance Checker for Alpine Lakes Wilderness with alcohol stove and canister stove
    const zoneSelect = page.getByLabel(/select wilderness zone/i);
    const stoveSelect = page.getByLabel(/select stove or flame type/i);
    const stoveResult = page.getByTestId('stove-check-result');

    await zoneSelect.selectOption('alpine-lakes-wilderness');
    await stoveSelect.selectOption('alcohol_stove');

    await expect(stoveResult).toContainText('PROHIBITED');
    await expect(stoveResult).toContainText('prohibited');

    await stoveSelect.selectOption('canister_with_shutoff');
    await expect(stoveResult).toContainText('PERMITTED');
    await expect(stoveResult).toContainText('permitted');

    // 5. Submit a wildfire / smoke sighting report and assert confirmation banner with FIR- ID is displayed
    const reportZoneSelect = page.getByLabel(/incident zone/i);
    const reportTypeSelect = page.getByLabel(/hazard report type/i);
    const locationInput = page.getByLabel(/specific location description/i);
    const submitBtn = page.getByRole('button', { name: /submit hazard report/i });

    await reportZoneSelect.selectOption('alpine-lakes-wilderness');
    await reportTypeSelect.selectOption('smoke_sighting');
    await locationInput.fill('Smoke visible above ridge near Lake Stuart trail');
    await submitBtn.click();

    const statusBanner = page.getByRole('status');
    await expect(statusBanner).toBeVisible();
    await expect(statusBanner).toContainText('Report Submitted Successfully');
    await expect(statusBanner).toContainText('FIR-');

    const reportsFeed = page.getByTestId('recent-reports-feed');
    await expect(reportsFeed).toContainText('FIR-');
    await expect(reportsFeed).toContainText('Smoke visible above ridge near Lake Stuart trail');

    // 6. Assert Leave No Trace fire rules section is visible
    const lntHeading = page.getByRole('heading', {
      level: 2,
      name: /Leave No Trace Campfire Guidelines & Etiquette/i,
    });
    await expect(lntHeading).toBeVisible();
    await expect(page.getByText(/Drown-Stir-Feel Cold Test/i)).toBeVisible();
    await expect(page.getByText(/Wrist-Thick Rule/i)).toBeVisible();
    await expect(page.getByText(/Mound Fire Technique/i)).toBeVisible();
    await expect(page.getByText(/Campfire Permit Requirements/i)).toBeVisible();
  });
});

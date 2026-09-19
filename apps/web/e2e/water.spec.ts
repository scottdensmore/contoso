import { test, expect } from '@playwright/test';

test.describe('Backcountry Water Sources & Filtration Advisor Journey', () => {
  test('navigates to /water, filters by reliability, calculates hydration, submits field condition report, and reviews guide', async ({
    page,
  }) => {
    // 1. Navigate to /water
    await page.goto('/water');

    // 2. Assert page title and literal H1 Backcountry Water Sources & Filtration Advisor
    await expect(page).toHaveTitle(
      /Backcountry Water Sources & Filtration Advisor \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Water Sources & Filtration Advisor',
    });
    await expect(h1).toBeVisible();

    // 3. Filter water sources by reliability "Year-round"
    const reliabilityFilter = page.getByLabel(/filter by reliability/i);
    await reliabilityFilter.selectOption('Year-round');

    const sourcesList = page.getByTestId('water-sources-list');
    await expect(sourcesList).toContainText('Colchuck Creek Footbridge Crossing');
    await expect(sourcesList).not.toContainText('Asgard Pass Mid-Slope Melt Cascades');

    // 4. In Hydration Calculator, adjust distance to 10 miles and temperature to 80°F -> assert calculated liters update
    const litersDisplay = page.getByTestId('calculated-liters');
    const initialLiters = await litersDisplay.innerText();

    const distanceInput = page.getByLabel(/distance \(miles\)/i);
    await distanceInput.fill('10');

    const tempInput = page.getByLabel(/temperature \(°f\)/i);
    await tempInput.fill('80');

    await expect(litersDisplay).not.toHaveText(initialLiters);
    const updatedLiters = Number(await litersDisplay.innerText());
    expect(updatedLiters).toBeGreaterThan(Number(initialLiters));

    // 5. Click "Report Condition" on "Colchuck Creek Footbridge Crossing"
    const reportConditionBtn = page.getByRole('button', {
      name: /report condition for colchuck creek/i,
    });
    await reportConditionBtn.click();

    // Verify source is selected in report form
    const sourceSelect = page.getByLabel(/select water source/i);
    await expect(sourceSelect).toHaveValue('colchuck-creek');

    // 6. Fill in reporter name "Alex Honnold", flow status "Flowing Strong", notes "Clean and cold fast flow"
    await page.getByLabel(/reporter name/i).fill('Alex Honnold');
    await page.getByLabel(/flow status/i).selectOption('Flowing Strong');
    await page.getByLabel(/field notes/i).fill('Clean and cold fast flow');

    // 7. Submit report
    const submitBtn = page.getByRole('button', {
      name: /submit water condition report/i,
    });
    await submitBtn.click();

    // 8. Assert report confirmation appears with code WTR- in recent reports feed
    await expect(page.getByText(/report submitted successfully/i)).toBeVisible();
    const reportsFeed = page.getByTestId('recent-reports-feed');
    await expect(reportsFeed).toContainText('WTR-');
    await expect(reportsFeed).toContainText('Alex Honnold');
    await expect(reportsFeed).toContainText('Clean and cold fast flow');

    // 9. Verify pathogen and filtration guide section is visible
    const guideHeading = page.getByRole('heading', {
      level: 2,
      name: 'Filtration & Pathogen Treatment Guide',
    });
    await expect(guideHeading).toBeVisible();
    await expect(page.getByText('Giardia lamblia')).toBeVisible();
    await expect(page.getByText('Cryptosporidium parvum')).toBeVisible();
  });
});

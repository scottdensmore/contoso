import { test, expect } from '@playwright/test';

test.describe('Glacier Mountaineering & Crevasse Rescue Guide Journey', () => {
  test('navigates to /mountaineering, verifies headings, filters routes by grade, calculates rope team spacing, and tracks gear', async ({
    page,
  }) => {
    // 1. Navigate to /mountaineering
    await page.goto('/mountaineering');

    // 2. Verify page title and literal H1 "Glacier Mountaineering & Crevasse Rescue Guide"
    await expect(page).toHaveTitle(
      /Glacier Mountaineering & Crevasse Rescue Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Glacier Mountaineering & Crevasse Rescue Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Grade III" and verify Mt. Rainier Disappointment Cleaver is displayed while others are hidden
    const grade3FilterBtn = page.getByRole('button', { name: /^Grade III$/i });
    await grade3FilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: 'Disappointment Cleaver' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Coleman-Deming Glacier' })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Blue Glacier via Hoh River' })
    ).toBeHidden();

    // Reset filter to All Routes
    const allFilterBtn = page.getByRole('button', { name: /^All Routes$/i });
    await allFilterBtn.click();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Coleman-Deming Glacier' })
    ).toBeVisible();

    // 4. Select Mt. Baker Coleman-Deming in calculator, adjust team size and snowpack, and assert live status reflects rope spacing and brake knots
    const routeSelect = page.getByLabel('Select Glaciated Route');
    await routeSelect.selectOption('baker-coleman-deming');

    const teamSizeInput = page.getByLabel('Team Members Count (2-5)');
    await teamSizeInput.fill('2');

    const snowpackSelect = page.getByLabel('Snowpack Firmness & Consistency');
    await snowpackSelect.selectOption('soft_wet_spring');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText('16m');
    await expect(liveStatus).toContainText('Brake Knots: Required');
    await expect(liveStatus).toContainText('Mount Baker — Coleman-Deming Glacier');

    // 5. Interact with the Technical Glacier checklist and verify mountaineering-gear-counter updates
    const counter = page.getByTestId('mountaineering-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const iceAxeCheckbox = page.getByLabel(/CE\/UIAA certified steel pick and adze mountaineering ice axe/i);
    await iceAxeCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const cramponsCheckbox = page.getByLabel(/10-to-12 point tempered steel mountaineering crampons/i);
    await cramponsCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await iceAxeCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});

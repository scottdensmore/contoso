import { test, expect } from '@playwright/test';

test.describe('Contoso Re-Gear Used Gear Trade-In Portal Journey', () => {
  test('evaluates gear trade-in valuation, submits intake request, and explores accepted brands and FAQs', async ({
    page,
  }) => {
    // 1. Navigates to /trade-in
    await page.goto('/trade-in');

    // 2. Verifies page title and H1 "Contoso Re-Gear: Used Gear Trade-in & Resale"
    await expect(page).toHaveTitle(
      /Contoso Re-Gear: Used Gear Trade-in & Resale \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Contoso Re-Gear: Used Gear Trade-in & Resale',
    });
    await expect(h1).toBeVisible();

    // 3. Selects "Tents & Shelters", enters $400 MSRP, and selects "Excellent" condition
    const categorySelect = page.getByRole('combobox', { name: /select category/i });
    await categorySelect.selectOption('Tents & Shelters');

    const msrpInput = page.getByRole('spinbutton', { name: /estimated original msrp/i });
    await msrpInput.fill('400');

    const excellentRadio = page.getByRole('radio', { name: /excellent/i });
    await excellentRadio.click();

    // 4. Verifies instant calculation displays "$200" credit
    const creditDisplay = page.getByTestId('trade-in-credit-amount');
    await expect(creditDisplay).toContainText('$200');

    const co2Display = page.getByTestId('trade-in-co2-amount');
    await expect(co2Display).toContainText('15 kg CO2 avoided');

    // 5. Changes condition to "Very Good" and verifies calculation updates to "$160" credit
    const veryGoodRadio = page.getByRole('radio', { name: /very good/i });
    await veryGoodRadio.click();
    await expect(creditDisplay).toContainText('$160');
    await expect(co2Display).toContainText('15 kg CO2 avoided');

    // 6. Fills out the intake form, selects "Free prepaid mail-in kit", and submits
    await page.getByLabel(/clean, odor-free/i).check();
    await page.getByLabel(/functional zippers/i).check();
    await page.getByLabel(/no structural tears/i).check();

    const mailInRadio = page.getByRole('radio', { name: /free prepaid mail-in kit/i });
    await mailInRadio.click();

    await page.getByLabel(/customer name/i).fill('Alex Morgan');
    await page.getByLabel(/customer email/i).fill('alex.morgan@example.com');

    const submitBtn = page.getByRole('button', { name: /submit trade-in request/i });
    await submitBtn.click();

    // 7. Asserts the confirmation banner with reference `#TIN-` appears
    const confirmationBanner = page.getByTestId('trade-in-confirmation-banner');
    await expect(confirmationBanner).toBeVisible();
    await expect(confirmationBanner).toContainText('#TIN-');
    await expect(confirmationBanner).toContainText('Alex Morgan');
    await expect(confirmationBanner).toContainText('$160');

    // 8. Verifies the Re-Gear FAQs and accepted brands section are visible
    await expect(
      page.getByRole('heading', { level: 2, name: 'Eligible Brands & Tier Standards' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Contoso Outdoors' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Partner Technical Brands' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: "Arc'teryx" })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { level: 2, name: 'Program FAQ & Acceptance Guidelines' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Accepted Gear & Condition Criteria/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Inspection & Appraisal Process/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Trade-In Credit vs\. Repair Services/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /What Happens to Unaccepted Gear\?/i })
    ).toBeVisible();
  });
});

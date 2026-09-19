import { test, expect } from '@playwright/test';

test.describe('Guided Outdoor Adventures & Skills Clinics Journey', () => {
  test('browses adventures, filters by search and category, configures booking with gear rental, submits intake, and views guide certifications', async ({
    page,
  }) => {
    // 1. Navigate to /adventures
    await page.goto('/adventures');

    // 2. Verifies page title and H1 "Guided Outdoor Adventures & Skills Clinics"
    await expect(page).toHaveTitle(/Guided Outdoor Adventures & Skills Clinics \| Contoso Outdoors/);
    const h1Heading = page.getByRole('heading', {
      level: 1,
      name: 'Guided Outdoor Adventures & Skills Clinics',
    });
    await expect(h1Heading).toBeVisible();

    // 3. Searches for "Climbing" or "Glacier" and filters adventures by category
    const searchInput = page.getByRole('searchbox', { name: /search adventures/i });
    await searchInput.fill('Glacier');
    await expect(
      page.getByRole('heading', { level: 3, name: 'Alpine Mountaineering & Glacier Travel' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Introduction to Outdoor Rock Climbing' })
    ).not.toBeVisible();

    // Clear search and filter by category
    const clearSearchBtn = page.getByRole('button', { name: /clear search query/i });
    await clearSearchBtn.click();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Introduction to Outdoor Rock Climbing' })
    ).toBeVisible();

    const rockClimbingTab = page.getByRole('button', { name: /^Rock Climbing$/i });
    await rockClimbingTab.click();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Introduction to Outdoor Rock Climbing' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Alpine Mountaineering & Glacier Travel' })
    ).not.toBeVisible();

    // 4. Selects a clinic (e.g., "Introduction to Outdoor Rock Climbing") in the booking intake
    const selectTourBtn = page.getByRole('button', {
      name: /Book Adventure: Introduction to Outdoor Rock Climbing/i,
    });
    await selectTourBtn.click();

    const tourSelect = page.getByLabel(/Selected Adventure \/ Clinic/i);
    await expect(tourSelect).toHaveValue('intro-rock-climbing-smith-rock');

    // 5. Changes participants count and toggles gear rental, verifying price calculation updates ($175 -> $350 + $70 = $420)
    const participantsSelect = page.getByLabel(/Number of Participants/i);
    await participantsSelect.selectOption('2');

    // Initially without gear: 2 * 175 = 350
    await expect(page.getByTestId('base-total-price')).toContainText('$350');
    await expect(page.getByTestId('total-price')).toContainText('$350');

    // Toggle gear rental package: 2 * 35 = 70; total = 420
    const gearCheckbox = page.getByLabel(/Include Contoso Technical Gear Rental Package/i);
    await gearCheckbox.check();

    await expect(page.getByTestId('gear-rental-total')).toContainText('$70');
    await expect(page.getByTestId('total-price')).toContainText('$420');

    // 6. Submits the booking request and asserts the confirmation banner with reference #ADV- appears
    await page.getByLabel(/Lead Participant Full Name/i).fill('Jamie Rivera');
    await page.getByLabel(/Contact Email Address/i).fill('jamie.rivera@example.com');
    await page
      .getByLabel(/Emergency Contact & Medical Notes/i)
      .fill('Emergency: Jordan Rivera (555) 345-6789. No known medical conditions.');

    const submitBtn = page.getByRole('button', { name: /Submit Adventure Booking Request/i });
    await submitBtn.click();

    const confirmationBanner = page.getByTestId('booking-confirmation-banner');
    await expect(confirmationBanner).toBeVisible();
    await expect(confirmationBanner).toContainText('Booking Request Received!');
    await expect(confirmationBanner).toContainText(/#ADV-\d+/);

    // 7. Verifies the Certified Guide Directory section displays guide certifications (AMGA, WFR)
    const guidesSectionHeading = page.getByRole('heading', {
      level: 2,
      name: 'Certified Lead Guide Directory',
    });
    await expect(guidesSectionHeading).toBeVisible();
    await expect(page.getByText('AMGA Certified Alpine Guide')).toBeVisible();
    await expect(page.getByText('AMGA Rock Guide')).toBeVisible();
    await expect(page.getByText('WFR').first()).toBeVisible();
  });
});

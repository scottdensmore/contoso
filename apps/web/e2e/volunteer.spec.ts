import { test, expect } from '@playwright/test';

test.describe('Trail Volunteer & Backcountry Stewardship Workparty Journey', () => {
  test('navigates to /volunteer, filters workparties, registers for crew with safety waiver, verifies confirmation and impact metrics, and cancels registration', async ({
    page,
  }) => {
    // 1. Navigate to /volunteer
    await page.goto('/volunteer');

    // 2. Assert page title and literal H1 "Trail Volunteer & Stewardship Workparties"
    await expect(page).toHaveTitle(
      /Trail Volunteer & Stewardship Workparties \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Trail Volunteer & Stewardship Workparties',
    });
    await expect(h1).toBeVisible();

    // 3. Filter workparties by difficulty "Strenuous"
    const difficultyFilter = page.getByLabel(/filter by difficulty/i);
    await difficultyFilter.selectOption('Strenuous');

    // 4. Click "Join Crew" on "Mailbox Peak Drainage & Turnpike Restoration"
    const joinCrewBtn = page.getByRole('button', {
      name: /join crew: mailbox peak drainage & turnpike restoration/i,
    });
    await joinCrewBtn.click();

    // 5. Fill in volunteer details and check safety waiver
    await page.getByLabel(/volunteer full name/i).fill('Alex Honnold');
    await page.getByLabel(/volunteer email/i).fill('alex@example.com');
    await page.getByLabel(/volunteer phone/i).fill('555-0199');
    await page.getByLabel(/emergency contact name/i).fill('Climbing Team');
    await page.getByLabel(/emergency contact phone/i).fill('555-0198');
    await page.getByLabel(/safety waiver/i).check();

    // 6. Submit registration
    const submitBtn = page.getByRole('button', {
      name: /complete volunteer registration/i,
    });
    await submitBtn.click();

    // 7. Assert registration confirmation card appears with code VOL-, project title, and confirmed status
    await expect(page.getByText(/VOL-\d{5}/).first()).toBeVisible();
    await expect(
      page.getByText('Mailbox Peak Drainage & Turnpike Restoration').first()
    ).toBeVisible();
    await expect(page.getByText('Alex Honnold').first()).toBeVisible();
    await expect(page.getByText('Confirmed').first()).toBeVisible();

    // 8. Assert stewardship impact dashboard is visible
    const impactHeading = page.getByRole('heading', {
      level: 2,
      name: /Community Stewardship Impact/i,
    });
    await expect(impactHeading).toBeVisible();
    await expect(page.getByText(/4,280\+/)).toBeVisible();
    await expect(page.getByText('342')).toBeVisible();

    // 9. Click "Cancel Registration" and assert registration is cancelled/removed
    const cancelBtn = page.getByRole('button', {
      name: /cancel registration/i,
    });
    await cancelBtn.click();

    await expect(page.getByText('Cancelled').first()).toBeVisible();
  });
});

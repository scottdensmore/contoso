import { test, expect } from '@playwright/test';

test.describe('FAQ Search Journey', () => {
  test('navigates to /faq, filters by category, searches, expands accordions, uses expand all, and handles empty states', async ({
    page,
  }) => {
    // 1. Navigation to /faq and verifying heading
    await page.goto('/faq');
    const heading = page.getByRole('heading', { level: 1, name: /help center & faq/i });
    await expect(heading).toBeVisible();

    // Verify search input is present
    const searchInput = page.getByRole('searchbox', { name: /search faq/i });
    await expect(searchInput).toBeVisible();

    // 2. Filtering by category pill (e.g. "Returns & Refunds") and verifying filtered items
    const categoryGroup = page.getByRole('group', { name: /filter faq by category/i });
    const returnsPill = categoryGroup.getByRole('button', { name: /returns & refunds/i });
    await expect(returnsPill).toBeVisible();
    await returnsPill.click();
    await expect(returnsPill).toHaveAttribute('aria-pressed', 'true');

    // Verify filtered items appear and other categories do not
    await expect(page.getByRole('button', { name: /what is your return policy\?/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /how do i return an item\?/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /when will i get my refund\?/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /how long will it take to receive my order\?/i })).not.toBeVisible();

    // Reset back to All category
    const allPill = categoryGroup.getByRole('button', { name: /^all/i });
    await allPill.click();
    await expect(allPill).toHaveAttribute('aria-pressed', 'true');

    // 3. Typing a query (e.g. "track") in the search box and verifying matching questions appear
    await searchInput.fill('track');
    const trackQuestion = page.getByRole('button', { name: /how can i track my order\?/i });
    await expect(trackQuestion).toBeVisible();
    await expect(page.getByRole('button', { name: /what is your return policy\?/i })).not.toBeVisible();

    // 4. Clicking on an accordion question to expand and verify answer text is visible
    await expect(trackQuestion).toHaveAttribute('aria-expanded', 'false');
    await trackQuestion.click();
    await expect(trackQuestion).toHaveAttribute('aria-expanded', 'true');

    // Verify answer text and link
    await expect(page.getByText(/carrier tracking details/i)).toBeVisible();
    const trackLink = page.getByRole('link', { name: /track your order online/i });
    await expect(trackLink).toBeVisible();
    await expect(trackLink).toHaveAttribute('href', '/track');

    // 5. Clicking "Expand All" and verifying multiple answers are revealed
    // Clear search query first to show all questions
    const clearInputBtn = page.getByRole('button', { name: /clear search input/i });
    await clearInputBtn.click();
    await expect(searchInput).toHaveValue('');

    const expandAllBtn = page.getByRole('button', { name: /expand all/i });
    await expect(expandAllBtn).toBeVisible();
    await expandAllBtn.click();
    await expect(page.getByRole('button', { name: /collapse all/i })).toBeVisible();

    // Verify multiple answers across categories are revealed
    await expect(page.getByText(/standard shipping typically takes 3-5 business days/i)).toBeVisible();
    await expect(page.getByText(/we offer a 30-day return policy/i)).toBeVisible();
    await expect(page.getByText(/limited lifetime warranty/i)).toBeVisible();

    // 6. Searching for an unknown query ("xyznonsense123") and verifying empty state alert and "Contact Support" link
    await searchInput.fill('xyznonsense123');
    await expect(page.getByText(/no questions found matching 'xyznonsense123'/i)).toBeVisible();
    const emptyContactLink = page.getByRole('link', { name: /contact support/i }).first();
    await expect(emptyContactLink).toBeVisible();
    await expect(emptyContactLink).toHaveAttribute('href', '/contact');
  });
});

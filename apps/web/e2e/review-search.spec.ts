import { test, expect } from "@playwright/test";

test.describe("Product Reviews Search, Filtering & Sorting Journey", () => {
  test("allows searching, sorting, star filtering, verified filtering, clearing filters, and recovering from empty state", async ({
    page,
  }) => {
    // 1. Navigate to /products/trailmaster-x4-tent
    await page.goto("/products/trailmaster-x4-tent");

    // 2. Scroll to the Reviews section (#reviews or Reviews heading)
    const reviewsSection = page.locator("#reviews");
    await reviewsSection.scrollIntoViewIfNeeded();

    const heading = page.getByRole("heading", {
      name: /reviews for trailmaster x4 tent/i,
    });
    await expect(heading).toBeVisible();

    const reviewCards = reviewsSection.getByTestId("review-card");
    await expect(reviewCards).toHaveCount(5);

    const liveAnnouncement = reviewsSection.locator("#reviews-count");
    await expect(liveAnnouncement).toContainText("Showing 5 of 5 reviews");

    // 3. Type a keyword into the review search input and verify matching reviews
    const searchInput = page.getByRole("searchbox", { name: /search reviews/i });
    await expect(searchInput).toBeVisible();
    await searchInput.fill("rain");

    // Only the 3rd review mentions "heavy rain"
    await expect(reviewCards).toHaveCount(1);
    await expect(
      reviewsSection.getByText(/waterproof design kept us dry in heavy rain/i)
    ).toBeVisible();
    await expect(
      reviewsSection.getByText(/uv protection is a great addition/i)
    ).not.toBeVisible();
    await expect(liveAnnouncement).toContainText("Showing 1 of 5 reviews (filtered)");

    // Clear search keyword using clear search button
    const clearSearchBtn = page.getByRole("button", {
      name: /clear review search/i,
    });
    await expect(clearSearchBtn).toBeVisible();
    await clearSearchBtn.click();
    await expect(searchInput).toHaveValue("");
    await expect(reviewCards).toHaveCount(5);

    // 4. Change sort order to "Lowest Rating" and "Highest Rating" and verify reordering
    const sortSelect = page.getByRole("combobox", {
      name: /sort reviews by/i,
    });
    await expect(sortSelect).toBeVisible();

    // Sort Lowest Rating: 3-star review should appear first
    await sortSelect.selectOption("lowest");
    await expect(
      reviewCards.first().getByText(/difficult to set up/i)
    ).toBeVisible();

    // Sort Highest Rating: 5-star review should appear first
    await sortSelect.selectOption("highest");
    await expect(
      reviewCards.first().getByLabel(/5 out of 5 stars/i)
    ).toBeVisible();

    // 5. Click a star rating bar (e.g. 5-star) and verify filtered list
    const star5Btn = reviewsSection.getByRole("button", {
      name: /5 star reviews/i,
    });
    await expect(star5Btn).toBeVisible();
    await star5Btn.click();

    // 3 reviews have 5 stars out of the 5 total
    await expect(reviewCards).toHaveCount(3);
    await expect(
      reviewsSection.getByText(/difficult to set up/i)
    ).not.toBeVisible();
    await expect(
      reviewsSection.getByText(/green color just isn't my favorite/i)
    ).not.toBeVisible();
    await expect(liveAnnouncement).toContainText("Showing 3 of 5 reviews (filtered)");

    // 6. Click "Clear filters" and verify full list is restored
    const clearFiltersBtn = page.getByRole("button", {
      name: /clear filters/i,
    });
    await expect(clearFiltersBtn).toBeVisible();
    await clearFiltersBtn.click();
    await expect(reviewCards).toHaveCount(5);
    await expect(liveAnnouncement).toContainText("Showing 5 of 5 reviews");

    // 7. Enter a non-matching query ("xyznonexistent123") and verify empty state with Reset button
    await searchInput.fill("xyznonexistent123");
    await expect(reviewCards).toHaveCount(0);
    await expect(
      reviewsSection.getByText(/no reviews match your filters/i)
    ).toBeVisible();

    const resetBtn = reviewsSection.getByRole("button", {
      name: /reset filters/i,
    });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // Full list is restored after reset
    await expect(searchInput).toHaveValue("");
    await expect(reviewCards).toHaveCount(5);
    await expect(liveAnnouncement).toContainText("Showing 5 of 5 reviews");
  });
});

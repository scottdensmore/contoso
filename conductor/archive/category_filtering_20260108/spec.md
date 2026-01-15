# Specification: Category-based Product Filtering

## Overview
Implement a dedicated page for displaying products filtered by category. This enhances the navigation experience by allowing users to drill down into specific product types from the sidebar or other links.

## Functional Requirements
- **URL Structure:**
    - Use a dedicated route: `/products/category/[slug]`.
- **Page Content:**
    - Display the **Category Title** prominently.
    - Display the **Category Description** to provide context.
    - List all products belonging to that category using the existing product card design.
- **Error Handling:**
    - If a category slug is invalid (does not exist in the database), return a **404 Not Found** status and page.
- **Filtering:**
    - Initial version supports filtering *only* by the main category path.
    - Further filtering (brand, price) is out of scope for this MVP.

## Technical Requirements
- **Frontend:** Next.js App Router page at `src/app/products/category/[slug]/page.tsx`.
- **Backend:** 
    - Reuse `src/lib/categories.ts` logic or create new `src/lib/products.ts` functions to fetch products by category slug.
    - Ensure Prisma queries include the necessary relations (e.g., `products`).
- **Components:** Reuse the existing `Block` and product display logic from `src/app/page.tsx` where possible to maintain consistency.

## Acceptance Criteria
- Navigating to `/products/category/hiking` (or valid slug) displays only hiking products.
- The page shows the correct category name and description.
- Navigating to an invalid category URL shows a 404 page.
- Product cards look consistent with the homepage.

## Out of Scope
- Advanced filtering (price range, brand selection) on the category page.
- Sorting options (e.g., "Price: Low to High").
- Pagination (assuming small product catalog for now).

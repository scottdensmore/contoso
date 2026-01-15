# Specification: About Page Implementation

## Overview
Create a dedicated "About Us" page for Contoso Outdoors. This page will communicate the company's mission and story to customers, using a rich media layout consistent with the site's aesthetic.

## Functional Requirements
- **Route:** Implement the page at `/about`.
- **Content Sections:**
    - **Hero Banner:** A visually engaging header with the company name.
    - **Our Mission:** A section dedicated to the company's purpose and values.
    - **Our Story:** A narrative about how Contoso Outdoors began and its commitment to quality.
- **Visual Design:** Use the existing `Block` component and Tailwind CSS to create a modern, sleek layout with images and styled text blocks.
- **Navigation:** Ensure the existing "About Us" link in the sidebar leads to this new page.

## Technical Requirements
- **Frontend:** Next.js App Router page at `src/app/about/page.tsx`.
- **Components:** Reuse `Block`, `Header`, and standard Tailwind patterns for consistency.
- **Copy:** Craft compelling copy that aligns with the "outdoor enthusiast" and "high-performance gear" themes defined in `product.md`.

## Acceptance Criteria
- Navigating to `/about` displays the correctly styled page.
- The page contains "Our Mission" and "Our Story" sections.
- Visual elements (images, banners) are present and responsive.
- The link in the sidebar correctly navigates to `/about`.

## Out of Scope
- Dynamic team profiles (CMS-backed).
- Interactive maps or location finders.

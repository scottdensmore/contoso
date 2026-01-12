# Specification: Sidebar Navigation Menu

## Overview
Populate the existing sidebar (hamburger) menu with comprehensive navigation links to improve site discoverability. The menu will be organized into logical groups and will dynamically display product categories and user-specific links based on authentication status.

## Functional Requirements
- **Sidebar Structure:**
    - Organize links into three main sections: "Shop", "Account", and "Support".
- **Shop Section:**
    - Dynamically fetch product categories from the database (via Prisma).
    - Display a list of top-level category links.
- **Account Section:**
    - For authenticated users: Show "Profile" and "Sign Out".
    - For guests: Show "Sign In" and "Sign Up".
- **Support Section:**
    - Include static links to "About Us", "Contact", and "FAQ".
- **Interactions:**
    - Clicking a link closes the sidebar and navigates to the target page.
    - The menu remains a single-level list for simplicity.

## Technical Requirements
- **Frontend:** React (Next.js client component) with Tailwind CSS for styling.
- **Backend:** Reuse existing Prisma logic to fetch categories.
- **State Management:** Use `next-auth/react` (`useSession`) to determine authentication status.
- **Components:** Create a new `Sidebar` component and integrate it with the `Header`.

## Acceptance Criteria
- The sidebar menu displays the "Shop", "Account", and "Support" headings.
- All product categories are correctly listed under "Shop".
- Account links correctly reflect the user's login status.
- Clicking any link navigates correctly and closes the menu.
- The UI is responsive and follows existing design patterns.

## Out of Scope
- Sub-category expansion/collapse within the sidebar.
- Search bar inside the sidebar.
- Social media links in this phase.

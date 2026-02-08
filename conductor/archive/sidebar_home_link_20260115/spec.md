# Specification: Sidebar Home Link

## Overview
Add a "Home" link to the sidebar navigation to provide users with an explicit and easy way to return to the main landing page from any context.

## Functional Requirements
- **Navigation:**
    - A link titled "Home" must be visible in the sidebar.
    - Clicking the link navigates the user to the root path `/`.
    - Clicking the link should close the sidebar (consistent with other links).
- **Placement:**
    - The link should be located at the very top of the sidebar content.
    - It should be contained within a new navigation section titled "General" (or similar generic title like "Menu").

## Technical Requirements
- **Implementation:**
    - Update `src/lib/navigation.ts` to include a new "General" section.
    - Ensure the `getSidebarLinks` function prepends this new section to the list.
- **Components:**
    - No changes expected to `src/components/sidebar.tsx` logic, as it renders dynamic sections.

## Acceptance Criteria
- Opening the sidebar reveals a "General" section at the top.
- The "General" section contains a "Home" link.
- Clicking "Home" navigates to `/`.

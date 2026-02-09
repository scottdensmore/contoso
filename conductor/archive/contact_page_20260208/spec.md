# Specification: Contact Page Integration

## Overview
This track involves adding a dedicated Contact Us page to the Contoso Outdoor website. The page will provide a way for adventurers to reach out to the support team with inquiries, feedback, or order-related issues. The design will align with the site's minimalist and adventurous theme, featuring a custom outdoor background image.

## Functional Requirements
- **Contact Form:**
    - Fields: Name (required), Email (required), Subject (required), Order Number (optional), Message (required).
    - Validation: Ensure email format is correct and all required fields are populated.
- **Visual Design:**
    - Layout: A clean, centered contact form overlaid on a subtle background image.
    - Image: A high-quality image of a dense forest trail with sunlight filtering through.
- **Submission Handling:**
    - Upon successful submission, the user should be redirected to a "Thank You" page (`/contact/thanks`).
    - The "Thank You" page should display a confirmation message and a button to return to the shop.
- **Navigation:**
    - Add a link to the Contact page in the site's sidebar/navigation.

## Non-Functional Requirements
- **Performance:** The background image should be optimized for fast loading.
- **Accessibility:** The form must be fully accessible (labels, keyboard navigation, etc.).
- **Consistency:** Use existing UI components (buttons, inputs) from the design system.

## Acceptance Criteria
- [ ] Contact page is accessible at `/contact`.
- [ ] Form fields are correctly validated.
- [ ] Submitting the form redirects the user to `/contact/thanks`.
- [ ] The "Thank You" page is accessible and contains the correct messaging.
- [ ] The custom forest background image is displayed correctly on the contact page.
- [ ] The Contact page link is visible in the main navigation.

## Out of Scope
- Backend email integration (for this track, we will simulate the submission via a mock API or console log).
- Database storage for contact inquiries.

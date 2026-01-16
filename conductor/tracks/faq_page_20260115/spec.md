# Specification: FAQ Page Implementation

## Overview
Implement the currently missing FAQ page (`/faq`) to provide customers with answers to common questions regarding ordering, shipping, returns, and refunds.

## Functional Requirements
- **Route:** Create the page at `src/app/faq/page.tsx`.
- **Content:**
    - **Ordering & Shipping Section:** Common questions about delivery times, costs, and order tracking.
    - **Returns & Refunds Section:** Information on how to return items and refund processing times.
- **Layout:** Use a **Categorized List** format where questions and answers are grouped under relevant headings.
- **Components:** Reuse the `Block` and `Header` components for visual consistency with the rest of the site.
- **CTA:** Include a footer note directing users to contact support if their question isn't answered.

## Technical Requirements
- **Frontend:** Next.js App Router page.
- **Design:** Clean, typography-focused layout using Tailwind CSS.
- **Copy:** Professional, helpful tone aligned with Contoso Outdoors' brand.

## Acceptance Criteria
- Navigating to `/faq` no longer results in a 404 error.
- The page displays clearly labeled sections for "Ordering & Shipping" and "Returns & Refunds".
- Each section contains at least 3-4 relevant Q&A pairs.
- The page layout is responsive and consistent with the homepage style.

## Out of Scope
- Dynamic search/filter functionality within the FAQ.
- Accordion/Collapsible interactions (sticking to Categorized List for MVP).
- Integration with a ticketing system or live chat.

# Specification: User Profile Management

## Overview
Enable users to manage their profile information, including updating their avatar, changing their password securely, and setting a default shipping address. This enhances the personalized experience and prepares the platform for a smoother checkout process.

## Functional Requirements
- **Avatar Management:**
    - Support direct file upload for user avatars.
    - Store avatars securely (server-side or cloud storage).
    - Display the avatar in the header and on the profile page.
- **Password Security:**
    - Implement a "Change Password" feature requiring the user to enter their current password.
    - Validate new password complexity (if applicable).
- **Shipping Address:**
    - Allow users to set and update a default shipping address.
    - Fields: Full Name, Address Line 1, Address Line 2, City, State/Province, ZIP/Postal Code, Country, and Phone Number.
- **User Interface:**
    - Create a profile page accessible via a dropdown menu in the header.
    - Use a tabbed interface to organize "General" (Avatar), "Security" (Password), and "Shipping" (Address) settings.

## Technical Requirements
- **Frontend:** React components with Tailwind CSS for styling.
- **Backend:** Next.js API routes for handling uploads and data updates.
- **ORM:** Update Prisma schema to support avatar storage (URL) and shipping address fields.
- **Security:** Use `bcryptjs` for password comparison and hashing.

## Acceptance Criteria
- Users can successfully upload and change their avatar.
- Users can only change their password after providing the correct current password.
- Shipping address information is persisted correctly in the database.
- The profile page is intuitive and responsive on mobile devices.

## Out of Scope
- Support for multiple shipping addresses (initial version only supports one default).
- Integration with third-party avatar services (e.g., Gravatar).
- Delivery instructions for shipping.

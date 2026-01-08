# Plan: User Profile Management

## Phase 1: Database and API Foundation [checkpoint: 29e9659]
- [x] Task: Update User model in Prisma schema [29e9659]
    - [x] Task: Write Tests for updated User model logic
    - [x] Task: Update Prisma schema with avatar and shipping address fields and run migrations
- [x] Task: Create Profile Management API routes [29e9659]
    - [x] Task: Write Tests for Profile and Password API routes
    - [x] Task: Implement API route for updating avatar and profile info
    - [x] Task: Implement API route for secure password change (bcrypt comparison)
- [x] Task: Create Shipping Address API route [29e9659]
    - [x] Task: Write Tests for Shipping Address API
    - [x] Task: Implement API route for setting/updating default shipping address
- [x] Task: Conductor - User Manual Verification 'Database and API Foundation' (Protocol in workflow.md)

## Phase 2: Profile UI - General and Security [checkpoint: 3e7e32b]
- [x] Task: Create Profile Page with Tabbed Interface [3e7e32b]
    - [x] Task: Write Tests for Profile Page navigation and layout
    - [x] Task: Implement tabbed layout (General, Security, Shipping) using Tailwind CSS
- [x] Task: Implement Avatar Management UI [3e7e32b]
    - [x] Task: Write Tests for Avatar upload component
    - [x] Task: Implement direct file upload and preview for user avatar
- [x] Task: Implement Password Change UI [3e7e32b]
    - [x] Task: Write Tests for Password change form
    - [x] Task: Implement secure form for updating password with validation
- [x] Task: Conductor - User Manual Verification 'Profile UI - General and Security' (Protocol in workflow.md)

## Phase 3: Profile UI - Shipping and Navigation
- [ ] Task: Implement Shipping Address UI
    - [ ] Task: Write Tests for Shipping Address form
    - [ ] Task: Implement form for default shipping address fields
- [ ] Task: Integrate Profile Access in Header
    - [ ] Task: Write Tests for Header user dropdown
    - [ ] Task: Update Header to include a dropdown with a "Profile Settings" link
- [ ] Task: Conductor - User Manual Verification 'Profile UI - Shipping and Navigation' (Protocol in workflow.md)

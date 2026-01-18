# Contributing to Contoso Outdoors

Thank you for your interest in contributing to the Contoso Outdoors project! We follow a structured, spec-driven development process to ensure high quality and maintainability.

## Spec-Driven Development (Conductor)

This project uses the **Conductor** framework to manage features and tasks.

1.  **Tracks:** Every major feature or bug fix is a "Track".
    - Tracks are listed in `conductor/tracks.md`.
    - Each track has its own folder in `conductor/tracks/<track_id>/` containing:
        - `spec.md`: Detailed functional and technical requirements.
        - `plan.md`: Step-by-step implementation plan.

2.  **Workflow:**
    - **Pick a Track:** Choose an incomplete track from `conductor/tracks.md`.
    - **Mark In Progress:** Update the status in `conductor/tracks.md` to `[~]`.
    - **Follow the Plan:** Execute tasks sequentially from the track's `plan.md`.

## Coding Standards

### Technology Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS.
- **Backend:** Next.js API Routes, Prisma ORM.
- **Database:** PostgreSQL.
- **Testing:** Vitest, React Testing Library.

### Guidelines
- **TypeScript:** Use strict typing. Avoid `any`.
- **Functional Components:** Use React Hooks and functional components.
- **Tailwind:** Use utility classes for styling.
- **TDD:** Write tests *before* implementation.

## Quality Gates

Before submitting a Pull Request, ensure:
- [ ] All tests pass (`npm test`).
- [ ] Code coverage is sufficient.
- [ ] No linting errors (`npm run lint`).
- [ ] The code matches the `spec.md` requirements.

## Making Changes

1.  **Create a Branch:** `git checkout -b feature/your-feature-name`
2.  **Implement:** Follow the TDD cycle (Red -> Green -> Refactor).
3.  **Commit:** Use conventional commit messages (e.g., `feat(auth): Add login page`).
4.  **Verify:** Run the full test suite.
5.  **Push & PR:** Push your branch and open a Pull Request.

## Database Migrations

If your change involves the database:
1.  Modify `prisma/schema.prisma`.
2.  Run `npx prisma migrate dev --name your_change_description`.
3.  Update the seed script (`prisma/seed.ts`) if necessary.

## Need Help?

Refer to the documentation in the `conductor/` directory for more details on the project structure and product goals.

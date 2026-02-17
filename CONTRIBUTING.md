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
- **Backend:** Next.js API Routes, FastAPI chat service, Prisma ORM.
- **Database:** PostgreSQL.
- **Testing:** Vitest, React Testing Library, pytest.

### Guidelines
- **TypeScript:** Use strict typing. Avoid `any`.
- **Functional Components:** Use React Hooks and functional components.
- **Tailwind:** Use utility classes for styling.
- **TDD:** Write tests *before* implementation.
- **Runtime Parity:** Use pinned local tool versions via `mise install` (Node.js 22, Python 3.11).

## Quality Gates

Before submitting a Pull Request, ensure:
- [ ] All tests pass (`make test`).
- [ ] Code coverage is sufficient.
- [ ] No linting errors (`make lint`).
- [ ] The code matches the `spec.md` requirements.

## Making Changes

1.  **Bootstrap once:** `make bootstrap` (or `npm run bootstrap`) for a full local setup.
2.  **Create a Branch:** `git checkout -b feature/your-feature-name`
3.  **Implement:** Follow the TDD cycle (Red -> Green -> Refactor).
4.  **Commit:** Use conventional commit messages (e.g., `feat(auth): Add login page`).
5.  **Verify:** Run preflight (`make agent-doctor`) and full local checks (`make ci`).
6.  **Push & PR:** Push your branch and open a Pull Request.

## Database Migrations

If your change involves the database:
1.  Modify `apps/web/prisma/schema.prisma`.
2.  Run `make migrate` (or `cd apps/web && npx prisma migrate dev --schema prisma/schema.prisma --name your_change_description`).
3.  Update the seed script (`apps/web/prisma/seed.ts`) if necessary.

## Need Help?

Refer to:

- `AGENTS.md` for coding agent runbooks and command conventions.
- `conductor/` for product goals and track context.

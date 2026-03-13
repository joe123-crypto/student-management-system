# System Overview

## Stack
- Next.js (App Router), React, and TypeScript.
- Auth.js credentials auth with Prisma-backed identity records.
- Prisma + PostgreSQL for normalized student profiles, announcements, and permission requests.
- Tailwind CSS for styling.
- Mock mode can still persist announcements and permission requests in `localStorage`.

## Code Layout
- `app/`: thin page wrappers that pass route intent into `AppShell`.
- `app/api/students/*`: student profile API surface.
- `app/api/announcements/*`: announcement CRUD surface.
- `app/api/permission-requests/*`: permission request submission and review surface.
- `app/api/auth/*`: Auth.js session routes plus password-change endpoint.
- `components/shell/`: routing shell, guards, and domain hooks orchestration.
- `components/features/*`: feature screens and feature-specific UI logic.
- `components/layout/`: shared page shell (sidebar, top nav, footer wrappers).
- `components/ui/`: reusable primitives.
- `lib/students/`: student profile normalization and Prisma store logic.
- `test/mock/`: legacy prototype data tables, seed data, and mock service adapters.
- `services/`: shared service contracts.

## Runtime Flow
1. Next page entry renders `components/shell/AppShell.tsx` with a route.
2. `AppShell` hydrates Auth.js session state plus student, announcement, and permission-request domains.
3. Student profile reads and writes go through `components/shell/domains/students/useStudents.ts`.
4. `/api/students*`, `/api/announcements*`, and `/api/permission-requests*` route handlers authorize the caller and delegate to their domain stores under `lib/`.
5. `POST /api/auth/change-password` rotates credential hashes for signed-in users.
6. Middleware and router guards enforce role-based access before feature screens render.

## Route Ownership
- Route literals: `components/shell/routes.ts`.
- Top-level route dispatch: `components/shell/AppShell.tsx`.
- Public route handling: `components/shell/routers/PublicAppRouter.tsx`.
- Student route handling: `components/shell/routers/StudentAppRouter.tsx`.
- Attache route handling: `components/shell/routers/AttacheAppRouter.tsx`.

## Data and Storage Ownership
- Student CRUD + persistence: `components/shell/domains/students/useStudents.ts` + `app/api/students/*` + `lib/students/store.ts`.
- Auth/session: `components/shell/domains/auth/useAuth.ts`.
- Announcements: `components/shell/domains/announcements/useAnnouncements.ts` + `app/api/announcements/*` + `lib/announcements/*`.
- Permission requests: `components/shell/domains/permissions/usePermissionRequests.ts` + `app/api/permission-requests/*` + `lib/permission-requests/*`.
- Legacy prototype helpers: `test/mock/prototypeDatabase.ts`.
- Service contracts: `services/contracts.ts`.

## Related Docs
- Frontend map: `docs/frontend/README.md`
- Data contracts: `docs/architecture/frontend-data-model.md`
- DB schema: `docs/architecture/app-schema.md`
- Troubleshooting: `docs/troubleshooting/README.md`

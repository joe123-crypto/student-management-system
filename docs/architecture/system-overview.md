# System Overview

## Stack
- Next.js (App Router), React, and TypeScript.
- Auth.js credentials auth with Prisma-backed identity records.
- Prisma + PostgreSQL for student profile persistence.
- Tailwind CSS for styling.
- Announcements and permission requests still persist in `localStorage`.

## Code Layout
- `app/`: thin page wrappers that pass route intent into `AppShell`.
- `app/api/students/*`: student profile API surface.
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
4. `/api/students*` route handlers authorize the caller and delegate to `lib/students/store.ts`.
5. Middleware and router guards enforce role-based access before feature screens render.

## Route Ownership
- Route literals: `components/shell/routes.ts`.
- Top-level route dispatch: `components/shell/AppShell.tsx`.
- Public route handling: `components/shell/routers/PublicAppRouter.tsx`.
- Student route handling: `components/shell/routers/StudentAppRouter.tsx`.
- Attache route handling: `components/shell/routers/AttacheAppRouter.tsx`.

## Data and Storage Ownership
- Student CRUD + persistence: `components/shell/domains/students/useStudents.ts` + `app/api/students/*` + `lib/students/store.ts`.
- Auth/session: `components/shell/domains/auth/useAuth.ts`.
- Announcements: `components/shell/domains/announcements/useAnnouncements.ts`.
- Permission requests: `components/shell/domains/permissions/usePermissionRequests.ts`.
- Legacy prototype helpers: `test/mock/prototypeDatabase.ts`.
- Service contracts: `services/contracts.ts`.

## Related Docs
- Frontend map: `docs/frontend/README.md`
- Data contracts: `docs/architecture/frontend-data-model.md`
- DB schema: `docs/architecture/app-schema.md`
- Troubleshooting: `docs/troubleshooting/README.md`

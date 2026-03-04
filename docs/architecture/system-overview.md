# System Overview

## Stack
- Next.js (App Router), React, TypeScript.
- Tailwind CSS for styling.
- Client-side persistence via in-memory state + `localStorage` (no backend yet).

## Code Layout
- `app/`: thin page wrappers that pass route intent into `AppShell`.
- `components/shell/`: routing shell, guards, and domain hooks orchestration.
- `components/features/*`: feature screens and feature-specific UI logic.
- `components/layout/`: shared page shell (sidebar, top nav, footer wrappers).
- `components/ui/`: reusable primitives.
- `mock/`: normalized in-memory prototype DB and seed/mapping logic.
- `services/`: contracts and mock adapters (backend swap seam).

## Runtime Flow
1. Next page entry renders `components/shell/AppShell.tsx` with a route.
2. `AppShell` hydrates domains (auth, students DB, announcements, permission requests).
3. `AppShell` delegates to `PublicAppRouter`, `StudentAppRouter`, or `AttacheAppRouter`.
4. Router guards enforce user role and auth/session presence.
5. Feature components render and mutate state through shell domain hooks.

## Route Ownership
- Route literals: `components/shell/routes.ts`.
- Top-level route dispatch: `components/shell/AppShell.tsx`.
- Public route handling: `components/shell/routers/PublicAppRouter.tsx`.
- Student route handling: `components/shell/routers/StudentAppRouter.tsx`.
- Attache route handling: `components/shell/routers/AttacheAppRouter.tsx`.

## Data and Storage Ownership
- Student CRUD + DB mapping: `components/shell/domains/students/usePrototypeDatabase.ts` + `mock/prototypeDatabase.ts`.
- Auth/session: `components/shell/domains/auth/useAuth.ts`.
- Announcements: `components/shell/domains/announcements/useAnnouncements.ts`.
- Permission requests: `components/shell/domains/permissions/usePermissionRequests.ts`.
- Service contracts: `services/contracts.ts`.

## Related Docs
- Frontend map: `docs/frontend/README.md`
- Data contracts: `docs/architecture/frontend-data-model.md`
- Prototype schema: `docs/architecture/app-schema.md`
- Troubleshooting: `docs/troubleshooting/README.md`

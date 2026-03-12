# Frontend State and Storage

## Local Storage Keys
- `prototype_database_v2`: legacy prototype student database kept for mock/reference tooling.
- `announcements`: announcements feed.
- `permission_requests_v1`: permission request submissions.

## Server Persistence
- Student profiles: Prisma `StudentProfileRecord` via `/api/students`, `/api/students/me`, and `/api/students/[id]`.
- Auth session: Auth.js JWT session cookie.

## Domain Hook Ownership
- Students DB: `components/shell/domains/students/useStudents.ts`
- Student repository + API: `lib/students/store.ts`, `app/api/students/*`
- Auth session: `components/shell/domains/auth/useAuth.ts`
- Announcements: `components/shell/domains/announcements/useAnnouncements.ts`
- Permission requests: `components/shell/domains/permissions/usePermissionRequests.ts`
- Storage helper: `components/shell/shared/storage.ts`

## Persistence Model
- Source of truth for runtime student data is PostgreSQL via Prisma `StudentProfileRecord`.
- Auth session state comes from Auth.js cookies via `useSession`, not `localStorage`.
- UI consumes `StudentProfile[]` and `currentStudent` from authenticated API routes.
- Announcements and permission requests remain local-storage domains until their backend cutover.
- `test/mock/prototypeDatabase.ts` remains as legacy prototype/reference tooling, not the runtime student store.

## Drift Prevention
- Full contract reference: `docs/architecture/frontend-data-model.md`
- DB schema reference: `docs/architecture/app-schema.md`
- Validation command: `npm run docs:check`

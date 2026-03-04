# Frontend State and Storage

## Local Storage Keys
- `prototype_database_v1`: normalized student database.
- `announcements`: announcements feed.
- `permission_requests_v1`: permission request submissions.
- `user`: current authenticated session.
- `auth_passwords_v1`: student credential map.

## Domain Hook Ownership
- Students DB: `components/shell/domains/students/usePrototypeDatabase.ts`
- Auth and password updates: `components/shell/domains/auth/useAuth.ts`
- Announcements: `components/shell/domains/announcements/useAnnouncements.ts`
- Permission requests: `components/shell/domains/permissions/usePermissionRequests.ts`
- Storage helper: `components/shell/shared/storage.ts`

## Persistence Model
- Source of truth for student data is normalized tables in `mock/prototypeDatabase.ts`.
- UI consumes mapped `StudentProfile[]` via domain hooks.
- Service contracts in `services/contracts.ts` define backend-compatible boundaries.

## Drift Prevention
- Full contract reference: `docs/architecture/frontend-data-model.md`
- DB schema reference: `docs/architecture/app-schema.md`
- Validation command: `npm run docs:check`

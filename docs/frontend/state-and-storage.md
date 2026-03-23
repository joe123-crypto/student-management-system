# Frontend State and Storage

## Local Storage Keys
- `prototype_database_v2`: legacy prototype student database kept for mock/reference tooling.
- `announcements`: mock announcements feed when `NEXT_PUBLIC_USE_MOCK_DB=true`.
- `permission_requests_v1`: mock permission request submissions when `NEXT_PUBLIC_USE_MOCK_DB=true`.

## IndexedDB Cache
- Runtime announcement lists are cached in IndexedDB with user-scoped keys and a short TTL when `NEXT_PUBLIC_USE_MOCK_DB=false`.
- Cache entries are cleared on logout.

## Server Persistence
- Student profiles: normalized Prisma tables via `/api/students`, `/api/students/me`, and `/api/students/[id]`.
- Managed student files: Prisma `FileAsset` metadata plus private Cloudflare R2 objects via `/api/files/*`.
- Announcements: Prisma-backed records via `/api/announcements` and `/api/announcements/[id]`.
- Permission requests: Prisma-backed records via `/api/permission-requests` and `/api/permission-requests/[id]`.
- Auth session: Auth.js JWT session cookie.
- Password changes: authenticated mutation via `POST /api/auth/change-password`.

## Domain Hook Ownership
- Students DB: `components/shell/domains/students/useStudents.ts`
- Student repository + API: `lib/students/store.ts`, `app/api/students/*`
- Managed file upload + access: `lib/files/*`, `lib/storage/*`, `app/api/files/*`
- Auth session: `components/shell/domains/auth/useAuth.ts`
- Announcements: `components/shell/domains/announcements/useAnnouncements.ts`
- Permission requests: `components/shell/domains/permissions/usePermissionRequests.ts`
- Storage helper: `components/shell/shared/storage.ts`

## Persistence Model
- Source of truth for runtime student data is PostgreSQL via normalized Prisma student tables.
- Source of truth for profile-picture and proof-document bytes is private object storage; the frontend stores authenticated file URLs/references, not base64 payloads.
- Source of truth for runtime announcements and permission requests is PostgreSQL when `NEXT_PUBLIC_USE_MOCK_DB=false`.
- Runtime announcements may be replayed from IndexedDB before the network refresh completes.
- Auth session state comes from Auth.js cookies via `useSession`, not `localStorage`.
- UI consumes `StudentProfile[]` and `currentStudent` from authenticated API routes.
- Announcements and permission requests use `localStorage` only in mock mode.
- `test/mock/prototypeDatabase.ts` remains as legacy prototype/reference tooling, not the runtime student store.

## Drift Prevention
- Full contract reference: `docs/architecture/frontend-data-model.md`
- DB schema reference: `docs/architecture/app-schema.md`
- Validation command: `npm run docs:check`

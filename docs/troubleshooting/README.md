# Troubleshooting

Use this page to debug common local issues quickly.

## App does not start (`npm run dev` fails)
- Ensure dependencies are installed: `npm install`.
- Verify Node version matches project expectation (use LTS).
- Check for lockfile conflicts after branch switch: reinstall if needed.

## Login keeps failing for valid test users
- Check `.env` values:
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `AUTH_ENABLE_MIDDLEWARE`
- Confirm seeded auth users exist in `prisma/seed.ts`.
- Verify `/api/auth/session` responds and inspect server logs for Prisma connection errors.

## Student/attache pages redirect unexpectedly
- Confirm route exists in `components/shell/routes.ts`.
- Confirm middleware is enabled only when `AUTH_SECRET` is configured.
- Check that `/api/students/me` returns the logged-in student record.
- Check onboarding redirect conditions in `StudentAppRouter`.

## Data looks stale after edits/import
- Verify `/api/students`, `/api/students/me`, or `/api/students/[id]` completed successfully.
- Verify normalized Prisma student rows were updated as expected.
- For CSV import, inspect parser behavior in `components/features/attache/utils/csvImport.ts`.

## Attache assistant does not load or reply
- Verify `/api/agent/chat` returns `200` for an authenticated attache session.
- Confirm `AgentThread` and `AgentMessage` tables were created by the latest Prisma migration.
- If the assistant loads but has no useful scope, open the Student Records view and confirm filters/selection are updating normally.
- Inspect server logs for `[AGENT]` errors from `app/api/agent/chat/route.ts`.

## `docs:check` fails
- Sync docs with source changes in:
  - `types.ts`
  - `services/contracts.ts`
  - `components/features/attache/types.ts`
- Update `docs/architecture/frontend-data-model.md` sections and storage key table.
- Re-run `npm run docs:check`.

## UI hydration mismatch / browser-only API errors
- Confirm storage access is guarded by client-side checks.
- Reuse `getFromStorage<T>()` from `components/shell/shared/storage.ts`.
- Ensure components using browser-only APIs are client components.

## Recommended Debug Command Set
1. `npm run dev`
2. `npm run lint`
3. `npm run docs:check`
4. `npm run typecheck`

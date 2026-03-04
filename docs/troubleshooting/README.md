# Troubleshooting

Use this page to debug common local issues quickly.

## App does not start (`npm run dev` fails)
- Ensure dependencies are installed: `npm install`.
- Verify Node version matches project expectation (use LTS).
- Check for lockfile conflicts after branch switch: reinstall if needed.

## Login keeps failing for valid test users
- Check `.env` values:
  - `NEXT_PUBLIC_DEMO_MODE`
  - `NEXT_PUBLIC_ATTACHE_PASSWORD`
- Inspect auth storage values in browser devtools (`user`, `auth_passwords_v1`).
- Clear local storage and retry to remove stale session/password data.

## Student/attache pages redirect unexpectedly
- Confirm route exists in `components/shell/routes.ts`.
- Confirm guard conditions in `StudentAppRouter` / `AttacheAppRouter` still match auth shape.
- Check that `useAuth` resolves `currentStudent` for the login id.

## Data looks stale after edits/import
- Inspect `prototype_database_v1` in browser storage.
- Verify mapping logic in `mock/prototypeDatabase.ts`.
- For CSV import, inspect parser behavior in `components/features/attache/utils/csvImport.ts`.

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

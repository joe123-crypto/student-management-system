# Client Cache Plan

## Goal

Improve perceived load time without changing the server as source of truth.

The current runtime frontend fetches authenticated data directly from API routes and keeps it only in React state. That is a good baseline for correctness, but it means every full page reload has to wait on the network again.

## Recommendation

Use IndexedDB for low-sensitivity runtime cache entries.

- Cache `Announcement[]` first.
- Do not persist full `StudentProfile` payloads.
- Do not persist full `PermissionRequest[]` payloads.
- Keep all existing runtime `fetch(..., { cache: 'no-store' })` calls.
- Hydrate from IndexedDB immediately, then fetch fresh data and overwrite the cache.

`localStorage` should remain limited to small mock-mode data and simple flags. It is not a good fit for authenticated runtime payloads because it is synchronous, size-limited, and coarse-grained.

## Why This Split

### Safe First Target: Announcements

Announcements are the lowest-risk runtime dataset:

- already list-oriented
- small payload size
- no bank, passport, address, or account data
- simple create/delete invalidation rules

This makes `components/shell/domains/announcements/useAnnouncements.ts` the best first integration point.

### Avoid Persisting Student Profiles

`StudentProfile` includes:

- passport data
- bank account data
- contact details
- address details
- academic history

Persisting that data in browser storage would create a long-lived local copy of highly sensitive information on every device used to sign in. That is a poor default.

If student-load performance becomes a real problem, split the attache experience into:

- a cacheable summary list API with safe fields only
- an uncached detail API for the selected student

### Avoid Persisting Permission Requests

Permission requests include:

- inscription number
- full name
- passport number
- review status

That is also sensitive enough that persistent browser cache should be avoided unless there is a strong product requirement and a clear retention policy.

## Phase 1 Implementation

### 1. Add a Shared IndexedDB Cache Helper

Add a small helper in `components/shell/shared/browser-cache.ts` with:

- `readCache<T>(key)`
- `writeCache<T>(key, value, ttlMs)`
- `deleteCache(key)`
- `clearCacheByPrefix(prefix)`

Required behavior:

- no-op safely during SSR
- versioned records
- `expiresAt` support
- JSON-serializable values only

Record shape:

```ts
type CacheRecord<T> = {
  version: number;
  expiresAt: number;
  value: T;
};
```

Use one IndexedDB database and one object store. Keep the design minimal.

### 2. Scope Cache Keys to the Signed-In User

Cache keys should include user identity so one browser account cannot read another user's cached runtime data.

Recommended key format:

```ts
const key = `runtime-cache:v1:${user.role}:${user.id}:announcements`;
```

For public or pre-auth pages, do not reuse authenticated cache keys.

### 3. Integrate `useAnnouncements`

In `components/shell/domains/announcements/useAnnouncements.ts`:

1. On mount, read cached announcements and call `setAnnouncements` before the network request.
2. Keep the existing API fetch.
3. On successful fetch, replace state and update IndexedDB.
4. On create/delete, update IndexedDB after state mutation succeeds.

Recommended TTL:

- `5 minutes` for authenticated announcement lists

This gives faster warm loads while keeping the cache short-lived.

### 4. Clear User-Scoped Cache on Logout

`components/shell/AppShell.tsx` already owns logout flow through `signOut()`. Extend that path to clear the current user's runtime cache prefix before redirecting.

This avoids stale authenticated payloads lingering after sign-out on shared machines.

## Optional Phase 2

Only if the attache dashboard still feels slow after announcement caching:

- add `StudentListItem` or `StudentDirectoryRow` with safe summary fields only
- expose a dedicated summary endpoint
- cache only the summary list in IndexedDB with a short TTL
- keep `currentStudent` and full profile detail uncached

Safe summary candidates:

- internal id
- inscription number
- full name
- status
- university name
- program name

Do not include:

- passport number
- bank account fields
- full contact fields
- full address fields
- full academic history

## Files To Touch First

- `components/shell/shared/browser-cache.ts` for the IndexedDB helper
- `components/shell/domains/announcements/useAnnouncements.ts` for read-through cache hydration
- `components/shell/AppShell.tsx` for logout-time cache clearing

## Explicit Non-Goals

- replacing PostgreSQL or Prisma as the source of truth
- switching runtime data storage to `localStorage`
- persisting full student or permission-request datasets by default
- relying on browser cache instead of explicit app-level invalidation

## Summary

The safest implementation is:

1. use IndexedDB, not `localStorage`
2. cache announcements first
3. leave student profiles and permission requests out of persistent browser storage
4. use user-scoped keys, short TTLs, and logout clearing

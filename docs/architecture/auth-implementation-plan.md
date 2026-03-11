# Authentication Implementation Plan

## Goal
Move from browser-only prototype auth (`localStorage`) to secure server-side authentication with role-based session checks, while preserving current student/attache UX.

## Current State
- Auth.js handles credential sign-in at `/api/auth/[...nextauth]`.
- Session state is read from signed cookies through `useSession`.
- Middleware can enforce role checks for `/student/*`, `/onboarding`, and `/attache/*`.
- Prototype student records still live in `localStorage`, but legacy local auth storage has been removed.

## Completed Work
1. Added Auth.js configuration: `auth.config.ts`.
2. Added auth route handler: `app/api/auth/[...nextauth]/route.ts`.
3. Added role-aware middleware template: `middleware.ts` (guarded by `AUTH_ENABLE_MIDDLEWARE`).
4. Added Auth.js typing for role/login claims: `types/next-auth.d.ts`.
5. Cut the login UI and client auth hook over to `signIn()` / `useSession()`.
6. Removed the legacy mock auth service and the inactive mock-database auth fallback.

## Remaining Hardening
1. Implement password-change endpoint:
   - `POST /api/auth/change-password`
   - Verify current password hash, rotate to new hash, audit log event.
2. Add rate limit and lockout strategy tuning for failed attempts.
3. Add automated auth tests:
   - Sign-in success/failure by role
   - Route access by role
   - Logout + session invalidation

## Backend Boundary with Python Services
1. Next.js remains identity/session gateway.
2. Python services receive trusted identity context from Next.js:
   - `x-user-id`, `x-role`, `x-subject` (or internal signed service JWT).
3. Python re-validates authorization on each protected action.

## Cutover Checklist
- [ ] `AUTH_SECRET` set in environment.
- [ ] Auth.js route responds at `/api/auth/session`.
- [ ] Login page calls server sign-in.
- [ ] Middleware enabled (`AUTH_ENABLE_MIDDLEWARE=true`) in staging first.
- [ ] Student and attache route guards pass in middleware and UI.
- [ ] Password-change flow implemented and tested.

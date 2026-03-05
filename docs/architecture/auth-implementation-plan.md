# Authentication Implementation Plan

## Goal
Move from browser-only prototype auth (`localStorage`) to secure server-side authentication with role-based session checks, while preserving current student/attache UX.

## Current State
- Login and session are stored client-side (`user`, `auth_passwords_v1`).
- Route protection is client-only (`StudentAppRouter`, `AttacheAppRouter` redirects).
- Password validation is done in browser code.

## Target State
- Auth handled by Auth.js server route (`/api/auth/[...nextauth]`).
- Session in signed JWT cookie (`HttpOnly`, `Secure` in production).
- Middleware-enforced role checks for `/student/*`, `/onboarding`, `/attache/*`.
- Existing UI routes remain unchanged.

## Phase 1 (Completed in this change)
- Added Auth.js configuration: `auth.config.ts`.
- Added auth route handler: `app/api/auth/[...nextauth]/route.ts`.
- Added role-aware middleware template: `middleware.ts` (guarded by `AUTH_ENABLE_MIDDLEWARE`).
- Added Auth.js typing for role/login claims: `types/next-auth.d.ts`.
- Added auth env contract in `.env.example`.

## Phase 2 (UI Cutover)
1. Replace client-side login validation with server sign-in.
   - File: `components/features/auth/LoginPage.tsx`
   - Use `signIn('credentials', { role, loginId, password, redirect: false })`
2. Replace `localStorage` user session reads with `useSession`.
   - File: `components/shell/domains/auth/useAuth.ts`
3. Remove `onLogin`, `studentPasswordsByInscription`, and `attachePassword` dependencies from public router path.
   - Files: `components/shell/AppShell.tsx`, `components/shell/routers/PublicAppRouter.tsx`
4. Keep onboarding logic:
   - Student post-login route remains `/onboarding` if required fields are missing, else `/student/dashboard`.

## Phase 3 (Password & Identity Hardening)
1. Move credentials from env JSON to database (PostgreSQL + Prisma).
2. Store password hashes with `argon2id` (never plaintext).
3. Implement password-change endpoint:
   - `POST /api/auth/change-password`
   - Verify current password hash, rotate to new hash, audit log event.
4. Add rate limit and lockout strategy for failed attempts.

## Phase 4 (Backend Boundary with Python Services)
1. Next.js remains identity/session gateway.
2. Python services receive trusted identity context from Next.js:
   - `x-user-id`, `x-role`, `x-subject` (or internal signed service JWT).
3. Python re-validates authorization on each protected action.

## Phase 5 (Cleanup)
1. Remove legacy local auth storage keys and mock password store logic.
   - `services/mock/authService.ts`
   - Local auth branches in `useAuth`.
2. Update docs:
   - `docs/frontend/state-and-storage.md`
   - `docs/architecture/frontend-data-model.md`
3. Add tests:
   - Sign-in success/failure by role
   - Route access by role
   - Logout + session invalidation

## Cutover Checklist
- [ ] `AUTH_SECRET` set in environment.
- [ ] Auth.js route responds at `/api/auth/session`.
- [ ] Login page calls server sign-in.
- [ ] Middleware enabled (`AUTH_ENABLE_MIDDLEWARE=true`) in staging first.
- [ ] Student and attache route guards pass in middleware and UI.
- [ ] Legacy `localStorage` auth removed after verification.

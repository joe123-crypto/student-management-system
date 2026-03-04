# Frontend Routing

## Entry Pages
- `app/page.tsx` -> `/`
- `app/login/page.tsx` -> `/login`
- `app/request-permission/page.tsx` -> `/request-permission`
- `app/onboarding/page.tsx` -> `/onboarding`
- `app/[user-type]/page.tsx` -> validates user-type then redirects to dashboard.
- `app/[user-type]/[section]/page.tsx` -> section validation wrapper.

## Internal Router Shell
- `components/shell/AppShell.tsx` is the route dispatcher and domain orchestrator.
- Route union type lives in `components/shell/routes.ts`.

## Router Responsibility Split
- `PublicAppRouter`: landing, login, permission request flows.
- `StudentAppRouter`: onboarding, student dashboard, student settings.
- `AttacheAppRouter`: attache dashboard and settings.
- `Redirect.tsx`: route replacement helper for guard redirects.

## Guard Rules
- Student routes require authenticated `user.role === STUDENT` and a resolved `currentStudent`.
- Attache routes require authenticated `user.role === ATTACHE`.
- Unknown routes should resolve back to safe defaults in `AppShell`.

## Add a Route Checklist
1. Extend `AppRoute` in `components/shell/routes.ts`.
2. Wire route handling in `AppShell` and one router file.
3. Add or update the matching Next.js page wrapper in `app/`.
4. Update docs in this file and `docs/frontend/features.md` if behavior changes.

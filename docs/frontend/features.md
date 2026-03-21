# Frontend Features

## Public Area
- Landing: `components/features/landing/LandingPage.tsx`
- Login: `components/features/auth/LoginPage.tsx`
- Permission request: `components/features/auth/PermissionRequestPage.tsx`

## Student Area
- Container: `components/features/student/StudentDashboard.tsx`
- Panels: `components/features/student/dashboard/*`
- Onboarding flow: `components/features/onboarding/OnboardingPage.tsx`
- Onboarding steps: `components/features/onboarding/components/*`

## Attache Area
- Container: `components/features/attache/AttacheeDashboard.tsx`
- Major sections: `components/features/attache/components/*`
- State/behavior hooks: `components/features/attache/hooks/*`
- Utility transforms/import: `components/features/attache/utils/*`

## Shared UI
- Authenticated shell: `components/layout/Layout.tsx`
- Floating authenticated chat shell: `components/layout/FloatingChatWidget.tsx`
- Public footer: `components/layout/Footer.tsx`
- UI primitives: `components/ui/*`
- Shared announcements widgets: `components/features/shared/announcements/AnnouncementSections.tsx`

## Feature Change Checklist
1. Update relevant feature components and hooks.
2. Confirm role guards and route wiring still hold.
3. Validate storage and service contract impact.
4. Update docs in this file and `docs/troubleshooting/README.md` when new failure modes appear.

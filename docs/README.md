Student Platform – Internal Architecture Guide
==============================================

This document is written for **future AI agents / maintainers** working on the Student Platform. It explains **where things live**, **which files own which responsibilities**, and **where to plug in new logic**.

---

High-level overview
-------------------

- **Framework**: Next.js (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Persistence**: **No real backend** – everything is in-memory plus `localStorage`
- **Data model**: Strongly-typed `StudentProfile`, `Announcement`, `PermissionRequest`, etc. in `types.ts`

You can think of the app as:

- **`app/`**: Thin Next.js pages that mount the internal router shell.
- **`components/app/`**: Core app shell, routing, guards, and state hooks.
- **`components/features/*`**: Feature-specific UIs (student, attache, onboarding, auth, landing).
- **`components/layout/` & `components/ui/`**: Layout chrome and shared UI primitives.
- **`data/`**: In-browser “database” and mappings.

If you want to understand how the user moves through the app, start at **`app/page.tsx` → `components/app/AppShell.tsx`**.

---

Routing and navigation
----------------------

**Where routing is defined**

- `components/app/routes.ts`
  - Declares the allowed route strings via `AppRoute` (e.g. `'/'`, `'/login'`, `'/student/dashboard'`, `'/attache/settings'`, etc.).
  - This is the **single source of truth** for logical routes used by the internal router.

- `components/app/AppShell.tsx`
  - The central **client-side router shell**. It:
    - Hydrates all local state (database, announcements, permission requests, auth).
    - Decides **which router** to render based on `route: AppRoute`:
      - Public routes → `PublicAppRouter`
      - Student routes → `StudentAppRouter`
      - Attache routes → `AttacheAppRouter`
    - Redirects to `'/'` if it receives an unknown route.

- `components/app/routers/PublicAppRouter.tsx`
  - Handles:
    - `'/'` → `components/features/landing/LandingPage.tsx`
    - `'/login'` → `components/features/auth/LoginPage.tsx`
    - `'/request-permission'` → `components/features/auth/PermissionRequestPage.tsx`
  - Wires callbacks for login and permission requests.

- `components/app/routers/StudentAppRouter.tsx`
  - Handles:
    - `'/onboarding'`
    - `'/student/dashboard'`
    - `'/student/settings'`
  - Enforces **student auth guard** using `user` and `currentStudent` from `useAuth`.
  - Routes into `components/features/student/StudentDashboard.tsx` and `components/features/onboarding/OnboardingPage.tsx`.

- `components/app/routers/AttacheAppRouter.tsx`
  - Handles:
    - `'/attache/dashboard'`
    - `'/attache/settings'`
  - Enforces **attache auth guard** based on `user.role`.
  - Routes into `components/features/attache/AttacheeDashboard.tsx`.

- `components/app/Redirect.tsx`
  - Simple helper component that immediately calls `router.replace(to)`.
  - Used by routers to perform guarded redirects (e.g. unauthenticated users → `/login`).

**Next.js page files (outer shell)**

- `app/layout.tsx`
  - Root HTML wrapper and global CSS import.

- `app/page.tsx`
  - Renders `AppShell` wired to `'/'` (landing).

- `app/login/page.tsx`
  - Renders `AppShell` wired to `'/login'`.

- `app/request-permission/page.tsx`
  - Renders `AppShell` wired to `'/request-permission'`.

- `app/onboarding/page.tsx`
  - Renders `AppShell` wired to `'/onboarding'`.

- `app/[user-type]/page.tsx`
  - Validates `user-type` (`student | attache`) and redirects to `/{user-type}/dashboard`.

- `app/[user-type]/[section]/page.tsx`
  - Validates `section` (`dashboard | settings`), then delegates to client-side routing (currently returns `null` – `AppShell`+routers control content).

If you add a new high-level route, you usually:

1. Extend `AppRoute` in `components/app/routes.ts`.
2. Extend `AppShell` and the appropriate router (public/student/attache).
3. Optionally add a new `app/.../page.tsx` wrapper that passes the new route string into `AppShell`.

---

Data model and persistence
--------------------------

**Core shared types**

- `types.ts`
  - Defines the main domain types:
    - `UserRole`, `StudentProfile`, `Announcement`, `PermissionRequest`, and the supporting details types (`PassportDetails`, `UniversityDetails`, `BankAccountDetails`, etc.).
  - Treat this as the **canonical shape** for entities used across features.

**Prototype “database” (client-side)**

- `data/prototypeDatabase.ts`
  - Defines a normalized “database” schema (`PrototypeDatabase`) with many tables:
    - Examples: `PERSON`, `STUDENT`, `PASSPORT`, `UNIVERSITY`, `PROGRAM`, `PROGRESS`, `BANK`, `ACCOUNT`, etc.
  - Contains `INITIAL_DATABASE` – the seeded dataset.
  - Key functions:
    - `createPrototypeDatabase()` – returns a deep-cloned initial DB.
    - `getStudentProfilesFromDatabase(db)` – maps normalized tables into `StudentProfile[]`.
    - `updateStudentProfileInDatabase(db, studentProfileId, patch)` – applies profile edits into the normalized tables.
    - `deleteStudentsFromDatabase(db, studentProfileIds)` – cascades deletions.
    - `importStudentProfilesToDatabase(db, records, mode)` – bulk import helper, used by the attache CSV import flow.
  - **Use this file whenever you need to adjust how student data is stored or derived.**

**Storage utilities and hooks**

- `components/app/hooks/storage.ts`
  - `getFromStorage<T>(key, fallback)` – safe `localStorage` JSON read with fallback and SSR-safety.
  - Shared by all storage-backed hooks.

- `components/app/hooks/usePrototypeDatabase.ts`
  - Owns the **student data store**:
    - Hydrates a `database` from `localStorage['prototype_database_v1']` or builds a new one.
    - Derives `students: StudentProfile[]` via `getStudentProfilesFromDatabase`.
    - Persists DB changes back to `localStorage`.
  - Exposes:
    - `students`
    - `updateStudent(id, patch)`
    - `deleteStudents(ids)`
    - `importStudents(records, mode)`
    - `isHydrated`
  - This is the main place to look for **CRUD operations on student records**.

- `components/app/hooks/useAuth.ts`
  - Owns **authentication/session state**:
    - Hydrates `user` from `localStorage['user']`.
    - Hydrates `authPasswords` (per-student password map) from `localStorage['auth_passwords_v1']`.
  - Derives:
    - `currentStudent` – by matching `user.loginId` against student inscription or email.
    - `studentPasswordsByInscription` - password map sourced from `localStorage['auth_passwords_v1']` with optional demo fallback when `NEXT_PUBLIC_DEMO_MODE=true`.
  - Exposes:
    - `user`, `setUser`
    - `currentStudent`
    - `studentPasswordsByInscription`
    - `changeStudentPassword(currentPassword, newPassword)`
  - This hook plus the routers implement the **auth guards**.

- `components/app/hooks/useAnnouncements.ts`
  - Manages `announcements: Announcement[]` and `isHydrated`.
  - Hydrates from `localStorage['announcements']` or a mock constant.
  - Exposes `addAnnouncement`.

- `components/app/hooks/usePermissionRequests.ts`
  - Manages `permissionRequests: PermissionRequest[]` and `isHydrated`.
  - Hydrates from `localStorage['permission_requests_v1']`.
  - Exposes:
    - `permissionRequests`
    - `submitPermissionRequest(inscriptionNumber)`
    - `existingPendingRequests` (derived).

All of these hooks expect to be called from **client components** and are orchestrated centrally in `AppShell`.

---

Feature areas and where to look
-------------------------------

### Landing / marketing

- `components/features/landing/LandingPage.tsx`
  - Landing/marketing page shown at `'/'`.
  - Uses charts (Recharts) and `MOCK_ANNOUNCEMENTS` for a rich hero and stats.
  - Uses `components/layout/Footer.tsx` for the footer.

### Authentication & permission requests

- `components/features/auth/LoginPage.tsx`
  - Login view used at `'/login'`.
  - Handles:
    - Student login (inscription + password).
    - Attache login (email + password semantics tuned in code).
  - Receives:
    - `onLogin(user)` callback from `AppShell`/`PublicAppRouter`.
    - `registeredStudentInscriptions`, `onboardingStudentInscriptions`, and `studentPasswordsByInscription`.
    - `attachePassword` (from `NEXT_PUBLIC_ATTACHE_PASSWORD`) for attache sign-in validation.
    - `demoMode` (from `NEXT_PUBLIC_DEMO_MODE`) to allow demo auth fallback before backend integration.
  - Redirects:
    - Students → `'/student/dashboard'` or `'/onboarding'` based on whether bank details are complete.
    - Attaches → `'/attache/dashboard'`.

- `components/features/auth/PermissionRequestPage.tsx`
  - View for students to request permission (e.g., access) using their inscription.
  - Receives:
    - `existingInscriptions` (from student data).
    - `existingRequests` and `onSubmitRequest` from `usePermissionRequests`.
  - Reached via `'/request-permission'` through `PublicAppRouter`.

**Auth guards (where access control happens)**

- `components/app/routers/StudentAppRouter.tsx`
  - Checks `user.role === STUDENT` and `currentStudent` before rendering any student views.
  - Redirects unauthenticated users to `'/login'`.

- `components/app/routers/AttacheAppRouter.tsx`
  - Checks `user.role === ATTACHE`.
  - Redirects unauthenticated users to `'/login'`.

### Student experience

- `components/features/student/StudentDashboard.tsx`
  - Container for all **student-facing dashboard & settings UI**.
  - Props include:
    - `student`, `announcements`
    - `onUpdate`, `onChangePassword`, `onLogout`
    - `section` (`'dashboard' | 'settings'`)
    - `onNavigateSection`
  - Uses `components/layout/Layout.tsx` with `role={UserRole.STUDENT}`.
  - Internally manages tabs:
    - Overview → `components/features/student/dashboard/StudentDashboardOverview.tsx`
    - Profile → `StudentProfilePanel.tsx` + `StudentContactBankPanel.tsx`
    - Academic → `StudentAcademicProgressPanel.tsx` / `StudentAcademicUpdateForm.tsx`
  - Also renders:
    - `StudentMissingInfoSidebar.tsx` – shows missing documents/info.
    - `StudentPasswordSettings.tsx` for the settings section.

- `components/features/student/dashboard/*`
  - Contains all subpanels/widgets used in the dashboard:
    - `StudentDashboardOverview.tsx`
    - `StudentProfilePanel.tsx`
    - `StudentContactBankPanel.tsx`
    - `StudentAcademicProgressPanel.tsx`
    - `StudentAcademicUpdateForm.tsx`
    - `StudentMissingInfoSidebar.tsx`
    - `StudentPasswordSettings.tsx`
  - These are mostly “dumb” components: they receive data & callbacks from `StudentDashboard`.

### Onboarding (student bank/account completion)

- `components/features/onboarding/OnboardingPage.tsx`
  - Multi-step onboarding flow for students with missing bank/account info.
  - Steps live in `components/features/onboarding/components/`:
    - `PersonalDetailsStep.tsx`
    - `AcademicInfoStep.tsx`
    - `BankRecordsStep.tsx`
    - `ReviewDetailsStep.tsx`
  - `components/features/onboarding/OnboardingProgress.tsx` renders the step indicator.
  - Uses `styles.ts` for input styling helpers.
  - On completion, calls `onComplete(profilePatch)` (wired from `StudentAppRouter`, which uses `updateStudent`) and navigates to `'/student/dashboard'`.

### Attache (admin) experience

- `components/features/attache/AttacheeDashboard.tsx`
  - Container for all **attache-facing dashboards, student management, announcements, permission requests, and imports**.
  - Props include:
    - `students`, `announcements`, `permissionRequests`
    - `onAddAnnouncement`, `onDeleteStudents`, `onImportStudents`
    - `section` (`'dashboard' | 'settings'`)
    - `onNavigateSection`, `onLogout`
  - Uses `components/layout/Layout.tsx` with `role={UserRole.ATTACHE}`.
  - Internally uses tabs for:
    - Students
    - Announcements
    - Permission Requests
  - When `section === 'settings'`, it shows the database import settings UI (`DatabaseImportSection`).

- `components/features/attache/components/*`
  - Key files:
    - `StudentsSection.tsx` – main student list/filtering/selection view.
    - `StudentRecordsTable.tsx` – table rendering for students.
    - `StudentDetailView.tsx` – detailed view of a single student.
    - `StudentAdvancedFilters.tsx`, `StudentQueryToolbar.tsx`, `StudentTablePagination.tsx` – query/filter/pagination UI.
    - `BulkActionsBar.tsx` – bulk actions on selected students.
    - `DataInsightsPanel.tsx` – summary/analytics view.
    - `AnnouncementsSection.tsx` – attache’s announcements management UI.
    - `PermissionRequestsSection.tsx` – lists permission requests.
    - `CommunicationCenter.tsx` – communication-related UI.
    - `DatabaseImportSection.tsx` – CSV import/replace UI for student database.
    - `ExportRecordsModal.tsx` – export modal for student data.

- `components/features/attache/hooks/*`
  - Behavior/state hooks for attache UIs:
    - `useStudentTable.ts` – table sorting/filtering/pagination logic.
    - `useStudentSelection.ts` – selection state & bulk operations.
    - `useStudentFilters.ts` - student query/filter state management.
    - `useStudentExports.ts` – export data preparation logic.

- `components/features/attache/utils/*`
  - `studentData.ts` – utility functions for shaping student data for views.
  - `csvImport.ts` – parses CSV into `StudentProfile[]`, used by `DatabaseImportSection`.

- `components/features/attache/types.ts`
  - Attache-specific types (e.g. table row shapes, view configs) that extend `StudentProfile`.

---

Layout and shared UI
--------------------

- `components/layout/Layout.tsx`
  - Main layout shell for **authenticated** views (student and attache).
  - Provides:
    - Sidebar navigation
    - Topbar with title and actions
    - Responsive layout for main content and side panels
  - Takes `role`, `onLogout`, `activeTab`, `setActiveTab`, `profilePicture`, `showSettingsMenu`.
  - If you want to change the global look/feel of dashboards, start here.

- `components/layout/Footer.tsx`
  - Footer for public/landing pages.

- `components/ui/*`
  - Shared design system components. Examples:
    - `Button.tsx`, `Tabs.tsx`, `Checkbox.tsx`, `FormField.tsx`
    - `ActionCard.tsx`, `AnnouncementCard.tsx`, `ProfilePictureUpload.tsx`
    - `StatusBadge.tsx`, `StatCard.tsx`, `SectionHeader.tsx`
    - `LoadingSpinner.tsx`, `FileUploadDropzone.tsx`, `SegmentedControl.tsx`, `AcademicHistoryItem.tsx`
    - `cn.ts` – utility for class name composition.
  - Prefer using or extending these instead of duplicating UI patterns.

- `components/features/shared/announcements/AnnouncementSections.tsx`
  - Shared components for rendering announcements, reused across features.

---

Constants and configuration
---------------------------

- `constants.tsx`
  - Contains:
    - `MOCK_ANNOUNCEMENTS` – seed data for announcements.
    - `PROGRESS_DATA` – mock data for progress visualizations.

- Global config files
  - `next.config.mjs`, `next-env.d.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.mjs`
  - Workflow automation:
    - `.github/workflows/*.yml` – CI/deploy pipelines.

---

Quick lookup – “where is X?”
----------------------------

- **Student dashboard UI & logic**
  - Container: `components/features/student/StudentDashboard.tsx`
  - Panels: `components/features/student/dashboard/*`
  - Data updates: `components/app/hooks/usePrototypeDatabase.ts` + `data/prototypeDatabase.ts`

- **Student onboarding flow**
  - Flow: `components/features/onboarding/OnboardingPage.tsx`
  - Steps: `components/features/onboarding/components/*`
  - Route wiring: `components/app/routers/StudentAppRouter.tsx` (for `'/onboarding'`)

- **Authentication + guards**
  - Auth state: `components/app/hooks/useAuth.ts`
  - Student guards: `components/app/routers/StudentAppRouter.tsx`
  - Attache guards: `components/app/routers/AttacheAppRouter.tsx`
  - Redirect helper: `components/app/Redirect.tsx`

- **Attache dashboards & student management**
  - Container: `components/features/attache/AttacheeDashboard.tsx`
  - Tables/filters: `components/features/attache/components/*`
  - Hooks: `components/features/attache/hooks/*`
  - CSV import/export: `components/features/attache/utils/*`

- **Announcements**
  - Types: `types.ts`
  - State: `components/app/hooks/useAnnouncements.ts`
  - Shared UI: `components/features/shared/announcements/AnnouncementSections.tsx`
  - Landing usage: `components/features/landing/LandingPage.tsx`

- **Permission requests**
  - State: `components/app/hooks/usePermissionRequests.ts`
  - Student UI: `components/features/auth/PermissionRequestPage.tsx`
  - Attache list UI: `components/features/attache/components/PermissionRequestsSection.tsx`

- **Data model & “API-like” layer**
  - Types/interfaces: `types.ts`
  - DB schema & mapping: `data/prototypeDatabase.ts`
  - Access hook: `components/app/hooks/usePrototypeDatabase.ts`

- **Layout wrappers**
  - Authenticated shell: `components/layout/Layout.tsx`
  - Public footer: `components/layout/Footer.tsx`

This should give you enough orientation to quickly locate any piece of logic or UI and extend the Student Platform safely.



import { notFound } from 'next/navigation';
interface UserTypeSectionPageProps {
  params: Promise<{
    'user-type': string;
    section: string;
  }>;
}

const ALLOWED_SECTIONS = new Set(['dashboard', 'settings']);

export default async function UserTypeSectionPage({ params }: UserTypeSectionPageProps) {
  const { section, 'user-type': userType } = await params;

  if (!ALLOWED_SECTIONS.has(section)) {
    notFound();
  }

  const route =
    userType === 'student'
      ? (section === 'settings' ? '/student/settings' : '/student/dashboard')
      : userType === 'attache'
        ? (section === 'settings' ? '/attache/settings' : '/attache/dashboard')
        : null;

  if (!route) {
    notFound();
  }

  // This page intentionally renders nothing.
  // All UI is rendered by UserTypeRouteShell in the parent layout.
  // Navigation to /[user-type]/[section] triggers layout data re-fetch,
  // which updates AppShell's route prop via usePathname().
  return null;
}

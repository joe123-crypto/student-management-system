import AppShell from '@/components/shell/AppShell';
import { loadAppShellInitialData } from '@/lib/app-shell/initial-data';

export default async function OnboardingRoutePage() {
  const initialData = await loadAppShellInitialData();

  return (
    <AppShell
      route="/onboarding"
      initialUser={initialData.user}
      initialCurrentStudent={initialData.currentStudent}
      initialStudents={initialData.students}
      initialAnnouncements={initialData.announcements}
    />
  );
}


'use client';

import type { User } from '@/types';
import type { AppRoute } from '@/components/shell/routes';
import LandingPage from '@/components/features/landing/LandingPage';
import LoginPage from '@/components/features/auth/LoginPage';
import PermissionRequestPage from '@/components/features/auth/PermissionRequestPage';

interface PublicAppRouterProps {
  route: AppRoute;
  onLogin: (user: User) => void;
  registeredStudentInscriptions: string[];
  onboardingStudentInscriptions: string[];
  studentPasswordsByInscription: Record<string, string>;
  attachePassword: string;
  demoMode: boolean;
  existingPendingRequests: string[];
  onSubmitPermissionRequest: (inscriptionNumber: string) => void;
}

export default function PublicAppRouter({
  route,
  onLogin,
  registeredStudentInscriptions,
  onboardingStudentInscriptions,
  studentPasswordsByInscription,
  attachePassword,
  demoMode,
  existingPendingRequests,
  onSubmitPermissionRequest,
}: PublicAppRouterProps) {
  if (route === '/') {
    return <LandingPage />;
  }

  if (route === '/login') {
    return (
      <LoginPage
        onLogin={onLogin}
        registeredStudentInscriptions={registeredStudentInscriptions}
        onboardingStudentInscriptions={onboardingStudentInscriptions}
        studentPasswordsByInscription={studentPasswordsByInscription}
        attachePassword={attachePassword}
        demoMode={demoMode}
      />
    );
  }

  if (route === '/request-permission') {
    return (
      <PermissionRequestPage
        existingInscriptions={registeredStudentInscriptions}
        existingRequests={existingPendingRequests}
        onSubmitRequest={onSubmitPermissionRequest}
      />
    );
  }

  return null;
}


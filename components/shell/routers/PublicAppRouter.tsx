'use client';

import type { User } from '@/types';
import LandingPage from '@/components/features/landing/LandingPage';
import LoginPage from '@/components/features/auth/LoginPage';
import PermissionRequestPage from '@/components/features/auth/PermissionRequestPage';

type PublicRoute = '/' | '/login' | '/request-permission';

interface PublicAppRouterProps {
  route: PublicRoute;
  onLogin: (user: User) => void;
  registeredStudentInscriptions: string[];
  onboardingStudentInscriptions: string[];
  studentPasswordsByInscription: Record<string, string>;
  attachePassword: string;
  demoMode: boolean;
  existingPendingRequests: string[];
  onSubmitPermissionRequest: (inscriptionNumber: string, fullName: string, passportNumber: string) => void;
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
  switch (route) {
    case '/':
      return <LandingPage />;
    case '/login':
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
    case '/request-permission':
      return (
        <PermissionRequestPage
          existingInscriptions={registeredStudentInscriptions}
          existingRequests={existingPendingRequests}
          onSubmitRequest={onSubmitPermissionRequest}
        />
      );
    default: {
      const unreachable: never = route;
      return unreachable;
    }
  }
}


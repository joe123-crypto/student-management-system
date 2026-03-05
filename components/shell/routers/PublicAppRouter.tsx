'use client';

import LandingPage from '@/components/features/landing/LandingPage';
import LoginPage from '@/components/features/auth/LoginPage';
import PermissionRequestPage from '@/components/features/auth/PermissionRequestPage';

type PublicRoute = '/' | '/login' | '/request-permission';

interface PublicAppRouterProps {
  route: PublicRoute;
  registeredStudentInscriptions: string[];
  onboardingStudentInscriptions: string[];
  demoMode: boolean;
  existingPendingRequests: string[];
  onSubmitPermissionRequest: (inscriptionNumber: string, fullName: string, passportNumber: string) => void;
}

export default function PublicAppRouter({
  route,
  registeredStudentInscriptions,
  onboardingStudentInscriptions,
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
          registeredStudentInscriptions={registeredStudentInscriptions}
          onboardingStudentInscriptions={onboardingStudentInscriptions}
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


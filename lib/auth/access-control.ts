import { UserRole } from '@/types';

export type AccessDecision =
  | { action: 'allow' }
  | { action: 'redirect'; target: string };

export type AccessControlContext = {
  pathname: string;
  isLoggedIn: boolean;
  role?: UserRole;
};

export function getDefaultSignedInRoute(role: UserRole): string {
  return role === UserRole.ATTACHE ? '/attache/dashboard' : '/onboarding';
}

function getRedirectTargetForRole(role?: UserRole): string {
  return role ? getDefaultSignedInRoute(role) : '/login';
}

export function evaluateAccess({ pathname, isLoggedIn, role }: AccessControlContext): AccessDecision {
  if (pathname === '/login' && isLoggedIn) {
    return { action: 'redirect', target: getRedirectTargetForRole(role) };
  }

  if (pathname.startsWith('/student') || pathname === '/onboarding') {
    if (!isLoggedIn) {
      return { action: 'redirect', target: '/login' };
    }

    if (role !== UserRole.STUDENT) {
      return { action: 'redirect', target: getRedirectTargetForRole(role) };
    }
  }

  if (pathname.startsWith('/attache')) {
    if (!isLoggedIn) {
      return { action: 'redirect', target: '/login' };
    }

    if (role !== UserRole.ATTACHE) {
      return { action: 'redirect', target: getRedirectTargetForRole(role) };
    }
  }

  return { action: 'allow' };
}

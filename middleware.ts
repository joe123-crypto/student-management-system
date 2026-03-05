import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/types';

function redirectToLogin(request: NextRequest) {
  const url = new URL('/login', request.url);
  return NextResponse.redirect(url);
}

function redirectToDefaultDashboard(request: NextRequest, role: UserRole) {
  const target = role === UserRole.ATTACHE ? '/attache/dashboard' : '/student/dashboard';
  const url = new URL(target, request.url);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  if (process.env.AUTH_ENABLE_MIDDLEWARE !== 'true') {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const { pathname } = request.nextUrl;
  const role = (token?.role as UserRole | undefined) ?? undefined;
  const isLoggedIn = Boolean(token);

  if (pathname === '/login' && isLoggedIn) {
    return redirectToDefaultDashboard(request, role ?? UserRole.STUDENT);
  }

  if (pathname.startsWith('/student') || pathname === '/onboarding') {
    if (!isLoggedIn) return redirectToLogin(request);
    if (role !== UserRole.STUDENT) return redirectToDefaultDashboard(request, role ?? UserRole.STUDENT);
  }

  if (pathname.startsWith('/attache')) {
    if (!isLoggedIn) return redirectToLogin(request);
    if (role !== UserRole.ATTACHE) return redirectToDefaultDashboard(request, role ?? UserRole.STUDENT);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/onboarding', '/student/:path*', '/attache/:path*'],
};

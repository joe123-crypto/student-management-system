import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/types';
import { evaluateAccess } from '@/lib/auth/access-control';

export async function middleware(request: NextRequest) {
  if (process.env.AUTH_ENABLE_MIDDLEWARE !== 'true') {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  const { pathname } = request.nextUrl;
  const role =
    token && !(token as { revoked?: boolean }).revoked
      ? ((token.role as UserRole | undefined) ?? undefined)
      : undefined;
  const isLoggedIn = Boolean(token?.sub && role);
  const decision = evaluateAccess({ pathname, isLoggedIn, role });

  if (decision.action === 'redirect') {
    return NextResponse.redirect(new URL(decision.target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/onboarding', '/student/:path*', '/attache/:path*'],
};

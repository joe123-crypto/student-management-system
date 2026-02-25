import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import UserTypeRouteShell from '@/components/app/UserTypeRouteShell';

interface UserTypeLayoutProps {
  children: ReactNode;
  params: Promise<{ 'user-type': string }>;
}

const ALLOWED_USER_TYPES = new Set(['student', 'attache']);

export default async function UserTypeLayout({ children, params }: UserTypeLayoutProps) {
  const { 'user-type': userType } = await params;

  if (!ALLOWED_USER_TYPES.has(userType)) {
    notFound();
  }

  return (
    <>
      {children}
      <UserTypeRouteShell userType={userType as 'student' | 'attache'} />
    </>
  );
}

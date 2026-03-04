import { notFound, redirect } from 'next/navigation';

interface UserTypeIndexPageProps {
  params: Promise<{ 'user-type': string }>;
}

const ALLOWED_USER_TYPES = new Set(['student', 'attache']);

export default async function UserTypeIndexPage({ params }: UserTypeIndexPageProps) {
  const { 'user-type': userType } = await params;

  if (!ALLOWED_USER_TYPES.has(userType)) {
    notFound();
  }

  redirect(`/${userType}/dashboard`);
}

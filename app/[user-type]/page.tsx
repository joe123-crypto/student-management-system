import { redirect } from 'next/navigation';

interface UserTypeIndexPageProps {
  params: Promise<{ 'user-type': string }>;
}

export default async function UserTypeIndexPage({ params }: UserTypeIndexPageProps) {
  const { 'user-type': userType } = await params;

  redirect(`/${userType}/dashboard`);
}

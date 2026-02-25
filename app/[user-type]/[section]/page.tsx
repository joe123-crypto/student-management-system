import { notFound } from 'next/navigation';
interface UserTypeSectionPageProps {
  params: Promise<{
    'user-type': string;
    section: string;
  }>;
}

const ALLOWED_USER_TYPES = new Set(['student', 'attache']);
const ALLOWED_SECTIONS = new Set(['dashboard', 'settings']);

export default async function UserTypeSectionPage({ params }: UserTypeSectionPageProps) {
  const { 'user-type': userType, section } = await params;

  if (!ALLOWED_USER_TYPES.has(userType) || !ALLOWED_SECTIONS.has(section)) {
    notFound();
  }

  return null;
}

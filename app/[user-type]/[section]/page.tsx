import { notFound } from 'next/navigation';
interface UserTypeSectionPageProps {
  params: Promise<{
    'user-type': string;
    section: string;
  }>;
}

const ALLOWED_SECTIONS = new Set(['dashboard', 'settings']);

export default async function UserTypeSectionPage({ params }: UserTypeSectionPageProps) {
  const { section } = await params;

  if (!ALLOWED_SECTIONS.has(section)) {
    notFound();
  }

  return null;
}

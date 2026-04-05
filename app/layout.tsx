import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { getServerSession } from 'next-auth';
import './globals.css';
import authConfig from '@/auth.config';
import AuthSessionProvider from '@/components/providers/AuthSessionProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ScholarsAlger',
  description: 'Scholarship and student management platform',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authConfig);

  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        <AuthSessionProvider session={session}>
          <div id="root">{children}</div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}


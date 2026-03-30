import type { Metadata } from 'next';
import './globals.css';
import AuthSessionProvider from '@/components/providers/AuthSessionProvider';

export const metadata: Metadata = {
  title: 'ScholarsAlger',
  description: 'Scholarship and student management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthSessionProvider>
          <div id="root">{children}</div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}


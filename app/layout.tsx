import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScholarSphere',
  description: 'Scholarship and student management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lexend:wght@400;500;600;700;800&family=Quicksand:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}


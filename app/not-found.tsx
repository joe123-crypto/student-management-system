import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="theme-card w-full max-w-2xl rounded-3xl border p-8 text-center md:p-12">
        <p className="theme-accent type-label">404 Error</p>
        <h1 className="theme-heading type-page-title mt-3">
          Page Not Found
        </h1>
        <p className="theme-text-muted type-body mt-4">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--theme-primary)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--theme-primary-strong)]"
          >
            Go To Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-[color:var(--theme-border)] bg-[var(--theme-surface)] px-6 py-3 text-sm font-bold text-[color:var(--theme-text)] transition-colors hover:bg-[var(--theme-surface-strong)]"
          >
            Go To Login
          </Link>
        </div>
      </section>
    </main>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="theme-page flex min-h-screen items-center justify-center px-6 py-12">
      <section className="theme-card relative w-full max-w-3xl overflow-hidden rounded-[2.5rem] border p-8 text-center md:p-12">
        <div className="relative mx-auto flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--theme-primary)] text-xl font-bold text-white shadow-lg shadow-[rgba(0,95,2,0.18)]">
            S
          </div>
          <span className="theme-heading type-brand text-2xl">ScholarsAlger</span>
        </div>

        <div className="relative mx-auto mt-10 max-w-xl">
          <p className="theme-accent type-label">404 Error</p>
          <h1 className="theme-heading type-page-title mt-3">Page Not Found</h1>
          <p className="theme-text-muted type-body mt-4">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--theme-primary)] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_36px_rgba(37,79,34,0.14)] transition-colors hover:bg-[var(--theme-primary-strong)]"
          >
            Return Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--theme-border)] bg-[var(--theme-surface)] px-6 py-3 text-sm font-bold text-[color:var(--theme-text)] transition-colors hover:bg-[var(--theme-surface-strong)]"
          >
            Student Login
          </Link>
        </div>

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/#how-it-works" className="theme-chip-muted rounded-full border px-4 py-2 text-xs font-bold transition-colors hover:text-[color:var(--theme-primary)]">
            How it works
          </Link>
          <Link href="/#tools" className="theme-chip-muted rounded-full border px-4 py-2 text-xs font-bold transition-colors hover:text-[color:var(--theme-primary)]">
            Explore tools
          </Link>
          <Link href="/#announcements" className="theme-chip-muted rounded-full border px-4 py-2 text-xs font-bold transition-colors hover:text-[color:var(--theme-primary)]">
            Announcements
          </Link>
        </div>
      </section>
    </main>
  );
}

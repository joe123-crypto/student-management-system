import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60 md:p-12">
        <p className="font-rounded text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">404 Error</p>
        <h1 className="mt-3 font-rounded text-4xl font-extrabold text-slate-900 md:text-5xl">
          Page Not Found
        </h1>
        <p className="mt-4 text-base text-slate-600 md:text-lg">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Go To Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Go To Login
          </Link>
        </div>
      </section>
    </main>
  );
}

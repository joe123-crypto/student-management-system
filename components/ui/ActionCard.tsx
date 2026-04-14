import React from 'react';

interface ActionCardProps {
  title: string;
  items: string[];
  emptyMessage?: string;
  priorityLabel?: string;
  actionSlot?: React.ReactNode;
}

export default function ActionCard({
  title,
  items,
  emptyMessage = 'Everything is up to date.',
  priorityLabel = 'Priority High',
  actionSlot,
}: ActionCardProps) {
  const hasItems = items.length > 0;

  return (
    <div className="theme-card relative overflow-hidden rounded-[2rem] border p-6 shadow-[0_22px_44px_rgba(37,79,34,0.08)] sm:p-8">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[rgba(245,130,74,0.08)] blur-3xl" />
      <div className="relative z-10 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="theme-text-muted type-label mb-2">
              Action Center
            </p>
            <h4 className="theme-heading type-section-title break-words">{title}</h4>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="type-meta rounded-full border border-[rgba(220,205,166,0.65)] bg-white/70 px-3 py-1.5 font-semibold text-[color:var(--theme-text)]">
              {hasItems ? `${items.length} open` : 'All clear'}
            </div>
            {actionSlot}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {hasItems ? (
            items.map((item, idx) => (
              <div
                key={`${item}-${idx}`}
                className="flex min-w-0 items-start gap-3 rounded-[1.35rem] border border-[rgba(220,205,166,0.5)] bg-white/72 px-4 py-4"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(245,130,74,0.14)] text-[color:var(--theme-primary-soft)]">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 9v2m0 4h.01m-7 4h14c1.333 0 2.167-1.444 1.5-2.6l-7-12.124a1.732 1.732 0 00-3 0L3.5 16.4C2.833 17.556 3.667 19 5 19z"
                    />
                  </svg>
                </div>
                <p className="theme-heading min-w-0 break-words text-sm font-semibold leading-relaxed">
                  {item}
                </p>
              </div>
            ))
          ) : (
            <div className="theme-success flex flex-col items-center justify-center rounded-[1.5rem] border border-[rgba(37,79,34,0.14)] px-6 py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-[color:var(--theme-primary)]">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold">{emptyMessage}</p>
            </div>
          )}
        </div>

        {hasItems ? (
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-[rgba(220,205,166,0.55)] pt-5">
            <span className="theme-text-muted type-label">
              {priorityLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

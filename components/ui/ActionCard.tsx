import React from 'react';

interface ActionCardProps {
  title: string;
  items: string[];
  emptyMessage?: string;
  priorityLabel?: string;
}

export default function ActionCard({
  title,
  items,
  emptyMessage = 'Everything is up to date.',
  priorityLabel = 'Priority High',
}: ActionCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,var(--theme-primary),var(--theme-primary-strong))] p-6 text-white shadow-[0_32px_64px_-16px_rgba(37,79,34,0.34)] sm:p-10">
      <div className="absolute right-[-20%] top-[-20%] h-48 w-48 rounded-full bg-[rgba(245,130,74,0.2)] blur-3xl transition-all group-hover:scale-125" />
      <div className="relative z-10 flex flex-col">
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Action Center</p>
        <h4 className="mb-6 text-2xl font-black leading-tight sm:mb-8 sm:text-3xl">{title}</h4>

        <div className="space-y-5">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <div key={`${item}-${idx}`} className="flex items-start gap-3 group/item cursor-pointer">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md bg-white/10 text-[color:var(--theme-secondary)] transition-all group-hover/item:bg-[color:var(--theme-primary-soft)] group-hover/item:text-white">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-white/78 transition-colors group-hover/item:text-white">{item}</p>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/12 text-[color:var(--theme-secondary)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-white/78">{emptyMessage}</p>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 sm:mt-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/68">{priorityLabel}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
              <svg className="w-4 h-4 text-[color:var(--theme-secondary)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

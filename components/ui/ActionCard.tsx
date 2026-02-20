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
    <div className="bg-[#1a1b3a] text-white rounded-[2rem] p-10 shadow-[0_32px_64px_-16px_rgba(26,27,58,0.3)] relative overflow-hidden group">
      <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl transition-all group-hover:scale-125" />
      <div className="relative z-10 flex flex-col">
        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-4">Action Center</p>
        <h4 className="text-2xl font-black mb-8 leading-tight">{title}</h4>

        <div className="space-y-5">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <div key={`${item}-${idx}`} className="flex items-start gap-3 group/item cursor-pointer">
                <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-indigo-400 mt-0.5 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-all">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors">{item}</p>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-300">{emptyMessage}</p>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{priorityLabel}</span>
            <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
              <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

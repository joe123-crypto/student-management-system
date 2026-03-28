import React from 'react';
import { cn } from './cn';

interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  items: ReadonlyArray<TabItem<T>>;
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
}

export default function Tabs<T extends string>({ items, activeTab, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn('overflow-x-auto pb-1', className)}>
      <div className="inline-flex min-w-full gap-1 rounded-[1.5rem] border border-[rgba(220,205,166,0.72)] bg-[rgba(255,255,255,0.72)] p-1 shadow-[0_12px_26px_rgba(37,79,34,0.05)] sm:min-w-0">
        {items.map((item) => {
          const active = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'rounded-[1.1rem] px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all sm:px-5',
                active
                  ? 'bg-[var(--theme-card)] text-[color:var(--theme-text)] shadow-[0_10px_20px_rgba(37,79,34,0.08)]'
                  : 'text-[color:var(--theme-text-muted)] hover:bg-[rgba(255,255,255,0.82)] hover:text-[color:var(--theme-text)]',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}


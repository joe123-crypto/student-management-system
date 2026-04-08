import React from 'react';
import { cn } from './cn';

interface TabItem<T extends string> {
  id: T;
  label: string;
  shortLabel?: string;
}

interface TabsProps<T extends string> {
  items: ReadonlyArray<TabItem<T>>;
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
  mobileLayout?: 'scroll' | 'grid';
}

export default function Tabs<T extends string>({
  items,
  activeTab,
  onChange,
  className,
  mobileLayout = 'scroll',
}: TabsProps<T>) {
  return (
    <div
      className={cn(
        mobileLayout === 'grid'
          ? 'pb-1'
          : 'overflow-x-auto overflow-y-hidden pb-1 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      <div
        className={cn(
          'rounded-[1.5rem] border border-[rgba(220,205,166,0.72)] bg-[rgba(255,255,255,0.72)] p-1',
          mobileLayout === 'grid'
            ? 'grid min-w-0 gap-1 md:inline-flex md:w-max md:min-w-0'
            : 'inline-flex w-max min-w-full gap-1 pr-6 sm:min-w-0 sm:pr-1',
        )}
        style={
          mobileLayout === 'grid'
            ? { gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {items.map((item) => {
          const active = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'rounded-[1.1rem] px-3 py-3 text-center text-xs font-semibold transition-all md:px-5 md:text-sm',
                mobileLayout === 'grid'
                  ? 'min-w-0 leading-tight'
                  : 'shrink-0 snap-start whitespace-nowrap',
                active
                  ? 'bg-[var(--theme-card)] text-[color:var(--theme-text)]'
                  : 'text-[color:var(--theme-text-muted)] hover:bg-[rgba(255,255,255,0.82)] hover:text-[color:var(--theme-text)]',
              )}
              aria-pressed={active}
            >
              <span className="md:hidden">{item.shortLabel ?? item.label}</span>
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


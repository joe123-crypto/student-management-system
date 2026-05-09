import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  compact?: boolean;
}

export default function Tabs<T extends string>({
  items,
  activeTab,
  onChange,
  className,
  mobileLayout = 'scroll',
  compact = false,
}: TabsProps<T>) {
  const indicatorId = useId();
  const shouldReduceMotion = useReducedMotion();

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
          'border border-[rgba(220,205,166,0.72)] bg-[rgba(255,255,255,0.72)] p-1',
          compact ? 'rounded-2xl' : 'rounded-[1.5rem]',
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
                'relative overflow-hidden text-center font-semibold transition-colors',
                compact ? 'rounded-xl px-3 py-2 text-xs md:px-4' : 'rounded-[1.1rem] px-3 py-3 text-xs md:px-5 md:text-sm',
                mobileLayout === 'grid'
                  ? 'min-w-0 leading-tight'
                  : 'shrink-0 snap-start whitespace-nowrap',
                active
                  ? 'text-[color:var(--theme-text)]'
                  : 'text-[color:var(--theme-text-muted)] hover:bg-[rgba(255,255,255,0.82)] hover:text-[color:var(--theme-text)]',
              )}
              aria-pressed={active}
            >
              {active ? (
                <motion.span
                  layoutId={`tabs-indicator-${indicatorId}`}
                  className={cn(
                    'absolute inset-0 bg-[var(--theme-card)] shadow-[0_12px_24px_rgba(96,83,55,0.08)]',
                    compact ? 'rounded-xl' : 'rounded-[1.1rem]',
                  )}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', bounce: 0.18, duration: 0.45 }
                  }
                />
              ) : null}
              <span className="relative z-10 md:hidden">{item.shortLabel ?? item.label}</span>
              <span className="relative z-10 hidden md:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


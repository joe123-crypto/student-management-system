import React from 'react';
import { cn } from './cn';

export interface TabItem<T extends string> {
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
    <div className={cn('flex gap-3 overflow-x-auto pb-1 sm:gap-6', className)}>
      {items.map((item) => {
        const active = item.id === activeTab;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative whitespace-nowrap px-1.5 pb-3 text-sm font-bold transition-all sm:px-2 sm:pb-5',
              active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600',
            )}
          >
            {item.label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
          </button>
        );
      })}
    </div>
  );
}


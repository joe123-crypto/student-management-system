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
    <div className={cn('flex gap-6 overflow-x-auto', className)}>
      {items.map((item) => {
        const active = item.id === activeTab;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'pb-5 px-2 text-sm font-bold transition-all relative whitespace-nowrap',
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


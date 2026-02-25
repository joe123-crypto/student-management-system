import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import type { SavedView } from '@/components/features/attache/types';

interface SavedViewsBarProps {
  views: SavedView[];
  activeViewId: string | null;
  onApply: (viewId: string) => void;
  onDelete: (viewId: string) => void;
  onSaveCurrent: (name: string) => void;
  compact?: boolean;
}

export default function SavedViewsBar({ views, activeViewId, onApply, onDelete, onSaveCurrent, compact = false }: SavedViewsBarProps) {
  const [name, setName] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSaveCurrent(trimmed);
    setName('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
      <div className={`flex flex-col gap-2 ${compact ? '' : 'md:flex-row'}`}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Save current filter as view..."
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button onClick={handleSave} size="sm" className={`whitespace-nowrap ${compact ? 'w-full' : ''}`}>
          Save View
        </Button>
      </div>
      {views.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {views.map((view) => {
            const active = activeViewId === view.id;
            return (
              <div key={view.id} className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 ${active ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => onApply(view.id)}
                  className={`text-xs font-bold px-2 py-1 rounded-lg transition-colors ${active ? 'text-indigo-700' : 'text-slate-700 hover:text-indigo-600'}`}
                >
                  {view.name}
                </button>
                <button type="button" onClick={() => onDelete(view.id)} className="text-slate-400 hover:text-red-500 px-1 text-sm leading-none">
                  x
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-500">No saved views yet.</p>
      )}
    </div>
  );
}

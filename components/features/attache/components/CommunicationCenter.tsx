import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import type { CommunicationLogEntry } from '@/components/features/attache/types';

const templates = [
  { value: 'MISSING_DOCS', label: 'Missing Documents Reminder' },
  { value: 'PROFILE_UPDATE', label: 'Profile Update Request' },
  { value: 'REVIEW_COMPLETE', label: 'Review Status Update' },
] as const;

interface CommunicationCenterProps {
  selectedCount: number;
  filteredCount: number;
  onSend: (payload: {
    channel: 'EMAIL' | 'SMS';
    template: string;
    scope: 'SELECTED' | 'FILTERED';
    customMessage: string;
  }) => void;
  logs: CommunicationLogEntry[];
}

export default function CommunicationCenter({ selectedCount, filteredCount, onSend, logs }: CommunicationCenterProps) {
  const [channel, setChannel] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [template, setTemplate] = useState<string>('MISSING_DOCS');
  const [scope, setScope] = useState<'SELECTED' | 'FILTERED'>('SELECTED');
  const [customMessage, setCustomMessage] = useState('');

  const recipientCount = scope === 'SELECTED' ? selectedCount : filteredCount;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Communication Center</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Channel</label>
          <select
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={channel}
            onChange={(e) => setChannel(e.target.value as 'EMAIL' | 'SMS')}
          >
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Recipients</label>
          <select
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={scope}
            onChange={(e) => setScope(e.target.value as 'SELECTED' | 'FILTERED')}
          >
            <option value="SELECTED">Selected Students</option>
            <option value="FILTERED">All Filtered</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Template</label>
        <select
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        >
          {templates.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Extra Message (optional)</label>
        <textarea
          rows={3}
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Add context for this communication..."
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">{recipientCount} recipient(s)</p>
        <Button
          size="sm"
          onClick={() => onSend({ channel, template, scope, customMessage })}
          disabled={recipientCount === 0}
        >
          Send
        </Button>
      </div>
      {logs.length > 0 ? (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Dispatches</p>
          {logs.slice(0, 3).map((entry) => (
            <div key={entry.id} className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
              <p className="text-xs font-bold text-slate-700">
                {entry.template} via {entry.channel}
              </p>
              <p className="text-xs text-slate-500">
                {entry.recipientCount} recipients • {entry.sentAt}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
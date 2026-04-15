import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Button from '@/components/ui/Button';
import type { CommunicationLogEntry } from '@/components/features/attache/types';
import { AnimatedCount, dashboardHoverLift, dashboardHoverTransition, dashboardStaggerContainer, dashboardStaggerItem } from '@/components/ui/motion';

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

export default function CommunicationCenter({
  selectedCount,
  filteredCount,
  onSend,
  logs,
}: CommunicationCenterProps) {
  const shouldReduceMotion = useReducedMotion();
  const [channel, setChannel] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [template, setTemplate] = useState<string>('MISSING_DOCS');
  const [scope, setScope] = useState<'SELECTED' | 'FILTERED'>('SELECTED');
  const [customMessage, setCustomMessage] = useState('');

  const recipientCount = scope === 'SELECTED' ? selectedCount : filteredCount;

  return (
    <motion.div
      className="theme-card space-y-4 rounded-2xl border p-5"
      variants={dashboardStaggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.p variants={dashboardStaggerItem} className="theme-text-muted type-label">
        Communication Center
      </motion.p>
      <motion.div variants={dashboardStaggerItem} className="grid grid-cols-2 gap-3">
        <div>
          <label className="theme-text-muted type-label mb-1 block">
            Channel
          </label>
          <select
            className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none"
            value={channel}
            onChange={(e) => setChannel(e.target.value as 'EMAIL' | 'SMS')}
          >
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
          </select>
        </div>
        <div>
          <label className="theme-text-muted type-label mb-1 block">
            Recipients
          </label>
          <select
            className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none"
            value={scope}
            onChange={(e) => setScope(e.target.value as 'SELECTED' | 'FILTERED')}
          >
            <option value="SELECTED">Selected Students</option>
            <option value="FILTERED">All Filtered</option>
          </select>
        </div>
      </motion.div>
      <motion.div variants={dashboardStaggerItem}>
        <label className="theme-text-muted type-label mb-1 block">
          Template
        </label>
        <select
          className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        >
          {templates.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
      </motion.div>
      <motion.div variants={dashboardStaggerItem}>
        <label className="theme-text-muted type-label mb-1 block">
          Message
        </label>
        <textarea
          rows={3}
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          className="theme-input w-full rounded-xl border px-3 py-2 text-sm outline-none"
        />
      </motion.div>
      <motion.div variants={dashboardStaggerItem} className="flex items-center justify-between gap-3">
        <p className="theme-text-muted text-xs">
          <AnimatedCount value={recipientCount} suffix=" recipient(s)" />
        </p>
        <Button
          size="sm"
          onClick={() => onSend({ channel, template, scope, customMessage })}
          disabled={recipientCount === 0}
        >
          Send
        </Button>
      </motion.div>
      {logs.length > 0 ? (
        <motion.div
          variants={dashboardStaggerItem}
          className="space-y-2 border-t border-[rgba(220,205,166,0.55)] pt-3"
        >
          <p className="theme-text-muted type-label">
            Recent Dispatches
          </p>
          <motion.div className="space-y-2" variants={dashboardStaggerContainer}>
            {logs.slice(0, 3).map((entry) => (
            <motion.div
              key={entry.id}
              variants={dashboardStaggerItem}
              whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
              transition={dashboardHoverTransition}
              className="theme-card-muted rounded-xl border p-2.5"
            >
              <p className="theme-heading text-xs font-bold">
                {entry.template} via {entry.channel}
              </p>
              <p className="theme-text-muted text-xs">
                <AnimatedCount value={entry.recipientCount} suffix=" recipients" /> - {entry.sentAt}
              </p>
            </motion.div>
          ))}
          </motion.div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}

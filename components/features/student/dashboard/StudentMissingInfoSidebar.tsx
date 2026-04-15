import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import ActionCard from '@/components/ui/ActionCard';
import Skeleton from '@/components/ui/Skeleton';
import {
  AnimatedCount,
  dashboardHoverLift,
  dashboardHoverTransition,
  dashboardPanelMotion,
  dashboardStaggerContainer,
  dashboardStaggerItem,
} from '@/components/ui/motion';

interface StudentMissingInfoSidebarProps {
  items: string[];
  loading?: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

function WarningIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d="M12 9v2m0 4h.01m-7 4h14c1.333 0 2.167-1.444 1.5-2.6l-7-12.124a1.732 1.732 0 00-3 0L3.5 16.4C2.833 17.556 3.667 19 5 19z"
      />
    </svg>
  );
}

function CheckIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChevronIcon({
  direction,
  className = 'h-4 w-4',
}: {
  direction: 'left' | 'right';
  className?: string;
}) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        d={direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'}
      />
    </svg>
  );
}

const StudentMissingInfoSidebar: React.FC<StudentMissingInfoSidebarProps> = ({
  items,
  loading = false,
  isExpanded,
  onToggleExpanded,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const hasItems = items.length > 0;
  const visibleWarningItems = items.slice(0, 3);
  const toggleLabel = isExpanded ? 'Collapse action center' : 'Expand action center';

  return (
    <aside className="relative self-start">
      <div className="top-6 z-10 rounded-[2rem] transition-all duration-300 md:sticky">
        {loading ? (
          isExpanded ? (
            <div className="theme-card rounded-[2rem] border p-6">
              <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-16 w-40" />
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            </div>
          ) : (
            <div className="theme-card flex w-full items-center justify-between gap-4 rounded-[1.75rem] border p-4 md:min-h-[24rem] md:flex-col md:justify-start md:px-3 md:py-5">
              <div className="flex items-center gap-3 md:flex-col">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="flex items-center gap-2 md:flex-col">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
              </div>
              <div className="flex items-center gap-3 md:mt-auto md:flex-col">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-2xl" />
              </div>
            </div>
          )
        ) : (
          <>
            {isExpanded ? (
              <motion.div {...dashboardPanelMotion}>
                <ActionCard
                  title="Missing Information"
                  items={items}
                  emptyMessage="Your profile is up to date!"
                  priorityLabel="Priority High"
                  actionSlot={
                    <button
                      type="button"
                      onClick={onToggleExpanded}
                      title={toggleLabel}
                      aria-label={toggleLabel}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(220,205,166,0.65)] bg-white/80 text-[color:var(--theme-text)] transition-all hover:-translate-y-0.5 hover:border-[rgba(160,58,19,0.38)] hover:text-[color:var(--theme-primary-soft)]"
                    >
                      <ChevronIcon direction="right" className="h-4 w-4" />
                    </button>
                  }
                />
              </motion.div>
            ) : (
              <motion.button
                type="button"
                onClick={onToggleExpanded}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: 'easeOut' }}
                whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
                title={
                  hasItems
                    ? `${items.length} item${items.length === 1 ? '' : 's'} need attention. ${toggleLabel}.`
                    : toggleLabel
                }
                aria-label={toggleLabel}
                aria-expanded={false}
                className="theme-card theme-panel-soft relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-[1.75rem] border p-4 text-left shadow-[0_22px_44px_rgba(37,79,34,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_52px_rgba(37,79,34,0.1)] md:min-h-[24rem] md:flex-col md:justify-start md:px-3 md:py-5"
              >
                <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[rgba(245,130,74,0.08)] blur-3xl" />

                <motion.div
                  className="relative z-10 flex min-w-0 items-center gap-4 md:flex-col md:items-center"
                  variants={dashboardStaggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    variants={dashboardStaggerItem}
                    transition={dashboardHoverTransition}
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                      hasItems
                        ? 'border-[rgba(245,130,74,0.26)] bg-[rgba(245,130,74,0.12)] text-[color:var(--theme-primary-soft)]'
                        : 'border-[rgba(37,79,34,0.18)] bg-[rgba(37,79,34,0.08)] text-[color:var(--theme-primary)]'
                    }`}
                  >
                    {hasItems ? (
                      <motion.span
                        initial={shouldReduceMotion ? false : { rotate: -10, y: 8, opacity: 0 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { rotate: 0, y: 0, opacity: 1 }}
                        transition={{ delay: 0.12, duration: 0.4, ease: 'easeOut' }}
                      >
                        <WarningIcon className="h-5 w-5" />
                      </motion.span>
                    ) : (
                      <CheckIcon className="h-5 w-5" />
                    )}
                    {hasItems ? (
                      <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--theme-primary-soft)] px-1 text-[11px] font-bold text-white">
                        <AnimatedCount value={items.length} />
                      </span>
                    ) : null}
                  </motion.div>

                  <motion.div className="flex items-center gap-2 md:flex-col md:gap-3" variants={dashboardStaggerContainer}>
                    {hasItems ? (
                      visibleWarningItems.map((item, index) => (
                        <motion.span
                          key={`${item}-${index}`}
                          title={item}
                          variants={dashboardStaggerItem}
                          initial={shouldReduceMotion ? false : { opacity: 0, y: 8, rotate: -6 }}
                          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, rotate: 0 }}
                          transition={{
                            delay: shouldReduceMotion ? 0 : 0.12 + index * 0.06,
                            duration: 0.28,
                            ease: 'easeOut',
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(220,205,166,0.55)] bg-white/78 text-[color:var(--theme-primary-soft)] shadow-sm"
                        >
                          <WarningIcon className="h-4 w-4" />
                        </motion.span>
                      ))
                    ) : (
                      <span className="type-label rounded-full border border-[rgba(37,79,34,0.18)] bg-white/78 px-3 py-1 text-[color:var(--theme-primary)]">
                        Clear
                      </span>
                    )}
                  </motion.div>
                </motion.div>

                <motion.div
                  className="relative z-10 flex items-center gap-3 md:mt-auto md:flex-col"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: shouldReduceMotion ? 0 : 0.18, duration: 0.28, ease: 'easeOut' }}
                >
                  <span className="type-label rounded-full border border-[rgba(220,205,166,0.55)] bg-white/78 px-3 py-1 text-[color:var(--theme-text)]">
                    {hasItems ? <AnimatedCount value={items.length} suffix=" open" /> : 'All clear'}
                  </span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(220,205,166,0.65)] bg-white/82 text-[color:var(--theme-text)]">
                    <ChevronIcon direction="left" className="h-4 w-4" />
                  </span>
                  <span className="sr-only">Action center</span>
                </motion.div>
              </motion.button>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default StudentMissingInfoSidebar;

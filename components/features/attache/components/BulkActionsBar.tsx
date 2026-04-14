import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { AnimatedCount, dashboardHoverLift, dashboardHoverTransition, dashboardStaggerContainer, dashboardStaggerItem } from '@/components/ui/motion';
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Database,
  Eraser,
  FileDown,
  LucideIcon,
  Mail,
  Pencil,
  Plus,
  ScanSearch,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onAddStudent: () => void;
  onEditSelected: () => void;
  onOpenDatabaseQuery: () => void;
  onMarkReviewed: () => void;
  onRequestMissingDocs: () => void;
  onExportSelected: () => void;
  onOpenExportOptions: () => void;
  onOpenDataQuality: () => void;
  onOpenDuplicateDetection: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  isEditActive?: boolean;
  isEditDisabled?: boolean;
  isExportDisabled?: boolean;
  isInsightsDisabled?: boolean;
}

interface ActionIconButtonProps {
  icon: LucideIcon;
  label: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  onClick: () => void;
  disabled?: boolean;
}

interface ToolbarAction {
  icon: LucideIcon;
  label: string;
  variant: ActionIconButtonProps['variant'];
  onClick: () => void;
  disabled: boolean;
}

function ActionIconButton({
  icon: Icon,
  label,
  variant,
  onClick,
  disabled = false,
}: ActionIconButtonProps) {
  return (
    <div className="group/action relative shrink-0">
      <Button
        size="sm"
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        className="h-11 w-11 px-0"
        aria-label={label}
        title={label}
      >
        <Icon className="h-6 w-6 stroke-[2.25]" />
      </Button>
    </div>
  );
}

export default function BulkActionsBar({
  selectedCount,
  onAddStudent,
  onEditSelected,
  onOpenDatabaseQuery,
  onMarkReviewed,
  onRequestMissingDocs,
  onExportSelected,
  onOpenExportOptions,
  onOpenDataQuality,
  onOpenDuplicateDetection,
  onClearSelection,
  onDeleteSelected,
  isEditActive = false,
  isEditDisabled = false,
  isExportDisabled = false,
  isInsightsDisabled = false,
}: BulkActionsBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasSelection = selectedCount > 0;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const container = scrollRef.current;
    if (!container) return;

    const nextCanScrollLeft = container.scrollLeft > 4;
    const nextCanScrollRight = container.scrollLeft + container.clientWidth < container.scrollWidth - 4;

    setCanScrollLeft(nextCanScrollLeft);
    setCanScrollRight(nextCanScrollRight);
  };

  useEffect(() => {
    updateScrollState();

    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollTimerRef.current) {
        window.clearInterval(scrollTimerRef.current);
      }
    };
  }, []);

  const stopAutoScroll = () => {
    if (scrollTimerRef.current) {
      window.clearInterval(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
  };

  const startAutoScroll = (direction: 'left' | 'right') => {
    stopAutoScroll();
    scrollTimerRef.current = window.setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;
      const delta = direction === 'left' ? -18 : 18;
      container.scrollBy({ left: delta });
      updateScrollState();
    }, 16);
  };

  return (
    <motion.div
      className="theme-toolbar group relative w-full max-w-full overflow-hidden rounded-[1.75rem] border px-4 py-4"
      variants={dashboardStaggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <motion.div variants={dashboardStaggerItem} className="min-w-0">
          <p className="theme-accent-soft type-label">Action Center</p>
          <p className="theme-heading text-sm font-semibold sm:text-base">
            {hasSelection ? (
              <AnimatedCount
                value={selectedCount}
                suffix={` record${selectedCount === 1 ? '' : 's'} selected`}
              />
            ) : (
              'Directory tools'
            )}
          </p>
        </motion.div>
        <motion.span
          variants={dashboardStaggerItem}
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
            hasSelection ? 'theme-chip-success' : 'theme-chip-muted'
          }`}
        >
          {hasSelection ? 'Batch mode' : 'Browse mode'}
        </motion.span>
      </div>

      <div className="theme-toolbar-well relative flex items-center border-t pt-4">
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto overflow-y-hidden touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={updateScrollState}
        >
          <motion.div
            className="mx-auto flex w-max items-center gap-2 px-0 pr-10 md:pr-1"
            variants={dashboardStaggerContainer}
            initial="hidden"
            animate="visible"
          >
            {([
              { icon: Plus, label: 'Add Student', variant: 'primary', onClick: onAddStudent, disabled: false },
              { icon: Pencil, label: 'Edit Selected', variant: isEditActive ? 'primary' : 'secondary', onClick: onEditSelected, disabled: isEditDisabled },
              { icon: Database, label: 'Query Database', variant: 'secondary', onClick: onOpenDatabaseQuery, disabled: false },
              { icon: FileDown, label: 'Export', variant: 'success', onClick: onOpenExportOptions, disabled: isExportDisabled },
              { icon: ShieldCheck, label: 'Data Quality', variant: 'secondary', onClick: onOpenDataQuality, disabled: isInsightsDisabled },
              { icon: ScanSearch, label: 'Duplicate Detection', variant: 'secondary', onClick: onOpenDuplicateDetection, disabled: isInsightsDisabled },
              { icon: CheckCheck, label: 'Mark Reviewed', variant: 'secondary', onClick: onMarkReviewed, disabled: !hasSelection },
              { icon: Mail, label: 'Request Missing Docs', variant: 'primary', onClick: onRequestMissingDocs, disabled: !hasSelection },
              { icon: FileDown, label: 'Export Selected', variant: 'success', onClick: onExportSelected, disabled: !hasSelection },
              { icon: Eraser, label: 'Clear Selection', variant: 'ghost', onClick: onClearSelection, disabled: !hasSelection },
              { icon: Trash2, label: 'Delete Selected', variant: 'danger', onClick: onDeleteSelected, disabled: !hasSelection },
            ] satisfies ToolbarAction[]).map((action) => (
              <motion.div
                key={action.label}
                variants={dashboardStaggerItem}
                whileHover={shouldReduceMotion ? undefined : dashboardHoverLift}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                transition={dashboardHoverTransition}
              >
                <ActionIconButton
                  icon={action.icon}
                  label={action.label}
                  variant={action.variant}
                  onClick={action.onClick}
                  disabled={action.disabled}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {canScrollLeft ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 top-4 flex w-14 items-center justify-start bg-gradient-to-r from-[rgba(255,253,248,0.92)] via-[rgba(255,253,248,0.8)] to-transparent opacity-100 transition-opacity md:w-16 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <span className="ml-2 inline-flex text-[color:var(--theme-primary)] md:hidden">
              <ChevronLeft className="h-4 w-4 stroke-[2.25]" />
            </span>
            <button
              type="button"
              className="pointer-events-auto ml-2 hidden items-center justify-center text-[color:var(--theme-primary)] transition-transform hover:scale-110 md:inline-flex"
              onMouseEnter={() => startAutoScroll('left')}
              onMouseLeave={stopAutoScroll}
              onFocus={() => startAutoScroll('left')}
              onBlur={stopAutoScroll}
              aria-label="Scroll controls left"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2.25]" />
            </button>
          </div>
        ) : null}

        {canScrollRight ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 top-4 flex w-14 items-center justify-end bg-gradient-to-l from-[rgba(255,253,248,0.92)] via-[rgba(255,253,248,0.8)] to-transparent opacity-100 transition-opacity md:w-16 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
            <span className="mr-2 inline-flex text-[color:var(--theme-primary)] md:hidden">
              <ChevronRight className="h-4 w-4 stroke-[2.25]" />
            </span>
            <button
              type="button"
              className="pointer-events-auto mr-2 hidden items-center justify-center text-[color:var(--theme-primary)] transition-transform hover:scale-110 md:inline-flex"
              onMouseEnter={() => startAutoScroll('right')}
              onMouseLeave={stopAutoScroll}
              onFocus={() => startAutoScroll('right')}
              onBlur={stopAutoScroll}
              aria-label="Scroll controls right"
            >
              <ChevronRight className="h-4 w-4 stroke-[2.25]" />
            </button>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  filters?: React.ReactNode;
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
  compact?: boolean;
}

interface ActionIconButtonProps {
  icon: LucideIcon;
  label: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  onClick: () => void;
  disabled?: boolean;
  isTooltipActive?: boolean;
  tooltipId?: string;
  onTooltipOpen: (label: string, element: HTMLElement) => void;
  onTooltipClose: () => void;
  compact?: boolean;
}

interface ToolbarAction {
  icon: LucideIcon;
  label: string;
  variant: ActionIconButtonProps['variant'];
  onClick: () => void;
  disabled: boolean;
}

interface ActiveTooltip {
  label: string;
  left: number;
  top: number;
  placement: 'above' | 'below';
}

const TOOLTIP_ID = 'bulk-actions-tooltip';
const INITIAL_TOOLTIP_DELAY = 450;
const WARM_TOOLTIP_DELAY = 35;
const TOOLTIP_CLOSE_DELAY = 70;
const TOOLTIP_WARM_WINDOW = 900;
const TOOLTIP_EDGE_PADDING = 14;
const TOOLTIP_VERTICAL_OFFSET = 8;

function ActionIconButton({
  icon: Icon,
  label,
  variant,
  onClick,
  disabled = false,
  isTooltipActive = false,
  tooltipId,
  onTooltipOpen,
  onTooltipClose,
  compact = false,
}: ActionIconButtonProps) {
  return (
    <div
      className="group/action relative shrink-0"
      onPointerEnter={(event) => onTooltipOpen(label, event.currentTarget)}
      onPointerLeave={onTooltipClose}
      onFocus={(event) => onTooltipOpen(label, event.currentTarget)}
      onBlur={onTooltipClose}
    >
      <Button
        size="sm"
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        className={`${compact ? 'h-10 w-10' : 'h-11 w-11'} px-0`}
        aria-label={label}
        aria-describedby={isTooltipActive ? tooltipId : undefined}
      >
        <Icon className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} stroke-[2.25]`} />
      </Button>
    </div>
  );
}

export default function BulkActionsBar({
  selectedCount,
  filters,
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
  compact = false,
}: BulkActionsBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasSelection = selectedCount > 0;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const tooltipOpenTimerRef = useRef<number | null>(null);
  const tooltipCloseTimerRef = useRef<number | null>(null);
  const tooltipWarmTimerRef = useRef<number | null>(null);
  const isTooltipWarmRef = useRef(false);
  const isTooltipOpenRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);
  const [isTooltipMounted, setIsTooltipMounted] = useState(false);

  const updateScrollState = () => {
    const container = scrollRef.current;
    if (!container) return;

    const nextCanScrollLeft = container.scrollLeft > 4;
    const nextCanScrollRight = container.scrollLeft + container.clientWidth < container.scrollWidth - 4;

    setCanScrollLeft(nextCanScrollLeft);
    setCanScrollRight(nextCanScrollRight);
  };

  const clearTooltipTimer = (timerRef: React.MutableRefObject<number | null>) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const markTooltipWarm = () => {
    isTooltipWarmRef.current = true;
    clearTooltipTimer(tooltipWarmTimerRef);
    tooltipWarmTimerRef.current = window.setTimeout(() => {
      isTooltipWarmRef.current = false;
      tooltipWarmTimerRef.current = null;
    }, TOOLTIP_WARM_WINDOW);
  };

  const getTooltipPosition = (element: HTMLElement): Omit<ActiveTooltip, 'label'> => {
    const rect = element.getBoundingClientRect();
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, TOOLTIP_EDGE_PADDING),
      window.innerWidth - TOOLTIP_EDGE_PADDING,
    );
    const shouldPlaceAbove = rect.bottom + 38 > window.innerHeight;

    return {
      left,
      top: shouldPlaceAbove ? rect.top - TOOLTIP_VERTICAL_OFFSET : rect.bottom + TOOLTIP_VERTICAL_OFFSET,
      placement: shouldPlaceAbove ? 'above' : 'below',
    };
  };

  const showTooltip = (label: string, element: HTMLElement) => {
    const nextTooltip = {
      label,
      ...getTooltipPosition(element),
    };

    setActiveTooltip(nextTooltip);
    isTooltipOpenRef.current = true;
    markTooltipWarm();
  };

  const handleTooltipOpen = (label: string, element: HTMLElement) => {
    clearTooltipTimer(tooltipOpenTimerRef);
    clearTooltipTimer(tooltipCloseTimerRef);
    clearTooltipTimer(tooltipWarmTimerRef);

    const delay = isTooltipOpenRef.current || isTooltipWarmRef.current ? WARM_TOOLTIP_DELAY : INITIAL_TOOLTIP_DELAY;

    tooltipOpenTimerRef.current = window.setTimeout(() => {
      showTooltip(label, element);
      tooltipOpenTimerRef.current = null;
    }, delay);
  };

  const handleTooltipClose = () => {
    clearTooltipTimer(tooltipOpenTimerRef);
    clearTooltipTimer(tooltipCloseTimerRef);

    const shouldKeepTooltipWarm = isTooltipOpenRef.current || isTooltipWarmRef.current;
    if (shouldKeepTooltipWarm) {
      markTooltipWarm();
    }

    tooltipCloseTimerRef.current = window.setTimeout(() => {
      setActiveTooltip(null);
      isTooltipOpenRef.current = false;
      tooltipCloseTimerRef.current = null;
    }, TOOLTIP_CLOSE_DELAY);
  };

  useEffect(() => {
    setIsTooltipMounted(true);
    updateScrollState();

    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollTimerRef.current) {
        window.clearInterval(scrollTimerRef.current);
      }
      clearTooltipTimer(tooltipOpenTimerRef);
      clearTooltipTimer(tooltipCloseTimerRef);
      clearTooltipTimer(tooltipWarmTimerRef);
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
      className={`theme-toolbar group relative w-full max-w-full overflow-hidden border ${
        compact ? 'rounded-3xl px-3 py-3' : 'rounded-[1.75rem] px-4 py-4'
      }`}
      variants={dashboardStaggerContainer}
      initial="hidden"
      animate="visible"
    >
      <div className={`${compact ? 'mb-3 gap-3' : 'mb-4 gap-4'} grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start`}>
        <motion.div variants={dashboardStaggerItem} className="min-w-0">
          <p className="theme-accent-soft type-label">Attache Dashboard</p>
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
        <div className="flex w-full min-w-0 flex-col gap-3 sm:items-center lg:w-auto lg:justify-self-center">
          {filters ? (
            <motion.div variants={dashboardStaggerItem} className="min-w-0">
              {filters}
            </motion.div>
          ) : null}
        </div>
        <div className="flex justify-start lg:justify-end">
          {hasSelection ? (
            <motion.span
              variants={dashboardStaggerItem}
              className="theme-chip-success inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-3 text-xs font-semibold"
            >
              Batch mode
            </motion.span>
          ) : null}
        </div>
      </div>

      <div className={`theme-toolbar-well relative flex items-center justify-center border-t ${compact ? 'pt-3' : 'pt-4'}`}>
        <div
          ref={scrollRef}
          className="-mt-4 w-full overflow-x-auto overflow-y-hidden pt-4 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={updateScrollState}
        >
          <motion.div
            className={`mx-auto flex w-max items-center justify-center ${compact ? 'gap-1.5' : 'gap-2'} px-1`}
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
                  isTooltipActive={activeTooltip?.label === action.label}
                  tooltipId={TOOLTIP_ID}
                  onTooltipOpen={handleTooltipOpen}
                  onTooltipClose={handleTooltipClose}
                  compact={compact}
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

      {isTooltipMounted && activeTooltip
        ? createPortal(
            <div
              id={TOOLTIP_ID}
              role="tooltip"
              className={`pointer-events-none fixed z-[1000] max-w-[min(16rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-md border border-[color:var(--theme-border)] bg-[color:var(--theme-card)] px-2.5 py-1.5 text-xs font-semibold text-[color:var(--theme-text)] shadow-[0_12px_28px_rgba(37,79,34,0.14)] ${
                activeTooltip.placement === 'above' ? '-translate-y-full' : ''
              }`}
              style={{
                left: activeTooltip.left,
                top: activeTooltip.top,
              }}
            >
              {activeTooltip.label}
            </div>,
            document.body,
          )
        : null}
    </motion.div>
  );
}

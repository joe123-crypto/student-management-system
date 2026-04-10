import React, { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import {
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Database,
  Eraser,
  FileDown,
  LucideIcon,
  Mail,
  Plus,
  ScanSearch,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onAddStudent: () => void;
  onOpenDatabaseQuery: () => void;
  onMarkReviewed: () => void;
  onRequestMissingDocs: () => void;
  onExportSelected: () => void;
  onOpenExportOptions: () => void;
  onOpenDataQuality: () => void;
  onOpenDuplicateDetection: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
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
  onOpenDatabaseQuery,
  onMarkReviewed,
  onRequestMissingDocs,
  onExportSelected,
  onOpenExportOptions,
  onOpenDataQuality,
  onOpenDuplicateDetection,
  onClearSelection,
  onDeleteSelected,
  isExportDisabled = false,
  isInsightsDisabled = false,
}: BulkActionsBarProps) {
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
    <div className="theme-accent-subtle group relative flex h-14 w-full max-w-full items-center rounded-2xl border px-3">
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto overflow-y-hidden touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={updateScrollState}
      >
        <div className="mx-auto flex w-max items-center gap-2 px-1 pr-10 md:pr-1">
          <ActionIconButton icon={Plus} label="Add Student" variant="primary" onClick={onAddStudent} />
          <ActionIconButton icon={Database} label="Query Database" variant="secondary" onClick={onOpenDatabaseQuery} />
          <ActionIconButton icon={FileDown} label="Export" variant="success" onClick={onOpenExportOptions} disabled={isExportDisabled} />
          <ActionIconButton icon={ShieldCheck} label="Data Quality" variant="secondary" onClick={onOpenDataQuality} disabled={isInsightsDisabled} />
          <ActionIconButton icon={ScanSearch} label="Duplicate Detection" variant="secondary" onClick={onOpenDuplicateDetection} disabled={isInsightsDisabled} />
          <ActionIconButton icon={CheckCheck} label="Mark Reviewed" variant="secondary" onClick={onMarkReviewed} disabled={!hasSelection} />
          <ActionIconButton icon={Mail} label="Request Missing Docs" variant="primary" onClick={onRequestMissingDocs} disabled={!hasSelection} />
          <ActionIconButton icon={FileDown} label="Export Selected" variant="success" onClick={onExportSelected} disabled={!hasSelection} />
          <ActionIconButton icon={Eraser} label="Clear Selection" variant="ghost" onClick={onClearSelection} disabled={!hasSelection} />
          <ActionIconButton icon={Trash2} label="Delete Selected" variant="danger" onClick={onDeleteSelected} disabled={!hasSelection} />
        </div>
      </div>

      {canScrollLeft ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center justify-start rounded-l-2xl bg-gradient-to-r from-[var(--theme-page)] via-[rgba(247,240,220,0.94)] to-transparent opacity-100 transition-opacity md:w-16 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
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
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-14 items-center justify-end rounded-r-2xl bg-gradient-to-l from-[var(--theme-page)] via-[rgba(247,240,220,0.94)] to-transparent opacity-100 transition-opacity md:w-16 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
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
  );
}

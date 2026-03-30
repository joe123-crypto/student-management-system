import React, { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { BarChart3, ChevronLeft, ChevronRight, FileDown, Filter, Mail, ShieldAlert, Trash2 } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onMarkReviewed: () => void;
  onRequestMissingDocs: () => void;
  onExportSelected: () => void;
  onOpenExportOptions: () => void;
  onOpenAdvancedFilters: () => void;
  onOpenQuerySummary: () => void;
  onOpenDataQuality: () => void;
  onOpenDuplicateDetection: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  isExportDisabled?: boolean;
  isInsightsDisabled?: boolean;
}

export default function BulkActionsBar({
  selectedCount,
  onMarkReviewed,
  onRequestMissingDocs,
  onExportSelected,
  onOpenExportOptions,
  onOpenAdvancedFilters,
  onOpenQuerySummary,
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
    <div className="theme-accent-subtle group relative inline-block max-w-full rounded-2xl border px-4 py-3">
      <div
        ref={scrollRef}
        className="max-w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={updateScrollState}
      >
        <div className="flex min-w-max items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onOpenAdvancedFilters} className="shrink-0 whitespace-nowrap">
            <Filter className="w-4 h-4" />
            Advanced Filtering
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={onOpenExportOptions}
            disabled={isExportDisabled}
            className="shrink-0 whitespace-nowrap"
          >
            <FileDown className="w-4 h-4" />
            Export
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onOpenQuerySummary}
            disabled={isInsightsDisabled}
            className="shrink-0 whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4" />
            Query Summary
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onOpenDataQuality}
            disabled={isInsightsDisabled}
            className="shrink-0 whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4" />
            Data Quality
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onOpenDuplicateDetection}
            disabled={isInsightsDisabled}
            className="shrink-0 whitespace-nowrap"
          >
            <ShieldAlert className="w-4 h-4" />
            Duplicate Detection
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onMarkReviewed}
            disabled={!hasSelection}
            className="shrink-0 whitespace-nowrap"
          >
            Mark Reviewed
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={onRequestMissingDocs}
            disabled={!hasSelection}
            className="shrink-0 px-3"
            title="Request Missing Docs"
            aria-label="Request Missing Docs"
          >
            <Mail className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={onExportSelected}
            disabled={!hasSelection}
            className="shrink-0 px-3"
            title="Export Selected"
            aria-label="Export Selected"
          >
            <FileDown className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onClearSelection} disabled={!hasSelection} className="shrink-0 whitespace-nowrap">
            Clear
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={onDeleteSelected}
            disabled={!hasSelection}
            className="shrink-0 px-3"
            title="Delete Selected"
            aria-label="Delete Selected"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {canScrollLeft ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-16 items-center justify-start rounded-l-2xl bg-gradient-to-r from-[var(--theme-page)] via-[rgba(247,240,220,0.94)] to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            className="pointer-events-auto ml-2 inline-flex items-center justify-center text-[color:var(--theme-primary)] transition-transform hover:scale-110"
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
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-16 items-center justify-end rounded-r-2xl bg-gradient-to-l from-[var(--theme-page)] via-[rgba(247,240,220,0.94)] to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            className="pointer-events-auto mr-2 inline-flex items-center justify-center text-[color:var(--theme-primary)] transition-transform hover:scale-110"
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

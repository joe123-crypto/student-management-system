import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import type { SavedView, StudentQueryState } from '@/components/features/attache/types';

interface UseSavedViewsResult {
  query: StudentQueryState;
  savedViews: SavedView[];
  activeSavedViewId: string | null;
  setQuery: Dispatch<SetStateAction<StudentQueryState>>;
  updateQuery: (patch: Partial<StudentQueryState>) => void;
  resetAdvancedFilters: () => void;
  saveCurrentView: (name: string) => void;
  applySavedView: (viewId: string) => void;
  deleteSavedView: (viewId: string) => void;
}

const makeId = () => Math.random().toString(36).slice(2, 11);

export default function useSavedViews(storageKey: string, defaultQuery: StudentQueryState): UseSavedViewsResult {
  const [query, setQuery] = useState<StudentQueryState>(defaultQuery);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeSavedViewId, setActiveSavedViewId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as SavedView[];
      setSavedViews(parsed);
    } catch {
      setSavedViews([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(savedViews));
  }, [savedViews, storageKey]);

  const updateQuery = useCallback((patch: Partial<StudentQueryState>) => {
    setQuery((prev) => ({ ...prev, ...patch }));
    setActiveSavedViewId(null);
  }, []);

  const resetAdvancedFilters = useCallback(() => {
    setQuery((prev) => ({
      ...prev,
      university: defaultQuery.university,
      program: defaultQuery.program,
      academicYear: defaultQuery.academicYear,
      missingData: defaultQuery.missingData,
      startDateFrom: defaultQuery.startDateFrom,
      startDateTo: defaultQuery.startDateTo,
      documentStatus: defaultQuery.documentStatus,
      duplicatesOnly: defaultQuery.duplicatesOnly,
    }));
    setActiveSavedViewId(null);
  }, [
    defaultQuery.academicYear,
    defaultQuery.documentStatus,
    defaultQuery.duplicatesOnly,
    defaultQuery.missingData,
    defaultQuery.program,
    defaultQuery.startDateFrom,
    defaultQuery.startDateTo,
    defaultQuery.university,
  ]);

  const saveCurrentView = useCallback(
    (name: string) => {
      const view: SavedView = {
        id: makeId(),
        name,
        query,
        createdAt: new Date().toISOString(),
      };
      setSavedViews((prev) => [view, ...prev]);
      setActiveSavedViewId(view.id);
    },
    [query],
  );

  const applySavedView = useCallback(
    (viewId: string) => {
      const view = savedViews.find((entry) => entry.id === viewId);
      if (!view) return;
      setQuery(view.query);
      setActiveSavedViewId(view.id);
    },
    [savedViews],
  );

  const deleteSavedView = useCallback(
    (viewId: string) => {
      setSavedViews((prev) => prev.filter((entry) => entry.id !== viewId));
      if (activeSavedViewId === viewId) setActiveSavedViewId(null);
    },
    [activeSavedViewId],
  );

  return {
    query,
    savedViews,
    activeSavedViewId,
    setQuery,
    updateQuery,
    resetAdvancedFilters,
    saveCurrentView,
    applySavedView,
    deleteSavedView,
  };
}

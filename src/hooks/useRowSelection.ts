"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Tracks selected row IDs as a Set, independent of which page is currently
 * shown — selecting rows on page 1, then moving to page 2, doesn't lose
 * page 1's selection. "Select all" only ever affects the currently-visible
 * rows (the standard bulk-select pattern), not every row across every page.
 */
export function useRowSelection<T>(rows: T[], keyField: (row: T) => string) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const visibleIds = useMemo(() => rows.map(keyField), [rows, keyField]);

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isAllVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const isSomeVisibleSelected = !isAllVisibleSelected && visibleIds.some((id) => selectedIds.has(id));

  const toggleAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [isAllVisibleSelected, visibleIds]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  return {
    selectedIds,
    selectedIdList: useMemo(() => Array.from(selectedIds), [selectedIds]),
    selectedCount: selectedIds.size,
    toggleRow,
    toggleAllVisible,
    isAllVisibleSelected,
    isSomeVisibleSelected,
    clearSelection,
  };
}

export type RowSelectionState = ReturnType<typeof useRowSelection>;

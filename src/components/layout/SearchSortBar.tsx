"use client";

import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

interface SearchSortBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Optional extra controls (e.g. a role filter) rendered to the right of the search box. */
  children?: React.ReactNode;
}

/**
 * Search only — sorting now happens by clicking a table's own column headers
 * (see TableHeaderCell), so there's no separate "sort by" dropdown here
 * anymore. Kept the filename for now since every page already imports it.
 */
export default function SearchSortBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search by name...",
  children,
}: SearchSortBarProps) {
  // Local debounce so we're not re-fetching on every keystroke.
  const [draftSearch, setDraftSearch] = useState(searchValue);
  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(draftSearch), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftSearch]);

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <FiSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={draftSearch}
          onChange={(e) => setDraftSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-ink
            placeholder:text-ink-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

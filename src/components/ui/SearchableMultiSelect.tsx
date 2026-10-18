"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";

export interface SearchableOption {
  value: string;
  label: string;
  description?: string;
}

export interface SearchablePage {
  options: SearchableOption[];
  hasMore: boolean;
}

export type SearchableOptionsLoader = (
  query: string,
  page: number,
  pageSize: number,
) => Promise<SearchablePage>;

interface SearchableMultiSelectProps {
  label: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  options?: readonly SearchableOption[];
  loadOptions?: SearchableOptionsLoader;
  placeholder?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  disabled?: boolean;
  error?: string;
}

export default function SearchableMultiSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  loadOptions,
  placeholder = "Select options",
  searchPlaceholder = "Search...",
  pageSize = 20,
  disabled = false,
  error,
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [remoteOptions, setRemoteOptions] = useState<SearchableOption[]>([]);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const dropdownId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);

  const staticOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return options.filter((option) =>
      `${option.label} ${option.description ?? ""}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [options, query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !loadOptions) return;

    const requestId = ++requestIdRef.current;
    pageRef.current = 1;
    loadingRef.current = true;

    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      setLoadError("");
      setRemoteOptions([]);
      setHasMore(false);

      loadOptions(query.trim(), 1, pageSize)
        .then((result) => {
          if (requestId !== requestIdRef.current) return;
          setRemoteOptions(result.options);
          setHasMore(result.hasMore);
        })
        .catch((cause: unknown) => {
          if (requestId !== requestIdRef.current) return;
          setLoadError(
            cause instanceof Error ? cause.message : "Could not load options. Try again.",
          );
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          loadingRef.current = false;
          setIsLoading(false);
        });
    }, 200);

    return () => {
      window.clearTimeout(timeout);
      requestIdRef.current += 1;
      loadingRef.current = false;
    };
  }, [isOpen, loadOptions, pageSize, query, retryCount]);

  const loadNextPage = () => {
    if (loadOptions) {
      if (!hasMore || loadingRef.current) return;

      const requestId = requestIdRef.current;
      const nextPage = pageRef.current + 1;
      loadingRef.current = true;
      setIsLoading(true);
      setLoadError("");
      loadOptions(query.trim(), nextPage, pageSize)
        .then((result) => {
          if (requestId !== requestIdRef.current) return;
          pageRef.current = nextPage;
          setRemoteOptions((current) => {
            const seen = new Set(current.map((option) => option.value));
            return [...current, ...result.options.filter((option) => !seen.has(option.value))];
          });
          setHasMore(result.hasMore);
        })
        .catch((cause: unknown) => {
          if (requestId !== requestIdRef.current) return;
          setLoadError(
            cause instanceof Error ? cause.message : "Could not load more options. Try again.",
          );
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          loadingRef.current = false;
          setIsLoading(false);
        });
      return;
    }

    setVisibleCount((current) => Math.min(current + pageSize, staticOptions.length));
  };

  const visibleOptions = loadOptions
    ? remoteOptions
    : staticOptions.slice(0, visibleCount);
  const selectedLabels = value.map(
    (selected) =>
      options.find((option) => option.value === selected)?.label ??
      remoteOptions.find((option) => option.value === selected)?.label ??
      selected,
  );

  const toggleValue = (selectedValue: string) => {
    onChange(
      value.includes(selectedValue)
        ? value.filter((item) => item !== selectedValue)
        : [...value, selectedValue],
    );
  };

  const handleScroll = () => {
    const list = listRef.current;
    if (!list || isLoading) return;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 32) loadNextPage();
  };

  return (
    <div className="w-full" ref={wrapperRef}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div className="relative">
        <button
          id={dropdownId}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-describedby={error ? `${name}-error` : undefined}
          onClick={() => {
            setVisibleCount(pageSize);
            setIsOpen((current) => !current);
          }}
          className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-surface px-3 py-2.5 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50
            ${error ? "border-danger" : "border-border focus:border-primary"}`}
        >
          <span className={selectedLabels.length ? "truncate text-ink" : "text-ink-muted/70"}>
            {selectedLabels.length
              ? selectedLabels.length <= 2
                ? selectedLabels.join(", ")
                : `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2} more`
              : placeholder}
          </span>
          <FiChevronDown
            size={16}
            className={`shrink-0 text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-floating">
            <div className="border-b border-border p-3">
              <Input
                name={`${name}-search`}
                label="Search options"
                icon={FiSearch}
                value={query}
                placeholder={searchPlaceholder}
                autoComplete="off"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleCount(pageSize);
                  if (listRef.current) listRef.current.scrollTop = 0;
                }}
              />
            </div>
            <div
              ref={listRef}
              role="group"
              aria-labelledby={dropdownId}
              onScroll={handleScroll}
              className="max-h-56 space-y-1 overflow-y-auto p-3 [scrollbar-color:var(--color-primary-light)_transparent] [scrollbar-width:thin]"
            >
              {visibleOptions.map((option, index) => (
                <div
                  key={option.value}
                  className="rounded-lg px-2 py-2 hover:bg-surface-tint"
                >
                  <Checkbox
                    name={`${name}-${index}`}
                    checked={value.includes(option.value)}
                    onChange={() => toggleValue(option.value)}
                    label={
                      <span className="block">
                        <span className="block font-medium text-ink">{option.label}</span>
                        {option.description && (
                          <span className="mt-0.5 block text-xs text-ink-muted">
                            {option.description}
                          </span>
                        )}
                      </span>
                    }
                  />
                </div>
              ))}
              {!isLoading && !loadError && visibleOptions.length === 0 && (
                <p className="px-2 py-4 text-center text-sm text-ink-muted">
                  No matching options.
                </p>
              )}
              {isLoading && (
                <p className="px-2 py-3 text-center text-sm text-ink-muted" role="status">
                  Loading options…
                </p>
              )}
              {loadError && (
                <div className="px-2 py-3 text-sm text-danger" role="alert">
                  <p>{loadError}</p>
                  {loadOptions && (
                    <button
                      type="button"
                      onClick={() => {
                        if (pageRef.current === 1) {
                          setRetryCount((current) => current + 1);
                        } else {
                          loadNextPage();
                        }
                      }}
                      className="mt-1 font-medium underline"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
              {!loadOptions && visibleCount < staticOptions.length && (
                <p className="px-2 py-2 text-center text-xs text-ink-muted">
                  Scroll for more options
                </p>
              )}
            </div>
            {value.length > 0 && (
              <div className="flex items-center justify-between border-t border-border px-3 py-2">
                <span className="text-xs text-ink-muted">{value.length} selected</span>
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p id={`${name}-error`} className="mt-1.5 text-caption text-danger">{error}</p>}
    </div>
  );
}

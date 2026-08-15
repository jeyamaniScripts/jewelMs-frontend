"use client";

import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import type { PaginationMeta } from "@/types/dataTable";
import Dropdown from "@/components/ui/Dropdown";

const LIMIT_OPTIONS = [
  { value: "10", label: "10 / page" },
  { value: "20", label: "20 / page" },
  { value: "50", label: "50 / page" },
  { value: "100", label: "100 / page" },
];

export default function Pagination({
  pagination,
  onPageChange,
  onLimitChange,
}: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}) {
  const { page, limit, total, totalPages } = pagination;
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <div className="flex items-center gap-3 text-caption text-ink-muted">
        <span className="whitespace-nowrap">
          {startItem}–{endItem} of {total}
        </span>
        <div className="w-32">
          <Dropdown
            options={LIMIT_OPTIONS}
            value={String(limit)}
            onChange={(value) => onLimitChange(Number(value))}
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
          aria-label="First page"
        >
          <FiChevronsLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
          aria-label="Previous page"
        >
          <FiChevronLeft size={16} />
        </button>
        <span className="px-2 text-sm text-ink">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
          aria-label="Next page"
        >
          <FiChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
          aria-label="Last page"
        >
          <FiChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}

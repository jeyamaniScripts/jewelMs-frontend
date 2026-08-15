"use client";

import { useEffect, useRef, useState } from "react";
import { FiColumns, FiCheck } from "react-icons/fi";
import type { ColumnDef } from "@/types/dataTable";

export default function ColumnVisibilityMenu<T>({
  columns,
  visibleKeys,
  onChange,
}: {
  columns: ColumnDef<T>[];
  visibleKeys: string[];
  onChange: (keys: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleColumn = (key: string) => {
    onChange(visibleKeys.includes(key) ? visibleKeys.filter((k) => k !== key) : [...visibleKeys, key]);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink-muted hover:border-primary hover:text-primary"
      >
        <FiColumns size={15} /> Columns
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-1.5 w-56 rounded-xl border border-border bg-surface p-1.5 shadow-floating">
          {columns.map((column) => {
            const isVisible = visibleKeys.includes(column.key);
            return (
              <button
                key={column.key}
                type="button"
                disabled={column.alwaysVisible}
                onClick={() => toggleColumn(column.key)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-ink hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-50"
              >
                {column.header}
                {isVisible && <FiCheck size={15} className="shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

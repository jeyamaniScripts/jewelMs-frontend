"use client";

import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import type { ColumnDef } from "@/types/dataTable";

export default function TableHeaderCell<T>({
  column,
  isActive,
  order,
  onSort,
}: {
  column: ColumnDef<T>;
  isActive: boolean;
  order: "asc" | "desc";
  onSort: () => void;
}) {
  const alignClass = column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left";
  const baseClass = `px-4 py-3.5 text-caption font-semibold uppercase tracking-wide text-white ${alignClass}`;

  if (!column.sortable) {
    return <th className={baseClass}>{column.header}</th>;
  }

  return (
    <th className={baseClass}>
      <button
        type="button"
        onClick={onSort}
        className={`inline-flex items-center gap-1.5 transition-opacity hover:opacity-100
          ${isActive ? "opacity-100" : "opacity-80"}`}
      >
        {column.header}
        <span className="flex flex-col -space-y-1">
          <FiChevronUp size={15} className={isActive && order === "asc" ? "text-white" : "text-white/40"} />
          <FiChevronDown size={15} className={isActive && order === "desc" ? "text-white" : "text-white/40"} />
        </span>
      </button>
    </th>
  );
}

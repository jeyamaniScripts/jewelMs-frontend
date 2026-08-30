"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MdViewColumn, MdCheckBox, MdCheckBoxOutlineBlank, MdIndeterminateCheckBox } from "react-icons/md";
import type { ColumnDef, PaginationMeta } from "@/types/dataTable";
import type { Role } from "@/types/auth";
import type { RowSelectionState } from "@/hooks/useRowSelection";
import TableHeaderCell from "./TableHeaderCell";
import Pagination from "./Pagination";
import ColumnVisibilityMenu from "./ColumnVisibilityMenu";
import ExportMenu from "./ExportMenu";
import ColumnArrangeModal from "./ColumnArrangeModal";
import { useColumnLayout } from "@/hooks/useColumnLayout";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  keyField: (row: T) => string;
  sortBy: string;
  order: "asc" | "desc";
  onSortChange: (key: string) => void;
  visibleColumnKeys: string[];
  onVisibleColumnsChange: (keys: string[]) => void;
  pagination: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  /** Adds a totals row at the bottom — supply `footer` on the relevant columns. */
  showFooter?: boolean;
  /** Message shown inside the table body when there's no data — table header/search/columns stay visible. */
  emptyMessage?: ReactNode;
  /** Card renderer used below the `md` breakpoint instead of the table. */
  mobileCard: (row: T) => ReactNode;
  isLoading?: boolean;
  skeletonRowCount?: number;
  /** Set to enable the Export (Excel/PDF/Print) button — this is also the
   *  base filename. Omit to hide export entirely for this table. */
  exportFilename?: string;
  /** Restricts who sees the Export button, beyond whoever can already see this table. */
  exportRoles?: Role[];
  /** "Which branch's data" — shown in the export header block. */
  exportScopeLabel?: string;
  /** Unique key for this table (e.g. "employees") — enables persisted
   *  column preferences (order and/or visibility, depending on
   *  `columnControls`) remembered per person. Omit to keep this table's
   *  columns in their declared order with no persistence at all. */
  module?: string;
  /** "arrange" = drag-to-reorder + visibility in one modal (no separate
   *  Columns button). "toggle" = the simple show/hide dropdown only, no
   *  reordering (still persisted via `module`, just without drag support).
   *  Never both on the same table. Defaults to "toggle". */
  columnControls?: "arrange" | "toggle";
  /** Enables a checkbox column (with header select-all) — omit to leave this
   *  table without selection entirely. Built once, reusable on any table by
   *  passing the return value of `useRowSelection`. */
  rowSelection?: RowSelectionState;
}

function SelectAllCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 cursor-pointer rounded accent-primary"
      aria-label="Select all"
    />
  );
}

function SkeletonCell() {
  return (
    <td className="px-4 py-3.5">
      <div className="h-3.5 w-full max-w-[140px] animate-pulse rounded bg-surface-tint" />
    </td>
  );
}

export default function DataTable<T>({
  columns,
  rows,
  keyField,
  sortBy,
  order,
  onSortChange,
  visibleColumnKeys: externalVisibleKeys,
  onVisibleColumnsChange: externalOnVisibleChange,
  pagination,
  onPageChange,
  onLimitChange,
  showFooter = false,
  emptyMessage = "No records found.",
  mobileCard,
  isLoading = false,
  skeletonRowCount = 5,
  exportFilename,
  exportRoles,
  exportScopeLabel,
  module,
  columnControls = "toggle",
  rowSelection,
}: DataTableProps<T>) {
  const [isArranging, setIsArranging] = useState(false);
  const layout = useColumnLayout(module, columns);

  // When `module` is set, DataTable manages order + visibility itself
  // (seeded from that person's saved arrangement); otherwise it defers
  // entirely to whatever the parent table component already controls —
  // same as before, nothing changes for tables that don't opt in.
  const visibleColumnKeys = module ? layout.visibleColumnKeys : externalVisibleKeys;
  const onVisibleColumnsChange = module ? layout.setVisibleColumnKeys : externalOnVisibleChange;
  const columnOrder = module ? layout.columnOrder : columns.map((c) => c.key);

  const visibleColumns = columnOrder
    .filter((key) => visibleColumnKeys.includes(key))
    .map((key) => columns.find((c) => c.key === key))
    .filter((c): c is ColumnDef<T> => !!c);

  const isEmpty = !isLoading && rows.length === 0;

  // Client-side sort of whatever page of rows is currently loaded. This is
  // deliberately independent of the server call — sorting feels instant,
  // and still works even if a page forgot to wire up (or briefly hasn't
  // finished) the server-side sort request.
  const activeSortColumn = columns.find((c) => c.key === sortBy);
  const sortedRows =
    activeSortColumn?.sortValue
      ? [...rows].sort((a, b) => {
          const av = activeSortColumn.sortValue!(a);
          const bv = activeSortColumn.sortValue!(b);
          const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
          return order === "asc" ? cmp : -cmp;
        })
      : rows;

  return (
    <div>
      <div className="mb-3 flex justify-end gap-2">
        {exportFilename && (
          <ExportMenu
            columns={visibleColumns}
            rows={sortedRows}
            filename={exportFilename}
            allowedRoles={exportRoles}
            scopeLabel={exportScopeLabel}
          />
        )}
        {module && columnControls === "arrange" ? (
          <button
            type="button"
            onClick={() => setIsArranging(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink-muted hover:border-primary hover:text-primary"
          >
            <MdViewColumn size={16} /> Arrange
          </button>
        ) : (
          <ColumnVisibilityMenu
            columns={columns}
            visibleKeys={visibleColumnKeys}
            onChange={(keys) => {
              onVisibleColumnsChange(keys);
              // Toggle mode has no explicit "Save" button (that's the whole
              // point — it's meant to stay simple) — persist quietly in the
              // background instead, using the fresh keys directly rather
              // than the hook's not-yet-updated state.
              if (module) layout.saveLayout({ visibleColumnKeys: keys }, true);
            }}
          />
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto border border-border bg-surface shadow-card md:block">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-primary-dark">
              {rowSelection && (
                <th className="w-10 px-4 py-3.5">
                  <SelectAllCheckbox
                    checked={rowSelection.isAllVisibleSelected}
                    indeterminate={rowSelection.isSomeVisibleSelected}
                    onChange={rowSelection.toggleAllVisible}
                  />
                </th>
              )}
              {visibleColumns.map((column) => (
                <TableHeaderCell
                  key={column.key}
                  column={column}
                  isActive={sortBy === column.key}
                  order={order}
                  onSort={() => onSortChange(column.key)}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-b border-border last:border-0">
                  {rowSelection && <SkeletonCell />}
                  {visibleColumns.map((column) => (
                    <SkeletonCell key={column.key} />
                  ))}
                </tr>
              ))}

            {isEmpty && (
              <tr>
                <td
                  colSpan={visibleColumns.length + (rowSelection ? 1 : 0)}
                  className="px-4 py-16 text-center text-ink-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!isLoading &&
              sortedRows.map((row) => {
                const rowId = keyField(row);
                const isSelected = rowSelection?.selectedIds.has(rowId) ?? false;
                return (
                  <tr
                    key={rowId}
                    className={`border-b border-border last:border-0 hover:bg-surface-tint/50 ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    {rowSelection && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => rowSelection.toggleRow(rowId)}
                          className="h-4 w-4 cursor-pointer rounded accent-primary"
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    {visibleColumns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 ${
                          column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""
                        }`}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
          {showFooter && !isLoading && !isEmpty && (
            <tfoot>
              <tr className="border-t-2 border-border bg-surface-tint font-medium text-ink">
                {rowSelection && <td className="px-4 py-3" />}
                {visibleColumns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 ${column.align === "right" ? "text-right" : ""}`}>
                    {column.footer ? column.footer(sortedRows) : null}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {isLoading &&
          Array.from({ length: skeletonRowCount }).map((_, i) => (
            <div key={`mskeleton-${i}`} className="rounded-2xl border border-border bg-surface p-4 shadow-card">
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-tint" />
              <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-surface-tint" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-surface-tint" />
            </div>
          ))}

        {isEmpty && (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center text-ink-muted shadow-card">
            {emptyMessage}
          </div>
        )}

        {!isLoading && sortedRows.map((row) => <div key={keyField(row)}>{mobileCard(row)}</div>)}
      </div>

      {pagination && pagination.total > 0 && (
        <div className="mt-4">
          <Pagination pagination={pagination} onPageChange={onPageChange} onLimitChange={onLimitChange} />
        </div>
      )}

      {module && columnControls === "arrange" && (
        <ColumnArrangeModal
          open={isArranging}
          onClose={() => setIsArranging(false)}
          columns={columns}
          columnOrder={layout.columnOrder}
          visibleColumnKeys={layout.visibleColumnKeys}
          onApply={(newOrder, newVisible) => {
            layout.setColumnOrder(newOrder);
            layout.setVisibleColumnKeys(newVisible);
          }}
          onSave={(newOrder, newVisible) =>
            layout.saveLayout({ columnOrder: newOrder, visibleColumnKeys: newVisible })
          }
          onResetToDefault={layout.resetToDefault}
        />
      )}
    </div>
  );
}

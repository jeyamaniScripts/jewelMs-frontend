import type { ReactNode } from "react";

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  /** Columns default to visible unless this is explicitly false. */
  defaultVisible?: boolean;
  /** Can't be hidden via the column-visibility menu (e.g. the primary name column, Actions). */
  alwaysVisible?: boolean;
  align?: "left" | "center" | "right";
  render: (row: T) => ReactNode;
  /** Extracts a comparable value for this column — lets DataTable sort the
   *  currently-loaded rows client-side, instantly, without waiting on (or
   *  depending entirely on) the server's sort. Only needed on sortable columns. */
  sortValue?: (row: T) => string | number;
  /** Plain text/number for this column, used by Excel/PDF/Print export —
   *  `render` returns JSX, which isn't usable there. Columns without this
   *  (e.g. Actions) are simply left out of exports. */
  exportValue?: (row: T) => string | number;
  /** Renders a cell in the optional totals footer row — omit for columns with nothing to total. */
  footer?: (rows: T[]) => ReactNode;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

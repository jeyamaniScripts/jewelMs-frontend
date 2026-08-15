"use client";

import { useEffect, useRef, useState } from "react";
import { MdFileDownload, MdCheck } from "react-icons/md";
import { BsFileEarmarkExcel, BsFileEarmarkPdf, BsPrinter } from "react-icons/bs";
import { useAppSelector } from "@/redux/hooks";
import type { ColumnDef } from "@/types/dataTable";
import type { Role } from "@/types/auth";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ExportMenuProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  /** Base filename, no extension — e.g. "brands" becomes "brands.xlsx". */
  filename: string;
  /** Omit to let anyone who can already see this table export it. Pass a
   *  list to restrict further (e.g. only Brand Admin, not Showroom Admin). */
  allowedRoles?: Role[];
  /** "Which branch's data" — shown in the export header block. */
  scopeLabel?: string;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function FieldPickerModal<T>({
  open,
  onClose,
  columns,
  onConfirm,
  isWorking,
}: {
  open: boolean;
  onClose: () => void;
  columns: ColumnDef<T>[];
  onConfirm: (selectedKeys: string[]) => void;
  isWorking: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(columns.map((c) => c.key));

  useEffect(() => {
    if (open) setSelected(columns.map((c) => c.key));
  }, [open, columns]);

  const toggle = (key: string) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  return (
    <Modal open={open} onClose={onClose} title="Choose fields to export" maxWidth="max-w-sm">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setSelected(selected.length === columns.length ? [] : columns.map((c) => c.key))}
          className="text-caption font-medium text-primary hover:underline"
        >
          {selected.length === columns.length ? "Deselect all" : "Select all"}
        </button>
      </div>

      <div className="max-h-72 space-y-1 overflow-y-auto">
        {columns.map((column) => {
          const isChecked = selected.includes(column.key);
          return (
            <button
              key={column.key}
              type="button"
              onClick={() => toggle(column.key)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-surface-tint"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border
                  ${isChecked ? "border-primary bg-primary text-white" : "border-border bg-surface"}`}
              >
                {isChecked && <MdCheck size={14} />}
              </span>
              <span className="text-sm text-ink">{column.header}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end gap-2.5 border-t border-border pt-4">
        <Button type="button" variant="outline" fullWidth={false} className="px-5" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          fullWidth={false}
          className="px-5"
          isLoading={isWorking}
          disabled={selected.length === 0}
          onClick={() => onConfirm(selected)}
        >
          Download
        </Button>
      </div>
    </Modal>
  );
}

export default function ExportMenu<T>({ columns, rows, filename, allowedRoles, scopeLabel }: ExportMenuProps<T>) {
  const role = useAppSelector((state) => state.auth.role);
  const user = useAppSelector((state) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pendingType, setPendingType] = useState<"excel" | "pdf" | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (allowedRoles && (!role || !allowedRoles.includes(role))) return null;

  const exportableColumns = columns.filter((c) => c.exportValue);
  if (exportableColumns.length === 0) return null;

  const hasData = rows.length > 0;

  const headerBlock = () => {
    const companyLine = user?.companyShortName
      ? `${user.companyName} - ${user.companyShortName}`
      : user?.companyName || "";
    const now = new Date();
    return {
      companyLine,
      branchLine: `Branch: ${scopeLabel || "All"}`,
      downloadedLine: `Downloaded: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
    };
  };

  const buildRows = (selectedColumns: ColumnDef<T>[]) => {
    const headers = ["#", ...selectedColumns.map((c) => c.header)];
    const body = rows.map((row, index) => [
      String(index + 1),
      ...selectedColumns.map((c) => String(c.exportValue!(row))),
    ]);
    return { headers, body };
  };

  const runExport = async (task: () => Promise<void> | void) => {
    setIsExporting(true);
    try {
      await task();
    } finally {
      setIsExporting(false);
      setIsOpen(false);
      setPendingType(null);
    }
  };

  const handleExcel = (selectedKeys: string[]) =>
    runExport(async () => {
      const selectedColumns = exportableColumns.filter((c) => selectedKeys.includes(c.key));
      const { companyLine, branchLine, downloadedLine } = headerBlock();
      const { headers, body } = buildRows(selectedColumns);

      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.aoa_to_sheet([
        [companyLine],
        [branchLine],
        [downloadedLine],
        [],
        headers,
        ...body,
      ]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
    });

  const handlePdf = (selectedKeys: string[]) =>
    runExport(async () => {
      const selectedColumns = exportableColumns.filter((c) => selectedKeys.includes(c.key));
      const { companyLine, branchLine, downloadedLine } = headerBlock();
      const { headers, body } = buildRows(selectedColumns);

      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();

      doc.setFontSize(12);
      doc.text(companyLine, 14, 15);
      doc.setFontSize(9);
      doc.text(branchLine, 14, 21);
      doc.text(downloadedLine, 14, 26);

      autoTable(doc, { head: [headers], body, startY: 32, styles: { fontSize: 9 } });
      doc.save(`${filename}.pdf`);
    });

  const handlePrint = () =>
    runExport(() => {
      // Print skips the field picker — it's meant for a quick printout of
      // what's currently visible, not a curated export.
      const { companyLine, branchLine, downloadedLine } = headerBlock();
      const { headers, body } = buildRows(exportableColumns);

      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (!printWindow) return;

      const headHtml = headers
        .map((h) => `<th style="padding:8px 10px;border:1px solid #ddd;background:#f3f4f6;text-align:left;">${escapeHtml(h)}</th>`)
        .join("");
      const rowsHtml = body
        .map((cells) => `<tr>${cells.map((c) => `<td style="padding:7px 10px;border:1px solid #ddd;">${escapeHtml(c)}</td>`).join("")}</tr>`)
        .join("");

      printWindow.document.write(`
        <html>
          <head>
            <title>${escapeHtml(filename)}</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 24px; }
              table { border-collapse: collapse; width: 100%; font-size: 13px; }
              h1 { font-size: 16px; margin-bottom: 4px; }
              p { font-size: 12px; color: #555; margin: 2px 0 12px; }
            </style>
          </head>
          <body>
            <h1>${escapeHtml(companyLine)}</h1>
            <p>${escapeHtml(branchLine)} &nbsp;·&nbsp; ${escapeHtml(downloadedLine)}</p>
            <table><thead><tr>${headHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>
            <script>window.onload = function () { window.print(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    });

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        disabled={isExporting || !hasData}
        title={hasData ? undefined : "No data to export"}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink-muted hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-ink-muted"
      >
        <MdFileDownload size={16} /> {isExporting ? "Exporting..." : "Export"}
      </button>

      {isOpen && hasData && (
        <div className="absolute right-0 z-20 mt-1.5 w-48 rounded-xl border border-border bg-surface p-1.5 shadow-floating">
          <button
            type="button"
            onClick={() => setPendingType("excel")}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-tint"
          >
            <BsFileEarmarkExcel size={16} className="text-success" /> Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => setPendingType("pdf")}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-tint"
          >
            <BsFileEarmarkPdf size={16} className="text-danger" /> PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-tint"
          >
            <BsPrinter size={16} className="text-primary" /> Print
          </button>
        </div>
      )}

      <FieldPickerModal
        open={pendingType !== null}
        onClose={() => setPendingType(null)}
        columns={exportableColumns}
        isWorking={isExporting}
        onConfirm={(selectedKeys) => (pendingType === "excel" ? handleExcel(selectedKeys) : handlePdf(selectedKeys))}
      />
    </div>
  );
}

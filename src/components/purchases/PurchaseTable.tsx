"use client";

import { useState } from "react";
import Link from "next/link";
import { MdDelete, MdEdit, MdShoppingCart, MdCheckCircle, MdCancel } from "react-icons/md";
import type { Purchase } from "@/types/purchase";
import type { Supplier } from "@/types/supplier";
import type { ColumnDef, PaginationMeta } from "@/types/dataTable";
import { useAppDispatch } from "@/redux/hooks";
import { deletePurchase, confirmPurchase, cancelPurchase } from "@/redux/slices/purchaseSlice";
import { showToast } from "@/redux/slices/toastSlice";
import DataTable from "@/components/ui/table/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useSiteFormatters } from "@/components/layout/SiteFormatProvider";
import type { SiteFormatters } from "@/lib/siteFormatters";

function supplierLabel(supplierId: Purchase["supplierId"]): string {
  if (typeof supplierId === "string") return supplierId;
  const supplier = supplierId as Pick<Supplier, "supplierName" | "supplierCode">;
  return supplier ? `${supplier.supplierName} (${supplier.supplierCode})` : "—";
}

function StatusBadge({ status }: { status: Purchase["status"] }) {
  const map = {
    draft: "bg-surface-tint text-ink",
    confirmed: "bg-success/10 text-success",
    cancelled: "bg-danger/10 text-danger",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption font-medium capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

function PaymentStatusBadge({ paymentStatus }: { paymentStatus: Purchase["paymentStatus"] }) {
  const map = {
    unpaid: "bg-danger/10 text-danger",
    partial: "bg-amber-300 text-amber-900",
    paid: "bg-success/10 text-success",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-caption font-medium capitalize ${map[paymentStatus]}`}>
      {paymentStatus}
    </span>
  );
}

function PurchaseActions({ purchase }: { purchase: Purchase }) {
  const dispatch = useAppDispatch();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingConfirm, setConfirmingConfirm] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const handleDelete = async () => {
    setIsBusy(true);
    const result = await dispatch(deletePurchase(purchase.id));
    setIsBusy(false);
    setConfirmingDelete(false);
    if (deletePurchase.fulfilled.match(result)) {
      dispatch(showToast("Purchase deleted successfully.", "success"));
    } else {
      dispatch(showToast(result.payload || "Failed to delete purchase.", "error"));
    }
  };

  const handleConfirm = async () => {
    setIsBusy(true);
    const result = await dispatch(confirmPurchase(purchase.id));
    setIsBusy(false);
    setConfirmingConfirm(false);
    if (confirmPurchase.fulfilled.match(result)) {
      dispatch(showToast("Purchase confirmed.", "success"));
    } else {
      dispatch(showToast(result.payload || "Failed to confirm purchase.", "error"));
    }
  };

  const handleCancel = async () => {
    setIsBusy(true);
    const result = await dispatch(cancelPurchase(purchase.id));
    setIsBusy(false);
    setConfirmingCancel(false);
    if (cancelPurchase.fulfilled.match(result)) {
      dispatch(showToast("Purchase cancelled.", "success"));
    } else {
      dispatch(showToast(result.payload || "Failed to cancel purchase.", "error"));
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {purchase.status === "draft" && (
          <>
            <Link
              href={`/purchases/${purchase.id}/edit`}
              title="Edit purchase"
              className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
            >
              <MdEdit size={17} />
            </Link>
            <button
              type="button"
              onClick={() => setConfirmingConfirm(true)}
              title="Confirm purchase"
              className="rounded-lg p-2 text-ink-muted hover:bg-success/10 hover:text-success"
            >
              <MdCheckCircle size={17} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              title="Delete purchase"
              className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
            >
              <MdDelete size={17} />
            </button>
          </>
        )}
        {purchase.status === "confirmed" && (
          <button
            type="button"
            onClick={() => setConfirmingCancel(true)}
            title="Cancel purchase"
            className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
          >
            <MdCancel size={17} />
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete purchase?"
        message={`This permanently deletes ${purchase.purchaseNumber}. This can't be undone.`}
        isLoading={isBusy}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
      <ConfirmDialog
        open={confirmingConfirm}
        title="Confirm purchase?"
        message={`Confirming ${purchase.purchaseNumber} locks it from further edits and records it against inventory. This can't be undone directly — only cancelled afterward.`}
        isLoading={isBusy}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmingConfirm(false)}
      />
      <ConfirmDialog
        open={confirmingCancel}
        title="Cancel purchase?"
        message={`This marks ${purchase.purchaseNumber} as cancelled.`}
        isLoading={isBusy}
        onConfirm={handleCancel}
        onCancel={() => setConfirmingCancel(false)}
      />
    </>
  );
}

const createColumns = (formatters: SiteFormatters): ColumnDef<Purchase>[] => [
  {
    key: "purchaseNumber",
    header: "Purchase #",
    sortable: true,
    alwaysVisible: true,
    render: (p) => <span className="font-mono font-medium text-ink">{p.purchaseNumber}</span>,
    sortValue: (p) => p.purchaseNumber,
    exportValue: (p) => p.purchaseNumber,
  },
  {
    key: "supplierId",
    header: "Supplier",
    sortable: false,
    render: (p) => supplierLabel(p.supplierId),
    exportValue: (p) => supplierLabel(p.supplierId),
  },
  {
    key: "purchaseDate",
    header: "Date",
    sortable: true,
    render: (p) => formatters.date(p.purchaseDate),
    sortValue: (p) => new Date(p.purchaseDate).getTime(),
    exportValue: (p) => formatters.date(p.purchaseDate),
  },
  {
    key: "purchaseType",
    header: "Type",
    sortable: false,
    defaultVisible: false,
    render: (p) => <span className="capitalize">{p.purchaseType}</span>,
    exportValue: (p) => p.purchaseType,
  },
  {
    key: "totalGrossWeight",
    header: "Gross Weight",
    sortable: false,
    defaultVisible: false,
    render: (p) => formatters.weight(p.totalGrossWeight),
    exportValue: (p) => formatters.weight(p.totalGrossWeight),
  },
  {
    key: "grandTotal",
    header: "Grand Total",
    sortable: true,
    render: (p) => formatters.amount(p.grandTotal),
    sortValue: (p) => p.grandTotal,
    exportValue: (p) => formatters.amount(p.grandTotal),
  },
  {
    key: "paymentStatus",
    header: "Payment",
    sortable: false,
    render: (p) => <PaymentStatusBadge paymentStatus={p.paymentStatus} />,
    exportValue: (p) => p.paymentStatus,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (p) => <StatusBadge status={p.status} />,
    sortValue: (p) => p.status,
    exportValue: (p) => p.status,
  },
];

export default function PurchaseTable({
  purchases,
  sortBy,
  order,
  onSortChange,
  pagination,
  onPageChange,
  onLimitChange,
  isLoading,
}: {
  purchases: Purchase[];
  sortBy: string;
  order: "asc" | "desc";
  onSortChange: (key: string) => void;
  pagination: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}) {
  const formatters = useSiteFormatters();
  const columns = createColumns(formatters);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(
    columns.filter((c) => c.defaultVisible !== false).map((c) => c.key)
  );

  const columnsWithActions: ColumnDef<Purchase>[] = [
    ...columns,
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      alwaysVisible: true,
      align: "right",
      render: (purchase) => <PurchaseActions purchase={purchase} />,
    },
  ];
  const allVisibleKeys = [...visibleColumnKeys, "actions"];

  return (
    <DataTable
      columns={columnsWithActions}
      rows={purchases}
      keyField={(p) => p.id}
      sortBy={sortBy}
      order={order}
      onSortChange={onSortChange}
      visibleColumnKeys={allVisibleKeys}
      onVisibleColumnsChange={(keys) => setVisibleColumnKeys(keys.filter((k) => k !== "actions"))}
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      isLoading={isLoading}
      exportFilename="purchases"
      exportScopeLabel="All Purchases"
      module="purchases"
      columnControls="toggle"
      mobileCard={(purchase) => (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-heading text-base font-medium text-ink">{purchase.purchaseNumber}</p>
              <p className="text-sm text-ink-muted">{supplierLabel(purchase.supplierId)}</p>
            </div>
            <StatusBadge status={purchase.status} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <PaymentStatusBadge paymentStatus={purchase.paymentStatus} />
            <span className="text-sm font-medium text-ink">{formatters.amount(purchase.grandTotal)}</span>
          </div>
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <PurchaseActions purchase={purchase} />
          </div>
        </div>
      )}
      emptyMessage={
        <span className="flex flex-col items-center gap-2">
          <MdShoppingCart size={28} className="text-ink-muted/50" />
          <span>No purchases yet — click &quot;Add Purchase&quot; to record the first one.</span>
        </span>
      }
    />
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { MdDelete, MdEdit, MdBusiness, MdCheckCircle, MdCancel, MdImage, MdBlock } from "react-icons/md";
import type { Supplier } from "../../../types/supplier";
import type { ColumnDef, PaginationMeta } from "@/types/dataTable";
import { useAppDispatch } from "@/redux/hooks";
import { useSiteFormatters } from "@/components/layout/SiteFormatProvider";
import { deleteSupplier, toggleSupplierStatus, toggleSupplierBlacklist } from "../../../redux/slices/supplierSlice";
import { showToast } from "@/redux/slices/toastSlice";
import DataTable from "@/components/ui/table/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function SupplierThumbnail({ supplier }: { supplier: Supplier }) {
  const photo = supplier.supplierImages?.[0] || supplier.visitingCard;
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={supplier.supplierName} className="h-9 w-9 rounded-lg object-cover" />;
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-tint text-ink-muted">
      <MdImage size={16} />
    </span>
  );
}

function StatusBadge({ status }: { status: Supplier["status"] }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-medium
        ${active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
    >
      {active ? <MdCheckCircle size={13} /> : <MdCancel size={13} />}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function SupplierTypeBadge({ supplierType }: { supplierType: Supplier["supplierType"] }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-caption font-medium capitalize text-primary">
      {supplierType.replace("_", " ")}
    </span>
  );
}

function SupplierActions({ supplier }: { supplier: Supplier }) {
  const dispatch = useAppDispatch();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blacklisting, setBlacklisting] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteSupplier(supplier.id));
    setIsDeleting(false);
    setConfirmingDelete(false);
    if (deleteSupplier.fulfilled.match(result)) {
      dispatch(showToast("Supplier deleted successfully.", "success"));
    } else {
      dispatch(showToast(result.payload || "Failed to delete supplier. Please try again.", "error"));
    }
  };

  const handleToggleBlacklist = async () => {
    if (!supplier.isBlacklisted && !blacklistReason.trim()) return;
    const result = await dispatch(
      toggleSupplierBlacklist({ id: supplier.id, blacklistReason: supplier.isBlacklisted ? undefined : blacklistReason })
    );
    setBlacklisting(false);
    setBlacklistReason("");
    if (toggleSupplierBlacklist.fulfilled.match(result)) {
      dispatch(
        showToast(supplier.isBlacklisted ? "Supplier removed from blacklist." : "Supplier blacklisted.", "success")
      );
    } else {
      dispatch(showToast(result.payload || "Failed to update blacklist status.", "error"));
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/accounts/suppliers/${supplier.id}/edit`}
          title="Edit supplier"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdEdit size={17} />
        </Link>
        <button
          type="button"
          onClick={async () => {
            const willActivate = supplier.status !== "active";
            const result = await dispatch(
              toggleSupplierStatus({ id: supplier.id, status: willActivate ? "active" : "inactive" })
            );
            if (toggleSupplierStatus.fulfilled.match(result)) {
              dispatch(showToast(`Supplier ${willActivate ? "activated" : "deactivated"} successfully.`, "success"));
            } else {
              dispatch(showToast("Failed to update supplier status. Please try again.", "error"));
            }
          }}
          title={supplier.status === "active" ? "Deactivate" : "Activate"}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          {supplier.status === "active" ? <MdCancel size={17} /> : <MdCheckCircle size={17} />}
        </button>
        <button
          type="button"
          onClick={() => (supplier.isBlacklisted ? handleToggleBlacklist() : setBlacklisting(true))}
          title={supplier.isBlacklisted ? "Remove from blacklist" : "Blacklist supplier"}
          className={`rounded-lg p-2 hover:bg-danger/10 hover:text-danger ${
            supplier.isBlacklisted ? "text-danger" : "text-ink-muted"
          }`}
        >
          <MdBlock size={17} />
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          title="Delete supplier"
          className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
        >
          <MdDelete size={17} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete supplier?"
        message={`This permanently deletes "${supplier.supplierName}". This can't be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />

      {blacklisting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-card">
            <p className="font-heading text-base font-medium text-ink">Blacklist supplier?</p>
            <p className="mt-1 text-caption text-ink-muted">
              This flags &quot;{supplier.supplierName}&quot; and requires a reason.
            </p>
            <input
              type="text"
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              placeholder="Reason for blacklisting"
              className="mt-3 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setBlacklisting(false);
                  setBlacklistReason("");
                }}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-muted hover:bg-surface-tint"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!blacklistReason.trim()}
                onClick={handleToggleBlacklist}
                className="rounded-lg bg-danger px-3.5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Blacklist
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const createColumns = (formatters: ReturnType<typeof useSiteFormatters>): ColumnDef<Supplier>[] => [
  {
    key: "supplierName",
    header: "Supplier",
    sortable: true,
    alwaysVisible: true,
    render: (s) => (
      <div className="flex items-center gap-2">
        <SupplierThumbnail supplier={s} />
        <div>
          <span className="font-medium text-ink">{s.supplierName}</span>
          {s.isBlacklisted && (
            <span className="ml-2 inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-caption font-medium text-danger">
              Blacklisted
            </span>
          )}
        </div>
      </div>
    ),
    sortValue: (s) => s.supplierName.toLowerCase(),
    exportValue: (s) => s.supplierName,
  },
  {
    key: "supplierCode",
    header: "Code",
    sortable: true,
    render: (s) => <span className="font-mono text-ink-muted">{s.supplierCode}</span>,
    sortValue: (s) => s.supplierCode,
    exportValue: (s) => s.supplierCode,
  },
  {
    key: "supplierType",
    header: "Type",
    sortable: true,
    render: (s) => <SupplierTypeBadge supplierType={s.supplierType} />,
    sortValue: (s) => s.supplierType,
    exportValue: (s) => s.supplierType,
  },
  {
    key: "phone",
    header: "Phone",
    sortable: false,
    render: (s) => s.phone,
    exportValue: (s) => s.phone,
  },
  {
    key: "contactPerson",
    header: "Contact Person",
    sortable: false,
    defaultVisible: false,
    render: (s) => s.contactPerson || "—",
    exportValue: (s) => s.contactPerson || "",
  },
  {
    key: "currentBalance",
    header: "Current Balance",
    sortable: false,
    defaultVisible: false,
    render: (s) => formatters.amount(s.currentBalance),
    exportValue: (s) => formatters.amount(s.currentBalance),
  },
  {
    key: "currentWeight",
    header: "Current Weight",
    sortable: false,
    defaultVisible: false,
    render: (s) => formatters.weight(s.currentWeight),
    exportValue: (s) => formatters.weight(s.currentWeight),
  },
  {
    key: "gstNumber",
    header: "GST Number",
    sortable: false,
    defaultVisible: false,
    render: (s) => s.gstNumber || "—",
    exportValue: (s) => s.gstNumber || "",
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    defaultVisible: false,
    render: (s) => formatters.date(s.createdAt),
    sortValue: (s) => new Date(s.createdAt).getTime(),
    exportValue: (s) => formatters.date(s.createdAt),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (s) => <StatusBadge status={s.status} />,
    sortValue: (s) => s.status,
    exportValue: (s) => s.status,
  },
];

export default function SupplierTable({
  suppliers,
  sortBy,
  order,
  onSortChange,
  pagination,
  onPageChange,
  onLimitChange,
  isLoading,
}: {
  suppliers: Supplier[];
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

  const columnsWithActions: ColumnDef<Supplier>[] = [
    ...columns,
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      alwaysVisible: true,
      align: "right",
      render: (supplier) => <SupplierActions supplier={supplier} />,
    },
  ];
  const allVisibleKeys = [...visibleColumnKeys, "actions"];

  return (
    <DataTable
      columns={columnsWithActions}
      rows={suppliers}
      keyField={(s) => s.id}
      sortBy={sortBy}
      order={order}
      onSortChange={onSortChange}
      visibleColumnKeys={allVisibleKeys}
      onVisibleColumnsChange={(keys) => setVisibleColumnKeys(keys.filter((k) => k !== "actions"))}
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      isLoading={isLoading}
      exportFilename="suppliers"
      exportScopeLabel="All Suppliers"
      module="suppliers"
      columnControls="toggle"
      mobileCard={(supplier) => (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <SupplierThumbnail supplier={supplier} />
              <div>
                <p className="font-heading text-base font-medium text-ink">{supplier.supplierName}</p>
                <p className="font-mono text-sm text-ink-muted">{supplier.supplierCode}</p>
              </div>
            </div>
            <StatusBadge status={supplier.status} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <SupplierTypeBadge supplierType={supplier.supplierType} />
            <span className="text-sm text-ink-muted">{supplier.phone}</span>
          </div>
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <SupplierActions supplier={supplier} />
          </div>
        </div>
      )}
      emptyMessage={
        <span className="flex flex-col items-center gap-2">
          <MdBusiness size={28} className="text-ink-muted/50" />
          <span>No suppliers yet — click &quot;Add Supplier&quot; to create the first one.</span>
        </span>
      }
    />
  );
}
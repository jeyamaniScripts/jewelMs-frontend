"use client";

import { useState } from "react";
import Link from "next/link";
import { MdRefresh, MdDelete, MdEdit, MdStorefront, MdCheckCircle, MdCancel, MdVisibility } from "react-icons/md";
import type { Brand } from "@/types/company";
import type { ColumnDef, PaginationMeta } from "@/types/dataTable";
import { useAppDispatch } from "@/redux/hooks";
import { deleteBrand, regenerateCredentials, toggleBrandStatus } from "@/redux/slices/companySlice";
import { showToast } from "@/redux/slices/toastSlice";
import DataTable from "@/components/ui/table/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import BrandDetails from "@/components/company/BrandDetails";

function StatusBadge({ status }: { status: Brand["status"] }) {
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

function BrandActions({ brand, onView }: { brand: Brand; onView: () => void }) {
  const dispatch = useAppDispatch();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await dispatch(deleteBrand(brand.id));
    setIsDeleting(false);
    setConfirmingDelete(false);
    dispatch(showToast("Brand deleted", "success"));
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={onView}
          title="View details"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdVisibility size={17} />
        </button>
        <Link
          href={`/brands/${brand.id}/edit`}
          title="Edit brand"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdEdit size={17} />
        </Link>
        <button
          type="button"
          onClick={() =>
            dispatch(toggleBrandStatus({ id: brand.id, status: brand.status === "active" ? "inactive" : "active" }))
          }
          title={brand.status === "active" ? "Deactivate" : "Activate"}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          {brand.status === "active" ? <MdCancel size={17} /> : <MdCheckCircle size={17} />}
        </button>
        <button
          type="button"
          onClick={() => dispatch(regenerateCredentials(brand))}
          title="Reset / regenerate login credentials"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdRefresh size={17} />
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          title="Delete brand"
          className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
        >
          <MdDelete size={17} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete brand?"
        message={`This permanently deletes "${brand.companyName}" and its Brand Admin login. This can't be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

const COLUMNS: ColumnDef<Brand>[] = [
  {
    key: "companyName",
    header: "Company",
    sortable: true,
    alwaysVisible: true,
    render: (b) => <span className="font-medium text-ink">{b.companyName}</span>,
    sortValue: (b) => b.companyName.toLowerCase(),
    exportValue: (b) => b.companyName,
  },
  {
    key: "shortName",
    header: "Short Name",
    sortable: true,
    defaultVisible: false,
    render: (b) => b.shortName || "—",
    sortValue: (b) => (b.shortName || b.companyName).toLowerCase(),
    exportValue: (b) => b.shortName || "",
  },
  { key: "ownerName", header: "Owner", sortable: false, render: (b) => b.ownerName, exportValue: (b) => b.ownerName },
  {
    key: "contact",
    header: "Contact",
    sortable: false,
    render: (b) => (
      <div>
        <div className="text-ink-muted">{b.email}</div>
        <div className="text-caption text-ink-muted">{b.phone}</div>
      </div>
    ),
    exportValue: (b) => `${b.email} / ${b.phone}`,
  },
  {
    key: "showroomsCount",
    header: "Showrooms",
    sortable: true,
    defaultVisible: false,
    render: (b) => b.showroomsCount,
    sortValue: (b) => b.showroomsCount,
    exportValue: (b) => b.showroomsCount,
    footer: (rows) => rows.reduce((sum, b) => sum + b.showroomsCount, 0),
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    defaultVisible: false,
    render: (b) => new Date(b.createdAt).toLocaleDateString(),
    sortValue: (b) => new Date(b.createdAt).getTime(),
    exportValue: (b) => new Date(b.createdAt).toLocaleDateString(),
  },
  { key: "status", header: "Status", sortable: false, render: (b) => <StatusBadge status={b.status} />, exportValue: (b) => b.status },
];

export default function BrandTable({
  brands,
  sortBy,
  order,
  onSortChange,
  pagination,
  onPageChange,
  onLimitChange,
  isLoading,
}: {
  brands: Brand[];
  sortBy: string;
  order: "asc" | "desc";
  onSortChange: (key: string) => void;
  pagination: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}) {
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(
    COLUMNS.filter((c) => c.defaultVisible !== false).map((c) => c.key)
  );
  const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);

  const columnsWithActions: ColumnDef<Brand>[] = [
    ...COLUMNS,
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      alwaysVisible: true,
      align: "right",
      render: (brand) => <BrandActions brand={brand} onView={() => setViewingBrand(brand)} />,
    },
  ];
  const allVisibleKeys = [...visibleColumnKeys, "actions"];

  return (
    <>
      <DataTable
        columns={columnsWithActions}
        rows={brands}
        keyField={(b) => b.id}
        sortBy={sortBy}
        order={order}
        onSortChange={onSortChange}
        visibleColumnKeys={allVisibleKeys}
        onVisibleColumnsChange={(keys) => setVisibleColumnKeys(keys.filter((k) => k !== "actions"))}
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        showFooter={visibleColumnKeys.includes("showroomsCount")}
        isLoading={isLoading}
        exportFilename="brands"
        exportScopeLabel="All Brands"
        module="brands"
        mobileCard={(brand) => (
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-heading text-base font-medium text-ink">{brand.companyName}</p>
                <p className="text-sm text-ink-muted">{brand.ownerName}</p>
              </div>
              <StatusBadge status={brand.status} />
            </div>
            <div className="mt-3 space-y-1 text-sm text-ink-muted">
              <p>{brand.email}</p>
              <p>{brand.phone}</p>
              <p>
                {brand.showroomsCount} showroom{brand.showroomsCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="mt-3 flex justify-end border-t border-border pt-3">
              <BrandActions brand={brand} onView={() => setViewingBrand(brand)} />
            </div>
          </div>
        )}
        emptyMessage={
          <span className="flex flex-col items-center gap-2">
            <MdStorefront size={28} className="text-ink-muted/50" />
            <span>No brands yet — click &quot;Add Brand&quot; to create the first one.</span>
          </span>
        }
      />

      <Modal open={!!viewingBrand} onClose={() => setViewingBrand(null)} title="Brand details" maxWidth="max-w-2xl">
        {viewingBrand && <BrandDetails brand={viewingBrand} />}
      </Modal>
    </>
  );
}

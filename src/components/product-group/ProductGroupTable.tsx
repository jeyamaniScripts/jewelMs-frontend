"use client";

import { useState } from "react";
import Link from "next/link";
import { MdDelete, MdEdit, MdCategory, MdCheckCircle, MdCancel, MdImage } from "react-icons/md";
import type { ProductGroup } from "@/types/productGroup";
import type { Category } from "@/types/category";
import type { ColumnDef, PaginationMeta } from "@/types/dataTable";
import { useAppDispatch } from "@/redux/hooks";
import { deleteProductGroup, toggleProductGroupStatus } from "@/redux/slices/productGroupSlice";
import { showToast } from "@/redux/slices/toastSlice";
import DataTable from "@/components/ui/table/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useSiteFormatters } from "@/components/layout/SiteFormatProvider";
import type { SiteFormatters } from "@/lib/siteFormatters";

function categoryLabel(categoryId: ProductGroup["categoryId"]): string {
  if (typeof categoryId === "string") return categoryId;
  const category = categoryId as Pick<Category, "categoryName" | "categoryCode">;
  return category ? `${category.categoryName} (${category.categoryCode})` : "—";
}

function ProductGroupThumbnail({ productGroup }: { productGroup: ProductGroup }) {
  if (productGroup.groupImageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={productGroup.groupImageUrl}
        alt={productGroup.groupName}
        className="h-9 w-9 rounded-lg object-cover"
      />
    );
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-tint text-ink-muted">
      <MdImage size={16} />
    </span>
  );
}

function StatusBadge({ status }: { status: ProductGroup["status"] }) {
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

function ProductGroupActions({ productGroup }: { productGroup: ProductGroup }) {
  const dispatch = useAppDispatch();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteProductGroup(productGroup.id));
    setIsDeleting(false);
    setConfirmingDelete(false);
    if (deleteProductGroup.fulfilled.match(result)) {
      dispatch(showToast("Product group deleted successfully.", "success"));
    } else {
      dispatch(showToast(result.payload || "Failed to delete product group. Please try again.", "error"));
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/inventory/product-groups/${productGroup.id}/edit`}
          title="Edit product group"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdEdit size={17} />
        </Link>
        <button
          type="button"
          onClick={async () => {
            const willActivate = productGroup.status !== "active";
            const result = await dispatch(
              toggleProductGroupStatus({ id: productGroup.id, status: willActivate ? "active" : "inactive" })
            );
            if (toggleProductGroupStatus.fulfilled.match(result)) {
              dispatch(
                showToast(`Product group ${willActivate ? "activated" : "deactivated"} successfully.`, "success")
              );
            } else {
              dispatch(showToast("Failed to update product group status. Please try again.", "error"));
            }
          }}
          title={productGroup.status === "active" ? "Deactivate" : "Activate"}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          {productGroup.status === "active" ? <MdCancel size={17} /> : <MdCheckCircle size={17} />}
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          title="Delete product group"
          className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
        >
          <MdDelete size={17} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete product group?"
        message={`This permanently deletes "${productGroup.groupName}". This can't be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

const createColumns = (formatters: SiteFormatters): ColumnDef<ProductGroup>[] => [
  {
    key: "groupName",
    header: "Product Group",
    sortable: true,
    alwaysVisible: true,
    render: (g) => (
      <div className="flex items-center gap-2">
        <ProductGroupThumbnail productGroup={g} />
        <span className="font-medium text-ink">{g.groupName}</span>
      </div>
    ),
    sortValue: (g) => g.groupName.toLowerCase(),
    exportValue: (g) => g.groupName,
  },
  {
    key: "groupCode",
    header: "Code",
    sortable: true,
    render: (g) => <span className="font-mono text-ink-muted">{g.groupCode}</span>,
    sortValue: (g) => g.groupCode,
    exportValue: (g) => g.groupCode,
  },
  {
    key: "categoryId",
    header: "Category",
    sortable: false,
    render: (g) => categoryLabel(g.categoryId),
    exportValue: (g) => categoryLabel(g.categoryId),
  },
  {
    key: "defaultMakingChargeType",
    header: "Making Charge",
    sortable: false,
    defaultVisible: false,
    render: (g) =>
      g.defaultMakingChargeValue !== undefined
        ? `${g.defaultMakingChargeValue}${g.defaultMakingChargeType === "percentage" ? "%" : ""}`
        : "—",
    exportValue: (g) => (g.defaultMakingChargeValue !== undefined ? String(g.defaultMakingChargeValue) : ""),
  },
  {
    key: "defaultWastagePercent",
    header: "Default Wastage",
    sortable: false,
    defaultVisible: false,
    render: (g) => (g.defaultWastagePercent !== undefined ? `${g.defaultWastagePercent}%` : "—"),
    exportValue: (g) => (g.defaultWastagePercent !== undefined ? `${g.defaultWastagePercent}%` : ""),
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    defaultVisible: false,
    render: (g) => formatters.date(g.createdAt),
    sortValue: (g) => new Date(g.createdAt).getTime(),
    exportValue: (g) => formatters.date(g.createdAt),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (g) => <StatusBadge status={g.status} />,
    sortValue: (g) => g.status,
    exportValue: (g) => g.status,
  },
];

export default function ProductGroupTable({
  productGroups,
  sortBy,
  order,
  onSortChange,
  pagination,
  onPageChange,
  onLimitChange,
  isLoading,
}: {
  productGroups: ProductGroup[];
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

  const columnsWithActions: ColumnDef<ProductGroup>[] = [
    ...columns,
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      alwaysVisible: true,
      align: "right",
      render: (productGroup) => <ProductGroupActions productGroup={productGroup} />,
    },
  ];
  const allVisibleKeys = [...visibleColumnKeys, "actions"];

  return (
    <DataTable
      columns={columnsWithActions}
      rows={productGroups}
      keyField={(g) => g.id}
      sortBy={sortBy}
      order={order}
      onSortChange={onSortChange}
      visibleColumnKeys={allVisibleKeys}
      onVisibleColumnsChange={(keys) => setVisibleColumnKeys(keys.filter((k) => k !== "actions"))}
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      isLoading={isLoading}
      exportFilename="product-groups"
      exportScopeLabel="All Product Groups"
      module="product-groups"
      columnControls="toggle"
      mobileCard={(productGroup) => (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <ProductGroupThumbnail productGroup={productGroup} />
              <div>
                <p className="font-heading text-base font-medium text-ink">{productGroup.groupName}</p>
                <p className="font-mono text-sm text-ink-muted">{productGroup.groupCode}</p>
              </div>
            </div>
            <StatusBadge status={productGroup.status} />
          </div>
          <div className="mt-3 text-sm text-ink-muted">{categoryLabel(productGroup.categoryId)}</div>
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <ProductGroupActions productGroup={productGroup} />
          </div>
        </div>
      )}
      emptyMessage={
        <span className="flex flex-col items-center gap-2">
          <MdCategory size={28} className="text-ink-muted/50" />
          <span>No product groups yet — click &quot;Add Product Group&quot; to create the first one.</span>
        </span>
      }
    />
  );
}
"use client";

import { useState } from "react";
import Link from "next/link";
import { MdDelete, MdEdit, MdCategory, MdCheckCircle, MdCancel, MdImage } from "react-icons/md";
import type { Category } from "@/types/category";
import type { ColumnDef, PaginationMeta } from "@/types/dataTable";
import { useAppDispatch } from "@/redux/hooks";
import { deleteCategory, toggleCategoryStatus } from "@/redux/slices/categorySlice";
import { showToast } from "@/redux/slices/toastSlice";
import DataTable from "@/components/ui/table/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useSiteFormatters } from "@/components/layout/SiteFormatProvider";
import type { SiteFormatters } from "@/lib/siteFormatters";

function CategoryThumbnail({ category }: { category: Category }) {
  if (category.categoryImageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={category.categoryImageUrl} alt={category.categoryName} className="h-9 w-9 rounded-lg object-cover" />;
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-tint text-ink-muted">
      <MdImage size={16} />
    </span>
  );
}

function StatusBadge({ status }: { status: Category["status"] }) {
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

function CategoryActions({ category }: { category: Category }) {
  const dispatch = useAppDispatch();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteCategory(category.id));
    setIsDeleting(false);
    setConfirmingDelete(false);
    if (deleteCategory.fulfilled.match(result)) {
      dispatch(showToast("Category deleted successfully.", "success"));
    } else {
      dispatch(showToast(result.payload || "Failed to delete category. Please try again.", "error"));
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/inventory/categories/${category.id}/edit`}
          title="Edit category"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdEdit size={17} />
        </Link>
        <button
          type="button"
          onClick={async () => {
            const willActivate = category.status !== "active";
            const result = await dispatch(
              toggleCategoryStatus({ id: category.id, status: willActivate ? "active" : "inactive" })
            );
            if (toggleCategoryStatus.fulfilled.match(result)) {
              dispatch(showToast(`Category ${willActivate ? "activated" : "deactivated"} successfully.`, "success"));
            } else {
              dispatch(showToast("Failed to update category status. Please try again.", "error"));
            }
          }}
          title={category.status === "active" ? "Deactivate" : "Activate"}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          {category.status === "active" ? <MdCancel size={17} /> : <MdCheckCircle size={17} />}
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          title="Delete category"
          className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
        >
          <MdDelete size={17} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete category?"
        message={`This permanently deletes "${category.categoryName}". This can't be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

const createColumns = (formatters: SiteFormatters): ColumnDef<Category>[] => [
  {
    key: "categoryName",
    header: "Category",
    sortable: true,
    alwaysVisible: true,
    render: (c) => (
      <div className="flex items-center gap-2">
        <CategoryThumbnail category={c} />
        <span className="font-medium text-ink">{c.categoryName}</span>
      </div>
    ),
    sortValue: (c) => c.categoryName.toLowerCase(),
    exportValue: (c) => c.categoryName,
  },
  {
    key: "categoryCode",
    header: "Code",
    sortable: true,
    render: (c) => <span className="font-mono text-ink-muted">{c.categoryCode}</span>,
    sortValue: (c) => c.categoryCode,
    exportValue: (c) => c.categoryCode,
  },
  {
    key: "hsnCode",
    header: "HSN Code",
    sortable: false,
    defaultVisible: false,
    render: (c) => c.hsnCode || "—",
    exportValue: (c) => c.hsnCode || "",
  },
  {
    key: "defaultGstRate",
    header: "Default GST",
    sortable: false,
    defaultVisible: false,
    render: (c) => (c.defaultGstRate !== undefined ? `${c.defaultGstRate}%` : "—"),
    exportValue: (c) => (c.defaultGstRate !== undefined ? `${c.defaultGstRate}%` : ""),
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    defaultVisible: false,
    render: (c) => formatters.date(c.createdAt),
    sortValue: (c) => new Date(c.createdAt).getTime(),
    exportValue: (c) => formatters.date(c.createdAt),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (c) => <StatusBadge status={c.status} />,
    sortValue: (c) => c.status,
    exportValue: (c) => c.status,
  },
];

export default function CategoryTable({
  categories,
  sortBy,
  order,
  onSortChange,
  pagination,
  onPageChange,
  onLimitChange,
  isLoading,
}: {
  categories: Category[];
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

  const columnsWithActions: ColumnDef<Category>[] = [
    ...columns,
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      alwaysVisible: true,
      align: "right",
      render: (category) => <CategoryActions category={category} />,
    },
  ];
  const allVisibleKeys = [...visibleColumnKeys, "actions"];

  return (
    <DataTable
      columns={columnsWithActions}
      rows={categories}
      keyField={(c) => c.id}
      sortBy={sortBy}
      order={order}
      onSortChange={onSortChange}
      visibleColumnKeys={allVisibleKeys}
      onVisibleColumnsChange={(keys) => setVisibleColumnKeys(keys.filter((k) => k !== "actions"))}
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      isLoading={isLoading}
      exportFilename="categories"
      exportScopeLabel="All Categories"
      module="categories"
      columnControls="toggle"
      mobileCard={(category) => (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <CategoryThumbnail category={category} />
              <div>
                <p className="font-heading text-base font-medium text-ink">{category.categoryName}</p>
                <p className="font-mono text-sm text-ink-muted">{category.categoryCode}</p>
              </div>
            </div>
            <StatusBadge status={category.status} />
          </div>
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <CategoryActions category={category} />
          </div>
        </div>
      )}
      emptyMessage={
        <span className="flex flex-col items-center gap-2">
          <MdCategory size={28} className="text-ink-muted/50" />
          <span>No categories yet — click &quot;Add Category&quot; to create the first one.</span>
        </span>
      }
    />
  );
}
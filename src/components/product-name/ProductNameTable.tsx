"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MdDelete,
  MdEdit,
  MdCategory,
  MdCheckCircle,
  MdCancel,
  MdImage,
} from "react-icons/md";
import type { ProductName } from "@/types/productName";
import type { ProductGroup } from "@/types/productGroup";
import type { ColumnDef, PaginationMeta } from "@/types/dataTable";
import { useAppDispatch } from "@/redux/hooks";
import {
  deleteProductName,
  toggleProductNameStatus,
} from "@/redux/slices/productNameSlice";
import { showToast } from "@/redux/slices/toastSlice";
import DataTable from "@/components/ui/table/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useSiteFormatters } from "@/components/layout/SiteFormatProvider";
import type { SiteFormatters } from "@/lib/siteFormatters";

function productGroupLabel(
  productGroupId: ProductName["productGroupId"],
): string {
  if (typeof productGroupId === "string") return productGroupId;
  const group = productGroupId as Pick<ProductGroup, "groupName" | "groupCode">;
  return group ? `${group.groupName} (${group.groupCode})` : "—";
}

function ProductNameThumbnail({ productName }: { productName: ProductName }) {
  if (productName.productImageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={productName.productImageUrl}
        alt={productName.name}
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

function StatusBadge({ status }: { status: ProductName["status"] }) {
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

function GenderBadge({ gender }: { gender: ProductName["gender"] }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-caption font-medium capitalize text-primary">
      {gender}
    </span>
  );
}

function MetalTypeBadge({
  metalType,
}: {
  metalType: ProductName["metalType"];
}) {
  return (
    <span className="inline-flex items-center rounded-full bg-surface-tint px-2.5 py-1 text-caption font-medium capitalize text-ink">
      {metalType}
    </span>
  );
}

function ProductNameActions({ productName }: { productName: ProductName }) {
  const dispatch = useAppDispatch();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteProductName(productName.id));
    setIsDeleting(false);
    setConfirmingDelete(false);
    if (deleteProductName.fulfilled.match(result)) {
      dispatch(showToast("Product name deleted successfully.", "success"));
    } else {
      dispatch(
        showToast(
          result.payload || "Failed to delete product name. Please try again.",
          "error",
        ),
      );
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/inventory/product-names/${productName.id}/edit`}
          title="Edit product name"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdEdit size={17} />
        </Link>
        <button
          type="button"
          onClick={async () => {
            const willActivate = productName.status !== "active";
            const result = await dispatch(
              toggleProductNameStatus({
                id: productName.id,
                status: willActivate ? "active" : "inactive",
              }),
            );
            if (toggleProductNameStatus.fulfilled.match(result)) {
              dispatch(
                showToast(
                  `Product name ${willActivate ? "activated" : "deactivated"} successfully.`,
                  "success",
                ),
              );
            } else {
              dispatch(
                showToast(
                  "Failed to update product name status. Please try again.",
                  "error",
                ),
              );
            }
          }}
          title={productName.status === "active" ? "Deactivate" : "Activate"}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          {productName.status === "active" ? (
            <MdCancel size={17} />
          ) : (
            <MdCheckCircle size={17} />
          )}
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          title="Delete product name"
          className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
        >
          <MdDelete size={17} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete product name?"
        message={`This permanently deletes "${productName.name}". This can't be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

const createColumns = (formatters: SiteFormatters): ColumnDef<ProductName>[] => [
  {
    key: "name",
    header: "Product Name",
    sortable: true,
    alwaysVisible: true,
    render: (n) => (
      <div className="flex items-center gap-2">
        <ProductNameThumbnail productName={n} />
        <span className="font-medium text-ink">{n.name}</span>
      </div>
    ),
    sortValue: (n) => n.name.toLowerCase(),
    exportValue: (n) => n.name,
  },
  {
    key: "productGroupId",
    header: "Product Group",
    sortable: false,
    render: (n) => productGroupLabel(n.productGroupId),
    exportValue: (n) => productGroupLabel(n.productGroupId),
  },
  {
    key: "gender",
    header: "Gender",
    sortable: true,
    render: (n) => <GenderBadge gender={n.gender} />,
    sortValue: (n) => n.gender,
    exportValue: (n) => n.gender,
  },
  {
    key: "metalType",
    header: "Metal Type",
    sortable: true,
    render: (n) => <MetalTypeBadge metalType={n.metalType} />,
    sortValue: (n) => n.metalType,
    exportValue: (n) => n.metalType,
  },
  {
    key: "tagNumber",
    header: "Tag Number",
    sortable: false,
    defaultVisible: false,
    render: (n) =>
      n.tagNumber ? (
        <span className="font-mono text-ink-muted">{n.tagNumber}</span>
      ) : (
        "—"
      ),
    exportValue: (n) => n.tagNumber || "",
  },
  {
    key: "openingWeight",
    header: "Opening Weight",
    sortable: false,
    defaultVisible: false,
    render: (n) =>
      n.openingWeight !== null && n.openingWeight !== undefined
        ? formatters.weight(n.openingWeight)
        : "—",
    exportValue: (n) =>
      n.openingWeight !== null && n.openingWeight !== undefined
        ? formatters.weight(n.openingWeight)
        : "",
  },
  {
    key: "openingAmount",
    header: "Opening Amount",
    sortable: false,
    defaultVisible: false,
    render: (n) =>
      n.openingAmount !== null && n.openingAmount !== undefined
        ? formatters.amount(n.openingAmount)
        : "—",
    exportValue: (n) =>
      n.openingAmount !== null && n.openingAmount !== undefined
        ? formatters.amount(n.openingAmount)
        : "",
  },
  {
    key: "isPartialProduct",
    header: "Partial Product",
    sortable: false,
    defaultVisible: false,
    render: (n) =>
      n.isPartialProduct ? (
        <span className="inline-flex items-center rounded-full bg-amber-300 px-2.5 py-1 text-caption font-medium text-amber-900">
          Partial
        </span>
      ) : (
        "No"
      ),
    exportValue: (n) => (n.isPartialProduct ? "Yes" : "No"),
  },
  {
    key: "hasSupplierPayment",
    header: "Supplier Payment",
    sortable: false,
    defaultVisible: false,
    render: (n) => (n.hasSupplierPayment ? "Yes" : "No"),
    exportValue: (n) => (n.hasSupplierPayment ? "Yes" : "No"),
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    defaultVisible: false,
    render: (n) => formatters.date(n.createdAt),
    sortValue: (n) => new Date(n.createdAt).getTime(),
    exportValue: (n) => formatters.date(n.createdAt),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (n) => <StatusBadge status={n.status} />,
    sortValue: (n) => n.status,
    exportValue: (n) => n.status,
  },
];

export default function ProductNameTable({
  productNames,
  sortBy,
  order,
  onSortChange,
  pagination,
  onPageChange,
  onLimitChange,
  isLoading,
}: {
  productNames: ProductName[];
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
    columns.filter((c) => c.defaultVisible !== false).map((c) => c.key),
  );

  const columnsWithActions: ColumnDef<ProductName>[] = [
    ...columns,
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      alwaysVisible: true,
      align: "right",
      render: (productName) => <ProductNameActions productName={productName} />,
    },
  ];
  const allVisibleKeys = [...visibleColumnKeys, "actions"];

  return (
    <DataTable
      columns={columnsWithActions}
      rows={productNames}
      keyField={(n) => n.id}
      sortBy={sortBy}
      order={order}
      onSortChange={onSortChange}
      visibleColumnKeys={allVisibleKeys}
      onVisibleColumnsChange={(keys) =>
        setVisibleColumnKeys(keys.filter((k) => k !== "actions"))
      }
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      isLoading={isLoading}
      exportFilename="product-names"
      exportScopeLabel="All Product Names"
      module="product-names"
      columnControls="toggle"
      mobileCard={(productName) => (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <ProductNameThumbnail productName={productName} />
              <p className="font-heading text-base font-medium text-ink">
                {productName.name}
              </p>
            </div>
            <StatusBadge status={productName.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <GenderBadge gender={productName.gender} />
            <MetalTypeBadge metalType={productName.metalType} />
          </div>
          <div className="mt-2 text-sm text-ink-muted">
            {productGroupLabel(productName.productGroupId)}
          </div>
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <ProductNameActions productName={productName} />
          </div>
        </div>
      )}
      emptyMessage={
        <span className="flex flex-col items-center gap-2">
          <MdCategory size={28} className="text-ink-muted/50" />
          <span>
            No product names yet — click &quot;Add Product Name&quot; to create
            the first one.
          </span>
        </span>
      }
    />
  );
}

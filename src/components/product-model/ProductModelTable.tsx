"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MdDelete,
  MdEdit,
  MdCategory,
  MdCheckCircle,
  MdCancel,
  MdDiamond,
} from "react-icons/md";
import type { ProductModel } from "@/types/productModel";
import type { ColumnDef, PaginationMeta } from "@/types/dataTable";
import { useAppDispatch } from "@/redux/hooks";
import {
  deleteProductModel,
  toggleProductModelStatus,
} from "@/redux/slices/productModelSlice";
import { showToast } from "@/redux/slices/toastSlice";
import DataTable from "@/components/ui/table/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useSiteFormatters } from "@/components/layout/SiteFormatProvider";
import type { SiteFormatters } from "@/lib/siteFormatters";

function productNameLabel(
  productNameId: ProductModel["productNameId"],
): string {
  if (typeof productNameId === "string") return productNameId;
  return productNameId.name;
}

function StatusBadge({ status }: { status: ProductModel["status"] }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-medium
        ${active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
    >
      {active ? <MdCheckCircle size={13} /> : <MdCancel size={13} />}
      {active ? "Active" : "Discontinued"}
    </span>
  );
}

function ProductModelActions({ productModel }: { productModel: ProductModel }) {
  const dispatch = useAppDispatch();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteProductModel(productModel.id));
    setIsDeleting(false);
    setConfirmingDelete(false);
    if (deleteProductModel.fulfilled.match(result)) {
      dispatch(showToast("Product model deleted successfully.", "success"));
    } else {
      dispatch(
        showToast(
          result.payload || "Failed to delete product model. Please try again.",
          "error",
        ),
      );
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/inventory/product-models/${productModel.id}/edit`}
          title="Edit product model"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdEdit size={17} />
        </Link>
        <button
          type="button"
          onClick={async () => {
            const willActivate = productModel.status !== "active";
            const result = await dispatch(
              toggleProductModelStatus({
                id: productModel.id,
                status: willActivate ? "active" : "discontinued",
              }),
            );
            if (toggleProductModelStatus.fulfilled.match(result)) {
              dispatch(
                showToast(
                  `Product model ${willActivate ? "activated" : "discontinued"} successfully.`,
                  "success",
                ),
              );
            } else {
              dispatch(
                showToast(
                  "Failed to update product model status. Please try again.",
                  "error",
                ),
              );
            }
          }}
          title={
            productModel.status === "active" ? "Discontinue" : "Reactivate"
          }
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          {productModel.status === "active" ? (
            <MdCancel size={17} />
          ) : (
            <MdCheckCircle size={17} />
          )}
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          title="Delete product model"
          className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
        >
          <MdDelete size={17} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete product model?"
        message={`This permanently deletes "${productModel.modelName}" (${productModel.modelCode}). This can't be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

const createColumns = (formatters: SiteFormatters): ColumnDef<ProductModel>[] => [
  {
    key: "modelName",
    header: "Design",
    sortable: true,
    alwaysVisible: true,
    render: (m) => (
      <div className="flex items-center gap-2">
        {m.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.images[0]}
            alt={m.modelName}
            className="h-9 w-9 rounded-lg object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-tint text-ink-muted">
            <MdDiamond size={16} />
          </span>
        )}
        <span className="font-medium text-ink">{m.modelName}</span>
      </div>
    ),
    sortValue: (m) => m.modelName.toLowerCase(),
    exportValue: (m) => m.modelName,
  },
  {
    key: "modelCode",
    header: "Model Code",
    sortable: true,
    render: (m) => (
      <span className="font-mono text-ink-muted">{m.modelCode}</span>
    ),
    sortValue: (m) => m.modelCode,
    exportValue: (m) => m.modelCode,
  },
  {
    key: "productNameId",
    header: "Product Name",
    sortable: false,
    render: (m) => productNameLabel(m.productNameId),
    exportValue: (m) => productNameLabel(m.productNameId),
  },
  {
    key: "purity",
    header: "Purity",
    sortable: true,
    render: (m) => <span className="font-medium text-ink">{m.purity}</span>,
    sortValue: (m) => m.purity,
    exportValue: (m) => m.purity,
  },
  {
    key: "grossWeightRange",
    header: "Weight Range",
    sortable: false,
    render: (m) =>
      `${formatters.weight(m.grossWeightRange.min)} – ${formatters.weight(m.grossWeightRange.max)}`,
    exportValue: (m) =>
      `${formatters.weight(m.grossWeightRange.min)} – ${formatters.weight(m.grossWeightRange.max)}`,
  },
  {
    key: "hasStones",
    header: "Stones",
    sortable: false,
    defaultVisible: false,
    render: (m) =>
      m.hasStones ? `Yes (${m.stoneDetails?.length ?? 0})` : "No",
    exportValue: (m) => (m.hasStones ? "Yes" : "No"),
  },
  {
    key: "requiresHuid",
    header: "HUID",
    sortable: false,
    defaultVisible: false,
    render: (m) => (m.requiresHuid ? "Required" : "Not required"),
    exportValue: (m) => (m.requiresHuid ? "Required" : "Not required"),
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    defaultVisible: false,
    render: (m) => formatters.date(m.createdAt),
    sortValue: (m) => new Date(m.createdAt).getTime(),
    exportValue: (m) => formatters.date(m.createdAt),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (m) => <StatusBadge status={m.status} />,
    sortValue: (m) => m.status,
    exportValue: (m) => m.status,
  },
];

export default function ProductModelTable({
  productModels,
  sortBy,
  order,
  onSortChange,
  pagination,
  onPageChange,
  onLimitChange,
  isLoading,
}: {
  productModels: ProductModel[];
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

  const columnsWithActions: ColumnDef<ProductModel>[] = [
    ...columns,
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      alwaysVisible: true,
      align: "right",
      render: (productModel) => (
        <ProductModelActions productModel={productModel} />
      ),
    },
  ];
  const allVisibleKeys = [...visibleColumnKeys, "actions"];

  return (
    <DataTable
      columns={columnsWithActions}
      rows={productModels}
      keyField={(m) => m.id}
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
      exportFilename="product-models"
      exportScopeLabel="All Product Models"
      module="product-models"
      columnControls="toggle"
      mobileCard={(productModel) => (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-heading text-base font-medium text-ink">
                {productModel.modelName}
              </p>
              <p className="font-mono text-sm text-ink-muted">
                {productModel.modelCode}
              </p>
            </div>
            <StatusBadge status={productModel.status} />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-ink-muted">
            <span>{productModel.purity}</span>
            <span>
              {formatters.weight(productModel.grossWeightRange.min)} –{" "}
              {formatters.weight(productModel.grossWeightRange.max)}
            </span>
          </div>
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <ProductModelActions productModel={productModel} />
          </div>
        </div>
      )}
      emptyMessage={
        <span className="flex flex-col items-center gap-2">
          <MdCategory size={28} className="text-ink-muted/50" />
          <span>
            No designs yet — click &quot;Add Product Model&quot; to create the
            first one.
          </span>
        </span>
      }
    />
  );
}

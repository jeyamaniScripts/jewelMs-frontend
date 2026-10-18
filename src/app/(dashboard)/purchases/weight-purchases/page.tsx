"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/layout/PageHeader";
import { useSiteFormatters } from "@/components/layout/SiteFormatProvider";
import DataTable from "@/components/ui/table/DataTable";
import type { ColumnDef, PaginationMeta } from "@/types/dataTable";
import { ApiClientError } from "@/lib/apiClient";
import {
  deleteWeightPurchase,
  listWeightPurchases,
  type WeightPurchase,
} from "@/lib/purchaseWeightApi";

const supplierName = (supplier: WeightPurchase["supplierId"]) =>
  typeof supplier === "string" ? "Supplier" : supplier.supplierName;

function StatusBadge({ status }: { status: WeightPurchase["status"] }) {
  const statusClasses = {
    draft: "bg-surface-tint text-ink",
    confirmed: "bg-success/10 text-success",
    cancelled: "bg-danger/10 text-danger",
  } as const;

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-caption font-medium capitalize ${statusClasses[status]}`}>
      {status}
    </span>
  );
}

export default function WeightPurchasesPage() {
  const formatters = useSiteFormatters();
  const [purchases, setPurchases] = useState<WeightPurchase[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("purchaseDate");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listWeightPurchases({ search, page, limit });
      setPurchases(result.purchases);
      setPagination(result.pagination);
      setError("");
    } catch (cause) {
      setError(cause instanceof ApiClientError ? cause.message : "Could not load weight-based purchases");
    } finally {
      setLoading(false);
    }
  }, [limit, page, search]);

  useEffect(() => {
    let isCurrent = true;
    listWeightPurchases({ search, page, limit })
      .then((result) => {
        if (!isCurrent) return;
        setPurchases(result.purchases);
        setPagination(result.pagination);
        setError("");
      })
      .catch((cause: unknown) => {
        if (!isCurrent) return;
        setError(cause instanceof ApiClientError ? cause.message : "Could not load weight-based purchases");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [search, page, limit]);

  const removePurchase = async (purchase: WeightPurchase) => {
    if (!window.confirm(`Delete ${purchase.purchaseNumber}?`)) return;
    setError("");
    try {
      await deleteWeightPurchase(purchase.id);
      if (purchases.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadPurchases();
      }
    } catch (cause) {
      setError(cause instanceof ApiClientError ? cause.message : "Could not delete this purchase");
    }
  };

  const columns: ColumnDef<WeightPurchase>[] = [
    {
      key: "purchaseNumber",
      header: "Purchase",
      sortable: true,
      alwaysVisible: true,
      render: (purchase) => <span className="font-mono font-medium text-primary">{purchase.purchaseNumber}</span>,
      sortValue: (purchase) => purchase.purchaseNumber,
      exportValue: (purchase) => purchase.purchaseNumber,
    },
    {
      key: "purchaseDate",
      header: "Date",
      sortable: true,
      render: (purchase) => formatters.date(purchase.purchaseDate),
      sortValue: (purchase) => new Date(purchase.purchaseDate).getTime(),
      exportValue: (purchase) => formatters.date(purchase.purchaseDate),
    },
    {
      key: "supplier",
      header: "Supplier",
      sortable: true,
      render: (purchase) => supplierName(purchase.supplierId),
      sortValue: (purchase) => supplierName(purchase.supplierId).toLowerCase(),
      exportValue: (purchase) => supplierName(purchase.supplierId),
    },
    {
      key: "products",
      header: "Products",
      align: "right",
      sortable: true,
      render: (purchase) => purchase.products.length,
      sortValue: (purchase) => purchase.products.length,
      exportValue: (purchase) => purchase.products.length,
    },
    {
      key: "netAmount",
      header: "Net amount",
      align: "right",
      sortable: true,
      render: (purchase) => <span className="font-semibold text-ink">{formatters.amount(purchase.netAmount)}</span>,
      sortValue: (purchase) => purchase.netAmount,
      exportValue: (purchase) => formatters.amount(purchase.netAmount),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (purchase) => <StatusBadge status={purchase.status} />,
      sortValue: (purchase) => purchase.status,
      exportValue: (purchase) => purchase.status,
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      alwaysVisible: true,
      align: "right",
      render: (purchase) => (
        <div className="flex justify-end gap-1">
          <Link
            href={`/purchases/weight-purchases/${purchase.id}`}
            aria-label={`Edit ${purchase.purchaseNumber}`}
            title="Edit purchase"
            className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
          >
            <FiEdit2 size={16} />
          </Link>
          <button
            type="button"
            onClick={() => void removePurchase(purchase)}
            aria-label={`Delete ${purchase.purchaseNumber}`}
            title="Delete purchase"
            className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const changeSort = (key: string) => {
    if (key === sortBy) {
      setOrder((current) => current === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setOrder("asc");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Weight-Based Purchases" subtitle="Create and manage weight-based supplier purchases." />
        <Link href="/purchases/weight-purchases/new">
          <Button fullWidth={false}>
            <FiPlus size={17} /> New weight purchase
          </Button>
        </Link>
      </div>

      {error && <Alert>{error}</Alert>}
      <div className="max-w-sm">
        <Input
          name="weight-purchase-search"
          label="Search purchases"
          placeholder="Purchase number or supplier"
          value={search}
          onChange={(event) => {
            setLoading(true);
            setPage(1);
            setSearch(event.target.value);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={purchases}
        keyField={(purchase) => purchase.id}
        sortBy={sortBy}
        order={order}
        onSortChange={changeSort}
        visibleColumnKeys={columns.filter((column) => column.defaultVisible !== false).map((column) => column.key)}
        onVisibleColumnsChange={() => undefined}
        pagination={pagination}
        onPageChange={(nextPage) => {
          setLoading(true);
          setPage(nextPage);
        }}
        onLimitChange={(nextLimit) => {
          setLoading(true);
          setPage(1);
          setLimit(nextLimit);
        }}
        isLoading={loading}
        exportFilename="weight-based-purchases"
        exportScopeLabel="Weight-Based Purchases"
        module="weight-purchases"
        columnControls="toggle"
        emptyMessage="No weight-based purchases found."
        mobileCard={(purchase) => (
          <article className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono font-semibold text-primary">{purchase.purchaseNumber}</p>
                <p className="mt-1 truncate text-sm text-ink">{supplierName(purchase.supplierId)}</p>
                <p className="mt-1 text-xs text-ink-muted">{formatters.date(purchase.purchaseDate)}</p>
              </div>
              <StatusBadge status={purchase.status} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-ink-muted">{purchase.products.length} product(s)</span>
              <span className="font-semibold text-ink">{formatters.amount(purchase.netAmount)}</span>
            </div>
            <div className="mt-2 flex justify-end gap-1">
              <Link
                href={`/purchases/weight-purchases/${purchase.id}`}
                aria-label={`Edit ${purchase.purchaseNumber}`}
                className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
              >
                <FiEdit2 size={16} />
              </Link>
              <button
                type="button"
                onClick={() => void removePurchase(purchase)}
                aria-label={`Delete ${purchase.purchaseNumber}`}
                className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </article>
        )}
      />
    </div>
  );
}

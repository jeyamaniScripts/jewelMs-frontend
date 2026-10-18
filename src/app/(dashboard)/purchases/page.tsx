"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MdAdd } from "react-icons/md";

import PageHeader from "@/components/layout/PageHeader";
import SearchSortBar from "@/components/layout/SearchSortBar";
import PurchaseTable from "@/components/purchases/PurchaseTable";
import Button from "@/components/ui/Button";
import { useTableController } from "@/hooks/useTableController";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchPurchases } from "@/redux/slices/purchaseSlice";

export default function PurchasesPage() {
  const dispatch = useAppDispatch();
  const { purchases, pagination, status } = useAppSelector((state) => state.purchase);
  const table = useTableController("purchaseDate");

  useEffect(() => {
    const request = dispatch(
      fetchPurchases({
        search: table.search,
        sortBy: table.sortBy as "purchaseNumber" | "purchaseDate" | "grandTotal" | "createdAt" | "status",
        order: table.order,
        page: table.page,
        limit: table.limit,
      })
    );
    return () => request.abort();
  }, [dispatch, table.search, table.sortBy, table.order, table.page, table.limit]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Purchases" subtitle="Goods received from suppliers." />
        <Link href="/purchases/new" className="inline-block">
          <Button type="button">
            <MdAdd size={18} /> Add Purchase
          </Button>
        </Link>
      </div>

      <SearchSortBar
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search by purchase number..."
      />

      <PurchaseTable
        purchases={purchases}
        sortBy={table.sortBy}
        order={table.order}
        onSortChange={table.toggleSort}
        pagination={pagination}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        isLoading={status === "loading"}
      />
    </div>
  );
}
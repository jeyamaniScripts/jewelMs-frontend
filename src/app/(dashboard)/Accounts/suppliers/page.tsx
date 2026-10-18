"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MdAdd } from "react-icons/md";

import PageHeader from "@/components/layout/PageHeader";
import SearchSortBar from "@/components/layout/SearchSortBar";
import SupplierTable from "@/components/accounts/supplier/SupplierTable";
import Button from "@/components/ui/Button";
import { useTableController } from "@/hooks/useTableController";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchSuppliers } from "@/redux/slices/supplierSlice";

export default function SuppliersPage() {
  const dispatch = useAppDispatch();
  const { suppliers, pagination, status } = useAppSelector((state) => state.supplier);
  const table = useTableController("supplierName");

  useEffect(() => {
    const request = dispatch(
      fetchSuppliers({
        search: table.search,
        sortBy: table.sortBy as "supplierName" | "supplierCode" | "supplierType" | "createdAt" | "status",
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
        <PageHeader title="Suppliers" subtitle="Manufacturers, karigars, and dealers you source stock from." />
        <Link href="/Accounts/suppliers/new" className="inline-block">
          <Button type="button">
            <MdAdd size={18} /> Add Supplier
          </Button>
        </Link>
      </div>

      <SearchSortBar
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search suppliers..."
      />

      <SupplierTable
        suppliers={suppliers}
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
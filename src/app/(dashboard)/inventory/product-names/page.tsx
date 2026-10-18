"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MdAdd } from "react-icons/md";

import PageHeader from "@/components/layout/PageHeader";
import SearchSortBar from "@/components/layout/SearchSortBar";
import ProductNameTable from "@/components/product-name/ProductNameTable";
import Button from "@/components/ui/Button";
import { useTableController } from "@/hooks/useTableController";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProductNames } from "@/redux/slices/productNameSlice";

export default function ProductNamesPage() {
  const dispatch = useAppDispatch();
  const { productNames, pagination, status } = useAppSelector((state) => state.productName);
  const table = useTableController("name");

  useEffect(() => {
    const request = dispatch(
      fetchProductNames({
        search: table.search,
        sortBy: table.sortBy as "name" | "gender" | "createdAt" | "status",
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
        <PageHeader
          title="Product Names"
          subtitle="The third level of your product hierarchy — grouped under a Product Group (e.g. Ladies Ring, Gents Ring)."
        />
        <Link href="/inventory/product-names/new" className="inline-block">
          <Button type="button">
            <MdAdd size={18} /> Add Product Name
          </Button>
        </Link>
      </div>

      <SearchSortBar
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search product names..."
      />

      <ProductNameTable
        productNames={productNames}
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

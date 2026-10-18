"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MdAdd } from "react-icons/md";

import PageHeader from "@/components/layout/PageHeader";
import SearchSortBar from "@/components/layout/SearchSortBar";
import ProductModelTable from "@/components/product-model/ProductModelTable";
import Button from "@/components/ui/Button";
import { useTableController } from "@/hooks/useTableController";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProductModels } from "@/redux/slices/productModelSlice";

export default function ProductModelsPage() {
  const dispatch = useAppDispatch();
  const { productModels, pagination, status } = useAppSelector((state) => state.productModel);
  const table = useTableController("modelName");

  useEffect(() => {
    const request = dispatch(
      fetchProductModels({
        search: table.search,
        sortBy: table.sortBy as "modelName" | "modelCode" | "purity" | "createdAt" | "status",
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
          title="Product Models"
          subtitle="The fourth level of your product hierarchy — the actual design/SKU, grouped under a Product Name."
        />
        <Link href="/inventory/product-models/new" className="inline-block">
          <Button type="button">
            <MdAdd size={18} /> Add Product Model
          </Button>
        </Link>
      </div>

      <SearchSortBar
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search designs..."
      />

      <ProductModelTable
        productModels={productModels}
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

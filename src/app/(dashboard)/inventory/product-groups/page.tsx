"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MdAdd } from "react-icons/md";

import PageHeader from "@/components/layout/PageHeader";
import SearchSortBar from "@/components/layout/SearchSortBar";
import ProductGroupTable from "@/components/product-group/ProductGroupTable";
import Button from "@/components/ui/Button";
import { useTableController } from "@/hooks/useTableController";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProductGroups } from "@/redux/slices/productGroupSlice";

export default function ProductGroupsPage() {
  const dispatch = useAppDispatch();
  const { productGroups, pagination, status } = useAppSelector((state) => state.productGroup);
  const table = useTableController("groupName");

  useEffect(() => {
    const request = dispatch(
      fetchProductGroups({
        search: table.search,
        sortBy: table.sortBy as "groupName" | "groupCode" | "createdAt" | "status",
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
          title="Product Groups"
          subtitle="The second level of your product hierarchy — grouped under a Category (e.g. Rings, Bangles, Chains)."
        />
        <Link href="/inventory/product-groups/new" className="inline-block">
          <Button type="button">
            <MdAdd size={18} /> Add Product Group
          </Button>
        </Link>
      </div>

      <SearchSortBar
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search product groups..."
      />

      <ProductGroupTable
        productGroups={productGroups}
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

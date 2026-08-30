"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MdAdd } from "react-icons/md";

import PageHeader from "@/components/layout/PageHeader";
import SearchSortBar from "@/components/layout/SearchSortBar";
import CategoryTable from "@/components/category/CategoryTable";
import Button from "@/components/ui/Button";
import { useTableController } from "@/hooks/useTableController";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCategories } from "@/redux/slices/categorySlice";

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { categories, pagination, status } = useAppSelector((state) => state.category);
  const table = useTableController("categoryName");

  useEffect(() => {
    const request = dispatch(
      fetchCategories({
        search: table.search,
        sortBy: table.sortBy as "categoryName" | "categoryCode" | "metalType" | "createdAt" | "status",
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
          title="Categories"
          subtitle="The top level of your product hierarchy — Category → Product Group → Product Name → Product Model."
        />
        <Link href="/inventory/categories/new" className="inline-block">
          <Button type="button">
            <MdAdd size={18} /> Add Category
          </Button>
        </Link>
      </div>

      <SearchSortBar
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search categories..."
      />

      <CategoryTable
        categories={categories}
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

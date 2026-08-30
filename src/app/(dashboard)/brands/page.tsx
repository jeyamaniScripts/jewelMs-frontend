"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MdAdd } from "react-icons/md";

import PageHeader from "@/components/layout/PageHeader";
import SearchSortBar from "@/components/layout/SearchSortBar";
import BrandTable from "@/components/company/BrandTable";
import CredentialsPanel from "@/components/shared/CredentialsPanel";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useTableController } from "@/hooks/useTableController";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchBrands, clearGeneratedCredentials } from "@/redux/slices/companySlice";

export default function BrandsPage() {
  const dispatch = useAppDispatch();
  const { brands, pagination, status, lastCreatedCredentials } = useAppSelector((state) => state.company);
  const table = useTableController("companyName");

  useEffect(() => {
    const request = dispatch(
      fetchBrands({
        search: table.search,
        sortBy: table.sortBy as
          | "companyName"
          | "shortName"
          | "ownerName"
          | "email"
          | "showroomsCount"
          | "createdAt"
          | "status",
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
          title="Jewelry Brands"
          subtitle="Create and manage the jewelry brands operating on this platform."
        />
        <Link href="/brands/new" className="inline-block">
          <Button type="button">
            <MdAdd size={18} /> Add Brand
          </Button>
        </Link>
      </div>

      <SearchSortBar
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search brands..."
      />

      <BrandTable
        brands={brands}
        sortBy={table.sortBy}
        order={table.order}
        onSortChange={table.toggleSort}
        pagination={pagination}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        isLoading={status === "loading"}
      />

      {/* Shown when "Reset / regenerate credentials" is used from the table above */}
      <Modal
        open={!!lastCreatedCredentials}
        onClose={() => dispatch(clearGeneratedCredentials())}
        title="Login credentials"
      >
        {lastCreatedCredentials && (
          <CredentialsPanel
            credentials={lastCreatedCredentials}
            onDone={() => dispatch(clearGeneratedCredentials())}
          />
        )}
      </Modal>
    </div>
  );
}

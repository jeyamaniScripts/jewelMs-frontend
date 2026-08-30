"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MdAdd } from "react-icons/md";

import PageHeader from "@/components/layout/PageHeader";
import SearchSortBar from "@/components/layout/SearchSortBar";
import ShowroomTable from "@/components/showroom/ShowroomTable";
import CredentialsPanel from "@/components/shared/CredentialsPanel";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useTableController } from "@/hooks/useTableController";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchShowrooms, clearShowroomCredentials } from "@/redux/slices/showroomSlice";

export default function ShowroomsPage() {
  const dispatch = useAppDispatch();
  const brandId = useAppSelector((state) => state.auth.user?.brandId);
  const { showrooms, pagination, status, lastCreatedCredentials } = useAppSelector((state) => state.showroom);
  const table = useTableController("showroomName");

  useEffect(() => {
    if (!brandId) return;
    const request = dispatch(
      fetchShowrooms({
        brandId,
        search: table.search,
        sortBy: table.sortBy as
          | "showroomName"
          | "shortName"
          | "managerName"
          | "contactEmail"
          | "employeesCount"
          | "createdAt"
          | "status",
        order: table.order,
        page: table.page,
        limit: table.limit,
      })
    );
    return () => request.abort();
  }, [dispatch, brandId, table.search, table.sortBy, table.order, table.page, table.limit]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Showrooms" subtitle="Manage the showrooms under your jewelry brand." />
        <Link href="/showrooms/new" className="inline-block">
          <Button type="button">
            <MdAdd size={18} /> Add Showroom
          </Button>
        </Link>
      </div>

      <SearchSortBar
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search showrooms..."
      />

      <ShowroomTable
        showrooms={showrooms}
        sortBy={table.sortBy}
        order={table.order}
        onSortChange={table.toggleSort}
        pagination={pagination}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        isLoading={status === "loading"}
      />

      <Modal
        open={!!lastCreatedCredentials}
        onClose={() => dispatch(clearShowroomCredentials())}
        title="Login credentials"
      >
        {lastCreatedCredentials && (
          <CredentialsPanel
            credentials={lastCreatedCredentials}
            onDone={() => dispatch(clearShowroomCredentials())}
          />
        )}
      </Modal>
    </div>
  );
}

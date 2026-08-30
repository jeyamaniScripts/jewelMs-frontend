"use client";

import { useEffect, useState } from "react";
import { MdPeople, MdDevices } from "react-icons/md";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";
import DataTable from "@/components/ui/table/DataTable";
import type { ColumnDef } from "@/types/dataTable";
import { useTableController } from "@/hooks/useTableController";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchActiveSessionsSummary, fetchActiveSessions } from "@/redux/slices/sessionSlice";
import type { ActiveSessionEntry } from "@/types/session";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

const COLUMNS: ColumnDef<ActiveSessionEntry>[] = [
  {
    key: "user",
    header: "User",
    sortable: false,
    alwaysVisible: true,
    render: (entry) => (
      <div>
        <div className="font-medium text-ink">{entry.user?.fullName ?? "Deleted user"}</div>
        <div className="text-caption text-ink-muted">{entry.user?.email}</div>
      </div>
    ),
    exportValue: (entry) => entry.user?.fullName ?? "Deleted user",
  },
  {
    // Key matches the backend's actual sort field (Session.createdAt) —
    // "loginAt" is just the display-friendly name for the same value.
    key: "createdAt",
    header: "Login time",
    sortable: true,
    render: (entry) => formatDateTime(entry.loginAt),
    sortValue: (entry) => new Date(entry.loginAt).getTime(),
    exportValue: (entry) => formatDateTime(entry.loginAt),
  },
  {
    key: "lastUsedAt",
    header: "Last active",
    sortable: true,
    render: (entry) => formatDateTime(entry.lastUsedAt),
    sortValue: (entry) => new Date(entry.lastUsedAt).getTime(),
    exportValue: (entry) => formatDateTime(entry.lastUsedAt),
  },
  {
    key: "ipAddress",
    header: "IP address",
    sortable: false,
    defaultVisible: false,
    render: (entry) => entry.ipAddress,
    exportValue: (entry) => entry.ipAddress,
  },
  {
    key: "userAgent",
    header: "Device",
    sortable: false,
    defaultVisible: false,
    render: (entry) => entry.userAgent,
    exportValue: (entry) => entry.userAgent,
  },
];

export default function SiteSettingsPage() {
  const dispatch = useAppDispatch();
  const currentRole = useAppSelector((state) => state.auth.role);
  const { summary, activeSessions, pagination, status } = useAppSelector((state) => state.session);
  // Starts sorted by "most recently active first" — matches what this page showed before sorting existed.
  const table = useTableController("lastUsedAt", 10, "desc");
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(
    COLUMNS.filter((c) => c.defaultVisible !== false).map((c) => c.key)
  );

  useEffect(() => {
    dispatch(fetchActiveSessionsSummary());
  }, [dispatch]);

  useEffect(() => {
    const request = dispatch(
      fetchActiveSessions({
        page: table.page,
        limit: table.limit,
        sortBy: table.sortBy as "lastUsedAt" | "createdAt",
        order: table.order,
      })
    );
    return () => request.abort();
  }, [dispatch, table.page, table.limit, table.sortBy, table.order]);

  return (
    <div>
      <PageHeader
        title="Site Settings"
        subtitle={
          currentRole === "super_admin"
            ? "Who's currently logged in across the platform."
            : "Who's currently logged in across your brand's accounts."
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Accounts currently logged in"
          value={summary?.activeAccountsCount ?? "—"}
          icon={MdPeople}
        />
        <StatCard
          label="Active sessions (all devices)"
          value={summary?.activeSessionsCount ?? "—"}
          icon={MdDevices}
        />
      </div>

      <h2 className="text-h4 mb-3">Currently logged in</h2>

      <DataTable
        columns={COLUMNS}
        rows={activeSessions}
        keyField={(entry) => entry.id}
        sortBy={table.sortBy}
        order={table.order}
        onSortChange={table.toggleSort}
        visibleColumnKeys={visibleColumnKeys}
        onVisibleColumnsChange={setVisibleColumnKeys}
        pagination={pagination}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        isLoading={status === "loading" && activeSessions.length === 0}
        exportFilename="currently-logged-in"
        exportScopeLabel={currentRole === "super_admin" ? "Platform-wide" : "Brand-wide"}
        exportRoles={["super_admin", "brand_admin"]}
        module="site-settings"
        mobileCard={(entry) => (
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <p className="font-medium text-ink">{entry.user?.fullName ?? "Deleted user"}</p>
            <p className="text-caption text-ink-muted">{entry.user?.email}</p>
            <div className="mt-3 space-y-1 text-sm text-ink-muted">
              <p>Logged in: {formatDateTime(entry.loginAt)}</p>
              <p>Last active: {formatDateTime(entry.lastUsedAt)}</p>
              <p>{entry.ipAddress}</p>
            </div>
          </div>
        )}
        emptyMessage="No one else is currently logged in."
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { MdRefresh, MdDelete, MdEdit, MdStorefront, MdCheckCircle, MdCancel } from "react-icons/md";
import type { Showroom } from "@/types/showroom";
import type { ColumnDef, PaginationMeta } from "@/types/dataTable";
import { useAppDispatch } from "@/redux/hooks";
import { deleteShowroom, regenerateShowroomCredentials, toggleShowroomStatus } from "@/redux/slices/showroomSlice";
import { showToast } from "@/redux/slices/toastSlice";
import DataTable from "@/components/ui/table/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

function StatusBadge({ status }: { status: Showroom["status"] }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-medium
        ${active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
    >
      {active ? <MdCheckCircle size={13} /> : <MdCancel size={13} />}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ShowroomActions({ showroom }: { showroom: Showroom }) {
  const dispatch = useAppDispatch();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteShowroom(showroom.id));
    setIsDeleting(false);
    setConfirmingDelete(false);
    if (deleteShowroom.fulfilled.match(result)) {
      dispatch(showToast("Showroom deleted successfully.", "success"));
    } else {
      dispatch(showToast("Failed to delete showroom. Please try again.", "error"));
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Link
          href={`/showrooms/${showroom.id}/edit`}
          title="Edit showroom"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdEdit size={17} />
        </Link>
        <button
          type="button"
          onClick={async () => {
            const willActivate = showroom.status !== "active";
            const result = await dispatch(
              toggleShowroomStatus({ id: showroom.id, status: willActivate ? "active" : "inactive" })
            );
            if (toggleShowroomStatus.fulfilled.match(result)) {
              dispatch(showToast(`Showroom ${willActivate ? "activated" : "deactivated"} successfully.`, "success"));
            } else {
              dispatch(showToast("Failed to update showroom status. Please try again.", "error"));
            }
          }}
          title={showroom.status === "active" ? "Deactivate" : "Activate"}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          {showroom.status === "active" ? <MdCancel size={17} /> : <MdCheckCircle size={17} />}
        </button>
        <button
          type="button"
          onClick={async () => {
            const result = await dispatch(regenerateShowroomCredentials(showroom));
            if (!regenerateShowroomCredentials.fulfilled.match(result)) {
              dispatch(showToast("Failed to regenerate credentials. Please try again.", "error"));
            }
          }}
          title="Reset / regenerate login credentials"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdRefresh size={17} />
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          title="Delete showroom"
          className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
        >
          <MdDelete size={17} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete showroom?"
        message={`This permanently deletes "${showroom.showroomName}" and its Showroom Admin login. This can't be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

const COLUMNS: ColumnDef<Showroom>[] = [
  {
    key: "showroomName",
    header: "Showroom",
    sortable: true,
    alwaysVisible: true,
    render: (s) => (
      <span className="inline-flex items-center gap-1.5">
        <span className="font-medium text-ink">{s.showroomName}</span>
        {s.isMainBranch && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            Main
          </span>
        )}
      </span>
    ),
    sortValue: (s) => s.showroomName.toLowerCase(),
    exportValue: (s) => `${s.showroomName}${s.isMainBranch ? " (Main)" : ""}`,
  },
  {
    key: "shortName",
    header: "Short Name",
    sortable: true,
    defaultVisible: false,
    render: (s) => s.shortName || "—",
    sortValue: (s) => (s.shortName || s.showroomName).toLowerCase(),
    exportValue: (s) => s.shortName || "",
  },
  {
    key: "managerName",
    header: "Manager",
    sortable: true,
    render: (s) => s.managerName,
    sortValue: (s) => s.managerName.toLowerCase(),
    exportValue: (s) => s.managerName,
  },
  {
    key: "contactEmail",
    header: "Contact",
    sortable: true,
    render: (s) => (
      <div>
        <div className="text-ink-muted">{s.contactEmail}</div>
        <div className="text-caption text-ink-muted">{s.contactPhone}</div>
      </div>
    ),
    sortValue: (s) => s.contactEmail.toLowerCase(),
    exportValue: (s) => `${s.contactEmail} / ${s.contactPhone}`,
  },
  {
    key: "employeesCount",
    header: "Employees",
    sortable: true,
    defaultVisible: false,
    render: (s) => s.employeesCount,
    sortValue: (s) => s.employeesCount,
    exportValue: (s) => s.employeesCount,
    footer: (rows) => rows.reduce((sum, s) => sum + s.employeesCount, 0),
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    defaultVisible: false,
    render: (s) => new Date(s.createdAt).toLocaleDateString(),
    sortValue: (s) => new Date(s.createdAt).getTime(),
    exportValue: (s) => new Date(s.createdAt).toLocaleDateString(),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (s) => <StatusBadge status={s.status} />,
    sortValue: (s) => s.status,
    exportValue: (s) => s.status,
  },
];

export default function ShowroomTable({
  showrooms,
  sortBy,
  order,
  onSortChange,
  pagination,
  onPageChange,
  onLimitChange,
  isLoading,
}: {
  showrooms: Showroom[];
  sortBy: string;
  order: "asc" | "desc";
  onSortChange: (key: string) => void;
  pagination: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}) {
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(
    COLUMNS.filter((c) => c.defaultVisible !== false).map((c) => c.key)
  );

  const columnsWithActions: ColumnDef<Showroom>[] = [
    ...COLUMNS,
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      alwaysVisible: true,
      align: "right",
      render: (showroom) => <ShowroomActions showroom={showroom} />,
    },
  ];
  const allVisibleKeys = [...visibleColumnKeys, "actions"];

  return (
    <DataTable
      columns={columnsWithActions}
      rows={showrooms}
      keyField={(s) => s.id}
      sortBy={sortBy}
      order={order}
      onSortChange={onSortChange}
      visibleColumnKeys={allVisibleKeys}
      onVisibleColumnsChange={(keys) => setVisibleColumnKeys(keys.filter((k) => k !== "actions"))}
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      showFooter={visibleColumnKeys.includes("employeesCount")}
      isLoading={isLoading}
      exportFilename="showrooms"
      exportScopeLabel="All Showrooms"
      module="showrooms"
      columnControls="toggle"
      mobileCard={(showroom) => (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 font-heading text-base font-medium text-ink">
                {showroom.showroomName}
                {showroom.isMainBranch && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Main
                  </span>
                )}
              </p>
              <p className="text-sm text-ink-muted">{showroom.managerName}</p>
            </div>
            <StatusBadge status={showroom.status} />
          </div>
          <div className="mt-3 space-y-1 text-sm text-ink-muted">
            <p>{showroom.contactEmail}</p>
            <p>{showroom.contactPhone}</p>
            <p>
              {showroom.employeesCount} employee{showroom.employeesCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <ShowroomActions showroom={showroom} />
          </div>
        </div>
      )}
      emptyMessage={
        <span className="flex flex-col items-center gap-2">
          <MdStorefront size={28} className="text-ink-muted/50" />
          <span>No showrooms yet — click &quot;Add Showroom&quot; to open your first location.</span>
        </span>
      }
    />
  );
}

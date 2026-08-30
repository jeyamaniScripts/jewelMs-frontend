"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MdRefresh,
  MdDelete,
  MdEdit,
  MdPeople,
  MdCheckCircle,
  MdCancel,
  MdVisibility,
  MdVpnKey,
  MdClose,
} from "react-icons/md";
import type { Employee } from "@/types/employee";
import type { ColumnDef, PaginationMeta } from "@/types/dataTable";
import { EMPLOYEE_ROLE_LABEL } from "@/constants/employeeRoles";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  deleteEmployee,
  regenerateEmployeeCredentials,
  grantEmployeeCredentials,
  toggleEmployeeStatus,
} from "@/redux/slices/employeeSlice";
import { showToast } from "@/redux/slices/toastSlice";
import DataTable from "@/components/ui/table/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import EmployeeDetails from "@/components/employee/EmployeeDetails";
import { useRowSelection } from "@/hooks/useRowSelection";
import Button from "@/components/ui/Button";

function StatusBadge({ status }: { status: Employee["status"] }) {
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

function CredentialsBadge({ hasCredentials }: { hasCredentials: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-medium
        ${hasCredentials ? "bg-primary/10 text-primary" : "bg-surface-tint text-ink-muted"}`}
    >
      <MdVpnKey size={12} />
      {hasCredentials ? "Login enabled" : "No login"}
    </span>
  );
}

function RoleBadge({ role }: { role: Employee["role"] }) {
  const roleRecord = useAppSelector((state) => state.permission.roles.find((r) => r.roleKey === role));
  const label = roleRecord?.label ?? EMPLOYEE_ROLE_LABEL[role as keyof typeof EMPLOYEE_ROLE_LABEL] ?? role;

  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-caption font-medium text-primary">
      {label}
    </span>
  );
}

function EmployeeActions({ employee, onView }: { employee: Employee; onView: () => void }) {
  const dispatch = useAppDispatch();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await dispatch(deleteEmployee(employee.id));
    setIsDeleting(false);
    setConfirmingDelete(false);
    if (deleteEmployee.fulfilled.match(result)) {
      dispatch(showToast("Employee deleted successfully.", "success"));
    } else {
      dispatch(showToast("Failed to delete employee. Please try again.", "error"));
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={onView}
          title="View details"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdVisibility size={17} />
        </button>
        <Link
          href={`/employees/${employee.id}/edit`}
          title="Edit employee"
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          <MdEdit size={17} />
        </Link>
        <button
          type="button"
          onClick={async () => {
            const willActivate = employee.status !== "active";
            const result = await dispatch(
              toggleEmployeeStatus({ id: employee.id, status: willActivate ? "active" : "inactive" })
            );
            if (toggleEmployeeStatus.fulfilled.match(result)) {
              dispatch(showToast(`Employee ${willActivate ? "activated" : "deactivated"} successfully.`, "success"));
            } else {
              dispatch(showToast("Failed to update employee status. Please try again.", "error"));
            }
          }}
          title={employee.status === "active" ? "Deactivate" : "Activate"}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          {employee.status === "active" ? <MdCancel size={17} /> : <MdCheckCircle size={17} />}
        </button>
        {employee.hasCredentials ? (
          <button
            type="button"
            onClick={async () => {
              const result = await dispatch(regenerateEmployeeCredentials({ employee }));
              if (!regenerateEmployeeCredentials.fulfilled.match(result)) {
                dispatch(showToast("Failed to regenerate credentials. Please try again.", "error"));
              }
            }}
            title="Reset / regenerate login credentials"
            className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
          >
            <MdRefresh size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={async () => {
              const result = await dispatch(grantEmployeeCredentials({ employee }));
              if (!grantEmployeeCredentials.fulfilled.match(result)) {
                dispatch(showToast("Failed to grant login access. Please try again.", "error"));
              }
            }}
            title="Grant login access"
            className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
          >
            <MdVpnKey size={17} />
          </button>
        )}
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          title="Delete employee"
          className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
        >
          <MdDelete size={17} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete employee?"
        message={`This permanently deletes ${employee.fullName}'s record${employee.hasCredentials ? " and login" : ""}. This can't be undone.`}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}

const COLUMNS: ColumnDef<Employee>[] = [
  {
    key: "fullName",
    header: "Employee",
    sortable: true,
    alwaysVisible: true,
    render: (e) => (
      <div>
        <div className="font-medium text-ink">{e.fullName}</div>
        <div className="text-caption text-ink-muted">{e.employeeCode}</div>
      </div>
    ),
    sortValue: (e) => e.fullName.toLowerCase(),
    exportValue: (e) => `${e.fullName} (${e.employeeCode})`,
  },
  {
    key: "email",
    header: "Contact",
    sortable: true,
    render: (e) => (
      <div>
        <div className="text-ink-muted">{e.email}</div>
        <div className="text-caption text-ink-muted">{e.mobile}</div>
      </div>
    ),
    sortValue: (e) => e.email.toLowerCase(),
    exportValue: (e) => `${e.email} / ${e.mobile}`,
  },
  { key: "role", header: "Role", sortable: true, render: (e) => <RoleBadge role={e.role} />, sortValue: (e) => e.role, exportValue: (e) => e.role },
  {
    key: "department",
    header: "Department",
    sortable: true,
    defaultVisible: false,
    render: (e) => e.department || "—",
    sortValue: (e) => (e.department || "").toLowerCase(),
    exportValue: (e) => e.department || "",
  },
  {
    key: "designation",
    header: "Designation",
    sortable: true,
    defaultVisible: false,
    render: (e) => e.designation || "—",
    sortValue: (e) => (e.designation || "").toLowerCase(),
    exportValue: (e) => e.designation || "",
  },
  {
    key: "employeeType",
    header: "Employee type",
    sortable: true,
    defaultVisible: false,
    render: (e) => e.employeeType || "—",
    sortValue: (e) => e.employeeType || "",
    exportValue: (e) => e.employeeType || "",
  },
  {
    key: "joiningDate",
    header: "Joining date",
    sortable: true,
    defaultVisible: false,
    render: (e) => (e.joiningDate ? new Date(e.joiningDate).toLocaleDateString() : "—"),
    sortValue: (e) => (e.joiningDate ? new Date(e.joiningDate).getTime() : 0),
    exportValue: (e) => (e.joiningDate ? new Date(e.joiningDate).toLocaleDateString() : ""),
  },
  {
    key: "hasCredentials",
    header: "Login",
    sortable: true,
    render: (e) => <CredentialsBadge hasCredentials={e.hasCredentials} />,
    sortValue: (e) => (e.hasCredentials ? 1 : 0),
    exportValue: (e) => (e.hasCredentials ? "Login enabled" : "No login"),
  },
  { key: "status", header: "Status", sortable: true, render: (e) => <StatusBadge status={e.status} />, sortValue: (e) => e.status, exportValue: (e) => e.status },
];

export default function EmployeeTable({
  employees,
  sortBy,
  order,
  onSortChange,
  pagination,
  onPageChange,
  onLimitChange,
  isLoading,
  scopeLabel,
}: {
  employees: Employee[];
  sortBy: string;
  order: "asc" | "desc";
  onSortChange: (key: string) => void;
  pagination: PaginationMeta | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
  scopeLabel?: string;
}) {
  const dispatch = useAppDispatch();
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(
    COLUMNS.filter((c) => c.defaultVisible !== false).map((c) => c.key)
  );
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const selection = useRowSelection(employees, (e) => e.id);
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false);
  const [isBulkWorking, setIsBulkWorking] = useState(false);

  const runBulkAction = async (
    action: (id: string) => Promise<{ meta: { requestStatus: string } }>,
    successMessage: string,
    failureMessage: string
  ) => {
    setIsBulkWorking(true);
    const ids = selection.selectedIdList;
    const results = await Promise.all(ids.map((id) => action(id)));
    setIsBulkWorking(false);
    selection.clearSelection();
    setConfirmingBulkDelete(false);

    const failedCount = results.filter((r) => r.meta.requestStatus === "rejected").length;

    if (failedCount === 0) {
      dispatch(showToast(successMessage, "success"));
    } else if (failedCount === ids.length) {
      dispatch(showToast(failureMessage, "error"));
    } else {
      dispatch(showToast(`${ids.length - failedCount} of ${ids.length} succeeded — some failed.`, "warning"));
    }
  };

  const handleBulkActivate = () =>
    runBulkAction(
      (id) => dispatch(toggleEmployeeStatus({ id, status: "active" })),
      "Selected employees activated successfully.",
      "Failed to activate selected employees."
    );

  const handleBulkDeactivate = () =>
    runBulkAction(
      (id) => dispatch(toggleEmployeeStatus({ id, status: "inactive" })),
      "Selected employees deactivated successfully.",
      "Failed to deactivate selected employees."
    );

  const handleBulkDelete = () =>
    runBulkAction(
      (id) => dispatch(deleteEmployee(id)),
      "Selected employees deleted successfully.",
      "Failed to delete selected employees."
    );

  const columnsWithActions: ColumnDef<Employee>[] = [
    ...COLUMNS,
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      alwaysVisible: true,
      align: "right",
      render: (employee) => <EmployeeActions employee={employee} onView={() => setViewingEmployee(employee)} />,
    },
  ];
  const allVisibleKeys = [...visibleColumnKeys, "actions"];

  return (
    <>
      {selection.selectedCount > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-sm font-medium text-ink">{selection.selectedCount} selected</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              fullWidth={false}
              className="px-3 py-1.5 text-sm"
              isLoading={isBulkWorking}
              onClick={handleBulkActivate}
            >
              Activate
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth={false}
              className="px-3 py-1.5 text-sm"
              isLoading={isBulkWorking}
              onClick={handleBulkDeactivate}
            >
              Deactivate
            </Button>
            <Button
              type="button"
              variant="danger"
              fullWidth={false}
              className="px-3 py-1.5 text-sm"
              onClick={() => setConfirmingBulkDelete(true)}
            >
              Delete
            </Button>
            <button
              type="button"
              onClick={selection.clearSelection}
              className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-tint hover:text-ink"
              aria-label="Clear selection"
            >
              <MdClose size={16} />
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={columnsWithActions}
        rows={employees}
        keyField={(e) => e.id}
        sortBy={sortBy}
        order={order}
        onSortChange={onSortChange}
        visibleColumnKeys={allVisibleKeys}
        onVisibleColumnsChange={(keys) => setVisibleColumnKeys(keys.filter((k) => k !== "actions"))}
        pagination={pagination}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        isLoading={isLoading}
        exportFilename="employees"
        exportScopeLabel={scopeLabel}
        module="employees"
        columnControls="arrange"
        rowSelection={selection}
        mobileCard={(employee) => (
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-heading text-base font-medium text-ink">{employee.fullName}</p>
                <p className="text-caption text-ink-muted">{employee.employeeCode}</p>
              </div>
              <StatusBadge status={employee.status} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <RoleBadge role={employee.role} />
              <CredentialsBadge hasCredentials={employee.hasCredentials} />
            </div>
            <div className="mt-3 flex justify-end border-t border-border pt-3">
              <EmployeeActions employee={employee} onView={() => setViewingEmployee(employee)} />
            </div>
          </div>
        )}
        emptyMessage={
          <span className="flex flex-col items-center gap-2">
            <MdPeople size={28} className="text-ink-muted/50" />
            <span>No employees yet — click &quot;Add Employee&quot; to bring on your first team member.</span>
          </span>
        }
      />

      <Modal
        open={!!viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        title="Employee details"
        maxWidth="max-w-2xl"
      >
        {viewingEmployee && <EmployeeDetails employee={viewingEmployee} />}
      </Modal>

      <ConfirmDialog
        open={confirmingBulkDelete}
        title="Delete selected employees?"
        message={`This permanently deletes ${selection.selectedCount} employee${selection.selectedCount === 1 ? "" : "s"} and any of their logins. This can't be undone.`}
        confirmLabel="Delete"
        isLoading={isBulkWorking}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmingBulkDelete(false)}
      />
    </>
  );
}

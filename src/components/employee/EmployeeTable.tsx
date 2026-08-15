"use client";

import { useState } from "react";
import Link from "next/link";
import { MdRefresh, MdDelete, MdEdit, MdPeople, MdCheckCircle, MdCancel, MdVisibility, MdVpnKey } from "react-icons/md";
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
    await dispatch(deleteEmployee(employee.id));
    setIsDeleting(false);
    setConfirmingDelete(false);
    dispatch(showToast("Employee deleted", "success"));
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
          onClick={() =>
            dispatch(
              toggleEmployeeStatus({
                id: employee.id,
                status: employee.status === "active" ? "inactive" : "active",
              })
            )
          }
          title={employee.status === "active" ? "Deactivate" : "Activate"}
          className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
        >
          {employee.status === "active" ? <MdCancel size={17} /> : <MdCheckCircle size={17} />}
        </button>
        {employee.hasCredentials ? (
          <button
            type="button"
            onClick={() => dispatch(regenerateEmployeeCredentials({ employee }))}
            title="Reset / regenerate login credentials"
            className="rounded-lg p-2 text-ink-muted hover:bg-surface-tint hover:text-primary"
          >
            <MdRefresh size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => dispatch(grantEmployeeCredentials({ employee }))}
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
    key: "contact",
    header: "Contact",
    sortable: false,
    render: (e) => (
      <div>
        <div className="text-ink-muted">{e.email}</div>
        <div className="text-caption text-ink-muted">{e.mobile}</div>
      </div>
    ),
    exportValue: (e) => `${e.email} / ${e.mobile}`,
  },
  { key: "role", header: "Role", sortable: true, render: (e) => <RoleBadge role={e.role} />, sortValue: (e) => e.role, exportValue: (e) => e.role },
  { key: "department", header: "Department", sortable: false, defaultVisible: false, render: (e) => e.department || "—", exportValue: (e) => e.department || "" },
  { key: "designation", header: "Designation", sortable: false, defaultVisible: false, render: (e) => e.designation || "—", exportValue: (e) => e.designation || "" },
  {
    key: "employeeType",
    header: "Employee type",
    sortable: false,
    defaultVisible: false,
    render: (e) => e.employeeType || "—",
    exportValue: (e) => e.employeeType || "",
  },
  {
    key: "joiningDate",
    header: "Joining date",
    sortable: false,
    defaultVisible: false,
    render: (e) => (e.joiningDate ? new Date(e.joiningDate).toLocaleDateString() : "—"),
    exportValue: (e) => (e.joiningDate ? new Date(e.joiningDate).toLocaleDateString() : ""),
  },
  { key: "login", header: "Login", sortable: false, render: (e) => <CredentialsBadge hasCredentials={e.hasCredentials} />, exportValue: (e) => (e.hasCredentials ? "Login enabled" : "No login") },
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
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(
    COLUMNS.filter((c) => c.defaultVisible !== false).map((c) => c.key)
  );
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

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
    </>
  );
}

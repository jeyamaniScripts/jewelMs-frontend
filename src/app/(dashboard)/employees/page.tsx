"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MdAdd } from "react-icons/md";

import PageHeader from "@/components/layout/PageHeader";
import SearchSortBar from "@/components/layout/SearchSortBar";
import EmployeeTable from "@/components/employee/EmployeeTable";
import CredentialsPanel from "@/components/shared/CredentialsPanel";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import { EMPLOYEE_ROLE_LABEL } from "@/constants/employeeRoles";
import type { Role } from "@/types/auth";
import { useTableController } from "@/hooks/useTableController";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchEmployees, clearEmployeeCredentials } from "@/redux/slices/employeeSlice";
import { clearBranchDataLoading } from "@/redux/slices/showroomSlice";
import { fetchRolePermissions } from "@/redux/slices/permissionSlice";

// Built-in roles that actually get assigned to Employee records — excludes
// super_admin/brand_admin, which aren't Employee documents at all.
const BUILT_IN_EMPLOYEE_ROLES: Role[] = [
  "brand_hr",
  "brand_manager",
  "showroom_admin",
  "showroom_manager",
  "cashier",
  "staff",
];

export default function EmployeesPage() {
  const dispatch = useAppDispatch();
  const currentRole = useAppSelector((state) => state.auth.role);
  const canViewAllBranches = useAppSelector((state) => state.auth.user?.canViewAllBranches);
  const selectedBranchId = useAppSelector((state) => state.showroom.selectedBranchId);
  const { employees, pagination, status, lastCreatedCredentials } = useAppSelector((state) => state.employee);
  const allRoles = useAppSelector((state) => state.permission.roles);
  const table = useTableController("fullName");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    dispatch(fetchRolePermissions());
  }, [dispatch]);

  // Built-ins from the static label map + any custom roles the backend
  // returned (already scoped to this brand) — so newly-added custom roles
  // show up here too, not just on the create form.
  const roleFilterOptions = useMemo(() => {
    const builtIns = BUILT_IN_EMPLOYEE_ROLES.map((role) => ({ value: role, label: EMPLOYEE_ROLE_LABEL[role] }));
    const custom = allRoles
      .filter((r) => r.isCustom)
      .map((r) => ({ value: r.roleKey, label: `${r.label} (custom)` }));
    return [{ value: "", label: "All roles" }, ...builtIns, ...custom];
  }, [allRoles]);

  useEffect(() => {
    dispatch(
      fetchEmployees({
        search: table.search,
        role: roleFilter || undefined,
        showroomId: canViewAllBranches ? selectedBranchId ?? undefined : undefined,
        sortBy: table.sortBy as "fullName" | "createdAt" | "role" | "status",
        order: table.order,
        page: table.page,
        limit: table.limit,
      })
    ).finally(() => dispatch(clearBranchDataLoading()));
  }, [
    dispatch,
    table.search,
    roleFilter,
    canViewAllBranches,
    selectedBranchId,
    table.sortBy,
    table.order,
    table.page,
    table.limit,
  ]);

  const branchOptions = useAppSelector((state) => state.showroom.branchOptions);
  const selectedBranchName = branchOptions.find((b) => b.id === selectedBranchId)?.showroomName;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Employees"
          subtitle={
            currentRole === "showroom_admin" && !canViewAllBranches
              ? "Staff assigned to your showroom."
              : canViewAllBranches && selectedBranchName
              ? `Showing staff for ${selectedBranchName}.`
              : "All staff across your brand's showrooms."
          }
        />
        <Link href="/employees/new" className="inline-block">
          <Button type="button">
            <MdAdd size={18} /> Add Employee
          </Button>
        </Link>
      </div>

      <SearchSortBar
        searchValue={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="Search employees..."
      >
        <div className="w-48">
          <Dropdown
            options={roleFilterOptions}
            value={roleFilter}
            onChange={(value) => {
              setRoleFilter(value);
              table.setPage(1);
            }}
            placeholder="Filter by role"
          />
        </div>
      </SearchSortBar>

      <EmployeeTable
        employees={employees}
        sortBy={table.sortBy}
        order={table.order}
        onSortChange={table.toggleSort}
        pagination={pagination}
        onPageChange={table.setPage}
        onLimitChange={table.setLimit}
        isLoading={status === "loading"}
        scopeLabel={
          currentRole === "showroom_admin" && !canViewAllBranches
            ? "My Showroom"
            : selectedBranchName ?? "All Branches"
        }
      />

      <Modal
        open={!!lastCreatedCredentials}
        onClose={() => dispatch(clearEmployeeCredentials())}
        title="Login credentials"
      >
        {lastCreatedCredentials && (
          <CredentialsPanel
            credentials={lastCreatedCredentials}
            onDone={() => dispatch(clearEmployeeCredentials())}
          />
        )}
      </Modal>
    </div>
  );
}

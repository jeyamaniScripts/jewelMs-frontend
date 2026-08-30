"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdCheckCircle } from "react-icons/md";
import PageHeader from "@/components/layout/PageHeader";
import EmployeeForm from "@/components/employee/EmployeeForm";
import CredentialsPanel from "@/components/shared/CredentialsPanel";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearEmployeeCredentials } from "@/redux/slices/employeeSlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function NewEmployeePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const lastCreatedCredentials = useAppSelector((state) => state.employee.lastCreatedCredentials);
  // Tracks the "created without login" case, where lastCreatedCredentials stays null.
  const [createdWithoutLogin, setCreatedWithoutLogin] = useState(false);

  return (
    <div>
      <PageHeader
        title="Add Employee"
        subtitle="Bring on a new team member — turn on login access if they need one."
      />

      {lastCreatedCredentials ? (
        <div className="max-w-lg">
          <CredentialsPanel
            credentials={lastCreatedCredentials}
            onDone={() => {
              dispatch(clearEmployeeCredentials());
              router.push("/employees");
            }}
          />
        </div>
      ) : createdWithoutLogin ? (
        <div className="flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success">
            <MdCheckCircle size={26} />
          </span>
          <div>
            <h3 className="text-h4">Employee created</h3>
            <p className="mt-1 text-body text-ink-muted">
              No login was created for this employee. You can grant access anytime from the
              employee list.
            </p>
          </div>
          <Button type="button" onClick={() => router.push("/employees")} fullWidth={false} className="px-6">
            Go to Employees
          </Button>
        </div>
      ) : (
        <EmployeeForm
          onCreated={(hasCredentials) => {
            dispatch(showToast("Employee created successfully.", "success"));
            if (!hasCredentials) setCreatedWithoutLogin(true);
          }}
        />
      )}
    </div>
  );
}

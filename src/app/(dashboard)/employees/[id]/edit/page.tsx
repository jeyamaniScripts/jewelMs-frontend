"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import EmployeeForm from "@/components/employee/EmployeeForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchEmployeeById, clearActiveEmployee } from "@/redux/slices/employeeSlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeEmployee, status } = useAppSelector((state) => state.employee);

  useEffect(() => {
    dispatch(fetchEmployeeById(id));
    return () => {
      dispatch(clearActiveEmployee());
    };
  }, [dispatch, id]);

  if (status === "loading" && !activeEmployee) {
    return <p className="text-ink-muted">Loading employee...</p>;
  }
  if (!activeEmployee) return null;

  const e = activeEmployee;

  return (
    <div>
      <PageHeader title="Edit Employee" subtitle={`Editing ${e.fullName}.`} />
      <EmployeeForm
        editingEmployeeId={e.id}
        defaultValues={{
          firstName: e.firstName,
          lastName: e.lastName,
          profilePhotoUrl: e.profilePhotoUrl,
          gender: e.gender ?? "",
          dateOfBirth: e.dateOfBirth ? e.dateOfBirth.slice(0, 10) : "",
          mobile: e.mobile,
          alternateMobile: e.alternateMobile ?? "",
          email: e.email,
          addressLine1: e.addressLine1 ?? "",
          addressLine2: e.addressLine2 ?? "",
          city: e.city ?? "",
          state: e.state ?? "",
          pincode: e.pincode ?? "",
          country: e.country ?? "",
          aadhaarNumber: e.aadhaarNumber ?? "",
          panNumber: e.panNumber ?? "",
          department: e.department ?? "",
          designation: e.designation ?? "",
          employeeType: e.employeeType ?? "",
          joiningDate: e.joiningDate ? e.joiningDate.slice(0, 10) : "",
          experienceYears: e.experienceYears !== undefined ? String(e.experienceYears) : "",
          salary: e.salary !== undefined ? String(e.salary) : "",
          bankName: e.bankName ?? "",
          accountNumber: e.accountNumber ?? "",
          ifscCode: e.ifscCode ?? "",
          upiId: e.upiId ?? "",
          emergencyContactName: e.emergencyContactName ?? "",
          emergencyContactNumber: e.emergencyContactNumber ?? "",
          role: e.role,
          showroomId: e.showroomId ?? "",
          status: e.status,
        }}
        onCreated={() => {
          dispatch(showToast("Employee updated", "success"));
          router.push("/employees");
        }}
      />
    </div>
  );
}

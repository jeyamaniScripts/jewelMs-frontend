"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import SupplierForm from "@/components/accounts/supplier/SupplierForm";
import { useAppDispatch } from "@/redux/hooks";
import { showToast } from "@/redux/slices/toastSlice";

export default function NewSupplierPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <div>
      <PageHeader title="Add Supplier" subtitle="Register a new supplier." />
      <SupplierForm
        onSaved={() => {
          dispatch(showToast("Supplier created successfully.", "success"));
          router.push("/suppliers");
        }}
      />
    </div>
  );
}
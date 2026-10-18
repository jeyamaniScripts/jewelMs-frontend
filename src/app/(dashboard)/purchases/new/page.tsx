"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import PurchaseForm from "@/components/purchases/PurchaseForm";
import { useAppDispatch } from "@/redux/hooks";
import { showToast } from "@/redux/slices/toastSlice";

export default function NewPurchasePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <div>
      <PageHeader title="Add Purchase" subtitle="Record a new purchase from a supplier." />
      <PurchaseForm
        onSaved={() => {
          dispatch(showToast("Purchase created successfully.", "success"));
          router.push("/purchases");
        }}
      />
    </div>
  );
}
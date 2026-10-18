"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import WeightPurchaseForm from "@/components/purchases/WeightPurchaseForm";
import { useAppDispatch } from "@/redux/hooks";
import { showToast } from "@/redux/slices/toastSlice";

export default function NewWeightPurchasePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <div>
      <PageHeader title="New Weight-Based Purchase" subtitle="Record a supplier purchase by weight." />
      <div className="mt-6">
        <WeightPurchaseForm
          onSaved={(purchase) => {
            dispatch(showToast(`${purchase.purchaseNumber} created successfully.`, "success"));
            router.push("/purchases/weight-purchases");
          }}
        />
      </div>
    </div>
  );
}

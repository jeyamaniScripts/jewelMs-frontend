"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import PageHeader from "@/components/layout/PageHeader";
import WeightPurchaseForm from "@/components/purchases/WeightPurchaseForm";
import { ApiClientError } from "@/lib/apiClient";
import {
  getWeightPurchase,
  weightPurchaseToFormValues,
  type WeightPurchase,
} from "@/lib/purchaseWeightApi";
import { useAppDispatch } from "@/redux/hooks";
import { showToast } from "@/redux/slices/toastSlice";

export default function EditWeightPurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [purchase, setPurchase] = useState<WeightPurchase | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getWeightPurchase(id)
      .then((result) => {
        if (active) setPurchase(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof ApiClientError ? cause.message : "Could not load this purchase");
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div>
      <PageHeader
        title={purchase ? `Edit ${purchase.purchaseNumber}` : "Weight-Based Purchase"}
        subtitle="Review or update this weight-based purchase."
      />
      {error ? (
        <div className="mt-6"><Alert>{error}</Alert></div>
      ) : !purchase ? (
        <p className="mt-6 text-sm text-ink-muted">Loading purchase…</p>
      ) : purchase.status === "confirmed" ? (
        <div className="mt-6 space-y-4">
          <Alert>This purchase is confirmed and can no longer be edited.</Alert>
          <p className="text-sm text-ink-muted">
            {purchase.purchaseNumber} · {purchase.products.length} product(s) · Net amount{" "}
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(purchase.netAmount)}
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <WeightPurchaseForm
            key={purchase.id}
            editingPurchaseId={purchase.id}
            defaultValues={weightPurchaseToFormValues(purchase)}
            onSaved={(updated) => {
              dispatch(showToast(`${updated.purchaseNumber} updated successfully.`, "success"));
              router.push("/purchases/weight-purchases");
            }}
          />
        </div>
      )}
    </div>
  );
}

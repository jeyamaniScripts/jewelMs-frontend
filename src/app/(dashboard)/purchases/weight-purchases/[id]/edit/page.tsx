"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import PurchaseForm from "@/components/purchases/PurchaseForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchPurchaseById, clearActivePurchase } from "@/redux/slices/purchaseSlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function EditPurchasePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activePurchase, status } = useAppSelector((state) => state.purchase);

  useEffect(() => {
    dispatch(fetchPurchaseById(id));
    return () => {
      dispatch(clearActivePurchase());
    };
  }, [dispatch, id]);

  if (status === "loading" && !activePurchase) {
    return <p className="text-ink-muted">Loading purchase...</p>;
  }
  if (!activePurchase) return null;

  if (activePurchase.status === "confirmed") {
    return (
      <div>
        <PageHeader title="Edit Purchase" subtitle={activePurchase.purchaseNumber} />
        <p className="text-ink-muted">
          This purchase is confirmed and can no longer be edited. Cancel it from the list page if
          you need to reverse it.
        </p>
      </div>
    );
  }

  const supplierId =
    typeof activePurchase.supplierId === "string" ? activePurchase.supplierId : activePurchase.supplierId.id;
  const branchId =
    typeof activePurchase.branchId === "string" || !activePurchase.branchId
      ? activePurchase.branchId ?? ""
      : activePurchase.branchId.id;

  return (
    <div>
      <PageHeader title="Edit Purchase" subtitle={`Editing ${activePurchase.purchaseNumber}.`} />
      <PurchaseForm
        editingPurchaseId={activePurchase.id}
        defaultValues={{
          branchId,
          supplierId,
          supplierInvoiceNumber: activePurchase.supplierInvoiceNumber ?? "",
          purchaseDate: activePurchase.purchaseDate.slice(0, 10),
          purchaseType: activePurchase.purchaseType,
          notes: activePurchase.notes ?? "",
          items: activePurchase.items.map((item) => ({
            productModelId: typeof item.productModelId === "string" ? item.productModelId : item.productModelId.id,
            purity: item.purity,
            grossWeight: String(item.grossWeight),
            wastagePercent: item.wastagePercent !== undefined ? String(item.wastagePercent) : "",
            ratePerGram: String(item.ratePerGram),
            makingChargeType: item.makingChargeType,
            makingChargeValue: item.makingChargeValue !== undefined ? String(item.makingChargeValue) : "",
            stoneCharges: item.stoneCharges !== undefined ? String(item.stoneCharges) : "",
            gstRate: item.gstRate !== undefined ? String(item.gstRate) : "",
            quantity: item.quantity !== undefined ? String(item.quantity) : "1",
          })),
        }}
        onSaved={() => {
          dispatch(showToast("Purchase updated successfully.", "success"));
          router.push("/purchases");
        }}
      />
    </div>
  );
}
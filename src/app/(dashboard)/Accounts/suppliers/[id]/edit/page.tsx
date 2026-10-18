"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import SupplierForm from "@/components/accounts/supplier/SupplierForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchSupplierById, clearActiveSupplier } from "@/redux/slices/supplierSlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function EditSupplierPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeSupplier, status } = useAppSelector((state) => state.supplier);

  useEffect(() => {
    dispatch(fetchSupplierById(id));
    return () => {
      dispatch(clearActiveSupplier());
    };
  }, [dispatch, id]);

  if (status === "loading" && !activeSupplier) {
    return <p className="text-ink-muted">Loading supplier...</p>;
  }
  if (!activeSupplier) return null;

  const branchId =
    typeof activeSupplier.branchId === "string" || !activeSupplier.branchId
      ? activeSupplier.branchId ?? ""
      : activeSupplier.branchId.id;

  return (
    <div>
      <PageHeader title="Edit Supplier" subtitle={`Editing ${activeSupplier.supplierName}.`} />
      <SupplierForm
        editingSupplierId={activeSupplier.id}
        defaultValues={{
          branchId,
          companyId: activeSupplier.companyId ?? "",
          supplierName: activeSupplier.supplierName,
          supplierCode: activeSupplier.supplierCode,
          supplierType: activeSupplier.supplierType,
          categoryIds: (activeSupplier.categoryIds ?? []).map((category) =>
            typeof category === "string" ? category : category.id,
          ),
          contactPerson: activeSupplier.contactPerson ?? "",
          phone: activeSupplier.phone,
          alternatePhone: activeSupplier.alternatePhone ?? "",
          email: activeSupplier.email ?? "",
          street: activeSupplier.address?.street ?? "",
          city: activeSupplier.address?.city ?? "",
          state: activeSupplier.address?.state ?? "",
          pincode: activeSupplier.address?.pincode ?? "",
          country: activeSupplier.address?.country ?? "India",
          gstNumber: activeSupplier.gstNumber ?? "",
          panNumber: activeSupplier.panNumber ?? "",
          businessType: activeSupplier.businessType ?? "",
          hallmarkLicenseNumber: activeSupplier.hallmarkLicenseNumber ?? "",
          accountHolderName: activeSupplier.bankDetails?.accountHolderName ?? "",
          accountNumber: activeSupplier.bankDetails?.accountNumber ?? "",
          ifscCode: activeSupplier.bankDetails?.ifscCode ?? "",
          bankName: activeSupplier.bankDetails?.bankName ?? "",
          branchName: activeSupplier.bankDetails?.branchName ?? "",
          openingBalance: String(activeSupplier.openingBalance ?? ""),
          currentBalance: String(activeSupplier.currentBalance ?? ""),
          openingWeight: String(activeSupplier.openingWeight ?? ""),
          currentWeight: String(activeSupplier.currentWeight ?? ""),
          creditPeriod: activeSupplier.creditPeriod != null ? String(activeSupplier.creditPeriod) : "",
          paymentTerms: activeSupplier.paymentTerms ?? "",
          supplierImages: activeSupplier.supplierImages ?? [],
          visitingCard: activeSupplier.visitingCard ?? undefined,
          isBlacklisted: activeSupplier.isBlacklisted,
          blacklistReason: activeSupplier.blacklistReason ?? "",
          notes: activeSupplier.notes ?? "",
        }}
        onSaved={() => {
          dispatch(showToast("Supplier updated successfully.", "success"));
          router.push("/suppliers");
        }}
      />
    </div>
  );
}
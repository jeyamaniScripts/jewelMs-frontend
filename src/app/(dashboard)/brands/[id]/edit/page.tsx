"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import BrandForm from "@/components/company/BrandForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchBrandById, clearActiveBrand } from "@/redux/slices/companySlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function EditBrandPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeBrand, status } = useAppSelector((state) => state.company);

  useEffect(() => {
    dispatch(fetchBrandById(id));
    return () => {
      dispatch(clearActiveBrand());
    };
  }, [dispatch, id]);

  if (status === "loading" && !activeBrand) {
    return <p className="text-ink-muted">Loading brand...</p>;
  }
  if (!activeBrand) return null;

  return (
    <div>
      <PageHeader title="Edit Brand" subtitle={`Editing ${activeBrand.companyName}.`} />
      <BrandForm
        editingBrandId={activeBrand.id}
        defaultValues={{
          companyName: activeBrand.companyName,
          shortName: activeBrand.shortName ?? "",
          ownerName: activeBrand.ownerName,
          gstNumber: activeBrand.gstNumber ?? "",
          panNumber: activeBrand.panNumber ?? "",
          businessRegNumber: activeBrand.businessRegNumber ?? "",
          email: activeBrand.email,
          phone: activeBrand.phone,
          alternatePhone: activeBrand.alternatePhone ?? "",
          website: activeBrand.website ?? "",
          logoUrl: activeBrand.logoUrl,
          addressLine1: activeBrand.addressLine1 ?? "",
          addressLine2: activeBrand.addressLine2 ?? "",
          city: activeBrand.city ?? "",
          state: activeBrand.state ?? "",
          pincode: activeBrand.pincode ?? "",
          country: activeBrand.country ?? "",
        }}
        onCreated={() => {
          dispatch(showToast("Brand updated", "success"));
          router.push("/brands");
        }}
      />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import BrandForm from "@/components/company/BrandForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchMyBrand, clearActiveBrand } from "@/redux/slices/companySlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function CompanyDetailsPage() {
  const dispatch = useAppDispatch();
  const { activeBrand, status } = useAppSelector((state) => state.company);

  useEffect(() => {
    dispatch(fetchMyBrand());
    return () => {
      dispatch(clearActiveBrand());
    };
  }, [dispatch]);

  if (status === "loading" && !activeBrand) {
    return (
      <div>
        <PageHeader title="Company Details" subtitle="Your brand's information." />
        <p className="text-ink-muted">Loading company details...</p>
      </div>
    );
  }

  if (!activeBrand) return null;

  return (
    <div>
      <PageHeader title="Company Details" subtitle="View and update your brand's information." />
      <BrandForm
        isMyBrand
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
        onCreated={() => dispatch(showToast("Company details updated successfully.", "success"))}
      />
    </div>
  );
}

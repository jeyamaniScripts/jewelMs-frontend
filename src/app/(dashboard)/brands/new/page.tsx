"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import BrandForm from "@/components/company/BrandForm";
import CredentialsPanel from "@/components/shared/CredentialsPanel";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearGeneratedCredentials } from "@/redux/slices/companySlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function NewBrandPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const lastCreatedCredentials = useAppSelector((state) => state.company.lastCreatedCredentials);

  return (
    <div>
      <PageHeader
        title="Add Brand"
        subtitle="Create a new jewelry brand. A Brand Admin login is generated automatically."
      />

      {lastCreatedCredentials ? (
        <div className="max-w-lg">
          <CredentialsPanel
            credentials={lastCreatedCredentials}
            onDone={() => {
              dispatch(clearGeneratedCredentials());
              router.push("/brands");
            }}
          />
        </div>
      ) : (
        <BrandForm onCreated={() => dispatch(showToast("Brand created successfully.", "success"))} />
      )}
    </div>
  );
}

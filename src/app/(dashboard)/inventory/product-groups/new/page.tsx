"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProductGroupForm from "@/components/product-group/ProductGroupForm";
import { useAppDispatch } from "@/redux/hooks";
import { showToast } from "@/redux/slices/toastSlice";

export default function NewProductGroupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <div>
      <PageHeader title="Add Product Group" subtitle="Create a new product group under a category." />
      <ProductGroupForm
        onSaved={() => {
          dispatch(showToast("Product group created successfully.", "success"));
          router.push("/inventory/product-groups");
        }}
      />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProductModelForm from "@/components/product-model/ProductModelForm";
import { useAppDispatch } from "@/redux/hooks";
import { showToast } from "@/redux/slices/toastSlice";

export default function NewProductModelPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <div>
      <PageHeader title="Add Product Model" subtitle="Create a new design under a product name." />
      <ProductModelForm
        onSaved={() => {
          dispatch(showToast("Product model created successfully.", "success"));
          router.push("/inventory/product-models");
        }}
      />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProductNameForm from "@/components/product-name/ProductNameForm";
import { useAppDispatch } from "@/redux/hooks";
import { showToast } from "@/redux/slices/toastSlice";

export default function NewProductNamePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <div>
      <PageHeader title="Add Product Name" subtitle="Create a new product name under a product group." />
      <ProductNameForm
        onSaved={() => {
          dispatch(showToast("Product name created successfully.", "success"));
          router.push("/inventory/product-names");
        }}
      />
    </div>
  );
}

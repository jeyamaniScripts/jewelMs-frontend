"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import CategoryForm from "@/components/category/CategoryForm";
import { useAppDispatch } from "@/redux/hooks";
import { showToast } from "@/redux/slices/toastSlice";

export default function NewCategoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  return (
    <div>
      <PageHeader title="Add Category" subtitle="Create a new top-level product category." />
      <CategoryForm
        onSaved={() => {
          dispatch(showToast("Category created successfully.", "success"));
          router.push("/inventory/categories");
        }}
      />
    </div>
  );
}

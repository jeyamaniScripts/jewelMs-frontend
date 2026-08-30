"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import CategoryForm from "@/components/category/CategoryForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCategoryById, clearActiveCategory } from "@/redux/slices/categorySlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeCategory, status } = useAppSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategoryById(id));
    return () => {
      dispatch(clearActiveCategory());
    };
  }, [dispatch, id]);

  if (status === "loading" && !activeCategory) {
    return <p className="text-ink-muted">Loading category...</p>;
  }
  if (!activeCategory) return null;

  return (
    <div>
      <PageHeader title="Edit Category" subtitle={`Editing ${activeCategory.categoryName}.`} />
      <CategoryForm
        editingCategoryId={activeCategory.id}
        defaultValues={{
          categoryName: activeCategory.categoryName,
          categoryCode: activeCategory.categoryCode,
          metalType: activeCategory.metalType,
          hsnCode: activeCategory.hsnCode ?? "",
          defaultGstRate: activeCategory.defaultGstRate !== undefined ? String(activeCategory.defaultGstRate) : "",
        }}
        onSaved={() => {
          dispatch(showToast("Category updated successfully.", "success"));
          router.push("/inventory/categories");
        }}
      />
    </div>
  );
}

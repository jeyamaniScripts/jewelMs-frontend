"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProductGroupForm from "@/components/product-group/ProductGroupForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProductGroupById, clearActiveProductGroup } from "@/redux/slices/productGroupSlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function EditProductGroupPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeProductGroup, status } = useAppSelector((state) => state.productGroup);

  useEffect(() => {
    dispatch(fetchProductGroupById(id));
    return () => {
      dispatch(clearActiveProductGroup());
    };
  }, [dispatch, id]);

  if (status === "loading" && !activeProductGroup) {
    return <p className="text-ink-muted">Loading product group...</p>;
  }
  if (!activeProductGroup) return null;

  const categoryId =
    typeof activeProductGroup.categoryId === "string"
      ? activeProductGroup.categoryId
      : activeProductGroup.categoryId.id;

  return (
    <div>
      <PageHeader title="Edit Product Group" subtitle={`Editing ${activeProductGroup.groupName}.`} />
      <ProductGroupForm
        editingProductGroupId={activeProductGroup.id}
      defaultValues={{
  categoryId,
  groupName: activeProductGroup.groupName,
  groupCode: activeProductGroup.groupCode,
  defaultMakingChargeType: activeProductGroup.defaultMakingChargeType,
  defaultMakingChargeValue:
    activeProductGroup.defaultMakingChargeValue !== undefined
      ? String(activeProductGroup.defaultMakingChargeValue)
      : "",
  defaultWastagePercent:
    activeProductGroup.defaultWastagePercent !== undefined
      ? String(activeProductGroup.defaultWastagePercent)
      : "",
  groupImageUrl: activeProductGroup.groupImageUrl,
}}
        onSaved={() => {
          dispatch(showToast("Product group updated successfully.", "success"));
          router.push("/inventory/product-groups");
        }}
      />
    </div>
  );
}

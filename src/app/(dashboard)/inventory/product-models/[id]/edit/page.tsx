"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProductModelForm from "@/components/product-model/ProductModelForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchProductModelById,
  clearActiveProductModel,
} from "@/redux/slices/productModelSlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function EditProductModelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeProductModel, status } = useAppSelector(
    (state) => state.productModel,
  );

  useEffect(() => {
    dispatch(fetchProductModelById(id));
    return () => {
      dispatch(clearActiveProductModel());
    };
  }, [dispatch, id]);

  if (status === "loading" && !activeProductModel) {
    return <p className="text-ink-muted">Loading product model...</p>;
  }
  if (!activeProductModel) return null;

  const productNameId =
    typeof activeProductModel.productNameId === "string"
      ? activeProductModel.productNameId
      : activeProductModel.productNameId.id;

  // Category and Product Group aren't stored on ProductModel — they're
  // derived here from the nested populate so the cascading dropdowns
  // start on the right values.
  const populatedName =
    typeof activeProductModel.productNameId === "string"
      ? undefined
      : activeProductModel.productNameId;
  const populatedGroup =
    populatedName && typeof populatedName.productGroupId !== "string"
      ? populatedName.productGroupId
      : undefined;

  const defaultProductGroupId =
    typeof populatedName?.productGroupId === "string"
      ? populatedName.productGroupId
      : populatedGroup?.id;

  const defaultCategoryId =
    populatedGroup && typeof populatedGroup.categoryId === "string"
      ? populatedGroup.categoryId
      : populatedGroup?.categoryId?.id;

  return (
    <div>
      <PageHeader
        title="Edit Product Model"
        subtitle={`Editing ${activeProductModel.modelName}.`}
      />
      <ProductModelForm
        editingProductModelId={activeProductModel.id}
        defaultCategoryId={defaultCategoryId}
        defaultProductGroupId={defaultProductGroupId}
        defaultValues={{
          productNameId,
          modelCode: activeProductModel.modelCode,
          modelName: activeProductModel.modelName,
          purity: activeProductModel.purity,
          grossWeightMin: String(activeProductModel.grossWeightRange.min),
          grossWeightMax: String(activeProductModel.grossWeightRange.max),
          makingChargeType: activeProductModel.makingChargeType ?? "",
          makingChargeValue:
            activeProductModel.makingChargeValue !== null &&
            activeProductModel.makingChargeValue !== undefined
              ? String(activeProductModel.makingChargeValue)
              : "",
          wastagePercent:
            activeProductModel.wastagePercent !== null &&
            activeProductModel.wastagePercent !== undefined
              ? String(activeProductModel.wastagePercent)
              : "",
          hasStones: activeProductModel.hasStones,
          stoneDetails: (activeProductModel.stoneDetails ?? []).map((s) => ({
            stoneType: s.stoneType,
            approxWeight:
              s.approxWeight !== undefined ? String(s.approxWeight) : "",
            includedInPrice: s.includedInPrice ?? true,
          })),
          requiresHuid: activeProductModel.requiresHuid,
          images: activeProductModel.images ?? [],
        }}
        onSaved={() => {
          dispatch(showToast("Product model updated successfully.", "success"));
          router.push("/inventory/product-models");
        }}
      />
    </div>
  );
}

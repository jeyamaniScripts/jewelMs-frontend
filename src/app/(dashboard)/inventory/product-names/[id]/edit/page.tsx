"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProductNameForm from "@/components/product-name/ProductNameForm";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchProductNameById,
  clearActiveProductName,
} from "@/redux/slices/productNameSlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function EditProductNamePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { activeProductName, status } = useAppSelector(
    (state) => state.productName,
  );

  useEffect(() => {
    dispatch(fetchProductNameById(id));
    return () => {
      dispatch(clearActiveProductName());
    };
  }, [dispatch, id]);

  if (status === "loading" && !activeProductName) {
    return <p className="text-ink-muted">Loading product name...</p>;
  }
  if (!activeProductName) return null;

  const productGroupId =
    typeof activeProductName.productGroupId === "string"
      ? activeProductName.productGroupId
      : activeProductName.productGroupId.id;

  // The category filter is UI-only (not stored on ProductName), so it's
  // derived here from the populated group so the dropdown starts correct.
  const defaultCategoryId =
    typeof activeProductName.productGroupId === "string"
      ? undefined
      : typeof activeProductName.productGroupId.categoryId === "string"
        ? activeProductName.productGroupId.categoryId
        : activeProductName.productGroupId.categoryId?.id;

  return (
    <div>
      <PageHeader
        title="Edit Product Name"
        subtitle={`Editing ${activeProductName.name}.`}
      />
      <ProductNameForm
        editingProductNameId={activeProductName.id}
        defaultCategoryId={defaultCategoryId}
        defaultValues={{
          productGroupId,
          name: activeProductName.name,
          gender: activeProductName.gender,
          metalType: activeProductName.metalType,
          tagNumber: activeProductName.tagNumber ?? "",
          openingWeight:
            activeProductName.openingWeight !== null &&
            activeProductName.openingWeight !== undefined
              ? String(activeProductName.openingWeight)
              : "",
          openingAmount:
            activeProductName.openingAmount !== null &&
            activeProductName.openingAmount !== undefined
              ? String(activeProductName.openingAmount)
              : "",
          isPartialProduct: activeProductName.isPartialProduct,
          hasSupplierPayment: activeProductName.hasSupplierPayment,
          productImageUrl: activeProductName.productImageUrl,
        }}
        onSaved={() => {
          dispatch(showToast("Product name updated successfully.", "success"));
          router.push("/inventory/product-names");
        }}
      />
    </div>
  );
}

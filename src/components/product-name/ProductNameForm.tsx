"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiTag, FiHash, FiTrendingUp, FiDollarSign } from "react-icons/fi";

import {
  productNameSchema,
  GENDER_OPTIONS,
  METAL_TYPE_OPTIONS,
  type ProductNameFormValues,
} from "@/schemas/productNameSchemas";
import {
  createProductName,
  updateProductName,
} from "@/redux/slices/productNameSlice";
import { fetchProductGroups } from "@/redux/slices/productGroupSlice";
import { fetchCategories } from "@/redux/slices/categorySlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Dropdown from "@/components/ui/Dropdown";
import ImageUpload from "@/components/ui/ImageUpload";

const FIELD_GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";

// No confirmed Checkbox primitive in the UI kit — small native checkbox
// kept local to this form, same as elsewhere.
function LabeledCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
      />
      {label}
    </label>
  );
}

interface ProductNameFormProps {
  onSaved: () => void;
  editingProductNameId?: string;
  defaultValues?: Partial<ProductNameFormValues>;
  /** Pre-selects the category filter when editing an existing entry. */
  defaultCategoryId?: string;
}

export default function ProductNameForm({
  onSaved,
  editingProductNameId,
  defaultValues,
  defaultCategoryId,
}: ProductNameFormProps) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.productName);
  const { categories } = useAppSelector((state) => state.category);
  const { productGroups } = useAppSelector((state) => state.productGroup);
  const isSubmitting = status === "loading";
  const isEditing = !!editingProductNameId;

  // Category is UI-only — it's not stored on ProductName, it just filters
  // the Product Group dropdown below it.
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    defaultCategoryId ?? "",
  );

  useEffect(() => {
    dispatch(fetchCategories({ limit: 200 }));
    dispatch(fetchProductGroups({ limit: 200 }));
  }, [dispatch]);

  const categoryOptions = categories
    .filter((c) => c.status === "active")
    .map((c) => ({ value: c.id, label: c.categoryName }));

  const groupOptions = useMemo(() => {
    return productGroups
      .filter((g) => g.status === "active")
      .filter((g) => {
        if (!selectedCategoryId) return true;
        const groupCategoryId =
          typeof g.categoryId === "string" ? g.categoryId : g.categoryId.id;
        return groupCategoryId === selectedCategoryId;
      })
      .map((g) => ({ value: g.id, label: `${g.groupName} (${g.groupCode})` }));
  }, [productGroups, selectedCategoryId]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductNameFormValues>({
    resolver: zodResolver(productNameSchema),
    defaultValues: {
      productGroupId: "",
      name: "",
      gender: "unisex",
      metalType: "gold",
      tagNumber: "",
      openingWeight: "",
      openingAmount: "",
      isPartialProduct: false,
      hasSupplierPayment: false,
      productImageUrl: undefined,
      ...defaultValues,
    },
  });

  const selectedGroupId = watch("productGroupId");

  // const onSubmit = async (formValues: ProductNameFormValues) => {
  //   if (isEditing) {
  //     const result = await dispatch(updateProductName({ id: editingProductNameId, formData: formValues }));
  //     if (updateProductName.fulfilled.match(result)) onSaved();
  //     return;
  //   }
  //   const result = await dispatch(createProductName(formValues));
  //   if (createProductName.fulfilled.match(result)) {
  //     reset();
  //     onSaved();
  //   }
  // };

  // Inside ProductNameForm.tsx

  const onSubmit = async (formValues: ProductNameFormValues) => {
    // Transform string inputs to numbers or null for the backend
    const payload = {
      ...formValues,
      openingWeight:
        formValues.openingWeight && formValues.openingWeight.trim() !== ""
          ? Number(formValues.openingWeight)
          : null,
      openingAmount:
        formValues.openingAmount && formValues.openingAmount.trim() !== ""
          ? Number(formValues.openingAmount)
          : null,
      tagNumber:
        formValues.tagNumber && formValues.tagNumber.trim() !== ""
          ? formValues.tagNumber.trim().toUpperCase()
          : null,
      productImageUrl: formValues.productImageUrl || null,
    };

    if (isEditing) {
      const result = await dispatch(
        updateProductName({
          id: editingProductNameId,
          formData: payload as any,
        }),
      );
      if (updateProductName.fulfilled.match(result)) onSaved();
      return;
    }

    const result = await dispatch(createProductName(payload as any));
    if (createProductName.fulfilled.match(result)) {
      reset();
      onSaved();
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Alert variant="error">{error}</Alert>

      <Controller
        name="productImageUrl"
        control={control}
        render={({ field }) => (
          <ImageUpload
            label="Product photo"
            value={field.value}
            onChange={(dataUrl) => field.onChange(dataUrl)}
            helpText="PNG or JPG, up to 2MB."
          />
        )}
      />

      <div className={FIELD_GRID}>
        <Dropdown
          label="Category *"
          options={categoryOptions}
          value={selectedCategoryId}
          onChange={(value) => {
            setSelectedCategoryId(value);
            // Selecting a category invalidates a group that belongs to a
            // different one — clear it so the two stay in sync.
            const groupStillValid = productGroups.some((g) => {
              const groupCategoryId =
                typeof g.categoryId === "string"
                  ? g.categoryId
                  : g.categoryId.id;
              return g.id === selectedGroupId && groupCategoryId === value;
            });
            if (!groupStillValid) setValue("productGroupId", "");
          }}
        />
        <Controller
          name="productGroupId"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Product Group *"
              options={groupOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.productGroupId?.message}
            />
          )}
        />
        <Input
          label="Name *"
          icon={FiTag}
          placeholder="Ladies Ring"
          error={errors.name?.message}
          {...register("name")}
        />
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Gender *"
              options={[...GENDER_OPTIONS]}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.gender?.message}
            />
          )}
        />
        <Controller
          name="metalType"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Metal Type *"
              options={[...METAL_TYPE_OPTIONS]}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.metalType?.message}
            />
          )}
        />
        <Input
          label="Tag Number"
          icon={FiHash}
          placeholder="Assigned when tagged into stock"
          error={errors.tagNumber?.message}
          {...register("tagNumber")}
        />
        <Input
          label="Opening Weight (g)"
          icon={FiTrendingUp}
          placeholder="e.g. 4.5"
          error={errors.openingWeight?.message}
          {...register("openingWeight")}
        />
        <Input
          label="Opening Amount"
          icon={FiDollarSign}
          placeholder="e.g. 32000"
          error={errors.openingAmount?.message}
          {...register("openingAmount")}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <Controller
          name="isPartialProduct"
          control={control}
          render={({ field }) => (
            <LabeledCheckbox
              label="Is Partial Product"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="hasSupplierPayment"
          control={control}
          render={({ field }) => (
            <LabeledCheckbox
              label="Supplier Payment"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        fullWidth={false}
        className="px-8"
      >
        {isSubmitting
          ? "Saving..."
          : isEditing
            ? "Save changes"
            : "Create product name"}
      </Button>
    </form>
  );
}

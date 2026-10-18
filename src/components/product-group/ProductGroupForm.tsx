"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiTag, FiHash, FiPercent, FiDollarSign } from "react-icons/fi";

import {
  productGroupSchema,
  MAKING_CHARGE_TYPE_OPTIONS,
  type ProductGroupFormValues,
} from "@/schemas/productGroupSchemas";
import {
  createProductGroup,
  updateProductGroup,
} from "@/redux/slices/productGroupSlice";
import { fetchCategories } from "@/redux/slices/categorySlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Dropdown from "@/components/ui/Dropdown";
import ImageUpload from "@/components/ui/ImageUpload";

const FIELD_GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4";

interface ProductGroupFormProps {
  onSaved: () => void;
  editingProductGroupId?: string;
  defaultValues?: Partial<ProductGroupFormValues>;
}

export default function ProductGroupForm({
  onSaved,
  editingProductGroupId,
  defaultValues,
}: ProductGroupFormProps) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.productGroup);
  const { categories } = useAppSelector((state) => state.category);
  const isSubmitting = status === "loading";
  const isEditing = !!editingProductGroupId;

  useEffect(() => {
    dispatch(fetchCategories({ limit: 200 }));
  }, [dispatch]);

  const categoryOptions = categories
    .filter((c) => c.status === "active")
    .map((c) => ({
      value: c.id,
      label: `${c.categoryName} (${c.categoryCode})`,
    }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductGroupFormValues>({
    resolver: zodResolver(productGroupSchema),
    defaultValues: {
      categoryId: "",
      groupName: "",
      groupCode: "",
      defaultMakingChargeType: "percentage",
      defaultMakingChargeValue: "",
      defaultWastagePercent: "",
      groupImageUrl: undefined,
      ...defaultValues,
    },
  });

  const onSubmit = async (formValues: ProductGroupFormValues) => {
    if (isEditing) {
      const result = await dispatch(
        updateProductGroup({ id: editingProductGroupId, formData: formValues }),
      );
      if (updateProductGroup.fulfilled.match(result)) onSaved();
      return;
    }
    const result = await dispatch(createProductGroup(formValues));
    if (createProductGroup.fulfilled.match(result)) {
      reset();
      onSaved();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Alert variant="error">{error}</Alert>

      <Controller
        name="groupImageUrl"
        control={control}
        render={({ field }) => (
          <ImageUpload
            label="Product group photo"
            value={field.value}
            onChange={(dataUrl) => field.onChange(dataUrl)}
            helpText="PNG or JPG, up to 2MB. Shown in the product groups list."
          />
        )}
      />

      <div className={FIELD_GRID}>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Category"
              options={categoryOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.categoryId?.message}
            />
          )}
        />
        <Input
          label="Group name"
          icon={FiTag}
          placeholder="Rings"
          error={errors.groupName?.message}
          {...register("groupName")}
        />
        <Input
          label="Group code"
          icon={FiHash}
          placeholder="RNG"
          error={errors.groupCode?.message}
          {...register("groupCode")}
        />
        <Controller
          name="defaultMakingChargeType"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Default making charge type"
              options={[...MAKING_CHARGE_TYPE_OPTIONS]}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.defaultMakingChargeType?.message}
            />
          )}
        />
        <Input
          label="Default making charge value"
          icon={FiDollarSign}
          placeholder="e.g. 12"
          error={errors.defaultMakingChargeValue?.message}
          {...register("defaultMakingChargeValue")}
        />
        <Input
          label="Default wastage % (optional)"
          icon={FiPercent}
          placeholder="e.g. 8"
          error={errors.defaultWastagePercent?.message}
          {...register("defaultWastagePercent")}
        />
      </div>

      <p className="text-caption text-ink-muted">
        These are starting defaults for every design under this group — an
        individual Product Model can override either value if a specific design
        costs differently.
      </p>

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
            : "Create product group"}
      </Button>
    </form>
  );
}

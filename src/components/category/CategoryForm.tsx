"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiTag, FiHash, FiPercent, FiFileText } from "react-icons/fi";

import { categorySchema, METAL_TYPE_OPTIONS, type CategoryFormValues } from "@/schemas/categorySchemas";
import { createCategory, updateCategory } from "@/redux/slices/categorySlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Dropdown from "@/components/ui/Dropdown";

const FIELD_GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4";

interface CategoryFormProps {
  onSaved: () => void;
  editingCategoryId?: string;
  defaultValues?: Partial<CategoryFormValues>;
}

export default function CategoryForm({ onSaved, editingCategoryId, defaultValues }: CategoryFormProps) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.category);
  const isSubmitting = status === "loading";
  const isEditing = !!editingCategoryId;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      categoryName: "",
      categoryCode: "",
      metalType: "gold",
      hsnCode: "",
      defaultGstRate: "3",
      ...defaultValues,
    },
  });

  const onSubmit = async (formValues: CategoryFormValues) => {
    if (isEditing) {
      const result = await dispatch(updateCategory({ id: editingCategoryId, formData: formValues }));
      if (updateCategory.fulfilled.match(result)) onSaved();
      return;
    }
    const result = await dispatch(createCategory(formValues));
    if (createCategory.fulfilled.match(result)) {
      reset();
      onSaved();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Alert variant="error">{error}</Alert>

      <div className={FIELD_GRID}>
        <div className="sm:col-span-2">
          <Input
            label="Category name"
            icon={FiTag}
            placeholder="Gold Jewellery"
            error={errors.categoryName?.message}
            {...register("categoryName")}
          />
        </div>
        <Input
          label="Category code"
          icon={FiHash}
          placeholder="GLD"
          error={errors.categoryCode?.message}
          {...register("categoryCode")}
        />
        <Controller
          name="metalType"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Metal type"
              options={[...METAL_TYPE_OPTIONS]}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.metalType?.message}
            />
          )}
        />
        <Input
          label="HSN code (optional)"
          icon={FiFileText}
          placeholder="7113"
          error={errors.hsnCode?.message}
          {...register("hsnCode")}
        />
        <Input
          label="Default GST rate % (optional)"
          icon={FiPercent}
          placeholder="3"
          error={errors.defaultGstRate?.message}
          {...register("defaultGstRate")}
        />
      </div>

      <p className="text-caption text-ink-muted">
        The category code is a short, unique shorthand (e.g. &quot;GLD&quot;) used later when
        generating tag numbers for individual pieces. The GST rate here is just a starting
        default — it can be overridden further down the product hierarchy.
      </p>

      <Button type="submit" isLoading={isSubmitting} fullWidth={false} className="px-8">
        {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create category"}
      </Button>
    </form>
  );
}

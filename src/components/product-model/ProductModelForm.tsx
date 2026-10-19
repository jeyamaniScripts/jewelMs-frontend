"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiTag, FiHash, FiPercent, FiDollarSign, FiTrash2, FiPlus } from "react-icons/fi";

import {
  productModelSchema,
  PURITY_OPTIONS,
  MAKING_CHARGE_TYPE_OPTIONS,
  type ProductModelFormValues,
} from "@/schemas/productModelSchemas";
import { createProductModel, updateProductModel } from "@/redux/slices/productModelSlice";
import { fetchProductNames } from "@/redux/slices/productNameSlice";
import { fetchProductGroups } from "@/redux/slices/productGroupSlice";
import { fetchCategories } from "@/redux/slices/categorySlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Dropdown from "@/components/ui/Dropdown";
import ImageUpload from "@/components/ui/ImageUpload";

const FIELD_GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4";

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

interface ProductModelFormProps {
  onSaved: () => void;
  editingProductModelId?: string;
  defaultValues?: Partial<ProductModelFormValues>;
  /** Pre-selects the category/group filters when editing an existing model. */
  defaultCategoryId?: string;
  defaultProductGroupId?: string;
}

export default function ProductModelForm({
  onSaved,
  editingProductModelId,
  defaultValues,
  defaultCategoryId,
  defaultProductGroupId,
}: ProductModelFormProps) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.productModel);
  const { categories } = useAppSelector((state) => state.category);
  const { productGroups } = useAppSelector((state) => state.productGroup);
  const { productNames } = useAppSelector((state) => state.productName);
  const isSubmitting = status === "loading";
  const isEditing = !!editingProductModelId;

  // Category and Product Group are UI-only filters here — Product Model
  // only ever stores productNameId. Selecting them just narrows the next
  // dropdown down the chain.
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultCategoryId ?? "");
  const [selectedGroupId, setSelectedGroupId] = useState(defaultProductGroupId ?? "");

  useEffect(() => {
    dispatch(fetchCategories({ limit: 200 }));
    dispatch(fetchProductGroups({ limit: 200 }));
    dispatch(fetchProductNames({ limit: 200 }));
  }, [dispatch]);

  const categoryOptions = categories
    .filter((c) => c.status === "active")
    .map((c) => ({ value: c.id, label: c.categoryName }));

  const groupOptions = useMemo(() => {
    return productGroups
      .filter((g) => g.status === "active")
      .filter((g) => {
        if (!selectedCategoryId) return true;
        const groupCategoryId = typeof g.categoryId === "string" ? g.categoryId : g.categoryId.id;
        return groupCategoryId === selectedCategoryId;
      })
      .map((g) => ({ value: g.id, label: `${g.groupName} (${g.groupCode})` }));
  }, [productGroups, selectedCategoryId]);

  const nameOptions = useMemo(() => {
    return productNames
      .filter((n) => n.status === "active")
      .filter((n) => {
        if (!selectedGroupId) return true;
        const nameGroupId = typeof n.productGroupId === "string" ? n.productGroupId : n.productGroupId.id;
        return nameGroupId === selectedGroupId;
      })
      .map((n) => ({ value: n.id, label: n.name }));
  }, [productNames, selectedGroupId]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductModelFormValues>({
    resolver: zodResolver(productModelSchema),
    defaultValues: {
      productNameId: "",
      modelCode: "",
      modelName: "",
      purity: "22K",
      grossWeightMin: "",
      grossWeightMax: "",
      makingChargeType: "",
      makingChargeValue: "",
      wastagePercent: "",
      hasStones: false,
      stoneDetails: [],
      requiresHuid: true,
      images: [],
      ...defaultValues,
    },
  });

  const hasStones = watch("hasStones");
  const selectedProductNameId = watch("productNameId");

  const stoneFields = useFieldArray({ control, name: "stoneDetails" });
  const imageFields = useFieldArray({
    control,
    // useFieldArray needs objects; images are stored as plain base64
    // strings, so this wraps each one just for the array's field keys.
    name: "images" as never,
  });

  const onSubmit = async (formValues: ProductModelFormValues) => {
    const payload: ProductModelFormValues = {
      ...formValues,
      stoneDetails: formValues.hasStones ? formValues.stoneDetails : [],
    };

    if (isEditing) {
      const result = await dispatch(updateProductModel({ id: editingProductModelId, formData: payload }));
      if (updateProductModel.fulfilled.match(result)) onSaved();
      return;
    }
    const result = await dispatch(createProductModel(payload));
    if (createProductModel.fulfilled.match(result)) {
      reset();
      onSaved();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <Alert variant="error">{error}</Alert>

      <div>
        <h3 className="mb-3 text-sm font-medium text-ink">Design location</h3>
        <div className={FIELD_GRID}>
          <Dropdown
            label="Category *"
            options={categoryOptions}
            value={selectedCategoryId}
            onChange={(value) => {
              setSelectedCategoryId(value);
              const groupStillValid = productGroups.some((g) => {
                const groupCategoryId = typeof g.categoryId === "string" ? g.categoryId : g.categoryId.id;
                return g.id === selectedGroupId && groupCategoryId === value;
              });
              if (!groupStillValid) {
                setSelectedGroupId("");
                setValue("productNameId", "");
              }
            }}
          />
          <Dropdown
            label="Product Group *"
            options={groupOptions}
            value={selectedGroupId}
            onChange={(value) => {
              setSelectedGroupId(value);
              const nameStillValid = productNames.some((n) => {
                const nameGroupId = typeof n.productGroupId === "string" ? n.productGroupId : n.productGroupId.id;
                return n.id === selectedProductNameId && nameGroupId === value;
              });
              if (!nameStillValid) setValue("productNameId", "");
            }}
          />
          <Controller
            name="productNameId"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Product Name *"
                options={nameOptions}
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.productNameId?.message}
              />
            )}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-ink">Design details</h3>
        <div className={FIELD_GRID}>
          <Input
            label="Model Code *"
            icon={FiHash}
            placeholder="AR-101"
            error={errors.modelCode?.message}
            {...register("modelCode")}
          />
          <div className="sm:col-span-2">
            <Input
              label="Model Name *"
              icon={FiTag}
              placeholder="Antique Floral Ring"
              error={errors.modelName?.message}
              {...register("modelName")}
            />
          </div>
          <Controller
            name="purity"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Purity *"
                options={[...PURITY_OPTIONS]}
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.purity?.message}
              />
            )}
          />
          <Input
            label="Gross Weight Min (g) *"
            placeholder="e.g. 4.2"
            error={errors.grossWeightMin?.message}
            {...register("grossWeightMin")}
          />
          <Input
            label="Gross Weight Max (g) *"
            placeholder="e.g. 5.1"
            error={errors.grossWeightMax?.message}
            {...register("grossWeightMax")}
          />
        </div>
        <p className="mt-2 text-caption text-ink-muted">
          This is a template range for the design — the actual weight is captured per physical piece
          when it&apos;s tagged into stock.
        </p>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium text-ink">Making charge &amp; wastage overrides</h3>
        <p className="mb-3 text-caption text-ink-muted">
          Leave blank to inherit from the Product Group. Fill in only if this design costs differently.
        </p>
        <div className={FIELD_GRID}>
          <Controller
            name="makingChargeType"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Making Charge Type"
                options={[{ value: "", label: "Inherit from group" }, ...MAKING_CHARGE_TYPE_OPTIONS]}
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.makingChargeType?.message}
              />
            )}
          />
          <Input
            label="Making Charge Value"
            icon={FiDollarSign}
            placeholder="e.g. 15"
            error={errors.makingChargeValue?.message}
            {...register("makingChargeValue")}
          />
          <Input
            label="Wastage %"
            icon={FiPercent}
            placeholder="e.g. 6"
            error={errors.wastagePercent?.message}
            {...register("wastagePercent")}
          />
        </div>
      </div>

      <div>
        <Controller
          name="requiresHuid"
          control={control}
          render={({ field }) => (
            <LabeledCheckbox label="Requires HUID hallmarking" checked={field.value} onChange={field.onChange} />
          )}
        />
        <p className="mt-1 text-caption text-ink-muted">
          Government hallmarking requirement — on by default since it applies to most gold jewelry
          sold since 2021.
        </p>
      </div>

      <div>
        <Controller
          name="hasStones"
          control={control}
          render={({ field }) => (
            <LabeledCheckbox
              label="Has stones"
              checked={field.value}
              onChange={(checked) => {
                field.onChange(checked);
                if (checked && stoneFields.fields.length === 0) {
                  stoneFields.append({ stoneType: "", approxWeight: "", includedInPrice: true });
                }
              }}
            />
          )}
        />

        {hasStones && (
          <div className="mt-4 space-y-3">
            {stoneFields.fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 gap-3 rounded-xl border border-border p-4 sm:grid-cols-4">
                <Input
                  label="Stone Type"
                  placeholder="Diamond"
                  error={errors.stoneDetails?.[index]?.stoneType?.message}
                  {...register(`stoneDetails.${index}.stoneType` as const)}
                />
                <Input
                  label="Approx Weight (ct)"
                  placeholder="e.g. 0.25"
                  error={errors.stoneDetails?.[index]?.approxWeight?.message}
                  {...register(`stoneDetails.${index}.approxWeight` as const)}
                />
                <Controller
                  name={`stoneDetails.${index}.includedInPrice` as const}
                  control={control}
                  render={({ field: includedField }) => (
                    <div className="flex items-end pb-2">
                      <LabeledCheckbox
                        label="Included in price"
                        checked={Boolean(includedField.value)}
                        onChange={includedField.onChange}
                      />
                    </div>
                  )}
                />
                <div className="flex items-end justify-end pb-1">
                  <button
                    type="button"
                    onClick={() => stoneFields.remove(index)}
                    className="rounded-lg p-2 text-ink-muted hover:bg-danger/10 hover:text-danger"
                    title="Remove stone"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {typeof errors.stoneDetails?.message === "string" && (
              <p className="text-caption text-danger">{errors.stoneDetails.message}</p>
            )}
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              onClick={() => stoneFields.append({ stoneType: "", approxWeight: "", includedInPrice: true })}
            >
              <FiPlus size={16} /> Add stone
            </Button>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-ink">Design photos</h3>
        <div className="flex flex-wrap gap-4">
          {imageFields.fields.map((field, index) => (
            <div key={field.id} className="relative">
              <Controller
                name={`images.${index}` as const}
                control={control}
                render={({ field: imgField }) => (
                  <ImageUpload
                    label={`Photo ${index + 1}`}
                    value={imgField.value}
                    onChange={(dataUrl) => imgField.onChange(dataUrl)}
                  />
                )}
              />
              <button
                type="button"
                onClick={() => imageFields.remove(index)}
                className="absolute right-0 top-0 rounded-full bg-danger/10 p-1 text-danger hover:bg-danger/20"
                title="Remove photo"
              >
                <FiTrash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          fullWidth={false}
          className="mt-3"
          onClick={() => imageFields.append("" as never)}
        >
          <FiPlus size={16} /> Add photo
        </Button>
        <p className="mt-2 text-caption text-ink-muted">
          Design photos help sales staff and customers browse by design.
        </p>
      </div>

      <Button type="submit" isLoading={isSubmitting} fullWidth={false} className="px-8">
        {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create product model"}
      </Button>
    </form>
  );
}
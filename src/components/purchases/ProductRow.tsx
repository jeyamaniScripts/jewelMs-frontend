"use client";

import { useFormContext, Controller } from "react-hook-form";
import { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import type { FieldPath } from "react-hook-form";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import NumericInput from "./NumericInput";
import { useAppSelector } from "@/redux/hooks";
import type { PurchaseWeightFormValues } from "@/schemas/purchaseWeightSchemas";

interface ProductRowProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  weightDecimals: number;
  quantityDecimals: number;
  amountDecimals: number;
  currency: string;
}

export default function ProductRow({
  index,
  onRemove,
  canRemove,
  weightDecimals,
  quantityDecimals,
  amountDecimals,
  currency,
}: ProductRowProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PurchaseWeightFormValues>();
  const { productModels } = useAppSelector((state) => state.productModel);
  const prefix = `products.${index}` as const;
  const weightPrefix = `${prefix}.weightDetails` as const;
  const weight = watch(weightPrefix);
  const netWeight = Math.max(
    0,
    Number(weight?.grossWeight || 0) +
      Number(weight?.addWeight || 0) -
      Number(weight?.lessWeight || 0),
  );
  const touch = Number(watch(`${prefix}.purchaseTouch`) || 0) +
    Number(watch(`${prefix}.profitTouch`) || 0);
  const pureWeight = (netWeight * touch) / 100;
  const rate = Number(weight?.rate || 0);
  const quantity = Number(weight?.quantity || 1);
  const amount = watch("calculationType") === "Fixed(QTY)" ? quantity * rate : pureWeight * rate;
  const itemErrors = errors.products?.[index];
  const selectedModelId = watch(`${prefix}.productModelId`);
  const selectedModel = productModels.find((model) => model.id === selectedModelId);
  const selectedName =
    selectedModel && typeof selectedModel.productNameId !== "string"
      ? selectedModel.productNameId
      : null;
  const selectedGroup =
    selectedName && typeof selectedName.productGroupId !== "string"
      ? selectedName.productGroupId
      : null;
  const selectedCategory =
    selectedGroup && typeof selectedGroup.categoryId !== "string"
      ? selectedGroup.categoryId
      : null;
  const [categoryChoice, setCategoryChoice] = useState("");
  const [groupChoice, setGroupChoice] = useState("");
  const [nameChoice, setNameChoice] = useState("");
  const activeModels = productModels.filter((model) => model.status === "active");
  const modelHierarchy = activeModels.flatMap((model) => {
    if (typeof model.productNameId === "string") return [];
    const name = model.productNameId;
    if (typeof name.productGroupId === "string") return [];
    const group = name.productGroupId;
    if (typeof group.categoryId === "string") return [];
    return [{ model, name, group, category: group.categoryId }];
  });
  const categoryId = categoryChoice || selectedCategory?.id || "";
  const groupId = groupChoice || selectedGroup?.id || "";
  const productNameId = nameChoice || selectedName?.id || "";
  const uniqueOptions = (values: Array<{ id: string; label: string }>) =>
    [...new Map(values.map((item) => [item.id, item])).values()];
  const categoryOptions = uniqueOptions(
    modelHierarchy.map(({ category }) => ({
      id: category.id,
      label: `${category.categoryName} (${category.categoryCode})`,
    })),
  ).map(({ id, label }) => ({ value: id, label }));
  const groupOptions = uniqueOptions(
    modelHierarchy
      .filter(({ category }) => category.id === categoryId)
      .map(({ group }) => ({
        id: group.id,
        label: `${group.groupName} (${group.groupCode})`,
      })),
  ).map(({ id, label }) => ({ value: id, label }));
  const nameOptions = uniqueOptions(
    modelHierarchy
      .filter(({ group, category }) => group.id === groupId && category.id === categoryId)
      .map(({ name }) => ({ id: name.id, label: name.name })),
  ).map(({ id, label }) => ({ value: id, label }));
  const designOptions = modelHierarchy
    .filter(({ name, group, category }) =>
      category.id === categoryId &&
      group.id === groupId &&
      name.id === productNameId,
    )
    .map(({ model }) => ({
      value: model.id,
      label: `${model.modelCode} — ${model.modelName}`,
    }));
  const numericInput = (
    name: FieldPath<PurchaseWeightFormValues>,
    label: string,
    precision: number,
    error?: string,
  ) => {
    const registration = register(name);
    return (
      <NumericInput
        label={label}
        name={registration.name}
        registration={registration}
        precision={precision}
        error={error}
      />
    );
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">Product {index + 1}</h3>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            fullWidth={false}
            className="px-2 py-1.5 text-danger"
            onClick={onRemove}
          >
            <FiTrash2 size={15} /> Remove
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Controller
          name={`${prefix}.productModelId`}
          control={control}
          render={({ field }) => (
            <div className="contents">
              <Dropdown
                label="Category *"
                options={categoryOptions}
                value={categoryId}
                onChange={(value) => {
                  setCategoryChoice(value);
                  setGroupChoice("");
                  setNameChoice("");
                  field.onChange("");
                }}
                placeholder="Choose a category"
              />
              <Dropdown
                label="Product group *"
                options={groupOptions}
                value={groupId}
                onChange={(value) => {
                  setGroupChoice(value);
                  setNameChoice("");
                  field.onChange("");
                }}
                disabled={!categoryId}
                placeholder="Choose a group"
              />
              <Dropdown
                label="Product *"
                options={nameOptions}
                value={productNameId}
                onChange={(value) => {
                  setNameChoice(value);
                  field.onChange("");
                }}
                disabled={!groupId}
                placeholder="Choose a product"
              />
              <Dropdown
                label="Design *"
                options={designOptions}
                value={field.value}
                onChange={(modelId) => {
                  field.onChange(modelId);
                  const model = productModels.find((item) => item.id === modelId);
                  if (model) {
                    const designTouch: Record<string, string> = {
                      "24K": "100",
                      "22K": "91.6",
                      "18K": "75",
                      "14K": "58.5",
                      "916": "91.6",
                      "750": "75",
                    };
                    const touch = designTouch[model.purity];
                    if (touch) setValue(`${prefix}.productTouch`, touch, { shouldValidate: true });
                  }
                }}
                error={itemErrors?.productModelId?.message}
                disabled={!productNameId}
                placeholder="Choose a design"
              />
            </div>
          )}
        />
        {numericInput(`${prefix}.productTouch`, "Product touch (%)", 2, itemErrors?.productTouch?.message)}
        {numericInput(`${prefix}.purchaseTouch`, "Purchase touch (%) *", 2, itemErrors?.purchaseTouch?.message)}
        {numericInput(`${prefix}.profitTouch`, "Profit touch (%)", 2, itemErrors?.profitTouch?.message)}
        {numericInput(`${weightPrefix}.quantity`, "Quantity *", quantityDecimals, itemErrors?.weightDetails?.quantity?.message)}
        {numericInput(`${weightPrefix}.grossWeight`, "Gross weight (g) *", weightDecimals, itemErrors?.weightDetails?.grossWeight?.message)}
        {numericInput(`${weightPrefix}.addWeight`, "Add weight (g)", weightDecimals, itemErrors?.weightDetails?.addWeight?.message)}
        {numericInput(`${weightPrefix}.lessWeight`, "Less weight (g)", weightDecimals, itemErrors?.weightDetails?.lessWeight?.message)}
        {numericInput(`${weightPrefix}.rate`, "Rate", amountDecimals, itemErrors?.weightDetails?.rate?.message)}
        {numericInput(`${weightPrefix}.otherCharges`, "Other item charges", amountDecimals, itemErrors?.weightDetails?.otherCharges?.message)}
        <div className="flex items-end">
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              {...register(`${weightPrefix}.lot`)}
            />
            Track as a stock lot
          </label>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-primary-light/40 p-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-ink-muted">Net weight</p>
          <p className="mt-1 font-semibold text-ink">{netWeight.toFixed(weightDecimals)} g</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">Total touch</p>
          <p className="mt-1 font-semibold text-ink">{touch.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">Pure weight</p>
          <p className="mt-1 font-semibold text-ink">{pureWeight.toFixed(weightDecimals)} g</p>
        </div>
        <div>
          <p className="text-xs text-ink-muted">Product amount</p>
          <p className="mt-1 font-semibold text-ink">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency,
              minimumFractionDigits: amountDecimals,
              maximumFractionDigits: amountDecimals,
            }).format(amount)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-muted">
        Design touch is prefilled from the selected design for reference. Pure weight uses purchase touch plus profit touch.
      </p>
    </section>
  );
}

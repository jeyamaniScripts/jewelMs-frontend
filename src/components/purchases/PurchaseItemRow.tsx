"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { FiTrash2 } from "react-icons/fi";
import type { PurchaseFormValues } from "@/schemas/purchaseSchemas";
import { MAKING_CHARGE_TYPE_OPTIONS } from "@/schemas/purchaseSchemas";
import { useAppSelector } from "@/redux/hooks";
import Input from "@/components/ui/Input";
import Dropdown from "@/components/ui/Dropdown";

interface PurchaseItemRowProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

export default function PurchaseItemRow({ index, onRemove, canRemove }: PurchaseItemRowProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<PurchaseFormValues>();

  const { categories } = useAppSelector((state) => state.category);
  const { productGroups } = useAppSelector((state) => state.productGroup);
  const { productNames } = useAppSelector((state) => state.productName);
  const { productModels } = useAppSelector((state) => state.productModel);

  const [categoryId, setCategoryId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [nameId, setNameId] = useState("");

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.categoryName }));

  const groupOptions = useMemo(
    () =>
      productGroups
        .filter((g) => {
          if (!categoryId) return true;
          const gCat = typeof g.categoryId === "string" ? g.categoryId : g.categoryId.id;
          return gCat === categoryId;
        })
        .map((g) => ({ value: g.id, label: g.groupName })),
    [productGroups, categoryId]
  );

  const nameOptions = useMemo(
    () =>
      productNames
        .filter((n) => {
          if (!groupId) return true;
          const nGroup = typeof n.productGroupId === "string" ? n.productGroupId : n.productGroupId.id;
          return nGroup === groupId;
        })
        .map((n) => ({ value: n.id, label: n.name })),
    [productNames, groupId]
  );

  const modelOptions = useMemo(
    () =>
      productModels
        .filter((m) => {
          if (!nameId) return true;
          const mName = typeof m.productNameId === "string" ? m.productNameId : m.productNameId.id;
          return mName === nameId;
        })
        .map((m) => ({ value: m.id, label: `${m.modelName} (${m.modelCode})` })),
    [productModels, nameId]
  );

  const productModelId = watch(`items.${index}.productModelId`);

  // When a design is picked, pre-fill purity from that model — the user
  // can still override it, since a purchase records what actually arrived.
  useEffect(() => {
    if (!productModelId) return;
    const model = productModels.find((m) => m.id === productModelId);
    if (model) setValue(`items.${index}.purity`, model.purity);
  }, [productModelId, productModels, index, setValue]);

  const itemErrors = errors.items?.[index];

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Dropdown
          label="Category"
          options={categoryOptions}
          value={categoryId}
          onChange={(value) => {
            setCategoryId(value);
            setGroupId("");
            setNameId("");
            setValue(`items.${index}.productModelId`, "");
          }}
        />
        <Dropdown
          label="Product Group"
          options={groupOptions}
          value={groupId}
          onChange={(value) => {
            setGroupId(value);
            setNameId("");
            setValue(`items.${index}.productModelId`, "");
          }}
        />
        <Dropdown
          label="Product Name"
          options={nameOptions}
          value={nameId}
          onChange={(value) => {
            setNameId(value);
            setValue(`items.${index}.productModelId`, "");
          }}
        />
        <Controller
          name={`items.${index}.productModelId`}
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Design *"
              options={modelOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={itemErrors?.productModelId?.message}
            />
          )}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Purity *" error={itemErrors?.purity?.message} {...register(`items.${index}.purity`)} />
        <Input
          label="Gross Weight (g) *"
          error={itemErrors?.grossWeight?.message}
          {...register(`items.${index}.grossWeight`)}
        />
        <Input
          label="Wastage %"
          error={itemErrors?.wastagePercent?.message}
          {...register(`items.${index}.wastagePercent`)}
        />
        <Input
          label="Rate/gram *"
          error={itemErrors?.ratePerGram?.message}
          {...register(`items.${index}.ratePerGram`)}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Controller
          name={`items.${index}.makingChargeType`}
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Making Charge Type *"
              options={[...MAKING_CHARGE_TYPE_OPTIONS]}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={itemErrors?.makingChargeType?.message}
            />
          )}
        />
        <Input
          label="Making Charge Value"
          error={itemErrors?.makingChargeValue?.message}
          {...register(`items.${index}.makingChargeValue`)}
        />
        <Input
          label="Stone Charges"
          error={itemErrors?.stoneCharges?.message}
          {...register(`items.${index}.stoneCharges`)}
        />
        <Input label="GST %" error={itemErrors?.gstRate?.message} {...register(`items.${index}.gstRate`)} />
        <Input label="Quantity" error={itemErrors?.quantity?.message} {...register(`items.${index}.quantity`)} />
      </div>

      {canRemove && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/10"
          >
            <FiTrash2 size={14} /> Remove item
          </button>
        </div>
      )}
    </div>
  );
}
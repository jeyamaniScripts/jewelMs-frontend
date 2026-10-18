"use client";

import { useEffect } from "react";
import { useForm, FormProvider, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiPlus } from "react-icons/fi";

import { purchaseSchema, PURCHASE_TYPE_OPTIONS, type PurchaseFormValues } from "@/schemas/purchaseSchemas";
import { createPurchase, updatePurchase } from "@/redux/slices/purchaseSlice";
import { fetchSuppliers } from "@/redux/slices/supplierSlice";
import { fetchShowrooms } from "@/redux/slices/showroomSlice";
import { fetchCategories } from "@/redux/slices/categorySlice";
import { fetchProductGroups } from "@/redux/slices/productGroupSlice";
import { fetchProductNames } from "@/redux/slices/productNameSlice";
import { fetchProductModels } from "@/redux/slices/productModelSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Dropdown from "@/components/ui/Dropdown";
import PurchaseItemRow from "@/components/purchases/PurchaseItemRow";

const emptyItem = {
  productModelId: "",
  purity: "",
  grossWeight: "",
  wastagePercent: "",
  ratePerGram: "",
  makingChargeType: "percentage" as const,
  makingChargeValue: "",
  stoneCharges: "",
  gstRate: "3",
  quantity: "1",
};

interface PurchaseFormProps {
  onSaved: () => void;
  editingPurchaseId?: string;
  defaultValues?: Partial<PurchaseFormValues>;
}

export default function PurchaseForm({ onSaved, editingPurchaseId, defaultValues }: PurchaseFormProps) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.purchase);
  const { suppliers } = useAppSelector((state) => state.supplier);
  const { showrooms } = useAppSelector((state) => state.showroom);
  const isSubmitting = status === "loading";
  const isEditing = !!editingPurchaseId;

  useEffect(() => {
    dispatch(fetchSuppliers({ limit: 200 }));
    dispatch(fetchShowrooms({ limit: 200 }));
    dispatch(fetchCategories({ limit: 200 }));
    dispatch(fetchProductGroups({ limit: 200 }));
    dispatch(fetchProductNames({ limit: 200 }));
    dispatch(fetchProductModels({ limit: 500 }));
  }, [dispatch]);

  const supplierOptions = suppliers
    .filter((s) => s.status === "active" && !s.isBlacklisted)
    .map((s) => ({ value: s.id, label: `${s.supplierName} (${s.supplierCode})` }));
  const branchOptions = showrooms.map((s: { id: string; showroomName: string }) => ({
    value: s.id,
    label: s.showroomName,
  }));

  const methods = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      branchId: "",
      supplierId: "",
      supplierInvoiceNumber: "",
      purchaseDate: new Date().toISOString().slice(0, 10),
      purchaseType: "credit",
      items: [emptyItem],
      notes: "",
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  const itemFields = useFieldArray({ control, name: "items" });

  const onSubmit = async (formValues: PurchaseFormValues) => {
    if (isEditing) {
      const result = await dispatch(updatePurchase({ id: editingPurchaseId, formData: formValues }));
      if (updatePurchase.fulfilled.match(result)) onSaved();
      return;
    }
    const result = await dispatch(createPurchase(formValues));
    if (createPurchase.fulfilled.match(result)) {
      reset();
      onSaved();
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
        <Alert variant="error">{error}</Alert>

        <div>
          <h3 className="mb-3 text-sm font-medium text-ink">Invoice details</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Controller
              name="supplierId"
              control={control}
              render={({ field }) => (
                <Dropdown
                  label="Supplier *"
                  options={supplierOptions}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={errors.supplierId?.message}
                />
              )}
            />
            <Controller
              name="branchId"
              control={control}
              render={({ field }) => (
                <Dropdown
                  label="Branch"
                  options={[{ value: "", label: "Not assigned" }, ...branchOptions]}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="purchaseType"
              control={control}
              render={({ field }) => (
                <Dropdown
                  label="Purchase Type *"
                  options={[...PURCHASE_TYPE_OPTIONS]}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={errors.purchaseType?.message}
                />
              )}
            />
            <Input
              label="Supplier Invoice Number"
              error={errors.supplierInvoiceNumber?.message}
              {...register("supplierInvoiceNumber")}
            />
            <Input
              label="Purchase Date *"
              type="date"
              error={errors.purchaseDate?.message}
              {...register("purchaseDate")}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-ink">Items</h3>
          <div className="space-y-4">
            {itemFields.fields.map((field, index) => (
              <PurchaseItemRow
                key={field.id}
                index={index}
                onRemove={() => itemFields.remove(index)}
                canRemove={itemFields.fields.length > 1}
              />
            ))}
          </div>
          {typeof errors.items?.message === "string" && (
            <p className="mt-2 text-caption text-danger">{errors.items.message}</p>
          )}
          <Button
            type="button"
            variant="secondary"
            fullWidth={false}
            className="mt-4"
            onClick={() => itemFields.append(emptyItem)}
          >
            <FiPlus size={16} /> Add item
          </Button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Notes</label>
          <textarea
            rows={3}
            placeholder="Notes about this purchase..."
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            {...register("notes")}
          />
        </div>

        <p className="text-caption text-ink-muted">
          Totals (gross weight, metal value, GST, grand total) are calculated by the server from
          these inputs once saved — they aren&apos;t shown live here to avoid drifting from what
          actually gets recorded.
        </p>

        <Button type="submit" isLoading={isSubmitting} fullWidth={false} className="px-8">
          {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create purchase"}
        </Button>
      </form>
    </FormProvider>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiPlus } from "react-icons/fi";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import Input from "@/components/ui/Input";
import NumericInput from "./NumericInput";
import DatePicker from "@/components/ui/DatePicker";
import { createWeightPurchase, updateWeightPurchase } from "@/lib/purchaseWeightApi";
import { ApiClientError } from "@/lib/apiClient";
import { fetchSiteSettings } from "@/lib/siteSettingsApi";
import { DEFAULT_SITE_SETTINGS } from "@/constants/siteSettings";
import { useSiteFormatters } from "@/components/layout/SiteFormatProvider";
import { fetchProductModels } from "@/redux/slices/productModelSlice";
import { fetchSuppliers } from "@/redux/slices/supplierSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  EMPTY_WEIGHT_PURCHASE,
  purchaseWeightSchema,
  type PurchaseWeightFormValues,
} from "@/schemas/purchaseWeightSchemas";
import type { WeightPurchase } from "@/lib/purchaseWeightApi";
import ProductRow from "./ProductRow";
import SummaryCard from "./SummaryCard";

interface WeightPurchaseFormProps {
  onSaved: (purchase: WeightPurchase) => void;
  editingPurchaseId?: string;
  defaultValues?: PurchaseWeightFormValues;
}

const chargeFields = [
  ["huid", "HUID"],
  ["hallmark", "Hallmark"],
  ["logo", "Logo"],
  ["makingCharge", "Making charge"],
  ["parcelCharge", "Parcel charge"],
] as const;

export default function WeightPurchaseForm({
  onSaved,
  editingPurchaseId,
  defaultValues,
}: WeightPurchaseFormProps) {
  const dispatch = useAppDispatch();
  const suppliers = useAppSelector((state) => state.supplier.suppliers);
  const formatters = useSiteFormatters();
  const [formatSettings, setFormatSettings] = useState({
    weightDecimals: Number(DEFAULT_SITE_SETTINGS.weightDecimals),
    quantityDecimals: Number(DEFAULT_SITE_SETTINGS.quantityDecimals),
    amountDecimals: Number(DEFAULT_SITE_SETTINGS.amountDecimals),
    currency: DEFAULT_SITE_SETTINGS.currency,
  });
  const [settingsError, setSettingsError] = useState("");
  const isEditing = Boolean(editingPurchaseId);
  const methods = useForm<PurchaseWeightFormValues>({
    resolver: zodResolver(purchaseWeightSchema),
    defaultValues: defaultValues ?? EMPTY_WEIGHT_PURCHASE,
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;
  const products = useFieldArray({ control, name: "products" });
  const chargeInput = (
    key: (typeof chargeFields)[number][0],
    field: "rate" | "qty",
    label: string,
  ) => {
    const registration = register(`charges.${key}.${field}`);
    return (
      <NumericInput
        name={registration.name}
        registration={registration}
        aria-label={`${label} ${field === "qty" ? "quantity" : "rate"}`}
        placeholder={field === "qty" ? "Qty" : "Rate"}
        className="py-2"
        precision={field === "qty" ? formatSettings.quantityDecimals : formatSettings.amountDecimals}
        error={errors.charges?.[key]?.[field]?.message}
      />
    );
  };
  const overallQtyRegistration = register("charges.overallQty");
  const overallRateRegistration = register("charges.overallRs");
  const overallAmountRegistration = register("charges.overallAmount");
  const discountRegistration = register("discount");
  const roundOffAmountRegistration = register("roundOffAmount");

  useEffect(() => {
    dispatch(fetchSuppliers({ limit: 200 }));
    dispatch(fetchProductModels({ limit: 500 }));
    const controller = new AbortController();
    fetchSiteSettings(controller.signal)
      .then(({ settings }) => {
        setFormatSettings({
          weightDecimals: Number(settings.weightDecimals),
          quantityDecimals: Number(settings.quantityDecimals),
          amountDecimals: Number(settings.amountDecimals),
          currency: settings.currency,
        });
        setSettingsError("");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setSettingsError(
          error instanceof ApiClientError
            ? `Could not load site number formats (${error.message}); default formats are being used.`
            : "Could not load site number formats; default formats are being used.",
        );
      });
    return () => controller.abort();
  }, [dispatch]);

  const supplierOptions = suppliers
    .filter((supplier) => supplier.status === "active" && !supplier.isBlacklisted)
    .map((supplier) => ({
      value: supplier.id,
      label: `${supplier.supplierName} (${supplier.supplierCode})`,
    }));
  const submit = async (values: PurchaseWeightFormValues) => {
    try {
      const purchase = editingPurchaseId
        ? await updateWeightPurchase(editingPurchaseId, values)
        : await createWeightPurchase(values);
      onSaved(purchase);
    } catch (error) {
      methods.setError("root.server", {
        message: error instanceof ApiClientError ? error.message : "Could not save the weight-based purchase",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submit)} noValidate className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {errors.root?.server?.message && <Alert>{errors.root.server.message}</Alert>}
          {settingsError && <Alert>{settingsError}</Alert>}

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Purchase details</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                  <div>
                    <Dropdown
                      label="Supplier *"
                      options={supplierOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.supplierId?.message}
                      placeholder="Choose a supplier"
                    />
                    {(() => {
                      const supplier = suppliers.find((option) => option.id === field.value);
                      if (!supplier) return null;
                      return (
                        <div className="mt-2 rounded-lg border border-border bg-surface-alt px-3 py-2 text-xs font-medium text-ink">
                          <span>OB: {formatters.amount(supplier.openingBalance ?? 0)}</span>
                          <span className="mx-2 text-ink-muted" aria-hidden="true">|</span>
                          <span>OW: {formatters.weight(supplier.openingWeight ?? 0)}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              />
              <Controller
                name="purchaseDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Purchase date *"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.purchaseDate?.message}
                  />
                )}
              />
              <Input
                label="Supplier invoice number"
                maxLength={60}
                error={errors.supplierInvoiceNumber?.message}
                {...register("supplierInvoiceNumber")}
              />
              <Controller
                name="calculationType"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    label="Calculation type"
                    options={[
                      { value: "Per Gram", label: "Per gram (pure weight × rate)" },
                      { value: "Fixed(QTY)", label: "Fixed quantity (quantity × rate)" },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Input
                label="Reference"
                maxLength={120}
                error={errors.referenceName?.message}
                {...register("referenceName")}
              />
            </div>
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Weight-based products</h2>
                <p className="mt-1 text-sm text-ink-muted">Enter received weights, touch and purchase rate.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                fullWidth={false}
                onClick={() => products.append({
                  productModelId: "",
                  productTouch: "0",
                  purchaseTouch: "0",
                  profitTouch: "0",
                  weightDetails: {
                    lot: false,
                    quantity: "1",
                    grossWeight: "0",
                    addWeight: "0",
                    lessWeight: "0",
                    rate: "0",
                    otherCharges: "0",
                  },
                })}
              >
                <FiPlus size={16} /> Add product
              </Button>
            </div>
            <div className="space-y-4">
              {products.fields.map((item, index) => (
                <ProductRow
                  key={item.id}
                  index={index}
                  canRemove={products.fields.length > 1}
                  onRemove={() => products.remove(index)}
                  weightDecimals={formatSettings.weightDecimals}
                  quantityDecimals={formatSettings.quantityDecimals}
                  amountDecimals={formatSettings.amountDecimals}
                  currency={formatSettings.currency}
                />
              ))}
            </div>
            {typeof errors.products?.message === "string" && (
              <p className="mt-2 text-caption text-danger">{errors.products.message}</p>
            )}
          </section>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.75fr)]">
            <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-ink">Additional charges</h2>
                <p className="text-xs text-ink-muted">Leave unused charges at zero.</p>
              </div>
              <div className="hidden grid-cols-[minmax(110px,1fr)_minmax(100px,0.8fr)_minmax(100px,0.8fr)_72px] gap-3 px-2 pb-1 text-xs font-medium text-ink-muted sm:grid">
                <span>Charge</span>
                <span>Rate</span>
                <span>Quantity</span>
                <span className="text-center">Ledger</span>
              </div>
              <div className="divide-y divide-border rounded-xl border border-border">
                {chargeFields.map(([key, label]) => (
                  <div key={key} className="grid grid-cols-2 items-center gap-x-3 gap-y-2 px-3 py-2 sm:grid-cols-[minmax(110px,1fr)_minmax(100px,0.8fr)_minmax(100px,0.8fr)_72px]">
                    <p className="col-span-2 text-sm font-medium text-ink sm:col-span-1">{label}</p>
                    {chargeInput(key, "rate", label)}
                    {chargeInput(key, "qty", label)}
                    <Controller
                      name={`charges.${key}.reflectLedger`}
                      control={control}
                      render={({ field }) => (
                        <label className="col-span-2 flex items-center gap-2 text-xs font-medium text-ink-muted sm:col-span-1 sm:justify-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-primary"
                            checked={field.value}
                            onChange={field.onChange}
                          />
                          <span className="sm:hidden">Reflect in ledger</span>
                        </label>
                      )}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NumericInput name={overallQtyRegistration.name} registration={overallQtyRegistration} label="Overall quantity" precision={formatSettings.quantityDecimals} className="py-2" error={errors.charges?.overallQty?.message} />
                <NumericInput name={overallRateRegistration.name} registration={overallRateRegistration} label="Overall rate" precision={formatSettings.amountDecimals} className="py-2" error={errors.charges?.overallRs?.message} />
                <NumericInput name={overallAmountRegistration.name} registration={overallAmountRegistration} label="Other overall amount" precision={formatSettings.amountDecimals} className="py-2" error={errors.charges?.overallAmount?.message} />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-ink">Tax, discount and rounding</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {(["cgst", "sgst", "igst"] as const).map((field) => {
                  const registration = register(field);
                  return (
                    <NumericInput
                      key={field}
                      name={registration.name}
                      registration={registration}
                      label={`${field.toUpperCase()} (%)`}
                      precision={2}
                      error={errors[field]?.message}
                    />
                  );
                })}
                <NumericInput
                  name={discountRegistration.name}
                  registration={discountRegistration}
                  label="Discount"
                  precision={formatSettings.amountDecimals}
                  error={errors.discount?.message}
                />
                <Controller
                  name="roundOffType"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      label="Round off"
                      options={[{ value: "Add", label: "Add" }, { value: "Sub", label: "Subtract" }]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <NumericInput
                  name={roundOffAmountRegistration.name}
                  registration={roundOffAmountRegistration}
                  label="Round-off amount"
                  precision={formatSettings.amountDecimals}
                  error={errors.roundOffAmount?.message}
                />
              </div>
            </section>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button type="submit" fullWidth={false} isLoading={isSubmitting} className="min-w-40">
              {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Save weight purchase"}
            </Button>
          </div>
        </div>
        <SummaryCard currency={formatSettings.currency} amountDecimals={formatSettings.amountDecimals} />
      </form>
    </FormProvider>
  );
}

"use client";

import { useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FiTag,
  FiHash,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiFileText,
  FiCreditCard,
  FiDollarSign,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";

import {
  supplierSchema,
  SUPPLIER_TYPE_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  type SupplierFormValues,
} from "@/schemas/supplierSchemas";
import { createSupplier, updateSupplier } from "@/redux/slices/supplierSlice";
import { fetchShowrooms } from "@/redux/slices/showroomSlice";
import { fetchCategories } from "@/redux/slices/categorySlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Dropdown from "@/components/ui/Dropdown";
import ImageUpload from "@/components/ui/ImageUpload";
import SearchableMultiSelect from "@/components/ui/SearchableMultiSelect";

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

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      {subtitle && <p className="mt-0.5 text-caption text-ink-muted">{subtitle}</p>}
    </div>
  );
}

interface SupplierFormProps {
  onSaved: () => void;
  editingSupplierId?: string;
  defaultValues?: Partial<SupplierFormValues>;
}

export default function SupplierForm({ onSaved, editingSupplierId, defaultValues }: SupplierFormProps) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.supplier);
  const { showrooms } = useAppSelector((state) => state.showroom);
  const { categories, status: categoryStatus, error: categoryError } = useAppSelector((state) => state.category);
  const isSubmitting = status === "loading";
  const isEditing = !!editingSupplierId;

  useEffect(() => {
    dispatch(fetchShowrooms({ limit: 200 }));
    dispatch(fetchCategories({ limit: 200 }));
  }, [dispatch]);

  const branchOptions = showrooms.map((s: { id: string; showroomName: string }) => ({
    value: s.id,
    label: s.showroomName,
  }));

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      branchId: "",
      companyId: "",
      supplierName: "",
      supplierCode: "",
      supplierType: "manufacturer",
      categoryIds: [],
      contactPerson: "",
      phone: "",
      alternatePhone: "",
      email: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      gstNumber: "",
      panNumber: "",
      businessType: "",
      hallmarkLicenseNumber: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      openingBalance: "",
      currentBalance: "",
      openingWeight: "",
      currentWeight: "",
      creditPeriod: "",
      paymentTerms: "",
      supplierImages: [],
      visitingCard: undefined,
      isBlacklisted: false,
      blacklistReason: "",
      notes: "",
      ...defaultValues,
    },
  });

  const isBlacklisted = watch("isBlacklisted");

  const imageFields = useFieldArray({
    control,
    // useFieldArray needs objects; images are plain base64 strings, so
    // this wraps each one just for the array's field keys.
    name: "supplierImages" as never,
  });

  const onSubmit = async (formValues: SupplierFormValues) => {
    if (isEditing) {
      const result = await dispatch(updateSupplier({ id: editingSupplierId, formData: formValues }));
      if (updateSupplier.fulfilled.match(result)) onSaved();
      return;
    }
    const result = await dispatch(createSupplier(formValues));
    if (createSupplier.fulfilled.match(result)) {
      reset();
      onSaved();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <Alert variant="error">{error}</Alert>

      <div>
        <SectionHeading title="Basic Info" />
        <div className={`${FIELD_GRID} mt-4`}>
          <Input
            label="Supplier Name *"
            icon={FiTag}
            placeholder="Rajesh Jewels Pvt Ltd"
            error={errors.supplierName?.message}
            {...register("supplierName")}
          />
          <Input
            label="Supplier Code *"
            icon={FiHash}
            placeholder="SUP-001"
            error={errors.supplierCode?.message}
            {...register("supplierCode")}
          />
          <Controller
            name="supplierType"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Supplier Type *"
                options={[...SUPPLIER_TYPE_OPTIONS]}
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.supplierType?.message}
              />
            )}
          />
          <Controller
            name="categoryIds"
            control={control}
            render={({ field }) => (
              <SearchableMultiSelect
                name="supplier-category-ids"
                label="Product categories"
                options={categories
                  .filter((category) => category.status === "active")
                  .map((category) => ({
                    value: category.id,
                    label: `${category.categoryName} (${category.categoryCode})`,
                  }))}
                value={field.value ?? []}
                onChange={field.onChange}
                placeholder="Choose categories supplied"
                searchPlaceholder="Search product categories"
                error={categoryStatus === "failed" ? categoryError ?? "Could not load categories" : undefined}
              />
            )}
          />
          <Input
            label="Contact Person"
            icon={FiUser}
            placeholder="Contact name"
            error={errors.contactPerson?.message}
            {...register("contactPerson")}
          />
          <Input
            label="Phone *"
            icon={FiPhone}
            placeholder="9876543210"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Alternate Phone"
            icon={FiPhone}
            placeholder="9876543210"
            error={errors.alternatePhone?.message}
            {...register("alternatePhone")}
          />
          <Input
            label="Email"
            icon={FiMail}
            placeholder="supplier@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>
      </div>

      <div>
        <SectionHeading title="Address" />
        <div className={`${FIELD_GRID} mt-4`}>
          <div className="sm:col-span-2 lg:col-span-3">
            <Input
              label="Street"
              icon={FiMapPin}
              placeholder="Street address"
              error={errors.street?.message}
              {...register("street")}
            />
          </div>
          <Input label="City" placeholder="City" error={errors.city?.message} {...register("city")} />
          <Input label="State" placeholder="State" error={errors.state?.message} {...register("state")} />
          <Input label="Pincode" placeholder="Pincode" error={errors.pincode?.message} {...register("pincode")} />
          <Input label="Country" placeholder="Country" error={errors.country?.message} {...register("country")} />
        </div>
      </div>

      <div>
        <SectionHeading title="Business / Legal" />
        <div className={`${FIELD_GRID} mt-4`}>
          <Input
            label="GST Number"
            icon={FiFileText}
            placeholder="22AAAAA0000A1Z5"
            error={errors.gstNumber?.message}
            {...register("gstNumber")}
          />
          <Input
            label="PAN Number"
            icon={FiFileText}
            placeholder="AAAAA0000A"
            error={errors.panNumber?.message}
            {...register("panNumber")}
          />
          <Controller
            name="businessType"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Business Type"
                options={[{ value: "", label: "Not specified" }, ...BUSINESS_TYPE_OPTIONS]}
                value={field.value ?? ""}
                onChange={field.onChange}
                error={errors.businessType?.message}
              />
            )}
          />
          <Input
            label="Hallmark License Number"
            placeholder="BIS hallmarking license"
            error={errors.hallmarkLicenseNumber?.message}
            {...register("hallmarkLicenseNumber")}
          />
        </div>
      </div>

      <div>
        <SectionHeading title="Bank Details" />
        <div className={`${FIELD_GRID} mt-4`}>
          <Input
            label="Account Holder Name"
            icon={FiCreditCard}
            placeholder="As per bank records"
            error={errors.accountHolderName?.message}
            {...register("accountHolderName")}
          />
          <Input
            label="Account Number"
            placeholder="Bank account number"
            error={errors.accountNumber?.message}
            {...register("accountNumber")}
          />
          <Input
            label="IFSC Code"
            placeholder="e.g. SBIN0001234"
            error={errors.ifscCode?.message}
            {...register("ifscCode")}
          />
          <Input label="Bank Name" placeholder="Bank name" error={errors.bankName?.message} {...register("bankName")} />
          <Input
            label="Branch Name"
            placeholder="Branch name"
            error={errors.branchName?.message}
            {...register("branchName")}
          />
        </div>
      </div>

      <div>
        <SectionHeading title="Balance & Weight" />
        <div className={`${FIELD_GRID} mt-4`}>
          <Input
            label="Opening Balance"
            icon={FiDollarSign}
            placeholder="0"
            error={errors.openingBalance?.message}
            {...register("openingBalance")}
          />
          <Input
            label="Current Balance"
            icon={FiDollarSign}
            placeholder="Defaults to opening balance"
            error={errors.currentBalance?.message}
            {...register("currentBalance")}
          />
          <Input
            label="Opening Weight (g)"
            placeholder="0"
            error={errors.openingWeight?.message}
            {...register("openingWeight")}
          />
          <Input
            label="Current Weight (g)"
            placeholder="Defaults to opening weight"
            error={errors.currentWeight?.message}
            {...register("currentWeight")}
          />
          <Input
            label="Credit Period (days)"
            placeholder="e.g. 30"
            error={errors.creditPeriod?.message}
            {...register("creditPeriod")}
          />
          <Input
            label="Payment Terms"
            placeholder="e.g. Net 30"
            error={errors.paymentTerms?.message}
            {...register("paymentTerms")}
          />
        </div>
      </div>

      <div>
        <SectionHeading title="Images" />
        <div className="mt-4 space-y-5">
          <Controller
            name="visitingCard"
            control={control}
            render={({ field }) => (
              <ImageUpload
                label="Visiting Card"
                value={field.value}
                onChange={(dataUrl) => field.onChange(dataUrl)}
                helpText="PNG or JPG, up to 2MB."
              />
            )}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Supplier Photos</label>
            <div className="flex flex-wrap gap-4">
              {imageFields.fields.map((field, index) => (
                <div key={field.id} className="relative">
                  <Controller
                    name={`supplierImages.${index}` as const}
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
          </div>
        </div>
      </div>

      <div>
        <SectionHeading title="Operational" />
        <div className={`${FIELD_GRID} mt-4`}>
          <Dropdown
            label="Branch"
            options={[{ value: "", label: "Not assigned" }, ...branchOptions]}
            value={watch("branchId") ?? ""}
            onChange={(value) => control._formValues && register("branchId").onChange({ target: { value, name: "branchId" } })}
          />
          <Input label="Company ID" placeholder="Optional" error={errors.companyId?.message} {...register("companyId")} />
        </div>

        <div className="mt-5">
          <label className="mb-1.5 block text-sm font-medium text-ink">Notes</label>
          <textarea
            rows={3}
            placeholder="Internal notes about this supplier..."
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            {...register("notes")}
          />
          {errors.notes?.message && <p className="mt-1.5 text-caption text-danger">{errors.notes.message}</p>}
        </div>

        <div className="mt-5">
          <Controller
            name="isBlacklisted"
            control={control}
            render={({ field }) => (
              <LabeledCheckbox label="Blacklisted" checked={field.value} onChange={field.onChange} />
            )}
          />
          {isBlacklisted && (
            <div className="mt-3">
              <Input
                label="Blacklist Reason *"
                placeholder="Why is this supplier blacklisted?"
                error={errors.blacklistReason?.message}
                {...register("blacklistReason")}
              />
            </div>
          )}
        </div>
      </div>

      <Button type="submit" isLoading={isSubmitting} fullWidth={false} className="px-8">
        {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create supplier"}
      </Button>
    </form>
  );
}
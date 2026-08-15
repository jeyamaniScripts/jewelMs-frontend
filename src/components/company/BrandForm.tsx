"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiUser, FiMail, FiPhone, FiMapPin, FiHash, FiBriefcase, FiGlobe } from "react-icons/fi";

import { brandSchema, type BrandFormValues } from "@/schemas/companySchemas";
import { createBrand, updateBrand } from "@/redux/slices/companySlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import ImageUpload from "@/components/ui/ImageUpload";
import FormSection from "@/components/ui/FormSection";

// Desktop shows up to 4 fields per row — short fields take 1 column,
// longer ones (name/address lines) span 2.
const FIELD_GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4";

interface BrandFormProps {
  onCreated: () => void;
  /** Supply these two together to switch the form into edit mode. */
  editingBrandId?: string;
  defaultValues?: Partial<BrandFormValues>;
}

export default function BrandForm({ onCreated, editingBrandId, defaultValues }: BrandFormProps) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.company);
  const isSubmitting = status === "loading";
  const isEditing = !!editingBrandId;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      companyName: "",
      shortName: "",
      ownerName: "",
      gstNumber: "",
      panNumber: "",
      businessRegNumber: "",
      email: "",
      phone: "",
      alternatePhone: "",
      website: "",
      logoUrl: undefined,
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      ...defaultValues,
    },
  });

  const onSubmit = async (formValues: BrandFormValues) => {
    if (isEditing) {
      const result = await dispatch(updateBrand({ id: editingBrandId, formData: formValues }));
      if (updateBrand.fulfilled.match(result)) onCreated();
      return;
    }
    const result = await dispatch(createBrand(formValues));
    if (createBrand.fulfilled.match(result)) {
      reset();
      onCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Alert variant="error">{error}</Alert>

      <FormSection title="Company Information" />
      <Controller
        name="logoUrl"
        control={control}
        render={({ field }) => (
          <ImageUpload label="Logo" value={field.value} onChange={field.onChange} shape="square" />
        )}
      />
      <div className={FIELD_GRID}>
        <div className="sm:col-span-2">
          <Input
            label="Company name"
            icon={FiBriefcase}
            placeholder="Meera Gold & Diamonds"
            error={errors.companyName?.message}
            {...register("companyName")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Short name (optional)"
            icon={FiBriefcase}
            placeholder="Used for sorting, e.g. Meera"
            error={errors.shortName?.message}
            {...register("shortName")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Owner name"
            icon={FiUser}
            placeholder="Priya Nair"
            error={errors.ownerName?.message}
            {...register("ownerName")}
          />
        </div>
        <Input
          label="GST number (optional)"
          icon={FiHash}
          placeholder="33ABCDE1234F1Z5"
          error={errors.gstNumber?.message}
          {...register("gstNumber")}
        />
        <Input
          label="PAN number (optional)"
          icon={FiHash}
          placeholder="ABCDE1234F"
          error={errors.panNumber?.message}
          {...register("panNumber")}
        />
        <div className="sm:col-span-2">
          <Input
            label="Business registration number (optional)"
            icon={FiHash}
            placeholder="CIN / registration no."
            error={errors.businessRegNumber?.message}
            {...register("businessRegNumber")}
          />
        </div>
      </div>

      <FormSection title="Contact Information" />
      <div className={FIELD_GRID}>
        <Input
          label="Email"
          type="email"
          icon={FiMail}
          placeholder="owner@brand.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Phone number"
          type="tel"
          icon={FiPhone}
          placeholder="9876543210"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label="Alternate phone (optional)"
          type="tel"
          icon={FiPhone}
          placeholder="9876500000"
          error={errors.alternatePhone?.message}
          {...register("alternatePhone")}
        />
        <Input
          label="Website (optional)"
          icon={FiGlobe}
          placeholder="https://brand.com"
          error={errors.website?.message}
          {...register("website")}
        />
      </div>

      <FormSection title="Address" description="All fields optional." />
      <div className={FIELD_GRID}>
        <div className="sm:col-span-2">
          <Input
            label="Address line 1"
            icon={FiMapPin}
            placeholder="Street, building"
            error={errors.addressLine1?.message}
            {...register("addressLine1")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Address line 2"
            icon={FiMapPin}
            placeholder="Area, landmark"
            error={errors.addressLine2?.message}
            {...register("addressLine2")}
          />
        </div>
        <Input label="City" error={errors.city?.message} {...register("city")} />
        <Input label="State" error={errors.state?.message} {...register("state")} />
        <Input label="Pincode" placeholder="600001" error={errors.pincode?.message} {...register("pincode")} />
        <Input label="Country" placeholder="India" error={errors.country?.message} {...register("country")} />
      </div>

      {!isEditing && (
        <p className="text-caption text-ink-muted">
          A Brand Admin login will be generated automatically for the email above once you create
          this brand.
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} fullWidth={false} className="px-8">
        {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create brand & generate login"}
      </Button>
      {isEditing && (
        <p className="text-caption text-ink-muted">
          Editing won&apos;t change the Brand Admin login — use &quot;Reset credentials&quot; from
          the list page for that.
        </p>
      )}
    </form>
  );
}

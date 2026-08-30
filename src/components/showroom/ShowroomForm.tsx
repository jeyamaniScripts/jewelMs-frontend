"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiUser, FiMail, FiPhone, FiMapPin, FiHome } from "react-icons/fi";

import { showroomSchema, type ShowroomFormValues } from "@/schemas/showroomSchemas";
import { createShowroom, updateShowroom } from "@/redux/slices/showroomSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Checkbox from "@/components/ui/Checkbox";

const FIELD_GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4";

interface ShowroomFormProps {
  onCreated: () => void;
  editingShowroomId?: string;
  defaultValues?: Partial<ShowroomFormValues>;
}

export default function ShowroomForm({ onCreated, editingShowroomId, defaultValues }: ShowroomFormProps) {
  const dispatch = useAppDispatch();
  const brandId = useAppSelector((state) => state.auth.user?.brandId);
  const { status, error } = useAppSelector((state) => state.showroom);
  const isSubmitting = status === "loading";
  const isEditing = !!editingShowroomId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShowroomFormValues>({
    resolver: zodResolver(showroomSchema),
    defaultValues: {
      showroomName: "",
      shortName: "",
      isMainBranch: false,
      managerName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      ...defaultValues,
    },
  });

  const onSubmit = async (formValues: ShowroomFormValues) => {
    if (isEditing) {
      const result = await dispatch(updateShowroom({ id: editingShowroomId, formData: formValues }));
      if (updateShowroom.fulfilled.match(result)) onCreated();
      return;
    }
    if (!brandId) return;
    const result = await dispatch(createShowroom({ brandId, formData: formValues }));
    if (createShowroom.fulfilled.match(result)) {
      reset();
      onCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Alert variant="error">{error}</Alert>

      <div className={FIELD_GRID}>
        <div className="sm:col-span-2">
          <Input
            label="Showroom name"
            icon={FiHome}
            placeholder="Anna Nagar Showroom"
            error={errors.showroomName?.message}
            {...register("showroomName")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Short name (optional)"
            icon={FiHome}
            placeholder="Used for sorting, e.g. Anna Nagar"
            error={errors.shortName?.message}
            {...register("shortName")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Showroom manager"
            icon={FiUser}
            placeholder="Mia Kapoor"
            error={errors.managerName?.message}
            {...register("managerName")}
          />
        </div>
        <Input
          label="Contact email"
          type="email"
          icon={FiMail}
          placeholder="manager@brand.com"
          error={errors.contactEmail?.message}
          {...register("contactEmail")}
        />
        <Input
          label="Contact phone"
          type="tel"
          icon={FiPhone}
          placeholder="9876543210"
          error={errors.contactPhone?.message}
          {...register("contactPhone")}
        />
        <div className="sm:col-span-2">
          <Input
            label="Address (optional)"
            icon={FiMapPin}
            placeholder="Area, City"
            error={errors.address?.message}
            {...register("address")}
          />
        </div>
      </div>

      <Checkbox
        label="This is the brand's main branch"
        // name="isMainBranch"
        {...register("isMainBranch")}
      />
      <p className="-mt-3 text-caption text-ink-muted">
        Only one showroom can be marked as the main branch — checking this unmarks any previous one.
      </p>

      {!isEditing && (
        <p className="text-caption text-ink-muted">
          A Showroom Admin login will be generated automatically for the contact email above.
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} fullWidth={false} className="px-8">
        {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create showroom & generate login"}
      </Button>
    </form>
  );
}

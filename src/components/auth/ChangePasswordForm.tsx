"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/schemas/changePasswordSchemas";
import { changePassword, clearAuthError } from "@/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function ChangePasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const isSubmitting = status === "loading";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    const result = await dispatch(changePassword(data));
    if (changePassword.fulfilled.match(result)) {
      onSuccess();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => error && dispatch(clearAuthError())}
      noValidate
      className="space-y-5"
    >
      <Alert variant="error">{error}</Alert>

      <PasswordInput
        label="Current password"
        placeholder="Enter your current password"
        error={errors.currentPassword?.message}
        {...register("currentPassword")}
      />
      <PasswordInput
        label="New password"
        placeholder="Create a new password"
        error={errors.newPassword?.message}
        {...register("newPassword")}
      />
      <PasswordInput
        label="Confirm new password"
        placeholder="Re-enter your new password"
        error={errors.confirmNewPassword?.message}
        {...register("confirmNewPassword")}
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}

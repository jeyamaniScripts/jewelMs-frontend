"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { resetPasswordSchema, type ResetPasswordFormValues } from "@/schemas/authSchemas";
import { resetPassword, clearAuthError } from "@/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const dispatch = useAppDispatch();
  const { status, error, passwordResetSuccess } = useAppSelector((state) => state.auth);
  const isLoading = status === "loading";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    const result = await dispatch(resetPassword({ ...data, token }));
    if (resetPassword.fulfilled.match(result)) {
      setTimeout(() => router.push("/login"), 1500);
    }
  };

  if (passwordResetSuccess) {
    return <Alert variant="success">Password updated. Redirecting you to sign in...</Alert>;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => error && dispatch(clearAuthError())}
      noValidate
      className="space-y-5"
    >
      <Alert variant="error">{error}</Alert>

      {!token && (
        <Alert variant="error">
          This reset link is missing or invalid. Request a new one from the{" "}
          <Link href="/forgot-password" className="underline">
            forgot password
          </Link>{" "}
          page.
        </Alert>
      )}

      <PasswordInput
        label="New password"
        placeholder="Create a new password"
        error={errors.password?.message}
        {...register("password")}
      />

      <PasswordInput
        label="Confirm new password"
        placeholder="Re-enter your new password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" isLoading={isLoading} disabled={!token}>
        {isLoading ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}

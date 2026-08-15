"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiMail, FiArrowLeft } from "react-icons/fi";

import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/schemas/authSchemas";
import { forgotPassword, clearAuthError, resetPasswordFlags } from "@/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function ForgotPasswordForm() {
  const dispatch = useAppDispatch();
  const { status, error, passwordResetEmailSent } = useAppSelector((state) => state.auth);
  const isLoading = status === "loading";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    dispatch(forgotPassword(data));
  };

  if (passwordResetEmailSent) {
    return (
      <div className="space-y-5 text-center">
        <Alert variant="success">A password reset link has been sent to your email.</Alert>
        <Link
          href="/login"
          onClick={() => dispatch(resetPasswordFlags())}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark"
        >
          <FiArrowLeft size={16} /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onChange={() => error && dispatch(clearAuthError())}
      noValidate
      className="space-y-5"
    >
      <Alert variant="error">{error}</Alert>

      <Input
        label="Email address"
        type="email"
        icon={FiMail}
        placeholder="you@ashirajewels.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Button type="submit" isLoading={isLoading}>
        {isLoading ? "Sending link..." : "Send reset link"}
      </Button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark"
      >
        <FiArrowLeft size={16} /> Back to sign in
      </Link>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiMail } from "react-icons/fi";

import { loginSchema, type LoginFormValues } from "@/schemas/authSchemas";
import { loginUser, clearAuthError } from "@/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ROLE_HOME_ROUTE } from "@/constants/roles";

import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const isLoading = status === "loading";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      router.push(ROLE_HOME_ROUTE[role] ?? "/dashboard");
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

      <Input
        label="Email address"
        type="email"
        icon={FiMail}
        placeholder="you@ashirajewels.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <PasswordInput
        label="Password"
        placeholder="Enter your password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-between">
        <Checkbox label="Remember me" {...register("rememberMe")} />
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" isLoading={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Registering the first time?{" "}
        <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
          Create Super Admin account
        </Link>
      </p>

      <p className="text-center text-caption text-ink-muted">
        First time here? Create the Super Admin account, then use it to sign in.
      </p>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiUser, FiMail, FiPhone } from "react-icons/fi";

import { registerSchema, type RegisterFormValues } from "@/schemas/authSchemas";
import { registerSuperAdmin, clearAuthError } from "@/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ROLE_HOME_ROUTE } from "@/constants/roles";

import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const isLoading = status === "loading";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      // zod's z.literal(true) types this field as `true`, but the checkbox
      // must default to unchecked — cast is safe, RHF/zod validate at runtime.
      terms: false as unknown as true,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    const result = await dispatch(registerSuperAdmin(data));
    if (registerSuperAdmin.fulfilled.match(result)) {
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
        label="Full name"
        icon={FiUser}
        placeholder="Jane Doe"
        error={errors.fullName?.message}
        {...register("fullName")}
      />

      <Input
        label="Email address"
        type="email"
        icon={FiMail}
        placeholder="you@ashirajewels.com"
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

      <PasswordInput
        label="Password"
        placeholder="Create a password"
        error={errors.password?.message}
        {...register("password")}
      />

      <PasswordInput
        label="Confirm password"
        placeholder="Re-enter your password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Checkbox
        label={
          <>
            I agree to the <span className="font-medium text-primary">Terms &amp; Conditions</span>
          </>
        }
        error={errors.terms?.message}
        {...register("terms")}
      />

      <Button type="submit" isLoading={isLoading}>
        {isLoading ? "Creating account..." : "Create Super Admin account"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </form>
  );
}

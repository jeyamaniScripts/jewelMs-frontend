import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password | Ashira Jewels Admin" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-h2">Forgot your password?</h1>
      <p className="mt-2 text-body text-ink-muted">
        Enter the email linked to your account and we&apos;ll send you a reset link.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

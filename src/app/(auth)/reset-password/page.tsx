import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset password | Ashira Jewels Admin" };

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="text-h2">Set a new password</h1>
      <p className="mt-2 text-body text-ink-muted">
        Choose a new password to finish resetting your account access.
      </p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

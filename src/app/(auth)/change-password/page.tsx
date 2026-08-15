"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { useAppSelector } from "@/redux/hooks";

export default function ChangePasswordPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const mustChangePassword = useAppSelector((state) => state.auth.user?.mustChangePassword);
  const sessionRestored = useAppSelector((state) => state.auth.sessionRestored);

  useEffect(() => {
    if (!sessionRestored) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!mustChangePassword) {
      // Nothing forcing a change — no reason to be here, send them on.
      router.replace("/dashboard");
    }
  }, [sessionRestored, isAuthenticated, mustChangePassword, router]);

  if (!isAuthenticated || !mustChangePassword) return null;

  return (
    <div>
      <h1 className="text-h2">Set a new password</h1>
      <p className="mt-2 text-body text-ink-muted">
        Your account was created with a temporary password. Set your own before continuing.
      </p>
      <div className="mt-8">
        <ChangePasswordForm onSuccess={() => router.push("/dashboard")} />
      </div>
    </div>
  );
}

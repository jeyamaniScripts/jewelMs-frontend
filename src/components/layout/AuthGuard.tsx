"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const mustChangePassword = useAppSelector((state) => state.auth.user?.mustChangePassword);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (mustChangePassword) {
      // Every system-generated temporary password forces this before
      // anything else in the dashboard is reachable.
      router.replace("/change-password");
    }
  }, [isAuthenticated, mustChangePassword, router]);

  if (!isAuthenticated || mustChangePassword) return null;

  return <>{children}</>;
}

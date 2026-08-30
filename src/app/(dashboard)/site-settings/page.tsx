"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

/** Bare /site-settings has no content of its own — send people to whichever
 *  child page makes sense for their role. Brand Admin lands on Company
 *  Details (the more commonly-needed page); Super Admin has no Company
 *  Details tab at all, so they go straight to Login Activity. */
export default function SiteSettingsIndexPage() {
  const router = useRouter();
  const role = useAppSelector((state) => state.auth.role);

  useEffect(() => {
    if (role === "brand_admin") {
      router.replace("/site-settings/company-details");
    } else {
      router.replace("/site-settings/login-activity");
    }
  }, [role, router]);

  return null;
}

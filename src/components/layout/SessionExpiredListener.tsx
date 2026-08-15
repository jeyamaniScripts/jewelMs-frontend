"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { setSessionExpiredHandler } from "@/lib/apiClient";
import { useAppDispatch } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/authSlice";
import { showToast } from "@/redux/slices/toastSlice";

export default function SessionExpiredListener() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSessionExpiredHandler(() => {
      dispatch(logoutUser());
      dispatch(showToast("Your session has expired. Please sign in again.", "warning"));
      if (!pathname.startsWith("/login")) {
        router.push("/login");
      }
    });
  }, [dispatch, router, pathname]);

  return null;
}

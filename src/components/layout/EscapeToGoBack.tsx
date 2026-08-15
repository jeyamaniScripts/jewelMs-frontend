"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EscapeToGoBack() {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;

      // If a modal is open, it already closes itself on Escape (see
      // Modal.tsx) — navigating back at the same time would be surprising,
      // so just let the modal handle it and do nothing here.
      if (document.querySelector('[role="dialog"]')) return;

      router.back();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return null;
}

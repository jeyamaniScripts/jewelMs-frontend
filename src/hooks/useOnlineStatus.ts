"use client";

import { useEffect, useState } from "react";

export function useOnlineStatus(): boolean {
  // Default to true so server-rendered HTML and the first client render
  // match (avoids a hydration mismatch) — the real value is set right after.
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

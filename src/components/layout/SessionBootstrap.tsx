"use client";

import { useEffect, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { restoreSession } from "@/redux/slices/authSlice";

export default function SessionBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const sessionRestored = useAppSelector((state) => state.auth.sessionRestored);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (!sessionRestored) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

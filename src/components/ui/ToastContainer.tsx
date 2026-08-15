"use client";

import { useEffect } from "react";
import { FiCheck, FiX, FiInfo, FiAlertTriangle } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { dismissToast, type Toast, type ToastVariant } from "@/redux/slices/toastSlice";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const VARIANT_CONFIG: Record<ToastVariant, { title: string; wrap: string; badge: string; Icon: typeof FiCheck }> = {
  success: {
    title: "Success!",
    wrap: "bg-success/10 border-success/30",
    badge: "bg-success",
    Icon: FiCheck,
  },
  error: {
    title: "Something Went Wrong!",
    wrap: "bg-danger/10 border-danger/30",
    badge: "bg-danger",
    Icon: FiX,
  },
  warning: {
    title: "Warning!",
    wrap: "bg-warning/10 border-warning/30",
    badge: "bg-warning",
    Icon: FiAlertTriangle,
  },
  info: {
    title: "Info",
    wrap: "bg-primary/10 border-primary/30",
    badge: "bg-primary",
    Icon: FiInfo,
  },
};

const AUTO_DISMISS_MS = 3000;

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();
  const { title, wrap, badge, Icon } = VARIANT_CONFIG[toast.variant];

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex w-80 max-w-[90vw] items-center gap-3 rounded-full border
        py-2 pl-2 pr-3 shadow-floating sm:w-96 ${wrap}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${badge}`}>
        <Icon size={17} strokeWidth={2.5} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-tight text-ink">{title}</span>
        <span className="block truncate text-caption leading-tight text-ink-muted">{toast.message}</span>
      </span>

      <button
        type="button"
        onClick={() => dispatch(dismissToast(toast.id))}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface hover:text-ink"
        aria-label="Dismiss"
      >
        <FiX size={15} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useAppSelector((state) => state.toast.toasts);
  const isOnline = useOnlineStatus();

  if (toasts.length === 0) return null;

  return (
    <div
      className={`pointer-events-none fixed right-4 z-[100] flex flex-col gap-2.5 sm:right-6
        ${isOnline ? "top-4 sm:top-6" : "top-12 sm:top-14"}`}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

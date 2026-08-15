"use client";

import type { ReactNode } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

type AlertVariant = "error" | "success";

interface AlertProps {
  variant?: AlertVariant;
  children?: ReactNode;
}

const VARIANT = {
  error: {
    wrap: "bg-danger/10 text-danger border-danger/20",
    Icon: FiAlertCircle,
  },
  success: {
    wrap: "bg-success/10 text-success border-success/20",
    Icon: FiCheckCircle,
  },
} as const;

export default function Alert({ variant = "error", children }: AlertProps) {
  if (!children) return null;
  const { wrap, Icon } = VARIANT[variant];

  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm ${wrap}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

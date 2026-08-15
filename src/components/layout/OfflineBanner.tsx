"use client";

import { MdWifiOff } from "react-icons/md";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[200] flex items-center justify-center gap-2 bg-danger px-4 py-2 text-center text-sm font-medium text-white">
      <MdWifiOff size={16} />
      You&apos;re offline — some pages won&apos;t load until your connection is back.
    </div>
  );
}

import type { ReactNode } from "react";
import AuthGuard from "@/components/layout/AuthGuard";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

/**
 * Fixed-height shell: Sidebar + (Navbar, scrollable main, Footer) all live
 * inside a single `h-screen overflow-hidden` frame. Only `<main>` scrolls —
 * the navbar stays pinned to the top and the footer stays pinned to the
 * bottom without needing separate sticky positioning tricks.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-surface-tint">
        <Sidebar />

        <div className="flex h-screen w-full flex-1 flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}

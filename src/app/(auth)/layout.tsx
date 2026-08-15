import type { ReactNode } from "react";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import ThemeToggle from "@/components/theme/ThemeToggle";

/**
 * The shell for all auth pages (Login, Register, Forgot Password, Reset Password).
 *
 * Desktop layout (lg+, >=1024px) — two EQUAL-width columns:
 *   ┌────────────────────┬────────────────────┐
 *   │  LEFT — form  50%  │  RIGHT — brand 50% │
 *   │  (scrollable)      │  illustration      │
 *   └────────────────────┴────────────────────┘
 *
 * Below lg (mobile + tablet):
 *   ┌─────────────────┐
 *   │  Form only      │  (brand panel hidden below 1024px)
 *   └─────────────────┘
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-surface">
      {/* LEFT — form content, scrolls independently of the brand panel */}
      <main className="flex max-h-screen w-full items-center justify-center overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 md:px-10 lg:w-1/2 lg:px-14">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between">
            {/* Logo — brand panel carries this on lg+, so this is for everything below lg */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-semibold text-white font-heading">
                A
              </div>
              <span className="font-heading text-lg font-medium text-ink">Ashira Jewels</span>
            </div>
            <ThemeToggle className="ml-auto" />
          </div>

          {children}
        </div>
      </main>

      {/* RIGHT — brand illustration, hidden below lg, equal 50% width at lg+ */}
      <AuthBrandPanel />
    </div>
  );
}

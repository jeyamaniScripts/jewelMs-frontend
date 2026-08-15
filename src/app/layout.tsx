import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import ReduxProvider from "@/redux/ReduxProvider";
import SessionBootstrap from "@/components/layout/SessionBootstrap";
import SessionExpiredListener from "@/components/layout/SessionExpiredListener";
import OfflineBanner from "@/components/layout/OfflineBanner";
import EscapeToGoBack from "@/components/layout/EscapeToGoBack";
import ToastContainer from "@/components/ui/ToastContainer";
import ThemeScript from "@/components/theme/ThemeScript";
import "./globals.css";

const heading = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-heading-sans",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-sans",
});

export const metadata: Metadata = {
  title: "Ashira Jewels Admin",
  description: "Multi-tenant admin panel for jewelry brands and showrooms",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs before hydration so the correct theme class is set on first
            paint — prevents a light -> dark flash when the user prefers dark. */}
        <ThemeScript />
      </head>
      <body>
        <ReduxProvider>
          <SessionBootstrap>
            {children}
            <SessionExpiredListener />
            <OfflineBanner />
            <EscapeToGoBack />
            <ToastContainer />
          </SessionBootstrap>
        </ReduxProvider>
      </body>
    </html>
  );
}

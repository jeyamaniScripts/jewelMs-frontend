"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SITE_SETTINGS, type SiteSettingsValues } from "@/constants/siteSettings";
import { fetchSiteSettings, SITE_SETTINGS_UPDATED_EVENT } from "@/lib/siteSettingsApi";
import { createSiteFormatters, type SiteFormatters } from "@/lib/siteFormatters";
import { useAppDispatch } from "@/redux/hooks";
import { showToast } from "@/redux/slices/toastSlice";

const SiteFormatContext = createContext<SiteFormatters>(
  createSiteFormatters(DEFAULT_SITE_SETTINGS),
);

export function useSiteFormatters() {
  return useContext(SiteFormatContext);
}

export default function SiteFormatProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const [settings, setSettings] = useState<SiteSettingsValues>(DEFAULT_SITE_SETTINGS);
  const formatters = useMemo(() => createSiteFormatters(settings), [settings]);

  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;

    const loadSettings = () => {
      controller?.abort();
      const requestController = new AbortController();
      controller = requestController;
      fetchSiteSettings(requestController.signal)
        .then(({ settings: currentSettings }) => {
          if (active) setSettings({ ...DEFAULT_SITE_SETTINGS, ...currentSettings });
        })
        .catch((error: unknown) => {
          if (!active || requestController.signal.aborted) return;
          const detail = error instanceof Error ? ` (${error.message})` : "";
          dispatch(
            showToast(
              `Could not load site formatting preferences${detail}; default formats are being used.`,
              "warning",
            ),
          );
        });
    };

    loadSettings();
    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, loadSettings);
    return () => {
      active = false;
      controller?.abort();
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, loadSettings);
    };
  }, [dispatch]);

  return (
    <SiteFormatContext.Provider value={formatters}>
      {children}
    </SiteFormatContext.Provider>
  );
}

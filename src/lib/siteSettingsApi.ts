import { apiRequest } from "@/lib/apiClient";
import type { SiteSettingsValues } from "@/constants/siteSettings";

export const SITE_SETTINGS_UPDATED_EVENT = "site-settings-updated";

export interface SiteSettingsResponse {
  scope: "platform" | "brand";
  settings: SiteSettingsValues;
}

export function fetchSiteSettings(signal?: AbortSignal) {
  return apiRequest<SiteSettingsResponse>("/site-settings/current", { signal });
}

export function saveSiteSettings(settings: Partial<SiteSettingsValues>) {
  return apiRequest<SiteSettingsResponse>("/site-settings/current", {
    method: "PUT",
    body: settings,
  }).then((response) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(SITE_SETTINGS_UPDATED_EVENT));
    }
    return response;
  });
}

export function resetSiteSettings() {
  return apiRequest<SiteSettingsResponse>("/site-settings/current", {
    method: "DELETE",
  }).then((response) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(SITE_SETTINGS_UPDATED_EVENT));
    }
    return response;
  });
}

export async function uploadSiteSettingsImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest<{ url: string }>("/uploads/image", {
    method: "POST",
    body: formData,
  });
}

export async function uploadLegacySiteSettingsImage(
  dataUrl: string,
  allowedFormats: string[] = ["jpg", "jpeg", "png", "webp", "gif"],
  maxFileSizeMb = 5,
) {
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error("Could not read the saved image");

  const blob = await response.blob();
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const extension = extensions[blob.type];
  if (
    !extension ||
    !allowedFormats.some((format) => format === extension || (extension === "jpg" && format === "jpeg")) ||
    blob.size > maxFileSizeMb * 1024 * 1024
  ) {
    throw new Error(`Saved image must use an allowed format and be no larger than ${maxFileSizeMb} MB`);
  }

  return uploadSiteSettingsImage(
    new File([blob], `site-settings-image.${extension}`, { type: blob.type }),
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MdCalendarMonth,
  MdLanguage,
  MdNumbers,
  MdOutlineInfo,
  MdRestartAlt,
  MdSave,
  MdWeb,
  MdContactPhone,
  MdShare,
} from "react-icons/md";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Dropdown from "@/components/ui/Dropdown";
import ImageUpload from "@/components/ui/ImageUpload";
import Input from "@/components/ui/Input";
import SearchableMultiSelect from "@/components/ui/SearchableMultiSelect";
import Tabs from "@/components/ui/Tabs";
import {
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  DEFAULT_SITE_SETTINGS,
  LANGUAGES_BY_COUNTRY,
  MONTH_OPTIONS,
  TIME_ZONE_OPTIONS,
  type SiteSettingsValues,
} from "@/constants/siteSettings";
import PageHeader from "@/components/layout/PageHeader";
import { ApiClientError, resolveApiAssetUrl } from "@/lib/apiClient";
import {
  fetchSiteSettings,
  resetSiteSettings,
  saveSiteSettings,
  uploadLegacySiteSettingsImage,
  uploadSiteSettingsImage,
} from "@/lib/siteSettingsApi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { showToast } from "@/redux/slices/toastSlice";

type Settings = SiteSettingsValues;
type TabId = "site-info" | "business-contact" | "social-profiles" | "date-time" | "formats";

const TABS = [
  { id: "site-info", label: "Site information", icon: MdWeb },
  { id: "business-contact", label: "Business & contact", icon: MdContactPhone },
  { id: "social-profiles", label: "Social profiles", icon: MdShare },
  { id: "date-time", label: "Date & time", icon: MdCalendarMonth },
  { id: "formats", label: "Regional formats", icon: MdNumbers },
];

const PRECISION_OPTIONS = ["0", "1", "2", "3", "4"].map((value) => ({
  value,
  label: `${value} ${value === "1" ? "decimal place" : "decimal places"}`,
}));
const IMAGE_FORMAT_OPTIONS = [
  { value: "jpg", label: "JPG" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
  { value: "gif", label: "GIF" },
];
const IMAGE_SIZE_OPTIONS = ["1", "2", "3", "4", "5", "10", "20"].map((value) => ({
  value,
  label: `${value} MB`,
}));

function formatDatePreview(date: Date, format: string, locale: string) {
  const parts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";

  switch (format) {
    case "MM/dd/yyyy":
      return `${month}/${day}/${year}`;
    case "yyyy-MM-dd":
      return `${year}-${month}-${day}`;
    case "dd MMM yyyy":
      return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
    default:
      return `${day}/${month}/${year}`;
  }
}

export default function AdminSettingsPage() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.role);
  const [activeTab, setActiveTab] = useState<TabId>("site-info");
  const [settings, setSettings] = useState<Settings>({ ...DEFAULT_SITE_SETTINGS });
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [uploadingAssets, setUploadingAssets] = useState<string[]>([]);
  const [settingsScope, setSettingsScope] = useState<"platform" | "brand">(
    role === "super_admin" ? "platform" : "brand",
  );
  const assetUploadIds = useRef<Record<string, number>>({});

  useEffect(() => {
    const controller = new AbortController();
    fetchSiteSettings(controller.signal)
      .then((response) => {
        setSettings({
          ...DEFAULT_SITE_SETTINGS,
          ...response.settings,
          languages: [...response.settings.languages],
          currencies: [...response.settings.currencies],
        });
        setSettingsScope(response.scope);
        setHasLoadedSettings(true);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        dispatch(
          showToast(
            error instanceof ApiClientError
              ? error.message
              : "Could not load site settings. Please try again.",
            "error",
          ),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [dispatch]);

  const country = COUNTRY_OPTIONS.find((option) => option.value === settings.country) ?? COUNTRY_OPTIONS[0]!;
  const countryLanguages = LANGUAGES_BY_COUNTRY[settings.country] ?? [];
  const availableDefaultLanguages = countryLanguages.filter((option) =>
    settings.languages.includes(option.value),
  );
  const [now] = useState(() => new Date());
  const locale = settings.language;
  const previews = useMemo(() => {
    const amount = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: settings.currency,
      minimumFractionDigits: Number(settings.amountDecimals),
      maximumFractionDigits: Number(settings.amountDecimals),
    }).format(1234567.89);
    const weight = new Intl.NumberFormat(locale, {
      minimumFractionDigits: Number(settings.weightDecimals),
      maximumFractionDigits: Number(settings.weightDecimals),
    }).format(12.34567);
    const quantity = new Intl.NumberFormat(locale, {
      minimumFractionDigits: Number(settings.quantityDecimals),
      maximumFractionDigits: Number(settings.quantityDecimals),
    }).format(1234.567);
    const time = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: settings.timeFormat === "12-hour",
      timeZone: settings.timezone,
    }).format(now);

    return {
      amount,
      weight,
      quantity,
      time,
      date: formatDatePreview(now, settings.dateFormat, locale),
    };
  }, [locale, now, settings.amountDecimals, settings.currency, settings.dateFormat, settings.quantityDecimals, settings.timeFormat, settings.timezone, settings.weightDecimals]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const changeCountry = (countryCode: string) => {
    const nextCountry = COUNTRY_OPTIONS.find((option) => option.value === countryCode);
    if (!nextCountry) return;
    const languages = LANGUAGES_BY_COUNTRY[countryCode] ?? [];
    const defaultLanguage =
      languages.find((language) => language.value === nextCountry.locale)?.value ??
      languages[0]?.value ??
      nextCountry.locale;
    setSettings((current) => ({
      ...current,
      country: countryCode,
      language: defaultLanguage,
      languages: [defaultLanguage],
      currency: nextCountry.currency,
      currencies: [nextCountry.currency],
      timezone: nextCountry.timeZone,
      financialYearStartMonth: nextCountry.financialYearStartMonth,
    }));
  };

  const changeLanguages = (languages: string[]) => {
    const nextLanguages = languages.length > 0 ? languages : [country.locale];
    setSettings((current) => ({
      ...current,
      languages: nextLanguages,
      language: nextLanguages.includes(current.language) ? current.language : nextLanguages[0]!,
      languageSwitcherEnabled:
        current.languageSwitcherEnabled && nextLanguages.length > 1,
    }));
  };

  const changeCurrencies = (currencies: string[]) => {
    const nextCurrencies = currencies.length > 0 ? currencies : [country.currency];
    setSettings((current) => ({
      ...current,
      currencies: nextCurrencies,
      currency: nextCurrencies.includes(current.currency) ? current.currency : nextCurrencies[0]!,
      currencySwitcherEnabled:
        current.currencySwitcherEnabled && nextCurrencies.length > 1,
    }));
  };

  const resetSettings = async () => {
    setIsResetting(true);
    try {
      const response = await resetSiteSettings();
      setSettings({
        ...DEFAULT_SITE_SETTINGS,
        ...response.settings,
        languages: [...response.settings.languages],
        currencies: [...response.settings.currencies],
      });
      setSettingsScope(response.scope);
      dispatch(
        showToast(
          response.scope === "brand"
            ? "Brand settings restored to platform defaults."
            : "Platform settings restored to system defaults.",
          "success",
        ),
      );
    } catch (error) {
      dispatch(
        showToast(
          error instanceof ApiClientError
            ? error.message
            : "Could not restore site settings. Please try again.",
          "error",
        ),
      );
    } finally {
      setIsResetting(false);
    }
  };

  const saveSettings = async () => {
    if (!hasLoadedSettings) return;
    setIsSaving(true);
    try {
      const imageKeys = ["favicon", "websiteLogo", "mobileLogo"] as const;
      const normalizedSettings = { ...settings };
      for (const key of imageKeys) {
        const value = normalizedSettings[key];
        if (value.startsWith("data:image/")) {
          const uploaded = await uploadLegacySiteSettingsImage(
            value,
            settings.imageFormats,
            Number(settings.maxImageSizeMb),
          );
          normalizedSettings[key] = uploaded.url;
        }
      }
      const response = await saveSiteSettings(normalizedSettings);
      setSettings({
        ...DEFAULT_SITE_SETTINGS,
        ...response.settings,
        languages: [...response.settings.languages],
        currencies: [...response.settings.currencies],
      });
      setSettingsScope(response.scope);
      dispatch(showToast("Site settings saved successfully.", "success"));
    } catch (error) {
      dispatch(
        showToast(
          error instanceof ApiClientError
            ? error.message
            : "Could not save site settings. Please try again.",
          "error",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAsset = async (
    key: "favicon" | "websiteLogo" | "mobileLogo",
    file: File,
  ) => {
    const requestId = (assetUploadIds.current[key] ?? 0) + 1;
    assetUploadIds.current[key] = requestId;
    setUploadingAssets((current) => current.includes(key) ? current : [...current, key]);
    try {
      const response = await uploadSiteSettingsImage(file);
      if (assetUploadIds.current[key] !== requestId) return;
      updateSetting(key, response.url);
      dispatch(showToast("Image uploaded. Save preferences to keep this change.", "success"));
    } catch (error) {
      if (assetUploadIds.current[key] !== requestId) return;
      dispatch(
        showToast(
          error instanceof ApiClientError
            ? error.message
            : "Could not upload image. Please try again.",
          "error",
        ),
      );
    } finally {
      if (assetUploadIds.current[key] === requestId) {
        setUploadingAssets((current) => current.filter((item) => item !== key));
      }
    }
  };

  const settingsAudience =
    settingsScope === "platform" ? "Platform defaults" : "Current brand settings";

  return (
    <div className="w-full">
      <PageHeader
        title="Admin Settings"
        subtitle={`Manage ${settingsScope === "platform" ? "platform defaults" : "this brand's"} site identity, regional preferences, and display formats.`}
      />

      <div className="mb-6 flex gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
        <MdOutlineInfo size={20} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-ink-muted">
          {settingsScope === "platform"
            ? "These are the defaults used when a brand has not set its own preferences."
            : "These settings apply to the current brand and override the platform defaults."}
          {" "}Updates are saved to the backend for {settingsScope === "platform" ? "the platform" : "this brand"}.
        </p>
      </div>

      {isLoading && (
        <p className="mb-4 text-sm text-ink-muted" role="status">Loading saved settings…</p>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <fieldset
            disabled={isLoading || isSaving || uploadingAssets.length > 0}
            className="min-w-0 border-0 p-0"
          >
          <Tabs
            items={TABS}
            activeId={activeTab}
            onChange={(tab) => setActiveTab(tab as TabId)}
          >
        {activeTab === "site-info" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MdWeb size={21} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">Site identity</h2>
                  <p className="mt-1 text-sm text-ink-muted">Basic information shown across your website and admin pages.</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  name="siteName"
                  label="Site name"
                  value={settings.siteName}
                  onChange={(event) => updateSetting("siteName", event.target.value)}
                  placeholder="Your site or business name"
                />
                <Input
                  name="siteUrl"
                  label="Website URL"
                  type="url"
                  value={settings.siteUrl}
                  onChange={(event) => updateSetting("siteUrl", event.target.value)}
                  placeholder="https://www.example.com"
                />
                <Input
                  name="mobileAppUrl"
                  label="Mobile app URL"
                  type="url"
                  value={settings.mobileAppUrl}
                  onChange={(event) => updateSetting("mobileAppUrl", event.target.value)}
                  placeholder="https://app.example.com"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-ink">Brand assets</h2>
                <p className="mt-1 text-sm text-ink-muted">Choose the images used for your site and mobile experience.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                <ImageUpload
                  label="Website logo"
                  value={settings.websiteLogo ? resolveApiAssetUrl(settings.websiteLogo) : undefined}
                  onChange={(value) => {
                    if (!value) updateSetting("websiteLogo", "");
                  }}
                  onFileSelected={(file) => void uploadAsset("websiteLogo", file)}
                  allowedFormats={settings.imageFormats}
                  maxFileSizeMb={Number(settings.maxImageSizeMb)}
                  helpText={uploadingAssets.includes("websiteLogo") ? "Uploading…" : `Allowed: ${settings.imageFormats.join(", ").toUpperCase()}, max ${settings.maxImageSizeMb} MB. Recommended: horizontal logo.`}
                />
                <ImageUpload
                  label="Mobile logo"
                  value={settings.mobileLogo ? resolveApiAssetUrl(settings.mobileLogo) : undefined}
                  onChange={(value) => {
                    if (!value) updateSetting("mobileLogo", "");
                  }}
                  onFileSelected={(file) => void uploadAsset("mobileLogo", file)}
                  allowedFormats={settings.imageFormats}
                  maxFileSizeMb={Number(settings.maxImageSizeMb)}
                  helpText={uploadingAssets.includes("mobileLogo") ? "Uploading…" : `Allowed: ${settings.imageFormats.join(", ").toUpperCase()}, max ${settings.maxImageSizeMb} MB. Optimized for mobile screens.`}
                />
                <ImageUpload
                  label="Favicon"
                  value={settings.favicon ? resolveApiAssetUrl(settings.favicon) : undefined}
                  onChange={(value) => {
                    if (!value) updateSetting("favicon", "");
                  }}
                  onFileSelected={(file) => void uploadAsset("favicon", file)}
                  allowedFormats={settings.imageFormats}
                  maxFileSizeMb={Number(settings.maxImageSizeMb)}
                  helpText={uploadingAssets.includes("favicon") ? "Uploading…" : `Allowed: ${settings.imageFormats.join(", ").toUpperCase()}, max ${settings.maxImageSizeMb} MB. Square icon for browser tabs.`}
                />
              </div>
              <div className="mt-6 grid gap-5 border-t border-border pt-5 sm:grid-cols-[minmax(0,1fr)_14rem]">
                <div>
                  <h3 className="text-sm font-medium text-ink">Allowed image formats</h3>
                  <p className="mt-1 text-caption text-ink-muted">Choose which formats and file size the site image uploader should accept. Save settings to apply the new policy.</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                    {IMAGE_FORMAT_OPTIONS.map((option) => {
                      const checked = settings.imageFormats.includes(option.value);
                      return (
                        <Checkbox
                          key={option.value}
                          name={`site-image-format-${option.value}`}
                          label={option.label}
                          checked={checked}
                          onChange={(event) => {
                            const nextFormats = event.target.checked
                              ? [...settings.imageFormats, option.value]
                              : settings.imageFormats.filter((format) => format !== option.value);
                            if (!nextFormats.length) {
                              dispatch(showToast("At least one image format must remain enabled.", "error"));
                              return;
                            }
                            updateSetting("imageFormats", nextFormats);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <Dropdown
                  label="Maximum image size"
                  options={IMAGE_SIZE_OPTIONS}
                  value={settings.maxImageSizeMb}
                  onChange={(value) => updateSetting("maxImageSizeMb", value)}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-ink">Search engine (SEO)</h2>
                <p className="mt-1 text-sm text-ink-muted">Default metadata for search results and link previews.</p>
              </div>
              <div className="space-y-5">
                <Input
                  name="seoTitle"
                  label="SEO title"
                  value={settings.seoTitle}
                  maxLength={70}
                  onChange={(event) => updateSetting("seoTitle", event.target.value)}
                  placeholder="A short title for search results"
                />
                <div>
                  <label htmlFor="seoDescription" className="mb-1.5 block text-sm font-medium text-ink">Meta description</label>
                  <textarea
                    id="seoDescription"
                    name="seoDescription"
                    rows={3}
                    maxLength={160}
                    value={settings.seoDescription}
                    onChange={(event) => updateSetting("seoDescription", event.target.value)}
                    placeholder="Describe your site in a sentence or two."
                    className="w-full resize-y rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="mt-1 text-xs text-ink-muted">{settings.seoDescription.length}/160 characters</p>
                </div>
                <Input
                  name="seoKeywords"
                  label="SEO keywords"
                  value={settings.seoKeywords}
                  onChange={(event) => updateSetting("seoKeywords", event.target.value)}
                  placeholder="jewellery, gold, diamonds"
                />
                <p className="-mt-4 text-xs text-ink-muted">Separate keywords with commas.</p>
              </div>
            </section>
          </div>
        )}

        {activeTab === "business-contact" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MdContactPhone size={21} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">Business contact details</h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Public contact information used on your site and customer communications.
                  </p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  name="businessEmail"
                  label="Business email"
                  type="email"
                  value={settings.businessEmail}
                  onChange={(event) => updateSetting("businessEmail", event.target.value)}
                  placeholder="contact@example.com"
                />
                <Input
                  name="businessPhone"
                  label="Business phone"
                  type="tel"
                  value={settings.businessPhone}
                  onChange={(event) => updateSetting("businessPhone", event.target.value)}
                  placeholder="+91 98765 43210"
                />
                <Input
                  name="whatsappBusinessNumber"
                  label="WhatsApp Business number"
                  type="tel"
                  value={settings.whatsappBusinessNumber}
                  onChange={(event) => updateSetting("whatsappBusinessNumber", event.target.value)}
                  placeholder="+91 98765 43210"
                />
                <Input
                  name="whatsappBusinessAccountId"
                  label="WhatsApp Business Account ID"
                  value={settings.whatsappBusinessAccountId}
                  onChange={(event) => updateSetting("whatsappBusinessAccountId", event.target.value)}
                  placeholder="Meta WhatsApp Business Account ID"
                />
              </div>
              <p className="mt-4 rounded-xl bg-surface-tint p-3 text-caption text-ink-muted">
                These are business profile details only. Provider access tokens and API secrets must not be stored in public site settings.
              </p>
            </section>
          </div>
        )}

        {activeTab === "social-profiles" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MdShare size={21} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">Social media profiles</h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    Add the public profile URLs you want customers to find. Leave unused profiles blank.
                  </p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  name="facebookUrl"
                  label="Facebook"
                  type="url"
                  value={settings.facebookUrl}
                  onChange={(event) => updateSetting("facebookUrl", event.target.value)}
                  placeholder="https://www.facebook.com/yourbrand"
                />
                <Input
                  name="instagramUrl"
                  label="Instagram"
                  type="url"
                  value={settings.instagramUrl}
                  onChange={(event) => updateSetting("instagramUrl", event.target.value)}
                  placeholder="https://www.instagram.com/yourbrand"
                />
                <Input
                  name="youtubeUrl"
                  label="YouTube"
                  type="url"
                  value={settings.youtubeUrl}
                  onChange={(event) => updateSetting("youtubeUrl", event.target.value)}
                  placeholder="https://www.youtube.com/@yourbrand"
                />
                <Input
                  name="xUrl"
                  label="X"
                  type="url"
                  value={settings.xUrl}
                  onChange={(event) => updateSetting("xUrl", event.target.value)}
                  placeholder="https://x.com/yourbrand"
                />
                <Input
                  name="linkedinUrl"
                  label="LinkedIn"
                  type="url"
                  value={settings.linkedinUrl}
                  onChange={(event) => updateSetting("linkedinUrl", event.target.value)}
                  placeholder="https://www.linkedin.com/company/yourbrand"
                />
                <Input
                  name="tiktokUrl"
                  label="TikTok"
                  type="url"
                  value={settings.tiktokUrl}
                  onChange={(event) => updateSetting("tiktokUrl", event.target.value)}
                  placeholder="https://www.tiktok.com/@yourbrand"
                />
                <Input
                  name="pinterestUrl"
                  label="Pinterest"
                  type="url"
                  value={settings.pinterestUrl}
                  onChange={(event) => updateSetting("pinterestUrl", event.target.value)}
                  placeholder="https://www.pinterest.com/yourbrand"
                />
              </div>
            </section>
          </div>
        )}

        {activeTab === "date-time" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MdCalendarMonth size={21} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">Date & time</h2>
                  <p className="mt-1 text-sm text-ink-muted">Control how dates, times, and financial periods appear in your workspace.</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Dropdown
                  label="Time zone"
                  options={TIME_ZONE_OPTIONS}
                  value={settings.timezone}
                  onChange={(value) => updateSetting("timezone", value)}
                />
                <Dropdown
                  label="Date format"
                  options={DATE_FORMAT_OPTIONS}
                  value={settings.dateFormat}
                  onChange={(value) => updateSetting("dateFormat", value)}
                />
                <Dropdown
                  label="Time format"
                  options={[
                    { value: "12-hour", label: "12-hour — 2:05 PM" },
                    { value: "24-hour", label: "24-hour — 14:05" },
                  ]}
                  value={settings.timeFormat}
                  onChange={(value) => updateSetting("timeFormat", value)}
                />
                <Dropdown
                  label="Financial year starts in"
                  options={MONTH_OPTIONS}
                  value={settings.financialYearStartMonth}
                  onChange={(value) => updateSetting("financialYearStartMonth", value)}
                />
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <h2 className="text-base font-semibold text-ink">Date and time preview</h2>
              <p className="mt-1 text-sm text-ink-muted">Example using your current date, time zone, and format choices.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-tint p-4">
                  <p className="text-xs font-medium text-ink-muted">Date</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{previews.date}</p>
                </div>
                <div className="rounded-xl bg-surface-tint p-4">
                  <p className="text-xs font-medium text-ink-muted">Time ({settings.timezone})</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{previews.time}</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === "formats" && (
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MdLanguage size={21} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">Country & languages</h2>
                  <p className="mt-1 text-sm text-ink-muted">Choose a country first to see the languages available for that region.</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Dropdown
                  label="Country or region"
                  options={COUNTRY_OPTIONS}
                  value={settings.country}
                  onChange={changeCountry}
                />
                <Dropdown
                  label="Default language"
                  options={availableDefaultLanguages.map(({ value, label, description }) => ({
                    value,
                    label: description ? `${label} — ${description}` : label,
                  }))}
                  value={settings.language}
                  onChange={(value) => updateSetting("language", value)}
                />
                <div className="sm:col-span-1">
                  <SearchableMultiSelect
                    name="availableLanguages"
                    label="Languages available to users"
                    value={settings.languages}
                    options={countryLanguages}
                    onChange={changeLanguages}
                    pageSize={20}
                    placeholder="Choose languages"
                    searchPlaceholder="Search languages..."
                  />
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                    India includes English and all 22 languages listed in the Eighth Schedule.
                    UAE includes Arabic and English. This config prepares choices; app translations
                    need language content before they can be switched at runtime.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <Checkbox
                    name="languageSwitcherEnabled"
                    disabled={settings.languages.length < 2}
                    checked={settings.languageSwitcherEnabled}
                    onChange={(event) => updateSetting("languageSwitcherEnabled", event.target.checked)}
                    label={
                      <span>
                        <span className="block font-medium text-ink">Enable language switcher</span>
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          Allow users to change between the languages selected above.
                        </span>
                      </span>
                    }
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <MdNumbers size={21} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-ink">Currency & precision</h2>
                  <p className="mt-1 text-sm text-ink-muted">Configure currency display and decimal places for different values.</p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Dropdown
                  label="Default currency"
                  options={CURRENCY_OPTIONS.filter((option) => settings.currencies.includes(option.value))}
                  value={settings.currency}
                  onChange={(value) => updateSetting("currency", value)}
                />
                <SearchableMultiSelect
                  name="availableCurrencies"
                  label="Currencies available to users"
                  value={settings.currencies}
                  options={CURRENCY_OPTIONS.map((option) => ({ ...option }))}
                  onChange={changeCurrencies}
                  placeholder="Choose currencies"
                  searchPlaceholder="Search currencies..."
                />
                <div className="sm:col-span-2">
                  <Checkbox
                    name="currencySwitcherEnabled"
                    disabled={settings.currencies.length < 2}
                    checked={settings.currencySwitcherEnabled}
                    onChange={(event) => updateSetting("currencySwitcherEnabled", event.target.checked)}
                    label={
                      <span>
                        <span className="block font-medium text-ink">Enable currency switcher</span>
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          Allow users to choose a display currency. This does not convert stored amounts.
                        </span>
                      </span>
                    }
                  />
                </div>
                <Dropdown
                  label="Amount decimal places"
                  options={PRECISION_OPTIONS}
                  value={settings.amountDecimals}
                  onChange={(value) => updateSetting("amountDecimals", value)}
                />
                <Dropdown
                  label="Weight decimal places"
                  options={PRECISION_OPTIONS}
                  value={settings.weightDecimals}
                  onChange={(value) => updateSetting("weightDecimals", value)}
                />
                <Dropdown
                  label="Quantity decimal places"
                  options={PRECISION_OPTIONS}
                  value={settings.quantityDecimals}
                  onChange={(value) => updateSetting("quantityDecimals", value)}
                />
              </div>
              <div className="mt-5 grid gap-3 rounded-xl bg-surface-tint p-4 sm:grid-cols-3">
                <PreviewValue label="Amount" value={previews.amount} />
                <PreviewValue label="Weight" value={`${previews.weight} g`} />
                <PreviewValue label="Quantity" value={previews.quantity} />
              </div>
            </section>
          </div>
          )}
          </Tabs>
          </fieldset>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              fullWidth={false}
              className="gap-2"
              onClick={resetSettings}
              isLoading={isResetting}
              disabled={isLoading || isSaving || isResetting || uploadingAssets.length > 0}
            >
              <MdRestartAlt size={18} />
              Restore defaults
            </Button>
            <Button
              type="button"
              fullWidth={false}
              className="gap-2"
              onClick={saveSettings}
              isLoading={isSaving}
              disabled={isLoading || isResetting || !hasLoadedSettings || uploadingAssets.length > 0}
            >
              <MdSave size={18} />
              Save preferences
            </Button>
          </div>
        </div>

        <aside
          dir={settings.language.startsWith("ar") ? "rtl" : "ltr"}
          className="rounded-2xl border border-border bg-surface p-5 shadow-card xl:sticky xl:top-6"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-ink">Live preview</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {settingsAudience}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-muted">Updates as you edit settings.</p>

          <div className="mt-5 rounded-xl border border-border bg-surface-tint p-4">
            <div className="flex items-center gap-3">
              {settings.websiteLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resolveApiAssetUrl(settings.websiteLogo)} alt="" className="size-10 rounded-lg border border-border bg-surface object-contain p-1" />
              ) : (
                <span className="grid size-10 place-items-center rounded-lg bg-primary text-white">
                  <MdWeb size={20} />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{settings.siteName || "Your site name"}</p>
                <p className="truncate text-xs text-ink-muted">{settings.siteUrl || "Website URL not set"}</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 border-t border-border pt-3">
              <PreviewValue label="Date" value={previews.date} />
              <PreviewValue label="Time" value={`${previews.time} (${settings.timezone})`} />
              <PreviewValue label="Currency" value={previews.amount} />
              <PreviewValue label="Weight" value={`${previews.weight} g`} />
              <PreviewValue label="Quantity" value={previews.quantity} />
              <PreviewValue label="Country" value={country.label} />
              <PreviewValue
                label="Language switcher"
                value={settings.languageSwitcherEnabled ? "Enabled" : "Disabled"}
              />
              <PreviewValue
                label="Currency switcher"
                value={settings.currencySwitcherEnabled ? "Enabled" : "Disabled"}
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Search preview</p>
            <p className="mt-2 line-clamp-1 text-sm font-semibold text-primary">
              {settings.seoTitle || settings.siteName || "Your site title"}
            </p>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ink-muted">
              {settings.seoDescription || "Your site description will appear here in search results."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PreviewValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

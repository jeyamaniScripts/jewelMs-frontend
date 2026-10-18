export interface SiteSettingOption {
  value: string;
  label: string;
}

export interface SearchableSettingOption extends SiteSettingOption {
  description?: string;
}

export interface CountrySetting extends SiteSettingOption {
  locale: string;
  currency: string;
  timeZone: string;
  financialYearStartMonth: string;
}

export interface SiteSettingsValues {
  siteName: string;
  siteUrl: string;
  mobileAppUrl: string;
  businessEmail: string;
  businessPhone: string;
  whatsappBusinessNumber: string;
  whatsappBusinessAccountId: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  xUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;
  pinterestUrl: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  favicon: string;
  websiteLogo: string;
  mobileLogo: string;
  imageFormats: string[];
  maxImageSizeMb: string;
  country: string;
  language: string;
  languages: string[];
  languageSwitcherEnabled: boolean;
  currency: string;
  currencies: string[];
  currencySwitcherEnabled: boolean;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  financialYearStartMonth: string;
  amountDecimals: string;
  weightDecimals: string;
  quantityDecimals: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsValues = {
  siteName: "Ashira Jewels",
  siteUrl: "",
  mobileAppUrl: "",
  businessEmail: "",
  businessPhone: "",
  whatsappBusinessNumber: "",
  whatsappBusinessAccountId: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  xUrl: "",
  linkedinUrl: "",
  tiktokUrl: "",
  pinterestUrl: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  favicon: "",
  websiteLogo: "",
  mobileLogo: "",
  imageFormats: ["jpg", "jpeg", "png", "webp", "gif"],
  maxImageSizeMb: "5",
  country: "IN",
  language: "en-IN",
  languages: ["en-IN"],
  languageSwitcherEnabled: false,
  currency: "INR",
  currencies: ["INR"],
  currencySwitcherEnabled: false,
  timezone: "Asia/Kolkata",
  dateFormat: "dd/MM/yyyy",
  timeFormat: "12-hour",
  financialYearStartMonth: "3",
  amountDecimals: "2",
  weightDecimals: "3",
  quantityDecimals: "0",
};

export const COUNTRY_OPTIONS: CountrySetting[] = [
  {
    value: "IN",
    label: "India",
    locale: "en-IN",
    currency: "INR",
    timeZone: "Asia/Kolkata",
    financialYearStartMonth: "3",
  },
  {
    value: "AE",
    label: "United Arab Emirates",
    locale: "en-AE",
    currency: "AED",
    timeZone: "Asia/Dubai",
    financialYearStartMonth: "0",
  },
];

export const LANGUAGES_BY_COUNTRY: Record<string, SearchableSettingOption[]> = {
  IN: [
    { value: "en-IN", label: "English", description: "English" },
    { value: "as-IN", label: "Assamese", description: "অসমীয়া" },
    { value: "bn-IN", label: "Bengali", description: "বাংলা" },
    { value: "brx-IN", label: "Bodo", description: "बड़ो" },
    { value: "doi-IN", label: "Dogri", description: "डोगरी" },
    { value: "gu-IN", label: "Gujarati", description: "ગુજરાતી" },
    { value: "hi-IN", label: "Hindi", description: "हिन्दी" },
    { value: "kn-IN", label: "Kannada", description: "ಕನ್ನಡ" },
    { value: "ks-IN", label: "Kashmiri", description: "कॉशुर" },
    { value: "kok-IN", label: "Konkani", description: "कोंकणी" },
    { value: "mai-IN", label: "Maithili", description: "मैथिली" },
    { value: "ml-IN", label: "Malayalam", description: "മലയാളം" },
    { value: "mni-IN", label: "Manipuri (Meitei)", description: "মৈতৈলোন্" },
    { value: "mr-IN", label: "Marathi", description: "मराठी" },
    { value: "ne-IN", label: "Nepali", description: "नेपाली" },
    { value: "or-IN", label: "Odia", description: "ଓଡ଼ିଆ" },
    { value: "pa-IN", label: "Punjabi", description: "ਪੰਜਾਬੀ" },
    { value: "sa-IN", label: "Sanskrit", description: "संस्कृतम्" },
    { value: "sat-IN", label: "Santali", description: "ᱥᱟᱱᱛᱟᱲᱤ" },
    { value: "sd-IN", label: "Sindhi", description: "سنڌي" },
    { value: "ta-IN", label: "Tamil", description: "தமிழ்" },
    { value: "te-IN", label: "Telugu", description: "తెలుగు" },
    { value: "ur-IN", label: "Urdu", description: "اردو" },
  ],
  AE: [
    { value: "ar-AE", label: "Arabic", description: "العربية" },
    { value: "en-AE", label: "English", description: "English" },
  ],
};

export const CURRENCY_OPTIONS: SiteSettingOption[] = [
  { value: "INR", label: "Indian Rupee (INR ₹)" },
  { value: "AED", label: "UAE Dirham (AED د.إ)" },
  { value: "USD", label: "US Dollar (USD $)" },
  { value: "GBP", label: "British Pound (GBP £)" },
  { value: "EUR", label: "Euro (EUR €)" },
  { value: "SGD", label: "Singapore Dollar (SGD $)" },
];

export const TIME_ZONE_OPTIONS: SiteSettingOption[] = [
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)" },
  { value: "Europe/London", label: "United Kingdom (GMT/BST)" },
  { value: "America/New_York", label: "US Eastern Time (ET)" },
];

export const DATE_FORMAT_OPTIONS: SiteSettingOption[] = [
  { value: "dd/MM/yyyy", label: "DD/MM/YYYY — 27/09/2026" },
  { value: "MM/dd/yyyy", label: "MM/DD/YYYY — 09/27/2026" },
  { value: "yyyy-MM-dd", label: "YYYY-MM-DD — 2026-09-27" },
  { value: "dd MMM yyyy", label: "DD MMM YYYY — 27 Sep 2026" },
];

export const MONTH_OPTIONS: SiteSettingOption[] = Array.from({ length: 12 }, (_, month) => ({
  value: String(month),
  label: new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(2026, month, 1)),
}));

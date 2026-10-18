import { z } from "zod";

export const SUPPLIER_TYPE_OPTIONS = [
  { value: "manufacturer", label: "Manufacturer" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "karigar", label: "Karigar (Artisan)" },
  { value: "gemstone_dealer", label: "Gemstone Dealer" },
  { value: "bullion_dealer", label: "Bullion Dealer" },
  { value: "other", label: "Other" },
] as const;

export const BUSINESS_TYPE_OPTIONS = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "private_limited", label: "Private Limited" },
  { value: "llp", label: "LLP" },
  { value: "individual", label: "Individual" },
  { value: "other", label: "Other" },
] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function numericString() {
  return z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || !isNaN(Number(v)), { message: "Enter a valid number" });
}

export const supplierSchema = z
  .object({
    branchId: z.string().optional().or(z.literal("")),
    companyId: z.string().optional().or(z.literal("")),

    supplierName: z.string().min(2, "Supplier name must be at least 2 characters").max(120, "Too long"),
    supplierCode: z
      .string()
      .min(2, "Code must be at least 2 characters")
      .max(20, "Too long")
      .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
    supplierType: z.enum(
      ["manufacturer", "wholesaler", "karigar", "gemstone_dealer", "bullion_dealer", "other"],
      { message: "Select a supplier type" }
    ),
    categoryIds: z.array(z.string()),
    contactPerson: z.string().max(100, "Too long").optional().or(z.literal("")),
    phone: z.string().min(6, "Enter a valid phone number").max(20, "Too long"),
    alternatePhone: z.string().max(20, "Too long").optional().or(z.literal("")),
    email: z.string().regex(EMAIL_REGEX, "Enter a valid email").optional().or(z.literal("")),

    street: z.string().max(200, "Too long").optional().or(z.literal("")),
    city: z.string().max(80, "Too long").optional().or(z.literal("")),
    state: z.string().max(80, "Too long").optional().or(z.literal("")),
    pincode: z.string().max(12, "Too long").optional().or(z.literal("")),
    country: z.string().max(80, "Too long").optional().or(z.literal("")),

    gstNumber: z.string().max(20, "Too long").optional().or(z.literal("")),
    panNumber: z.string().max(10, "Too long").optional().or(z.literal("")),
    businessType: z
      .enum(["proprietorship", "partnership", "private_limited", "llp", "individual", "other"])
      .optional()
      .or(z.literal("")),
    hallmarkLicenseNumber: z.string().max(40, "Too long").optional().or(z.literal("")),

    accountHolderName: z.string().max(120, "Too long").optional().or(z.literal("")),
    accountNumber: z.string().max(30, "Too long").optional().or(z.literal("")),
    ifscCode: z.string().max(15, "Too long").optional().or(z.literal("")),
    bankName: z.string().max(120, "Too long").optional().or(z.literal("")),
    branchName: z.string().max(120, "Too long").optional().or(z.literal("")),

    openingBalance: numericString(),
    currentBalance: numericString(),
    openingWeight: numericString(),
    currentWeight: numericString(),
    creditPeriod: numericString(),
    paymentTerms: z.string().max(60, "Too long").optional().or(z.literal("")),

    supplierImages: z.array(z.string()).optional(),
    visitingCard: z.string().optional(),

    isBlacklisted: z.boolean(),
    blacklistReason: z.string().max(500, "Too long").optional().or(z.literal("")),
    notes: z.string().max(2000, "Too long").optional().or(z.literal("")),
  })
  .refine((data) => !data.isBlacklisted || !!data.blacklistReason, {
    message: "Blacklist reason is required when marking a supplier as blacklisted",
    path: ["blacklistReason"],
  });

export type SupplierFormValues = z.infer<typeof supplierSchema>;
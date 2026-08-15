import { z } from "zod";
import { PATTERNS, MESSAGES } from "@/lib/validationPatterns";

const optionalText = (max: number) => z.string().max(max, "Too long").optional().or(z.literal(""));

export const brandSchema = z.object({
  // Company info
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(80, "Too long"),
  shortName: z.string().max(80, "Too long").optional().or(z.literal("")),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters").max(60, "Too long"),
  gstNumber: z.string().regex(PATTERNS.gst, MESSAGES.gst).optional().or(z.literal("")),
  panNumber: z.string().regex(PATTERNS.pan, MESSAGES.pan).optional().or(z.literal("")),
  businessRegNumber: optionalText(30),

  // Contact
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().min(1, "Phone number is required").regex(PATTERNS.phone10, MESSAGES.phone10),
  alternatePhone: z.string().regex(PATTERNS.phone10, MESSAGES.phone10).optional().or(z.literal("")),
  website: z.string().url("Enter a valid URL (include https://)").optional().or(z.literal("")),
  logoUrl: z.string().optional(),

  // Address
  addressLine1: optionalText(100),
  addressLine2: optionalText(100),
  city: optionalText(50),
  state: optionalText(50),
  pincode: z.string().regex(PATTERNS.pincode, MESSAGES.pincode).optional().or(z.literal("")),
  country: optionalText(50),
});

export type BrandFormValues = z.infer<typeof brandSchema>;

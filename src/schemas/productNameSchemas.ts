import { z } from "zod";

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unisex", label: "Unisex" },
  { value: "kids", label: "Kids" },
] as const;

export const METAL_TYPE_OPTIONS = [
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "platinum", label: "Platinum" },
  { value: "diamond", label: "Diamond" },
  { value: "other", label: "Other" },
] as const;

function numericString() {
  return z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Enter a valid number",
    });
}

export const productNameSchema = z.object({
  productGroupId: z.string().min(1, "Select a product group"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Too long"),
  gender: z.enum(["male", "female", "unisex", "kids"], {
    message: "Select a gender",
  }),
  metalType: z.enum(["gold", "silver", "platinum", "diamond", "other"], {
    message: "Select a metal type",
  }),
  tagNumber: z
    .string()
    .max(30, "Too long")
    .regex(/^[A-Za-z0-9-]*$/, "Use letters, numbers, and hyphens only")
    .optional()
    .or(z.literal("")),
  openingWeight: numericString(),
  openingAmount: numericString(),
  isPartialProduct: z.boolean(),
  hasSupplierPayment: z.boolean(),
  productImageUrl: z.string().optional(),
});

export type ProductNameFormValues = z.infer<typeof productNameSchema>;

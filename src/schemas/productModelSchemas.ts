import { z } from "zod";

export const PURITY_OPTIONS = [
  { value: "24K", label: "24K" },
  { value: "22K", label: "22K" },
  { value: "18K", label: "18K" },
  { value: "14K", label: "14K" },
  { value: "916", label: "916 Hallmark" },
  { value: "750", label: "750 Hallmark" },
  { value: "custom", label: "Custom" },
] as const;

export const MAKING_CHARGE_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage" },
  { value: "per_gram", label: "Per gram" },
  { value: "fixed", label: "Fixed amount" },
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

export const stoneDetailSchema = z.object({
  stoneType: z.string().min(1, "Stone type is required").max(40, "Too long"),
  approxWeight: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Enter a valid weight",
    }),
  includedInPrice: z.boolean(),
});

export const productModelSchema = z
  .object({
    productNameId: z.string().min(1, "Select a product name"),
    modelCode: z
      .string()
      .min(2, "Code must be at least 2 characters")
      .max(20, "Too long")
      .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
    modelName: z
      .string()
      .min(2, "Model name must be at least 2 characters")
      .max(100, "Too long"),
    purity: z.enum(["24K", "22K", "18K", "14K", "916", "750", "custom"], {
      message: "Select a purity",
    }),
    grossWeightMin: z
      .string()
      .min(1, "Enter a minimum weight")
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
        message: "Enter a valid weight",
      }),
    grossWeightMax: z
      .string()
      .min(1, "Enter a maximum weight")
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
        message: "Enter a valid weight",
      }),
    // Overrides the Product Group defaults — left blank means "inherit".
    makingChargeType: z
      .enum(["percentage", "per_gram", "fixed"])
      .optional()
      .or(z.literal("")),
    makingChargeValue: numericString(),
    wastagePercent: numericString(),
    hasStones: z.boolean(),
    stoneDetails: z.array(stoneDetailSchema).optional(),
    requiresHuid: z.boolean(),
    images: z.array(z.string()).optional(),
  })
  .refine(
    (data) => Number(data.grossWeightMin) <= Number(data.grossWeightMax),
    {
      message: "Min weight can't be greater than max weight",
      path: ["grossWeightMax"],
    },
  )
  .refine(
    (data) =>
      !data.hasStones || (data.stoneDetails && data.stoneDetails.length > 0),
    {
      message: 'Add at least one stone detail, or turn off "Has stones"',
      path: ["stoneDetails"],
    },
  );

export type ProductModelFormValues = z.infer<typeof productModelSchema>;

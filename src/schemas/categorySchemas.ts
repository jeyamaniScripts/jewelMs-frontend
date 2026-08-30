import { z } from "zod";

export const METAL_TYPE_OPTIONS = [
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "platinum", label: "Platinum" },
  { value: "diamond", label: "Diamond" },
  { value: "other", label: "Other" },
] as const;

export const categorySchema = z.object({
  categoryName: z.string().min(2, "Category name must be at least 2 characters").max(80, "Too long"),
  categoryCode: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Too long")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
  // metalType: z.enum(["gold", "silver", "platinum", "diamond", "other"], {
  //   errorMap: () => ({ message: "Select a metal type" }),
  // }),

  metalType: z.enum(["gold", "silver", "platinum", "diamond", "other"], "Select a metal type"),
  hsnCode: z.string().max(20, "Too long").optional().or(z.literal("")),
  defaultGstRate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100), {
      message: "Enter a value between 0 and 100",
    }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

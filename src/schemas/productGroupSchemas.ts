import { z } from "zod";

export const MAKING_CHARGE_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage" },
  { value: "per_gram", label: "Per gram" },
  { value: "fixed", label: "Fixed amount" },
] as const;

export const productGroupSchema = z.object({
  categoryId: z.string().min(1, "Select a category"),
  groupName: z.string().min(2, "Group name must be at least 2 characters").max(80, "Too long"),
  groupCode: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(10, "Too long")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only"),
  defaultMakingChargeType: z.enum(["percentage", "per_gram", "fixed"], {
    errorMap: () => ({ message: "Select a making charge type" }),
  }),
  defaultMakingChargeValue: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Enter a valid amount",
    }),
  defaultWastagePercent: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100), {
      message: "Enter a value between 0 and 100",
    }),
  groupImageUrl: z.string().optional(),
});

export type ProductGroupFormValues = z.infer<typeof productGroupSchema>;
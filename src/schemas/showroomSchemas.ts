import { z } from "zod";

export const showroomSchema = z.object({
  showroomName: z.string().min(2, "Showroom name must be at least 2 characters").max(80, "Too long"),
  shortName: z.string().max(80, "Too long").optional().or(z.literal("")),
  isMainBranch: z.boolean().optional(),
  managerName: z.string().min(2, "Manager name must be at least 2 characters").max(60, "Too long"),
  contactEmail: z.string().min(1, "Email is required").email("Enter a valid email address"),
  contactPhone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  address: z.string().max(200, "Too long").optional().or(z.literal("")),
});

export type ShowroomFormValues = z.infer<typeof showroomSchema>;

import { z } from "zod";
import { PATTERNS, MESSAGES } from "@/lib/validationPatterns";

const optionalText = (max: number) => z.string().max(max, "Too long").optional().or(z.literal(""));

export const employeeSchema = z
  .object({
    // Personal
    firstName: z.string().min(1, "First name is required").max(40, "Too long"),
    lastName: z.string().min(1, "Last name is required").max(40, "Too long"),
    profilePhotoUrl: z.string().optional(),
    gender: z.enum(["male", "female", "other", ""]).optional(),
    dateOfBirth: z.string().optional().or(z.literal("")),

    // Contact
    mobile: z.string().min(1, "Mobile number is required").regex(PATTERNS.phone10, MESSAGES.phone10),
    alternateMobile: z.string().regex(PATTERNS.phone10, MESSAGES.phone10).optional().or(z.literal("")),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),

    // Address
    addressLine1: optionalText(100),
    addressLine2: optionalText(100),
    city: optionalText(50),
    state: optionalText(50),
    pincode: z.string().regex(PATTERNS.pincode, MESSAGES.pincode).optional().or(z.literal("")),
    country: optionalText(50),

    // Identity documents
    aadhaarNumber: z.string().regex(PATTERNS.aadhaar, MESSAGES.aadhaar).optional().or(z.literal("")),
    panNumber: z.string().regex(PATTERNS.pan, MESSAGES.pan).optional().or(z.literal("")),

    // Employment
    department: optionalText(50),
    designation: optionalText(60),
    employeeType: z.enum(["full_time", "part_time", "contract", "intern", ""]).optional(),
    joiningDate: z.string().optional().or(z.literal("")),
    experienceYears: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || /^\d+$/.test(v), "Enter a whole number of years"),
    salary: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || /^\d+(\.\d{1,2})?$/.test(v), "Enter a valid amount"),

    // Bank details
    bankName: optionalText(60),
    accountNumber: optionalText(30),
    ifscCode: z.string().regex(PATTERNS.ifsc, MESSAGES.ifsc).optional().or(z.literal("")),
    upiId: z.string().regex(PATTERNS.upi, MESSAGES.upi).optional().or(z.literal("")),

    // Emergency contact
    emergencyContactName: optionalText(60),
    emergencyContactNumber: z.string().regex(PATTERNS.phone10, MESSAGES.phone10).optional().or(z.literal("")),

    // Role / access
    role: z.string().min(1, "Select a role"),
    showroomId: z.string().optional().or(z.literal("")),
    status: z.enum(["active", "inactive"]).default("active"),

    // Login credentials — conditional on wantsCredentials
    wantsCredentials: z.boolean().default(true),
    username: z.string().max(60, "Too long").optional().or(z.literal("")),
    passwordMode: z.enum(["auto", "manual"]).default("auto"),
    manualPassword: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.wantsCredentials) {
      if (!data.username?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["username"], message: "Username is required" });
      }
      if (data.passwordMode === "manual") {
        const pw = data.manualPassword ?? "";
        if (pw.length < 8) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["manualPassword"],
            message: "Password must be at least 8 characters",
          });
        } else if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["manualPassword"],
            message: "Include at least one uppercase letter and one number",
          });
        }
      }
    }
  });

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

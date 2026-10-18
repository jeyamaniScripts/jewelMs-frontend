import { z } from "zod";

export const PURCHASE_TYPE_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "credit", label: "Credit" },
  { value: "consignment", label: "Consignment" },
] as const;

export const MAKING_CHARGE_TYPE_OPTIONS = [
  { value: "percentage", label: "Percentage" },
  { value: "per_gram", label: "Per gram" },
  { value: "fixed", label: "Fixed amount" },
] as const;

function numericString(required = false) {
  const base = z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, { message: "Enter a valid number" });
  return required ? base.min(1, "Required") : base.optional().or(z.literal(""));
}

export const purchaseItemSchema = z.object({
  productModelId: z.string().min(1, "Select a design"),
  purity: z.string().min(1, "Purity is required"),
  grossWeight: numericString(true),
  wastagePercent: numericString(),
  ratePerGram: numericString(true),
  makingChargeType: z.enum(["percentage", "per_gram", "fixed"], { message: "Select a type" }),
  makingChargeValue: numericString(),
  stoneCharges: numericString(),
  gstRate: numericString(),
  quantity: numericString(),
});

export const purchaseSchema = z.object({
  branchId: z.string().optional().or(z.literal("")),
  supplierId: z.string().min(1, "Select a supplier"),
  supplierInvoiceNumber: z.string().max(60, "Too long").optional().or(z.literal("")),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchaseType: z.enum(["cash", "credit", "consignment"]),
  items: z.array(purchaseItemSchema).min(1, "Add at least one item"),
  notes: z.string().max(1000, "Too long").optional().or(z.literal("")),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
export type PurchaseItemFormValues = z.infer<typeof purchaseItemSchema>;
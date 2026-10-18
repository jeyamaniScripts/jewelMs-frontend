import { z } from "zod";

function numericString(required = false) {
  const value = z
    .string()
    .refine((input) => input.trim() !== "" && Number.isFinite(Number(input)) && Number(input) >= 0, {
      message: "Enter a valid non-negative number",
    });
  return required ? value : z.union([value, z.literal("")]).optional();
}

const chargeSchema = z.object({
  rate: numericString(),
  qty: numericString(),
  reflectLedger: z.boolean(),
});

const percentageString = z.string().refine(
  (value: string) =>
    value === "" ||
    (Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100),
  { message: "Enter a percentage from 0 to 100" },
);

const productWeightSchema = z.object({
  lot: z.boolean(),
  quantity: numericString(true),
  grossWeight: numericString(true),
  addWeight: numericString(),
  lessWeight: numericString(),
  rate: numericString(true),
  otherCharges: numericString(),
}).refine(
  (weight) =>
    Number(weight.lessWeight || 0) <=
    Number(weight.grossWeight || 0) + Number(weight.addWeight || 0),
  { path: ["lessWeight"], message: "Less weight cannot exceed gross plus add weight" },
);

const productSchema = z.object({
  _id: z.string().optional(),
  productModelId: z.string().min(1, "Select a design"),
  productTouch: percentageString,
  purchaseTouch: percentageString,
  profitTouch: percentageString,
  weightDetails: productWeightSchema,
}).refine(
  (product) => Number(product.purchaseTouch || 0) + Number(product.profitTouch || 0) <= 100,
  { path: ["profitTouch"], message: "Purchase touch plus profit touch cannot exceed 100" },
);

export const purchaseWeightSchema = z.object({
  supplierId: z.string().min(1, "Select a supplier"),
  supplierInvoiceNumber: z.string().max(60).optional(),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  calculationType: z.enum(["Fixed(QTY)", "Per Gram"]),
  referenceName: z.string().max(120).optional(),
  products: z.array(productSchema).min(1, "Add at least one product"),
  charges: z.object({
    huid: chargeSchema,
    hallmark: chargeSchema,
    logo: chargeSchema,
    makingCharge: chargeSchema,
    parcelCharge: chargeSchema,
    overallQty: numericString(),
    overallRs: numericString(),
    overallAmount: numericString(),
  }),
  cgst: percentageString,
  sgst: percentageString,
  igst: percentageString,
  discount: numericString(),
  roundOffType: z.enum(["Add", "Sub"]),
  roundOffAmount: numericString(),
  paidAmount: numericString(),
  tcsOrTdsPaid: numericString(),
}).refine(
  (purchase) =>
    Number(purchase.cgst || 0) +
      Number(purchase.sgst || 0) +
      Number(purchase.igst || 0) <=
    100,
  { path: ["igst"], message: "Combined GST cannot exceed 100%" },
);

export type PurchaseWeightFormValues = z.infer<typeof purchaseWeightSchema>;

export const EMPTY_WEIGHT_PURCHASE: PurchaseWeightFormValues = {
  supplierId: "",
  supplierInvoiceNumber: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  calculationType: "Per Gram",
  referenceName: "",
  products: [
    {
      productModelId: "",
      productTouch: "0",
      purchaseTouch: "0",
      profitTouch: "0",
      weightDetails: {
        lot: false,
        quantity: "1",
        grossWeight: "0",
        addWeight: "0",
        lessWeight: "0",
        rate: "0",
        otherCharges: "0",
      },
    },
  ],
  charges: {
    huid: { rate: "0", qty: "0", reflectLedger: false },
    hallmark: { rate: "0", qty: "0", reflectLedger: false },
    logo: { rate: "0", qty: "0", reflectLedger: false },
    makingCharge: { rate: "0", qty: "0", reflectLedger: false },
    parcelCharge: { rate: "0", qty: "0", reflectLedger: false },
    overallQty: "0",
    overallRs: "0",
    overallAmount: "0",
  },
  cgst: "0",
  sgst: "0",
  igst: "0",
  discount: "0",
  roundOffType: "Add",
  roundOffAmount: "0",
  paidAmount: "0",
  tcsOrTdsPaid: "0",
};

export function weightPurchaseToApi(values: PurchaseWeightFormValues) {
  const number = (value: string | undefined) => Number(value || 0);
  return {
    supplierId: values.supplierId,
    supplierInvoiceNumber: values.supplierInvoiceNumber || "",
    purchaseDate: values.purchaseDate,
    calculationType: values.calculationType,
    referenceName: values.referenceName || "",
    products: values.products.map((product) => ({
      ...(product._id ? { _id: product._id } : {}),
      productModelId: product.productModelId,
      productTouch: number(product.productTouch),
      purchaseTouch: number(product.purchaseTouch),
      profitTouch: number(product.profitTouch),
      weightDetails: {
        lot: product.weightDetails.lot,
        quantity: number(product.weightDetails.quantity),
        grossWeight: number(product.weightDetails.grossWeight),
        addWeight: number(product.weightDetails.addWeight),
        lessWeight: number(product.weightDetails.lessWeight),
        rate: number(product.weightDetails.rate),
        otherCharges: number(product.weightDetails.otherCharges),
      },
    })),
    charges: {
      huid: {
        rate: number(values.charges.huid.rate),
        qty: number(values.charges.huid.qty),
        reflectLedger: values.charges.huid.reflectLedger,
      },
      hallmark: {
        rate: number(values.charges.hallmark.rate),
        qty: number(values.charges.hallmark.qty),
        reflectLedger: values.charges.hallmark.reflectLedger,
      },
      logo: {
        rate: number(values.charges.logo.rate),
        qty: number(values.charges.logo.qty),
        reflectLedger: values.charges.logo.reflectLedger,
      },
      makingCharge: {
        rate: number(values.charges.makingCharge.rate),
        qty: number(values.charges.makingCharge.qty),
        reflectLedger: values.charges.makingCharge.reflectLedger,
      },
      parcelCharge: {
        rate: number(values.charges.parcelCharge.rate),
        qty: number(values.charges.parcelCharge.qty),
        reflectLedger: values.charges.parcelCharge.reflectLedger,
      },
      overallQty: number(values.charges.overallQty),
      overallRs: number(values.charges.overallRs),
      overallAmount: number(values.charges.overallAmount),
    },
    cgst: number(values.cgst),
    sgst: number(values.sgst),
    igst: number(values.igst),
    discount: number(values.discount),
    roundOffType: values.roundOffType,
    roundOffAmount: number(values.roundOffAmount),
    paidAmount: number(values.paidAmount),
    tcsOrTdsPaid: number(values.tcsOrTdsPaid),
  };
}

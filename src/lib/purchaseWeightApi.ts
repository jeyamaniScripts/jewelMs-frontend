import { apiRequest } from "@/lib/apiClient";
import {
  EMPTY_WEIGHT_PURCHASE,
  weightPurchaseToApi,
  type PurchaseWeightFormValues,
} from "@/schemas/purchaseWeightSchemas";

const BASE_PATH = "/purchases/weight-based";

export interface WeightPurchase {
  id: string;
  purchaseNumber: string;
  supplierId: string | { id: string; supplierName: string; supplierCode: string };
  supplierInvoiceNumber?: string;
  purchaseDate: string;
  calculationType: "Fixed(QTY)" | "Per Gram";
  referenceName?: string;
  products: Array<{
    id: string;
    productModelId: string | { id: string; modelCode: string; modelName: string };
    productTouch: number;
    purchaseTouch: number;
    profitTouch: number;
    weightDetails: {
      lot: boolean;
      quantity: number;
      grossWeight: number;
      addWeight: number;
      lessWeight: number;
      netWeight: number;
      totalTouch: number;
      pureWeight: number;
      rate: number;
      amount: number;
      otherCharges: number;
      purchaseAmount: number;
    };
  }>;
  charges: {
    huid?: { rate?: number; qty?: number; amount?: number; reflectLedger?: boolean };
    hallmark?: { rate?: number; qty?: number; amount?: number; reflectLedger?: boolean };
    logo?: { rate?: number; qty?: number; amount?: number; reflectLedger?: boolean };
    makingCharge?: { rate?: number; qty?: number; amount?: number; reflectLedger?: boolean };
    parcelCharge?: { rate?: number; qty?: number; amount?: number; reflectLedger?: boolean };
    overallQty?: number;
    overallRs?: number;
    overallAmount?: number;
    overallCharges?: number;
  };
  cgst: number;
  sgst: number;
  igst: number;
  totalGstAmount: number;
  discount: number;
  purchaseAmount: number;
  otherChargesWithTax: number;
  totalAmount: number;
  roundOffType: "Add" | "Sub";
  roundOffAmount: number;
  netAmount: number;
  paidAmount: number;
  tcsOrTdsPaid: number;
  balanceAmount: number;
  status: "draft" | "confirmed" | "cancelled";
  createdAt: string;
};

function toId(value: string | { id: string }) {
  return typeof value === "string" ? value : value?.id ?? "";
}

export function weightPurchaseToFormValues(purchase: WeightPurchase): PurchaseWeightFormValues {
  const charge = (key: "huid" | "hallmark" | "logo" | "makingCharge" | "parcelCharge") => ({
    rate: String(purchase.charges[key]?.rate ?? 0),
    qty: String(purchase.charges[key]?.qty ?? 0),
    reflectLedger: purchase.charges[key]?.reflectLedger ?? false,
  });
  return {
    ...EMPTY_WEIGHT_PURCHASE,
    supplierId: toId(purchase.supplierId),
    supplierInvoiceNumber: purchase.supplierInvoiceNumber ?? "",
    purchaseDate: purchase.purchaseDate.slice(0, 10),
    calculationType: purchase.calculationType,
    referenceName: purchase.referenceName ?? "",
    products: purchase.products.map((product) => ({
      _id: product.id,
      productModelId: toId(product.productModelId),
      productTouch: String(product.productTouch),
      purchaseTouch: String(product.purchaseTouch),
      profitTouch: String(product.profitTouch),
      weightDetails: {
        lot: product.weightDetails.lot,
        quantity: String(product.weightDetails.quantity),
        grossWeight: String(product.weightDetails.grossWeight),
        addWeight: String(product.weightDetails.addWeight),
        lessWeight: String(product.weightDetails.lessWeight),
        rate: String(product.weightDetails.rate),
        otherCharges: String(product.weightDetails.otherCharges),
      },
    })),
    charges: {
      huid: charge("huid"),
      hallmark: charge("hallmark"),
      logo: charge("logo"),
      makingCharge: charge("makingCharge"),
      parcelCharge: charge("parcelCharge"),
      overallQty: String(purchase.charges.overallQty ?? 0),
      overallRs: String(purchase.charges.overallRs ?? 0),
      overallAmount: String(purchase.charges.overallAmount ?? 0),
    },
    cgst: String(purchase.cgst),
    sgst: String(purchase.sgst),
    igst: String(purchase.igst),
    discount: String(purchase.discount),
    roundOffType: purchase.roundOffType,
    roundOffAmount: String(purchase.roundOffAmount),
    paidAmount: String(purchase.paidAmount),
    tcsOrTdsPaid: String(purchase.tcsOrTdsPaid),
  };
}

export async function listWeightPurchases(params: {
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const { purchases, pagination } = await apiRequest<{
    purchases: WeightPurchase[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>(`${BASE_PATH}${query.toString() ? `?${query.toString()}` : ""}`);
  return { purchases, pagination };
}

export async function getWeightPurchase(id: string) {
  const { purchase } = await apiRequest<{ purchase: WeightPurchase }>(`${BASE_PATH}/${id}`);
  return purchase;
}

export async function createWeightPurchase(values: PurchaseWeightFormValues) {
  const { purchase } = await apiRequest<{ purchase: WeightPurchase }>(BASE_PATH, {
    method: "POST",
    body: weightPurchaseToApi(values),
  });
  return purchase;
}

export async function updateWeightPurchase(id: string, values: PurchaseWeightFormValues) {
  const { purchase } = await apiRequest<{ purchase: WeightPurchase }>(`${BASE_PATH}/${id}`, {
    method: "PATCH",
    body: weightPurchaseToApi(values),
  });
  return purchase;
}

export async function deleteWeightPurchase(id: string) {
  await apiRequest(`${BASE_PATH}/${id}`, { method: "DELETE" });
}

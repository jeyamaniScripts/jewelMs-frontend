import type { AuditUserRef } from "@/types/company";
import type { Supplier } from "@/types/supplier";

export type PurchaseType = "cash" | "credit" | "consignment";
export type PurchaseStatus = "draft" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid";
export type MakingChargeType = "percentage" | "per_gram" | "fixed";

export interface PurchaseItem {
  productModelId: string | { id: string; modelCode: string; modelName: string };
  purity: string;
  grossWeight: number;
  wastagePercent?: number;
  ratePerGram: number;
  makingChargeType: MakingChargeType;
  makingChargeValue?: number;
  stoneCharges?: number;
  gstRate?: number;
  quantity?: number;
  // Server-computed — read-only from the client's perspective.
  netWeight: number;
  metalValue: number;
  makingCharges: number;
  gstAmount: number;
  lineTotal: number;
}

export interface Purchase {
  id: string;
  brandId: string;
  branchId?: string | { id: string; showroomName: string } | null;
  supplierId: string | Pick<Supplier, "id" | "supplierName" | "supplierCode">;
  purchaseNumber: string;
  supplierInvoiceNumber?: string;
  purchaseDate: string;
  purchaseType: PurchaseType;
  items: PurchaseItem[];
  totalGrossWeight: number;
  totalNetWeight: number;
  totalMetalValue: number;
  totalMakingCharges: number;
  totalStoneCharges: number;
  totalTaxAmount: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  status: PurchaseStatus;
  notes?: string | null;
  createdBy?: AuditUserRef | string;
  updatedBy?: AuditUserRef | string;
  createdAt: string;
  updatedAt?: string;
}
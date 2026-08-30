import type { AuditUserRef } from "@/types/company";

export type CategoryStatus = "active" | "inactive";
export type MetalType = "gold" | "silver" | "platinum" | "diamond" | "other";

export interface Category {
  id: string;
  brandId: string;
  categoryName: string;
  categoryCode: string;
  metalType: MetalType;
  hsnCode?: string;
  defaultGstRate?: number;
  status: CategoryStatus;
  createdBy?: AuditUserRef | string;
  updatedBy?: AuditUserRef | string;
  createdAt: string;
  updatedAt?: string;
}

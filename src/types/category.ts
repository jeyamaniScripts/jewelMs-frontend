import type { AuditUserRef } from "@/types/company";

export type CategoryStatus = "active" | "inactive";
export interface Category {
  id: string;
  brandId: string;
  categoryName: string;
  categoryCode: string;
  hsnCode?: string;
  defaultGstRate?: number;
  categoryImageUrl?: string;
  status: CategoryStatus;
  createdBy?: AuditUserRef | string;
  updatedBy?: AuditUserRef | string;
  createdAt: string;
  updatedAt?: string;
}

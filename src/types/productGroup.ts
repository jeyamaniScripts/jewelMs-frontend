import type { AuditUserRef } from "@/types/company";
import type { Category } from "@/types/category";

export type ProductGroupStatus = "active" | "inactive";
export type MakingChargeType = "percentage" | "per_gram" | "fixed";

export interface ProductGroup {
  id: string;
  brandId: string;
  categoryId: string | Pick<Category, "id" | "categoryName" | "categoryCode">;
  groupName: string;
  groupCode: string;
  defaultMakingChargeType: MakingChargeType;
  defaultMakingChargeValue?: number;
  defaultWastagePercent?: number;
  groupImageUrl?: string;
  status: ProductGroupStatus;
  createdBy?: AuditUserRef | string;
  updatedBy?: AuditUserRef | string;
  createdAt: string;
  updatedAt?: string;
}
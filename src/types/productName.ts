import type { AuditUserRef } from "@/types/company";
import type { ProductGroup } from "@/types/productGroup";

export type ProductNameStatus = "active" | "inactive";
export type Gender = "male" | "female" | "unisex" | "kids";
export type MetalType = "gold" | "silver" | "platinum" | "diamond" | "other";

export interface ProductName {
  id: string;
  brandId: string;
  productGroupId: string | Pick<ProductGroup, "id" | "groupName" | "groupCode" | "categoryId">;
  name: string;
  gender: Gender;
  metalType: MetalType;
  tagNumber?: string | null;
  openingWeight?: number | null;
  openingAmount?: number | null;
  isPartialProduct: boolean;
  hasSupplierPayment: boolean;
  productImageUrl?: string;
  status: ProductNameStatus;
  createdBy?: AuditUserRef | string;
  updatedBy?: AuditUserRef | string;
  createdAt: string;
  updatedAt?: string;
}
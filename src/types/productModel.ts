import type { AuditUserRef } from "@/types/company";
import type { ProductName } from "@/types/productName";
import type { ProductGroup, MakingChargeType } from "@/types/productGroup";

export type ProductModelStatus = "active" | "discontinued";
export type Purity = "24K" | "22K" | "18K" | "14K" | "916" | "750" | "custom";

export interface StoneDetail {
  stoneType: string;
  approxWeight?: number;
  includedInPrice?: boolean;
}

export interface WeightRange {
  min: number;
  max: number;
}

// The populated shape returned by GET/list — name plus its own nested
// productGroupId, itself populated one level deeper for the group/category.
type PopulatedProductName = Pick<ProductName, "id" | "name"> & {
  productGroupId:
    | string
    | Pick<ProductGroup, "id" | "groupName" | "groupCode" | "categoryId">;
};

export interface ProductModel {
  id: string;
  brandId: string;
  productNameId: string | PopulatedProductName;
  modelCode: string;
  modelName: string;
  purity: Purity;
  grossWeightRange: WeightRange;
  makingChargeType?: MakingChargeType | null;
  makingChargeValue?: number | null;
  wastagePercent?: number | null;
  hasStones: boolean;
  stoneDetails?: StoneDetail[];
  requiresHuid: boolean;
  images: string[];
  status: ProductModelStatus;
  createdBy?: AuditUserRef | string;
  updatedBy?: AuditUserRef | string;
  createdAt: string;
  updatedAt?: string;
}

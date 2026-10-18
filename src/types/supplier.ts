import type { AuditUserRef } from "@/types/company";

export type SupplierStatus = "active" | "inactive";
export type SupplierType = "manufacturer" | "wholesaler" | "karigar" | "gemstone_dealer" | "bullion_dealer" | "other";
export type BusinessType = "proprietorship" | "partnership" | "private_limited" | "llp" | "individual" | "other";

export interface SupplierAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface SupplierBankDetails {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branchName?: string;
}

export interface Supplier {
  id: string;
  brandId: string;
  branchId?: string | { id: string; showroomName: string } | null;
  companyId?: string | null;

  supplierName: string;
  supplierCode: string;
  supplierType: SupplierType;
  categoryIds?: Array<string | { id: string; categoryName: string; categoryCode: string }>;
  contactPerson?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;

  address?: SupplierAddress;

  gstNumber?: string;
  panNumber?: string;
  businessType?: BusinessType | null;
  hallmarkLicenseNumber?: string;

  bankDetails?: SupplierBankDetails;

  openingBalance: number;
  currentBalance: number;
  openingWeight: number;
  currentWeight: number;
  creditPeriod?: number | null;
  paymentTerms?: string;

  supplierImages: string[];
  visitingCard?: string | null;

  status: SupplierStatus;
  isBlacklisted: boolean;
  blacklistReason?: string | null;
  notes?: string | null;

  createdBy?: AuditUserRef | string;
  updatedBy?: AuditUserRef | string;
  createdAt: string;
  updatedAt?: string;
}
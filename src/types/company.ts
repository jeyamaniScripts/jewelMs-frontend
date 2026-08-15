export type BrandStatus = "active" | "inactive";

export interface AuditUserRef {
  fullName: string;
  email: string;
}

export interface Brand {
  id: string;
  companyName: string;
  shortName?: string;
  ownerName: string;
  gstNumber?: string;
  panNumber?: string;
  businessRegNumber?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  website?: string;
  logoUrl?: string; // data URL — no file storage backend yet, see BrandForm/ImageUpload
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  status: BrandStatus;
  showroomsCount: number;
  createdBy?: AuditUserRef | string;
  updatedBy?: AuditUserRef | string;
  createdAt: string; // ISO date
  updatedAt?: string;
}

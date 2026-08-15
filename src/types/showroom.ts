import type { AuditUserRef } from "@/types/company";

export type ShowroomStatus = "active" | "inactive";

export interface Showroom {
  id: string;
  brandId: string;
  showroomName: string;
  shortName?: string;
  isMainBranch?: boolean;
  managerName: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  status: ShowroomStatus;
  employeesCount: number;
  createdBy?: AuditUserRef | string;
  updatedBy?: AuditUserRef | string;
  createdAt: string; // ISO date
  updatedAt?: string;
}

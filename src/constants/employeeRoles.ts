import type { Role } from "@/types/auth";

/** Roles considered "showroom staff" — they belong to one specific showroom. */
export const SHOWROOM_SCOPED_ROLES: Role[] = [
  "showroom_admin",
  "showroom_manager",
  "cashier",
  "staff",
];

export function isShowroomScopedRole(role: Role): boolean {
  return SHOWROOM_SCOPED_ROLES.includes(role);
}

/**
 * Which roles a given creator is allowed to hand out when adding an employee.
 * - Brand Admin can create brand-level staff (HR/Manager) AND showroom-level
 *   staff for any showroom under their brand (they pick the showroom).
 * - Showroom Admin can only create staff within their own showroom.
 */
export const ASSIGNABLE_ROLES_BY_CREATOR: Partial<Record<Role, Role[]>> = {
  brand_admin: ["brand_hr", "brand_manager", "showroom_admin", "showroom_manager", "cashier", "staff"],
  showroom_admin: ["showroom_manager", "cashier", "staff"],
};

export const EMPLOYEE_ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  brand_admin: "Brand Admin",
  brand_hr: "HR",
  brand_manager: "Brand Manager",
  showroom_admin: "Showroom Admin",
  showroom_manager: "Showroom Manager",
  cashier: "Cashier",
  staff: "Staff",
};

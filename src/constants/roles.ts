import type { Role } from "@/types/auth";

export const ROLES: Record<string, Role> = {
  SUPER_ADMIN: "super_admin",
  BRAND_ADMIN: "brand_admin",
  BRAND_HR: "brand_hr",
  BRAND_MANAGER: "brand_manager",
  SHOWROOM_ADMIN: "showroom_admin",
  SHOWROOM_MANAGER: "showroom_manager",
  CASHIER: "cashier",
  STAFF: "staff",
};

// Every role lands on /dashboard for now — the dashboard phase will
// branch the UI itself based on the role read from Redux.
export const ROLE_HOME_ROUTE: Record<Role, string> = {
  super_admin: "/dashboard",
  brand_admin: "/dashboard",
  brand_hr: "/dashboard",
  brand_manager: "/dashboard",
  showroom_admin: "/dashboard",
  showroom_manager: "/dashboard",
  cashier: "/dashboard",
  staff: "/dashboard",
};

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  brand_admin: "Brand Admin",
  brand_hr: "HR",
  brand_manager: "Brand Manager",
  showroom_admin: "Showroom Admin",
  showroom_manager: "Showroom Manager",
  cashier: "Cashier",
  staff: "Staff",
};

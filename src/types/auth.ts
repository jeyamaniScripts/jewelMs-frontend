// Central domain types for the jewelry admin panel.
// SuperAdmin manages Jewelry Brands (companies); each Brand manages
// its own Showrooms (branches); each Showroom manages its own staff.

export type Role =
  | "super_admin"
  | "brand_admin" // "company admin" — owns a jewelry brand
  | "brand_hr"
  | "brand_manager"
  | "showroom_admin" // "branch admin" — manages a single showroom
  | "showroom_manager"
  | "cashier"
  | "staff";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  /** Set for brand_admin (and brand-level staff) — scopes them to one Brand. */
  brandId?: string;
  /** Set for showroom-level roles — scopes them to one Showroom. */
  showroomId?: string;
  /** True until the person sets their own password — enforced server-side. */
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  passwordChangedAt?: string;
  /** Brand Admin, or a Showroom Admin whose own showroom is the main branch. */
  canViewAllBranches?: boolean;
  companyName?: string | null;
  companyShortName?: string | null;
}

export interface AuthState {
  user: User | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  passwordResetEmailSent: boolean;
  passwordResetSuccess: boolean;
}

export interface LoginPayload {
  user: User;
  token: string;
}

import type { MenuPermissions } from "@/constants/permissionActions";

export interface RolePermissionRecord {
  id: string;
  roleKey: string;
  label: string;
  isCustom: boolean;
  /** null/absent = built-in or global custom role, visible to everyone. */
  brandId?: string | null;
  permissions: Record<string, MenuPermissions>;
}

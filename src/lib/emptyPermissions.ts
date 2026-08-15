import { PERMISSION_ACTIONS, type MenuPermissions } from "@/constants/permissionActions";

export function emptyMenuPermissions(): MenuPermissions {
  return PERMISSION_ACTIONS.reduce((acc, action) => {
    acc[action] = false;
    return acc;
  }, {} as MenuPermissions);
}

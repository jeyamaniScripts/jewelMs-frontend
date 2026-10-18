export const PERMISSION_ACTIONS = [
  "view",
  "add",
  "edit",
  "delete",
  "approve",
  "activeDeactivate",
  "exportExcel",
  "exportPdf",
  "print",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_ACTION_LABEL: Record<PermissionAction, string> = {
  view: "View",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
  approve: "Approval",
  activeDeactivate: "Active / Deactive",
  exportExcel: "Excel",
  exportPdf: "PDF",
  print: "Print",
};

export type MenuPermissions = Record<PermissionAction, boolean>;

"use client";

import { PERMISSION_MENU_CONFIG } from "@/constants/menuConfig";
import { PERMISSION_ACTIONS, PERMISSION_ACTION_LABEL, type MenuPermissions } from "@/constants/permissionActions";
import { emptyMenuPermissions } from "@/lib/emptyPermissions";

export default function EditablePermissionMatrix({
  permissions,
  onToggle,
}: {
  permissions: Record<string, MenuPermissions>;
  onToggle: (menuKey: string, action: keyof MenuPermissions, value: boolean) => void;
}) {
  const allSelected = PERMISSION_MENU_CONFIG.every((item) =>
    PERMISSION_ACTIONS.every(
      (action) => (permissions[item.key] ?? emptyMenuPermissions())[action],
    ),
  );
  const anySelected = PERMISSION_MENU_CONFIG.some((item) =>
    PERMISSION_ACTIONS.some(
      (action) => (permissions[item.key] ?? emptyMenuPermissions())[action],
    ),
  );
  const toggleAll = (value: boolean) => {
    for (const item of PERMISSION_MENU_CONFIG) {
      for (const action of PERMISSION_ACTIONS) {
        onToggle(item.key, action, value);
      }
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
      <table className="w-full min-w-[1080px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-tint">
            <th className="px-4 py-3 text-left font-semibold text-ink">Menu</th>
            {PERMISSION_ACTIONS.map((action) => (
              <th key={action} className="px-3 py-3 text-center font-semibold text-ink">
                {PERMISSION_ACTION_LABEL[action]}
              </th>
            ))}
            <th className="px-3 py-3 text-center font-semibold text-ink">
              <label className="inline-flex cursor-pointer flex-col items-center gap-1">
                <span>Select all</span>
                <input
                  ref={(input) => {
                    if (input) input.indeterminate = anySelected && !allSelected;
                  }}
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => toggleAll(event.target.checked)}
                  style={{ accentColor: "#088395" }}
                  className="h-4 w-4 accent-primary"
                  aria-label="Select all permissions for every menu"
                />
              </label>
            </th>
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MENU_CONFIG.map((item) => {
            const perms = permissions[item.key] ?? emptyMenuPermissions();
            const rowSelected = PERMISSION_ACTIONS.every(
              (action) => perms[action],
            );
            return (
              <tr key={item.key} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-ink">
                  <span className={item.label.includes(" / ") ? "pl-4 text-ink-muted" : ""}>
                    {item.label}
                  </span>
                </td>
                {PERMISSION_ACTIONS.map((action) => (
                  <td key={action} className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={perms[action]}
                      onChange={(e) => onToggle(item.key, action, e.target.checked)}
                      style={{ accentColor: "#088395" }}
                      className="h-4 w-4 accent-primary"
                      aria-label={`${PERMISSION_ACTION_LABEL[action]} — ${item.label}`}
                    />
                  </td>
                ))}
                <td className="px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={rowSelected}
                    onChange={(event) => {
                      for (const action of PERMISSION_ACTIONS) {
                        onToggle(item.key, action, event.target.checked);
                      }
                    }}
                    style={{ accentColor: "#088395" }}
                    className="h-4 w-4 accent-primary"
                    aria-label={`Select all permissions — ${item.label}`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

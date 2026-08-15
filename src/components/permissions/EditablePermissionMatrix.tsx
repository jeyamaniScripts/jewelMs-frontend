"use client";

import { MENU_CONFIG } from "@/constants/menuConfig";
import { PERMISSION_ACTIONS, PERMISSION_ACTION_LABEL, type MenuPermissions } from "@/constants/permissionActions";
import { emptyMenuPermissions } from "@/lib/emptyPermissions";

export default function EditablePermissionMatrix({
  permissions,
  onToggle,
}: {
  permissions: Record<string, MenuPermissions>;
  onToggle: (menuKey: string, action: keyof MenuPermissions, value: boolean) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-tint">
            <th className="px-4 py-3 text-left font-semibold text-ink">Menu</th>
            {PERMISSION_ACTIONS.map((action) => (
              <th key={action} className="px-3 py-3 text-center font-semibold text-ink">
                {PERMISSION_ACTION_LABEL[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MENU_CONFIG.map((item) => {
            const perms = permissions[item.key] ?? emptyMenuPermissions();
            return (
              <tr key={item.key} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-ink">{item.label}</td>
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

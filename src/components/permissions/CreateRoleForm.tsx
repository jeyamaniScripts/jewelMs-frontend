"use client";

import { useState } from "react";
import { MdAdd } from "react-icons/md";
import type { MenuPermissions } from "@/constants/permissionActions";
import { emptyMenuPermissions } from "@/lib/emptyPermissions";
import { MENU_CONFIG } from "@/constants/menuConfig";
import { createCustomRole } from "@/redux/slices/permissionSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import EditablePermissionMatrix from "@/components/permissions/EditablePermissionMatrix";

export default function CreateRoleForm({ onCreated }: { onCreated: (roleKey: string) => void }) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.permission);
  const isLoading = status === "loading";

  const [label, setLabel] = useState("");
  const [draft, setDraft] = useState<Record<string, MenuPermissions>>(() =>
    MENU_CONFIG.reduce((acc, item) => {
      acc[item.key] = emptyMenuPermissions();
      return acc;
    }, {} as Record<string, MenuPermissions>)
  );

  const handleToggle = (menuKey: string, action: keyof MenuPermissions, value: boolean) => {
    setDraft((prev) => ({
      ...prev,
      [menuKey]: { ...(prev[menuKey] ?? emptyMenuPermissions()), [action]: value },
    }));
  };

  const handleSubmit = async () => {
    const result = await dispatch(createCustomRole({ label, permissions: draft }));
    if (createCustomRole.fulfilled.match(result)) {
      onCreated(result.payload.roleKey);
    }
  };

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-card">
      <Alert variant="error">{error}</Alert>

      <div className="max-w-sm">
        <Input
          label="New role name"
          name="roleLabel"
          placeholder="e.g. Inventory Lead"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>

      <p className="text-caption text-ink-muted">
        Check off what this role can view, add, edit, delete, export, and print for each menu,
        then save.
      </p>

      <EditablePermissionMatrix permissions={draft} onToggle={handleToggle} />

      <Button type="button" onClick={handleSubmit} isLoading={isLoading} fullWidth={false} className="px-6">
        <MdAdd size={18} /> Create role
      </Button>
    </div>
  );
}

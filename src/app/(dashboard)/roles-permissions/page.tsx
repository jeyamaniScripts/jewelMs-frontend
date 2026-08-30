// "use client";

// import { useEffect, useState } from "react";
// import { MdVpnKey, MdAdd, MdSave, MdClose } from "react-icons/md";

// import PageHeader from "@/components/layout/PageHeader";
// import EditablePermissionMatrix from "@/components/permissions/EditablePermissionMatrix";
// import CreateRoleForm from "@/components/permissions/CreateRoleForm";
// import Button from "@/components/ui/Button";
// import Alert from "@/components/ui/Alert";
// import { emptyMenuPermissions } from "@/lib/emptyPermissions";
// import {
//   fetchRolePermissions,
//   saveRolePermissions,
// } from "@/redux/slices/permissionSlice";
// import { showToast } from "@/redux/slices/toastSlice";
// import { useAppDispatch, useAppSelector } from "@/redux/hooks";
// import type { MenuPermissions } from "@/constants/permissionActions";
// import { MENU_CONFIG } from "@/constants/menuConfig";

// export default function RolesPermissionsPage() {
//   const dispatch = useAppDispatch();
//   const { roles, status } = useAppSelector((state) => state.permission);
//   const isLoadingRoles = status === "loading" && roles.length === 0;
//   const isSaving = status === "loading" && roles.length > 0;

//   const builtInRoles = roles.filter((r) => !r.isCustom);
//   const customRoles = roles.filter((r) => r.isCustom);

//   const [selectedRoleKey, setSelectedRoleKey] = useState<string>("");
//   const [showCreateRole, setShowCreateRole] = useState(false);
//   const [saved, setSaved] = useState(false);

//   // Local draft so edits don't hit the store until "Save changes" is pressed.
//   const [draft, setDraft] = useState<Record<string, MenuPermissions>>({});

//   useEffect(() => {
//     dispatch(fetchRolePermissions());
//   }, [dispatch]);

//   // Default to the first built-in role once the list has loaded.
//   useEffect(() => {
//     if (!selectedRoleKey && builtInRoles.length > 0) {
//       setSelectedRoleKey(builtInRoles[0].roleKey);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [roles]);

//   useEffect(() => {
//     if (!selectedRoleKey) return;
//     const source =
//       roles.find((r) => r.roleKey === selectedRoleKey)?.permissions ?? {};
//     const seeded = MENU_CONFIG.reduce(
//       (acc, item) => {
//         acc[item.key] = source[item.key] ?? emptyMenuPermissions();
//         return acc;
//       },
//       {} as Record<string, MenuPermissions>,
//     );
//     setDraft(seeded);
//     setSaved(false);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedRoleKey]);

//   const handleToggle = (
//     menuKey: string,
//     action: keyof MenuPermissions,
//     value: boolean,
//   ) => {
//     setDraft((prev) => ({
//       ...prev,
//       [menuKey]: {
//         ...(prev[menuKey] ?? emptyMenuPermissions()),
//         [action]: value,
//       },
//     }));
//     setSaved(false);
//   };

//   const handleSave = async () => {
//     const result = await dispatch(
//       saveRolePermissions({ roleKey: selectedRoleKey, permissions: draft }),
//     );
//     if (saveRolePermissions.fulfilled.match(result)) {
//       setSaved(true);
//       dispatch(showToast("Role updated successfully.", "success"));
//     } else {
//       dispatch(showToast("Failed to update role. Please try again.", "error"));
//     }
//   };

//   const selectedLabel =
//     roles.find((r) => r.roleKey === selectedRoleKey)?.label ?? selectedRoleKey;

//   return (
//     <div>
//       <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
//         <PageHeader
//           title="Roles & Permissions"
//           subtitle="Control what each role can view, add, edit, delete, export, and print."
//         />
//         <Button
//           type="button"
//           variant={showCreateRole ? "outline" : "primary"}
//           onClick={() => setShowCreateRole((v) => !v)}
//           fullWidth={false}
//         >
//           {showCreateRole ? (
//             <>
//               <MdClose size={18} /> Cancel
//             </>
//           ) : (
//             <>
//               <MdAdd size={18} /> Add Role
//             </>
//           )}
//         </Button>
//       </div>

//       {showCreateRole && (
//         <div className="mb-6">
//           <CreateRoleForm
//             onCreated={(roleKey) => {
//               setShowCreateRole(false);
//               setSelectedRoleKey(roleKey);
//             }}
//           />
//         </div>
//       )}

//       {isLoadingRoles ? (
//         <p className="text-ink-muted">Loading roles...</p>
//       ) : (
//         <>
//           <div className="mb-5 flex flex-wrap items-center gap-2">
//             <MdVpnKey className="text-ink-muted" size={18} />
//             {builtInRoles.map((role) => (
//               <button
//                 key={role.roleKey}
//                 type="button"
//                 onClick={() => setSelectedRoleKey(role.roleKey)}
//                 className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors
//                   ${
//                     selectedRoleKey === role.roleKey
//                       ? "border-primary bg-primary text-white"
//                       : "border-border bg-surface text-ink-muted hover:border-primary hover:text-primary"
//                   }`}
//               >
//                 {role.label}
//               </button>
//             ))}
//             {customRoles.map((role) => (
//               <button
//                 key={role.roleKey}
//                 type="button"
//                 onClick={() => setSelectedRoleKey(role.roleKey)}
//                 className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors
//                   ${
//                     selectedRoleKey === role.roleKey
//                       ? "border-primary bg-primary text-white"
//                       : "border-border bg-surface text-ink-muted hover:border-primary hover:text-primary"
//                   }`}
//               >
//                 {role.label}
//               </button>
//             ))}
//           </div>

//           {saved && (
//             <div className="mb-4">
//               <Alert variant="success">
//                 Saved permissions for {selectedLabel}.
//               </Alert>
//             </div>
//           )}

//           <EditablePermissionMatrix
//             permissions={draft}
//             onToggle={handleToggle}
//           />

//           <div className="mt-4 flex justify-end">
//             <Button
//               type="button"
//               onClick={handleSave}
//               isLoading={isSaving}
//               fullWidth={false}
//               className="px-6"
//             >
//               <MdSave size={18} /> Save changes
//             </Button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { MdVpnKey, MdAdd, MdSave, MdClose } from "react-icons/md";

import PageHeader from "@/components/layout/PageHeader";
import EditablePermissionMatrix from "@/components/permissions/EditablePermissionMatrix";
import CreateRoleForm from "@/components/permissions/CreateRoleForm";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { emptyMenuPermissions } from "@/lib/emptyPermissions";
import {
  fetchRolePermissions,
  saveRolePermissions,
} from "@/redux/slices/permissionSlice";
import { showToast } from "@/redux/slices/toastSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import type { MenuPermissions } from "@/constants/permissionActions";
import { MENU_CONFIG } from "@/constants/menuConfig";

function getInitialDraft(
  roleKey: string,
  rolesList: Array<{
    roleKey: string;
    permissions?: Record<string, MenuPermissions>;
  }>,
): Record<string, MenuPermissions> {
  const source =
    rolesList.find((r) => r.roleKey === roleKey)?.permissions ?? {};
  return MENU_CONFIG.reduce(
    (acc, item) => {
      acc[item.key] = source[item.key] ?? emptyMenuPermissions();
      return acc;
    },
    {} as Record<string, MenuPermissions>,
  );
}

export default function RolesPermissionsPage() {
  const dispatch = useAppDispatch();
  const { roles, status } = useAppSelector((state) => state.permission);
  const isLoadingRoles = status === "loading" && roles.length === 0;
  const isSaving = status === "loading" && roles.length > 0;

  const builtInRoles = roles.filter((r) => !r.isCustom);
  const customRoles = roles.filter((r) => r.isCustom);

  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("");
  const [prevRoleKey, setPrevRoleKey] = useState<string>("");
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [saved, setSaved] = useState(false);

  // Local draft so edits don't hit the store until "Save changes" is pressed.
  const [draft, setDraft] = useState<Record<string, MenuPermissions>>({});

  // 1. Fetch initial permissions on mount
  useEffect(() => {
    dispatch(fetchRolePermissions());
  }, [dispatch]);

  // 2. Derive the active role directly (no effect needed)
  const activeRoleKey = selectedRoleKey || builtInRoles[0]?.roleKey || "";

  // 3. Sync draft synchronously during render when the active role changes
  if (activeRoleKey && activeRoleKey !== prevRoleKey) {
    setPrevRoleKey(activeRoleKey);
    setDraft(getInitialDraft(activeRoleKey, roles));
    setSaved(false);
  }

  const handleToggle = (
    menuKey: string,
    action: keyof MenuPermissions,
    value: boolean,
  ) => {
    setDraft((prev) => ({
      ...prev,
      [menuKey]: {
        ...(prev[menuKey] ?? emptyMenuPermissions()),
        [action]: value,
      },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!activeRoleKey) return;
    const result = await dispatch(
      saveRolePermissions({ roleKey: activeRoleKey, permissions: draft }),
    );
    if (saveRolePermissions.fulfilled.match(result)) {
      setSaved(true);
      dispatch(showToast("Role updated successfully.", "success"));
    } else {
      dispatch(showToast("Failed to update role. Please try again.", "error"));
    }
  };

  const selectedLabel =
    roles.find((r) => r.roleKey === activeRoleKey)?.label ?? activeRoleKey;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Roles & Permissions"
          subtitle="Control what each role can view, add, edit, delete, export, and print."
        />
        <Button
          type="button"
          variant={showCreateRole ? "outline" : "primary"}
          onClick={() => setShowCreateRole((v) => !v)}
          fullWidth={false}
        >
          {showCreateRole ? (
            <>
              <MdClose size={18} /> Cancel
            </>
          ) : (
            <>
              <MdAdd size={18} /> Add Role
            </>
          )}
        </Button>
      </div>

      {showCreateRole && (
        <div className="mb-6">
          <CreateRoleForm
            onCreated={(roleKey) => {
              setShowCreateRole(false);
              setSelectedRoleKey(roleKey);
            }}
          />
        </div>
      )}

      {isLoadingRoles ? (
        <p className="text-ink-muted">Loading roles...</p>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <MdVpnKey className="text-ink-muted" size={18} />
            {builtInRoles.map((role) => (
              <button
                key={role.roleKey}
                type="button"
                onClick={() => setSelectedRoleKey(role.roleKey)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors
                  ${
                    activeRoleKey === role.roleKey
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-ink-muted hover:border-primary hover:text-primary"
                  }`}
              >
                {role.label}
              </button>
            ))}
            {customRoles.map((role) => (
              <button
                key={role.roleKey}
                type="button"
                onClick={() => setSelectedRoleKey(role.roleKey)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors
                  ${
                    activeRoleKey === role.roleKey
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface text-ink-muted hover:border-primary hover:text-primary"
                  }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          {saved && (
            <div className="mb-4">
              <Alert variant="success">
                Saved permissions for {selectedLabel}.
              </Alert>
            </div>
          )}

          <EditablePermissionMatrix
            permissions={draft}
            onToggle={handleToggle}
          />

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={handleSave}
              isLoading={isSaving}
              fullWidth={false}
              className="px-6"
            >
              <MdSave size={18} /> Save changes
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

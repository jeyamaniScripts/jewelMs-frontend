import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { MenuPermissions } from "@/constants/permissionActions";
import type { RolePermissionRecord } from "@/types/permission";
import { apiRequest, ApiClientError } from "@/lib/apiClient";

interface PermissionState {
  roles: RolePermissionRecord[]; // every role (built-in + custom) with its full permission map
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PermissionState = {
  roles: [],
  status: "idle",
  error: null,
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

export const fetchRolePermissions = createAsyncThunk("permission/fetchAll", async () => {
  const { roles } = await apiRequest<{ roles: RolePermissionRecord[] }>("/permissions");
  return roles;
});

export const saveRolePermissions = createAsyncThunk<
  RolePermissionRecord,
  { roleKey: string; permissions: Record<string, MenuPermissions> },
  { rejectValue: string }
>("permission/saveRolePermissions", async ({ roleKey, permissions }, { rejectWithValue }) => {
  try {
    const { role } = await apiRequest<{ role: RolePermissionRecord }>(`/permissions/${roleKey}`, {
      method: "PUT",
      body: { permissions },
    });
    return role;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not save permissions"));
  }
});

export const createCustomRole = createAsyncThunk<
  RolePermissionRecord,
  { label: string; permissions: Record<string, MenuPermissions> },
  { rejectValue: string }
>("permission/createCustomRole", async ({ label, permissions }, { rejectWithValue }) => {
  try {
    const { role } = await apiRequest<{ role: RolePermissionRecord }>("/permissions/custom-role", {
      method: "POST",
      body: { label, permissions },
    });
    return role;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not create role"));
  }
});

const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolePermissions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action: PayloadAction<RolePermissionRecord[]>) => {
        state.status = "succeeded";
        state.roles = action.payload;
      })
      .addCase(fetchRolePermissions.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load roles & permissions";
      })

      .addCase(saveRolePermissions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(saveRolePermissions.fulfilled, (state, action: PayloadAction<RolePermissionRecord>) => {
        state.status = "succeeded";
        const index = state.roles.findIndex((r) => r.roleKey === action.payload.roleKey);
        if (index !== -1) state.roles[index] = action.payload;
      })
      .addCase(saveRolePermissions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not save permissions";
      })

      .addCase(createCustomRole.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createCustomRole.fulfilled, (state, action: PayloadAction<RolePermissionRecord>) => {
        state.status = "succeeded";
        state.roles.push(action.payload);
      })
      .addCase(createCustomRole.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not create role";
      });
  },
});

export default permissionSlice.reducer;

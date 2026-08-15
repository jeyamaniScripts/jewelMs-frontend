import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, LoginPayload, User } from "@/types/auth";
import type {
  LoginFormValues,
  RegisterFormValues,
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from "@/schemas/authSchemas";
import type { ChangePasswordFormValues } from "@/schemas/changePasswordSchemas";
import { apiRequest, ApiClientError, attemptTokenRefresh } from "@/lib/apiClient";
import { setStoredToken, clearStoredToken, getStoredToken } from "@/lib/tokenStorage";

// ---- Thunks — each one calls the real Express backend ----

export const loginUser = createAsyncThunk<LoginPayload, LoginFormValues, { rejectValue: string }>(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await apiRequest<LoginPayload>("/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      setStoredToken(data.token);
      return data;
    } catch (err) {
      return rejectWithValue(err instanceof ApiClientError ? err.message : "Login failed");
    }
  }
);

export const registerSuperAdmin = createAsyncThunk<
  LoginPayload,
  RegisterFormValues,
  { rejectValue: string }
>("auth/registerSuperAdmin", async (formData, { rejectWithValue }) => {
  try {
    const data = await apiRequest<LoginPayload>("/auth/register", {
      method: "POST",
      body: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      },
      auth: false,
    });
    setStoredToken(data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err instanceof ApiClientError ? err.message : "Registration failed");
  }
});

/** Called once on app load to rehydrate the session from a stored token, if any. */
export const restoreSession = createAsyncThunk<LoginPayload | null>(
  "auth/restoreSession",
  async () => {
    // Always try the refresh-token cookie first. The localStorage access
    // token is short-lived (15 min) — after any idle time, a hard page
    // refresh is very likely to have an already-expired token sitting in
    // storage. Establishing a fresh one up front means this doesn't quietly
    // depend on the 401-retry-then-refresh chain inside apiRequest working
    // perfectly on the very first request of a new page load.
    const refreshedToken = await attemptTokenRefresh();
    const token = refreshedToken ?? getStoredToken();
    if (!token) return null;

    try {
      const { user } = await apiRequest<{ user: User }>("/auth/me");
      return { user, token };
    } catch {
      clearStoredToken();
      return null;
    }
  }
);

export const forgotPassword = createAsyncThunk<
  { email: string },
  ForgotPasswordFormValues,
  { rejectValue: string }
>("auth/forgotPassword", async ({ email }, { rejectWithValue }) => {
  try {
    await apiRequest("/auth/forgot-password", { method: "POST", body: { email }, auth: false });
    return { email };
  } catch (err) {
    return rejectWithValue(err instanceof ApiClientError ? err.message : "Could not send reset link");
  }
});

export const resetPassword = createAsyncThunk<
  { success: true },
  ResetPasswordFormValues & { token: string | null },
  { rejectValue: string }
>("auth/resetPassword", async ({ token, password }, { rejectWithValue }) => {
  if (!token) return rejectWithValue("Reset link is invalid or has expired");
  try {
    await apiRequest("/auth/reset-password", { method: "POST", body: { token, password }, auth: false });
    return { success: true };
  } catch (err) {
    return rejectWithValue(err instanceof ApiClientError ? err.message : "Could not reset password");
  }
});

export const changePassword = createAsyncThunk<
  { user: User },
  ChangePasswordFormValues,
  { rejectValue: string }
>("auth/changePassword", async ({ currentPassword, newPassword }, { rejectWithValue }) => {
  try {
    const data = await apiRequest<{ user: User }>("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
    return data;
  } catch (err) {
    return rejectWithValue(err instanceof ApiClientError ? err.message : "Could not change password");
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    // Even if the request fails (e.g. already expired), still clear locally —
    // the person should never be stuck "logged in" on their own device.
  }
  clearStoredToken();
});

// ---- Slice ----

const initialState: AuthState & { sessionRestored: boolean } = {
  user: null,
  role: null,
  token: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
  passwordResetEmailSent: false,
  passwordResetSuccess: false,
  sessionRestored: false, // true once restoreSession has resolved (success or not) — gates initial render
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    resetPasswordFlags: (state) => {
      state.passwordResetEmailSent = false;
      state.passwordResetSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginPayload>) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed";
      })

      // Register (Super Admin)
      .addCase(registerSuperAdmin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerSuperAdmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerSuperAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Registration failed";
      })

      // Restore session (on app load)
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.sessionRestored = true;
        if (action.payload) {
          state.user = action.payload.user;
          state.role = action.payload.user.role;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.sessionRestored = true;
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Could not change password";
      })

      // Logout
      .addCase(logoutUser.fulfilled, () => ({ ...initialState, sessionRestored: true }))

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.passwordResetEmailSent = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = "succeeded";
        state.passwordResetEmailSent = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Could not send reset link";
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.passwordResetSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = "succeeded";
        state.passwordResetSuccess = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Could not reset password";
      });
  },
});

export const { clearAuthError, resetPasswordFlags } = authSlice.actions;
export default authSlice.reducer;

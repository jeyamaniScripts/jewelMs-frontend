import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { ActiveSessionsSummary, ActiveSessionEntry } from "@/types/session";
import type { PaginationMeta } from "@/types/dataTable";
import { apiRequest } from "@/lib/apiClient";

interface SessionState {
  summary: ActiveSessionsSummary | null;
  activeSessions: ActiveSessionEntry[];
  pagination: PaginationMeta | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SessionState = {
  summary: null,
  activeSessions: [],
  pagination: null,
  status: "idle",
  error: null,
};

export const fetchActiveSessionsSummary = createAsyncThunk("session/fetchSummary", async () => {
  return apiRequest<ActiveSessionsSummary>("/auth/sessions/active-count");
});

/** "Who's currently logged in" — not a history log (see the type comment). */
export const fetchActiveSessions = createAsyncThunk(
  "session/fetchActiveSessions",
  async (
    query: { page?: number; limit?: number; sortBy?: "lastUsedAt" | "createdAt"; order?: "asc" | "desc" } = {},
    { signal }
  ) => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.order) params.set("order", query.order);
    const qs = params.toString();
    return apiRequest<{ activeSessions: ActiveSessionEntry[]; pagination: PaginationMeta }>(
      `/auth/sessions/history${qs ? `?${qs}` : ""}`,
      { signal }
    );
  }
);

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveSessionsSummary.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchActiveSessionsSummary.fulfilled, (state, action: PayloadAction<ActiveSessionsSummary>) => {
        state.status = "succeeded";
        state.summary = action.payload;
      })
      .addCase(fetchActiveSessionsSummary.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load active sessions";
      })

      .addCase(fetchActiveSessions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchActiveSessions.fulfilled,
        (state, action: PayloadAction<{ activeSessions: ActiveSessionEntry[]; pagination: PaginationMeta }>) => {
          state.status = "succeeded";
          state.activeSessions = action.payload.activeSessions;
          state.pagination = action.payload.pagination;
        }
      );
  },
});

export default sessionSlice.reducer;

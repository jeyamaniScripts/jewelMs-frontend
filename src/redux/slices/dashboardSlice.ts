import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { DashboardStats } from "@/types/dashboard";
import { apiRequest } from "@/lib/apiClient";

interface DashboardState {
  stats: DashboardStats | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: DashboardState = {
  stats: null,
  status: "idle",
};

export const fetchDashboardStats = createAsyncThunk("dashboard/fetchStats", async () => {
  const { stats } = await apiRequest<{ stats: DashboardStats }>("/dashboard/stats");
  return stats;
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.status = "succeeded";
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default dashboardSlice.reducer;

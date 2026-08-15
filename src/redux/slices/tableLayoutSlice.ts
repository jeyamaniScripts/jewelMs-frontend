import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { SavedTableLayout } from "@/types/tableLayout";
import { apiRequest } from "@/lib/apiClient";

interface TableLayoutState {
  byModule: Record<string, { layout: SavedTableLayout | null; status: "idle" | "loading" | "loaded" }>;
}

const initialState: TableLayoutState = { byModule: {} };

export const fetchTableLayouts = createAsyncThunk("tableLayout/fetch", async (module: string) => {
  const { layout } = await apiRequest<{ layout: SavedTableLayout | null }>(`/table-layouts/${module}`);
  return { module, layout };
});

export const savePersonalLayout = createAsyncThunk(
  "tableLayout/save",
  async ({ module, layout }: { module: string; layout: SavedTableLayout }) => {
    const { layout: saved } = await apiRequest<{ layout: SavedTableLayout }>(`/table-layouts/${module}`, {
      method: "PUT",
      body: layout,
    });
    return { module, layout: saved };
  }
);

export const resetPersonalLayout = createAsyncThunk("tableLayout/reset", async (module: string) => {
  await apiRequest(`/table-layouts/${module}`, { method: "DELETE" });
  return module;
});

const tableLayoutSlice = createSlice({
  name: "tableLayout",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTableLayouts.pending, (state, action) => {
        const module = action.meta.arg;
        state.byModule[module] = { layout: state.byModule[module]?.layout ?? null, status: "loading" };
      })
      .addCase(fetchTableLayouts.fulfilled, (state, action) => {
        state.byModule[action.payload.module] = { layout: action.payload.layout, status: "loaded" };
      })

      .addCase(savePersonalLayout.fulfilled, (state, action: PayloadAction<{ module: string; layout: SavedTableLayout }>) => {
        state.byModule[action.payload.module] = { layout: action.payload.layout, status: "loaded" };
      })

      .addCase(resetPersonalLayout.fulfilled, (state, action: PayloadAction<string>) => {
        state.byModule[action.payload] = { layout: null, status: "loaded" };
      });
  },
});

export default tableLayoutSlice.reducer;

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Showroom, ShowroomStatus } from "@/types/showroom";
import type { GeneratedCredentials } from "@/types/credentials";
import type { PaginationMeta } from "@/types/dataTable";
import type { ShowroomFormValues } from "@/schemas/showroomSchemas";
import { apiRequest, ApiClientError } from "@/lib/apiClient";

const SELECTED_BRANCH_KEY = "ashira-selected-branch";

function getStoredSelectedBranch(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SELECTED_BRANCH_KEY);
}

function setStoredSelectedBranch(id: string | null): void {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(SELECTED_BRANCH_KEY, id);
  else window.localStorage.removeItem(SELECTED_BRANCH_KEY);
}

interface ShowroomState {
  showrooms: Showroom[];
  pagination: PaginationMeta | null;
  activeShowroom: Showroom | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastCreatedCredentials: GeneratedCredentials | null;

  /** Full (unpaginated) list for the navbar branch switcher — kept separate
   *  from `showrooms` above, which is the Showrooms admin page's own
   *  paginated/searched/sorted view. Only fetched for Brand Admin / a
   *  main-branch Showroom Admin. */
  branchOptions: Showroom[];
  /** The branch currently selected in the switcher — persisted across
   *  reloads, defaults to the first branch the first time it loads. */
  selectedBranchId: string | null;
  /** True from the moment the branch changes until whichever page reacted
   *  to it confirms its own fetch is done — see clearBranchDataLoading. */
  isBranchDataLoading: boolean;
}

const initialState: ShowroomState = {
  showrooms: [],
  pagination: null,
  activeShowroom: null,
  status: "idle",
  error: null,
  lastCreatedCredentials: null,

  branchOptions: [],
  selectedBranchId: getStoredSelectedBranch(),
  isBranchDataLoading: false,
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

export interface ShowroomListQuery {
  brandId: string;
  search?: string;
  sortBy?: "showroomName" | "shortName" | "createdAt" | "employeesCount";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/** brandId is accepted for API-shape consistency with the rest of the app,
 *  but the backend derives the actual scope from the logged-in Brand Admin's
 *  own token — a Brand Admin can never fetch another brand's showrooms by
 *  passing a different id here. */
export const fetchShowrooms = createAsyncThunk("showroom/fetchShowrooms", async (query: ShowroomListQuery) => {
  const params = new URLSearchParams({ brandId: query.brandId });
  if (query.search) params.set("search", query.search);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.order) params.set("order", query.order);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  return apiRequest<{ showrooms: Showroom[]; pagination: PaginationMeta }>(`/showrooms?${params.toString()}`);
});

/** Powers the navbar branch switcher — only called for Brand Admin / a
 *  main-branch Showroom Admin (the backend rejects anyone else). Fetches up
 *  to 100 branches in one page, sorted by name, so the switcher isn't
 *  missing anything for brands with more than the default page size. */
export const fetchBranchOptions = createAsyncThunk("showroom/fetchBranchOptions", async (brandId: string) => {
  const params = new URLSearchParams({ brandId, sortBy: "showroomName", order: "asc", limit: "100" });
  const { showrooms } = await apiRequest<{ showrooms: Showroom[]; pagination: PaginationMeta }>(
    `/showrooms?${params.toString()}`
  );
  return showrooms;
});

export const fetchShowroomById = createAsyncThunk("showroom/fetchShowroomById", async (id: string) => {
  const { showroom } = await apiRequest<{ showroom: Showroom }>(`/showrooms/${id}`);
  return showroom;
});

export const createShowroom = createAsyncThunk<
  { showroom: Showroom; credentials: GeneratedCredentials },
  { brandId: string; formData: ShowroomFormValues },
  { rejectValue: string }
>("showroom/createShowroom", async ({ formData }, { rejectWithValue }) => {
  try {
    return await apiRequest<{ showroom: Showroom; credentials: GeneratedCredentials }>("/showrooms", {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not create showroom"));
  }
});

export const updateShowroom = createAsyncThunk<
  Showroom,
  { id: string; formData: Partial<ShowroomFormValues> },
  { rejectValue: string }
>("showroom/updateShowroom", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { showroom } = await apiRequest<{ showroom: Showroom }>(`/showrooms/${id}`, {
      method: "PATCH",
      body: formData,
    });
    return showroom;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not update showroom"));
  }
});

export const deleteShowroom = createAsyncThunk("showroom/deleteShowroom", async (id: string) => {
  await apiRequest(`/showrooms/${id}`, { method: "DELETE" });
  return id;
});

export const regenerateShowroomCredentials = createAsyncThunk(
  "showroom/regenerateCredentials",
  async (showroom: Showroom) => {
    const { credentials } = await apiRequest<{ credentials: GeneratedCredentials }>(
      `/showrooms/${showroom.id}/regenerate-credentials`,
      { method: "POST" }
    );
    return credentials;
  }
);

export const toggleShowroomStatus = createAsyncThunk(
  "showroom/toggleStatus",
  async ({ id }: { id: string; status: ShowroomStatus }) => {
    const { showroom } = await apiRequest<{ showroom: Showroom }>(`/showrooms/${id}/status`, {
      method: "PATCH",
    });
    return showroom;
  }
);

const showroomSlice = createSlice({
  name: "showroom",
  initialState,
  reducers: {
    clearShowroomCredentials: (state) => {
      state.lastCreatedCredentials = null;
    },
    clearActiveShowroom: (state) => {
      state.activeShowroom = null;
    },
    setSelectedBranch: (state, action: PayloadAction<string>) => {
      state.selectedBranchId = action.payload;
      state.isBranchDataLoading = true;
      setStoredSelectedBranch(action.payload);
    },
    /** Whatever page reacted to the branch change calls this once its own
     *  fetch settles — keeps the switcher's loader honest instead of a
     *  guessed timeout. */
    clearBranchDataLoading: (state) => {
      state.isBranchDataLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShowrooms.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchShowrooms.fulfilled,
        (state, action: PayloadAction<{ showrooms: Showroom[]; pagination: PaginationMeta }>) => {
          state.status = "succeeded";
          state.showrooms = action.payload.showrooms;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchShowrooms.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load showrooms";
      })

      .addCase(fetchShowroomById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchShowroomById.fulfilled, (state, action: PayloadAction<Showroom>) => {
        state.status = "succeeded";
        state.activeShowroom = action.payload;
      })
      .addCase(fetchShowroomById.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load showroom";
      })

      .addCase(createShowroom.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createShowroom.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.showrooms.unshift(action.payload.showroom);
        state.lastCreatedCredentials = action.payload.credentials;
      })
      .addCase(createShowroom.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not create showroom";
      })

      .addCase(updateShowroom.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateShowroom.fulfilled, (state, action: PayloadAction<Showroom>) => {
        state.status = "succeeded";
        state.activeShowroom = action.payload;
        const index = state.showrooms.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.showrooms[index] = action.payload;
      })
      .addCase(updateShowroom.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not update showroom";
      })

      .addCase(deleteShowroom.fulfilled, (state, action: PayloadAction<string>) => {
        state.showrooms = state.showrooms.filter((s) => s.id !== action.payload);
      })

      .addCase(regenerateShowroomCredentials.fulfilled, (state, action) => {
        state.lastCreatedCredentials = action.payload;
      })

      .addCase(toggleShowroomStatus.fulfilled, (state, action: PayloadAction<Showroom>) => {
        const index = state.showrooms.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.showrooms[index] = action.payload;
      })

      .addCase(fetchBranchOptions.fulfilled, (state, action: PayloadAction<Showroom[]>) => {
        state.branchOptions = action.payload;
        const stillValid = state.selectedBranchId && action.payload.some((b) => b.id === state.selectedBranchId);
        if (!stillValid) {
          const firstBranch = action.payload[0];
          state.selectedBranchId = firstBranch ? firstBranch.id : null;
          setStoredSelectedBranch(state.selectedBranchId);
        }
      });
  },
});

export const { clearShowroomCredentials, clearActiveShowroom, setSelectedBranch, clearBranchDataLoading } =
  showroomSlice.actions;
export default showroomSlice.reducer;

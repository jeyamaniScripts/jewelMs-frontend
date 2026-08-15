import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Brand, BrandStatus } from "@/types/company";
import type { GeneratedCredentials } from "@/types/credentials";
import type { PaginationMeta } from "@/types/dataTable";
import type { BrandFormValues } from "@/schemas/companySchemas";
import { apiRequest, ApiClientError } from "@/lib/apiClient";

interface CompanyState {
  brands: Brand[];
  pagination: PaginationMeta | null;
  activeBrand: Brand | null; // loaded for the edit page
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastCreatedCredentials: GeneratedCredentials | null;
}

const initialState: CompanyState = {
  brands: [],
  pagination: null,
  activeBrand: null,
  status: "idle",
  error: null,
  lastCreatedCredentials: null,
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

export interface BrandListQuery {
  search?: string;
  sortBy?: "companyName" | "shortName" | "createdAt" | "showroomsCount";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const fetchBrands = createAsyncThunk("company/fetchBrands", async (query: BrandListQuery = {}) => {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.order) params.set("order", query.order);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const qs = params.toString();
  return apiRequest<{ brands: Brand[]; pagination: PaginationMeta }>(`/brands${qs ? `?${qs}` : ""}`);
});

export const fetchBrandById = createAsyncThunk("company/fetchBrandById", async (id: string) => {
  const { brand } = await apiRequest<{ brand: Brand }>(`/brands/${id}`);
  return brand;
});

export const createBrand = createAsyncThunk<
  { brand: Brand; credentials: GeneratedCredentials },
  BrandFormValues,
  { rejectValue: string }
>("company/createBrand", async (formData, { rejectWithValue }) => {
  try {
    return await apiRequest<{ brand: Brand; credentials: GeneratedCredentials }>("/brands", {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not create brand"));
  }
});

export const updateBrand = createAsyncThunk<
  Brand,
  { id: string; formData: Partial<BrandFormValues> },
  { rejectValue: string }
>("company/updateBrand", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { brand } = await apiRequest<{ brand: Brand }>(`/brands/${id}`, { method: "PATCH", body: formData });
    return brand;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not update brand"));
  }
});

export const deleteBrand = createAsyncThunk("company/deleteBrand", async (id: string) => {
  await apiRequest(`/brands/${id}`, { method: "DELETE" });
  return id;
});

export const regenerateCredentials = createAsyncThunk("company/regenerateCredentials", async (brand: Brand) => {
  const { credentials } = await apiRequest<{ credentials: GeneratedCredentials }>(
    `/brands/${brand.id}/regenerate-credentials`,
    { method: "POST" }
  );
  return credentials;
});

export const toggleBrandStatus = createAsyncThunk(
  "company/toggleBrandStatus",
  async ({ id }: { id: string; status: BrandStatus }) => {
    const { brand } = await apiRequest<{ brand: Brand }>(`/brands/${id}/status`, { method: "PATCH" });
    return brand;
  }
);

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearGeneratedCredentials: (state) => {
      state.lastCreatedCredentials = null;
    },
    clearActiveBrand: (state) => {
      state.activeBrand = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBrands.fulfilled, (state, action: PayloadAction<{ brands: Brand[]; pagination: PaginationMeta }>) => {
        state.status = "succeeded";
        state.brands = action.payload.brands;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBrands.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load brands";
      })

      .addCase(fetchBrandById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBrandById.fulfilled, (state, action: PayloadAction<Brand>) => {
        state.status = "succeeded";
        state.activeBrand = action.payload;
      })
      .addCase(fetchBrandById.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load brand";
      })

      .addCase(createBrand.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.brands.unshift(action.payload.brand);
        state.lastCreatedCredentials = action.payload.credentials;
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not create brand";
      })

      .addCase(updateBrand.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state, action: PayloadAction<Brand>) => {
        state.status = "succeeded";
        state.activeBrand = action.payload;
        const index = state.brands.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) state.brands[index] = action.payload;
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not update brand";
      })

      .addCase(deleteBrand.fulfilled, (state, action: PayloadAction<string>) => {
        state.brands = state.brands.filter((b) => b.id !== action.payload);
      })

      .addCase(regenerateCredentials.fulfilled, (state, action) => {
        state.lastCreatedCredentials = action.payload;
      })

      // toggleBrandStatus now returns the full updated brand from the server,
      // so we replace it in place rather than flipping the field locally.
      .addCase(toggleBrandStatus.fulfilled, (state, action: PayloadAction<Brand>) => {
        const index = state.brands.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) state.brands[index] = action.payload;
      });
  },
});

export const { clearGeneratedCredentials, clearActiveBrand } = companySlice.actions;
export default companySlice.reducer;

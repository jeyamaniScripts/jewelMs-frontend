import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { ProductName, ProductNameStatus } from "@/types/productName";
import type { PaginationMeta } from "@/types/dataTable";
import type { ProductNameFormValues } from "@/schemas/productNameSchemas";
import { apiRequest, ApiClientError } from "@/lib/apiClient";

interface ProductNameState {
  productNames: ProductName[];
  pagination: PaginationMeta | null;
  activeProductName: ProductName | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProductNameState = {
  productNames: [],
  pagination: null,
  activeProductName: null,
  status: "idle",
  error: null,
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

export interface ProductNameListQuery {
  search?: string;
  productGroupId?: string;
  gender?: string;
  sortBy?: "name" | "gender" | "createdAt" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const fetchProductNames = createAsyncThunk(
  "productName/fetchProductNames",
  async (query: ProductNameListQuery = {}, { signal }) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.productGroupId) params.set("productGroupId", query.productGroupId);
    if (query.gender) params.set("gender", query.gender);
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.order) params.set("order", query.order);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const qs = params.toString();
    return apiRequest<{ productNames: ProductName[]; pagination: PaginationMeta }>(
      `/inventory/product-names${qs ? `?${qs}` : ""}`,
      { signal }
    );
  }
);

export const fetchProductNameById = createAsyncThunk("productName/fetchProductNameById", async (id: string) => {
  const { productName } = await apiRequest<{ productName: ProductName }>(`/inventory/product-names/${id}`);
  return productName;
});

export const createProductName = createAsyncThunk<ProductName, ProductNameFormValues, { rejectValue: string }>(
  "productName/createProductName",
  async (formData, { rejectWithValue }) => {
    try {
      const { productName } = await apiRequest<{ productName: ProductName }>("/inventory/product-names", {
        method: "POST",
        body: formData,
      });
      return productName;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not create product name"));
    }
  }
);

export const updateProductName = createAsyncThunk<
  ProductName,
  { id: string; formData: Partial<ProductNameFormValues> },
  { rejectValue: string }
>("productName/updateProductName", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { productName } = await apiRequest<{ productName: ProductName }>(`/inventory/product-names/${id}`, {
      method: "PATCH",
      body: formData,
    });
    return productName;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not update product name"));
  }
});

export const deleteProductName = createAsyncThunk<string, string, { rejectValue: string }>(
  "productName/deleteProductName",
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest(`/inventory/product-names/${id}`, { method: "DELETE" });
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not delete product name"));
    }
  }
);

export const toggleProductNameStatus = createAsyncThunk(
  "productName/toggleStatus",
  async ({ id }: { id: string; status: ProductNameStatus }) => {
    const { productName } = await apiRequest<{ productName: ProductName }>(`/inventory/product-names/${id}/status`, {
      method: "PATCH",
    });
    return productName;
  }
);

const productNameSlice = createSlice({
  name: "productName",
  initialState,
  reducers: {
    clearActiveProductName: (state) => {
      state.activeProductName = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductNames.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchProductNames.fulfilled,
        (state, action: PayloadAction<{ productNames: ProductName[]; pagination: PaginationMeta }>) => {
          state.status = "succeeded";
          state.productNames = action.payload.productNames;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchProductNames.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error = "Could not load product names";
      })

      .addCase(fetchProductNameById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductNameById.fulfilled, (state, action: PayloadAction<ProductName>) => {
        state.status = "succeeded";
        state.activeProductName = action.payload;
      })
      .addCase(fetchProductNameById.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load product name";
      })

      .addCase(createProductName.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createProductName.fulfilled, (state, action: PayloadAction<ProductName>) => {
        state.status = "succeeded";
        state.productNames.unshift(action.payload);
      })
      .addCase(createProductName.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not create product name";
      })

      .addCase(updateProductName.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProductName.fulfilled, (state, action: PayloadAction<ProductName>) => {
        state.status = "succeeded";
        state.activeProductName = action.payload;
        const index = state.productNames.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) state.productNames[index] = action.payload;
      })
      .addCase(updateProductName.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not update product name";
      })

      .addCase(deleteProductName.fulfilled, (state, action: PayloadAction<string>) => {
        state.productNames = state.productNames.filter((n) => n.id !== action.payload);
      })

      .addCase(toggleProductNameStatus.fulfilled, (state, action: PayloadAction<ProductName>) => {
        const index = state.productNames.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) state.productNames[index] = action.payload;
      });
  },
});

export const { clearActiveProductName } = productNameSlice.actions;
export default productNameSlice.reducer;

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { ProductGroup, ProductGroupStatus } from "@/types/productGroup";
import type { PaginationMeta } from "@/types/dataTable";
import type { ProductGroupFormValues } from "@/schemas/productGroupSchemas";
import { apiRequest, ApiClientError } from "@/lib/apiClient";

interface ProductGroupState {
  productGroups: ProductGroup[];
  pagination: PaginationMeta | null;
  activeProductGroup: ProductGroup | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProductGroupState = {
  productGroups: [],
  pagination: null,
  activeProductGroup: null,
  status: "idle",
  error: null,
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

/** Backend expects real numbers — the form carries these as string inputs. */
function toApiPayload(formData: Partial<ProductGroupFormValues>) {
  return {
    ...formData,
    defaultMakingChargeValue: formData.defaultMakingChargeValue
      ? Number(formData.defaultMakingChargeValue)
      : undefined,
    defaultWastagePercent: formData.defaultWastagePercent ? Number(formData.defaultWastagePercent) : undefined,
  };
}

export interface ProductGroupListQuery {
  search?: string;
  categoryId?: string;
  sortBy?: "groupName" | "groupCode" | "createdAt" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const fetchProductGroups = createAsyncThunk(
  "productGroup/fetchProductGroups",
  async (query: ProductGroupListQuery = {}, { signal }) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.categoryId) params.set("categoryId", query.categoryId);
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.order) params.set("order", query.order);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const qs = params.toString();
    return apiRequest<{ productGroups: ProductGroup[]; pagination: PaginationMeta }>(
      `/inventory/product-groups${qs ? `?${qs}` : ""}`,
      { signal }
    );
  }
);

export const fetchProductGroupById = createAsyncThunk("productGroup/fetchProductGroupById", async (id: string) => {
  const { productGroup } = await apiRequest<{ productGroup: ProductGroup }>(`/inventory/product-groups/${id}`);
  return productGroup;
});

export const createProductGroup = createAsyncThunk<ProductGroup, ProductGroupFormValues, { rejectValue: string }>(
  "productGroup/createProductGroup",
  async (formData, { rejectWithValue }) => {
    try {
      const { productGroup } = await apiRequest<{ productGroup: ProductGroup }>("/inventory/product-groups", {
        method: "POST",
        body: toApiPayload(formData),
      });
      return productGroup;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not create product group"));
    }
  }
);

export const updateProductGroup = createAsyncThunk<
  ProductGroup,
  { id: string; formData: Partial<ProductGroupFormValues> },
  { rejectValue: string }
>("productGroup/updateProductGroup", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { productGroup } = await apiRequest<{ productGroup: ProductGroup }>(`/inventory/product-groups/${id}`, {
      method: "PATCH",
      body: toApiPayload(formData),
    });
    return productGroup;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not update product group"));
  }
});

export const deleteProductGroup = createAsyncThunk<string, string, { rejectValue: string }>(
  "productGroup/deleteProductGroup",
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest(`/inventory/product-groups/${id}`, { method: "DELETE" });
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not delete product group"));
    }
  }
);

export const toggleProductGroupStatus = createAsyncThunk(
  "productGroup/toggleStatus",
  async ({ id }: { id: string; status: ProductGroupStatus }) => {
    const { productGroup } = await apiRequest<{ productGroup: ProductGroup }>(
      `/inventory/product-groups/${id}/status`,
      { method: "PATCH" }
    );
    return productGroup;
  }
);

const productGroupSlice = createSlice({
  name: "productGroup",
  initialState,
  reducers: {
    clearActiveProductGroup: (state) => {
      state.activeProductGroup = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductGroups.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchProductGroups.fulfilled,
        (state, action: PayloadAction<{ productGroups: ProductGroup[]; pagination: PaginationMeta }>) => {
          state.status = "succeeded";
          state.productGroups = action.payload.productGroups;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchProductGroups.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error = "Could not load product groups";
      })

      .addCase(fetchProductGroupById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductGroupById.fulfilled, (state, action: PayloadAction<ProductGroup>) => {
        state.status = "succeeded";
        state.activeProductGroup = action.payload;
      })
      .addCase(fetchProductGroupById.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load product group";
      })

      .addCase(createProductGroup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createProductGroup.fulfilled, (state, action: PayloadAction<ProductGroup>) => {
        state.status = "succeeded";
        state.productGroups.unshift(action.payload);
      })
      .addCase(createProductGroup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not create product group";
      })

      .addCase(updateProductGroup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProductGroup.fulfilled, (state, action: PayloadAction<ProductGroup>) => {
        state.status = "succeeded";
        state.activeProductGroup = action.payload;
        const index = state.productGroups.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) state.productGroups[index] = action.payload;
      })
      .addCase(updateProductGroup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not update product group";
      })

      .addCase(deleteProductGroup.fulfilled, (state, action: PayloadAction<string>) => {
        state.productGroups = state.productGroups.filter((g) => g.id !== action.payload);
      })

      .addCase(toggleProductGroupStatus.fulfilled, (state, action: PayloadAction<ProductGroup>) => {
        const index = state.productGroups.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) state.productGroups[index] = action.payload;
      });
  },
});

export const { clearActiveProductGroup } = productGroupSlice.actions;
export default productGroupSlice.reducer;

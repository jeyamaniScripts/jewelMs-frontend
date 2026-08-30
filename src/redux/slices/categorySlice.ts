import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Category, CategoryStatus } from "@/types/category";
import type { PaginationMeta } from "@/types/dataTable";
import type { CategoryFormValues } from "@/schemas/categorySchemas";
import { apiRequest, ApiClientError } from "@/lib/apiClient";

interface CategoryState {
  categories: Category[];
  pagination: PaginationMeta | null;
  activeCategory: Category | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  pagination: null,
  activeCategory: null,
  status: "idle",
  error: null,
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

/** Backend expects a real number for defaultGstRate — the form carries it as a string input. */
function toApiPayload(formData: Partial<CategoryFormValues>) {
  return {
    ...formData,
    defaultGstRate: formData.defaultGstRate ? Number(formData.defaultGstRate) : undefined,
  };
}

export interface CategoryListQuery {
  search?: string;
  sortBy?: "categoryName" | "categoryCode" | "metalType" | "createdAt" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (query: CategoryListQuery = {}, { signal }) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.order) params.set("order", query.order);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const qs = params.toString();
    return apiRequest<{ categories: Category[]; pagination: PaginationMeta }>(
      `/inventory/categories${qs ? `?${qs}` : ""}`,
      { signal }
    );
  }
);

export const fetchCategoryById = createAsyncThunk("category/fetchCategoryById", async (id: string) => {
  const { category } = await apiRequest<{ category: Category }>(`/inventory/categories/${id}`);
  return category;
});

export const createCategory = createAsyncThunk<Category, CategoryFormValues, { rejectValue: string }>(
  "category/createCategory",
  async (formData, { rejectWithValue }) => {
    try {
      const { category } = await apiRequest<{ category: Category }>("/inventory/categories", {
        method: "POST",
        body: toApiPayload(formData),
      });
      return category;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not create category"));
    }
  }
);

export const updateCategory = createAsyncThunk<
  Category,
  { id: string; formData: Partial<CategoryFormValues> },
  { rejectValue: string }
>("category/updateCategory", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { category } = await apiRequest<{ category: Category }>(`/inventory/categories/${id}`, {
      method: "PATCH",
      body: toApiPayload(formData),
    });
    return category;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not update category"));
  }
});

export const deleteCategory = createAsyncThunk<string, string, { rejectValue: string }>(
  "category/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest(`/inventory/categories/${id}`, { method: "DELETE" });
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not delete category"));
    }
  }
);

export const toggleCategoryStatus = createAsyncThunk(
  "category/toggleStatus",
  async ({ id }: { id: string; status: CategoryStatus }) => {
    const { category } = await apiRequest<{ category: Category }>(`/inventory/categories/${id}/status`, {
      method: "PATCH",
    });
    return category;
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearActiveCategory: (state) => {
      state.activeCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<{ categories: Category[]; pagination: PaginationMeta }>) => {
          state.status = "succeeded";
          state.categories = action.payload.categories;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error = "Could not load categories";
      })

      .addCase(fetchCategoryById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        state.status = "succeeded";
        state.activeCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load category";
      })

      .addCase(createCategory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.status = "succeeded";
        state.categories.unshift(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not create category";
      })

      .addCase(updateCategory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.status = "succeeded";
        state.activeCategory = action.payload;
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.categories[index] = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not update category";
      })

      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload);
      })

      .addCase(toggleCategoryStatus.fulfilled, (state, action: PayloadAction<Category>) => {
        const index = state.categories.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.categories[index] = action.payload;
      });
  },
});

export const { clearActiveCategory } = categorySlice.actions;
export default categorySlice.reducer;

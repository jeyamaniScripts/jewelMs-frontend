import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Purchase, PurchaseItem } from "@/types/purchase";
import type { PaginationMeta } from "@/types/dataTable";
import type { PurchaseFormValues, PurchaseItemFormValues } from "@/schemas/purchaseSchemas";
import { apiRequest, ApiClientError } from "@/lib/apiClient";

interface PurchaseState {
  purchases: Purchase[];
  pagination: PaginationMeta | null;
  activePurchase: Purchase | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PurchaseState = {
  purchases: [],
  pagination: null,
  activePurchase: null,
  status: "idle",
  error: null,
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

/**
 * Every numeric field arrives from the form as a string — convert to
 * numbers before sending. The backend recomputes netWeight/metalValue/etc
 * itself, so those derived fields are never sent.
 */
function itemToApiPayload(item: PurchaseItemFormValues) {
  return {
    productModelId: item.productModelId,
    purity: item.purity,
    grossWeight: Number(item.grossWeight),
    wastagePercent: item.wastagePercent ? Number(item.wastagePercent) : 0,
    ratePerGram: Number(item.ratePerGram),
    makingChargeType: item.makingChargeType,
    makingChargeValue: item.makingChargeValue ? Number(item.makingChargeValue) : 0,
    stoneCharges: item.stoneCharges ? Number(item.stoneCharges) : 0,
    gstRate: item.gstRate ? Number(item.gstRate) : 3,
    quantity: item.quantity ? Number(item.quantity) : 1,
  };
}

function toApiPayload(formData: Partial<PurchaseFormValues>) {
  return {
    ...formData,
    branchId: formData.branchId || null,
    items: formData.items?.map(itemToApiPayload),
  };
}

export interface PurchaseListQuery {
  search?: string;
  supplierId?: string;
  status?: string;
  paymentStatus?: string;
  sortBy?: "purchaseNumber" | "purchaseDate" | "grandTotal" | "createdAt" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const fetchPurchases = createAsyncThunk(
  "purchase/fetchPurchases",
  async (query: PurchaseListQuery = {}, { signal }) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.supplierId) params.set("supplierId", query.supplierId);
    if (query.status) params.set("status", query.status);
    if (query.paymentStatus) params.set("paymentStatus", query.paymentStatus);
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.order) params.set("order", query.order);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const qs = params.toString();
    return apiRequest<{ purchases: Purchase[]; pagination: PaginationMeta }>(
      `/purchases${qs ? `?${qs}` : ""}`,
      { signal }
    );
  }
);

export const fetchPurchaseById = createAsyncThunk("purchase/fetchPurchaseById", async (id: string) => {
  const { purchase } = await apiRequest<{ purchase: Purchase }>(`/purchases/${id}`);
  return purchase;
});

export const createPurchase = createAsyncThunk<Purchase, PurchaseFormValues, { rejectValue: string }>(
  "purchase/createPurchase",
  async (formData, { rejectWithValue }) => {
    try {
      const { purchase } = await apiRequest<{ purchase: Purchase }>("/purchases", {
        method: "POST",
        body: toApiPayload(formData),
      });
      return purchase;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not create purchase"));
    }
  }
);

export const updatePurchase = createAsyncThunk<Purchase,
  { id: string; formData: Partial<PurchaseFormValues> },
  { rejectValue: string }
>("purchase/updatePurchase", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { purchase } = await apiRequest<{ purchase: Purchase }>(`/purchases/${id}`, {
      method: "PATCH",
      body: toApiPayload(formData),
    });
    return purchase;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not update purchase"));
  }
});

export const deletePurchase = createAsyncThunk<string, string, { rejectValue: string }>(
  "purchase/deletePurchase",
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest(`/purchases/${id}`, { method: "DELETE" });
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not delete purchase"));
    }
  }
);

export const confirmPurchase = createAsyncThunk<Purchase, string, { rejectValue: string }>(
  "purchase/confirmPurchase",
  async (id, { rejectWithValue }) => {
    try {
      const { purchase } = await apiRequest<{ purchase: Purchase }>(`/purchases/${id}/confirm`, { method: "PATCH" });
      return purchase;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not confirm purchase"));
    }
  }
);

export const cancelPurchase = createAsyncThunk<Purchase, string, { rejectValue: string }>(
  "purchase/cancelPurchase",
  async (id, { rejectWithValue }) => {
    try {
      const { purchase } = await apiRequest<{ purchase: Purchase }>(`/purchases/${id}/cancel`, { method: "PATCH" });
      return purchase;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not cancel purchase"));
    }
  }
);

const purchaseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {
    clearActivePurchase: (state) => {
      state.activePurchase = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchPurchases.fulfilled,
        (state, action: PayloadAction<{ purchases: Purchase[]; pagination: PaginationMeta }>) => {
          state.status = "succeeded";
          state.purchases = action.payload.purchases;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchPurchases.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error = "Could not load purchases";
      })

      .addCase(fetchPurchaseById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPurchaseById.fulfilled, (state, action: PayloadAction<Purchase>) => {
        state.status = "succeeded";
        state.activePurchase = action.payload;
      })
      .addCase(fetchPurchaseById.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load purchase";
      })

      .addCase(createPurchase.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action: PayloadAction<Purchase>) => {
        state.status = "succeeded";
        state.purchases.unshift(action.payload);
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not create purchase";
      })

      .addCase(updatePurchase.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updatePurchase.fulfilled, (state, action: PayloadAction<Purchase>) => {
        state.status = "succeeded";
        state.activePurchase = action.payload;
        const index = state.purchases.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.purchases[index] = action.payload;
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not update purchase";
      })

      .addCase(deletePurchase.fulfilled, (state, action: PayloadAction<string>) => {
        state.purchases = state.purchases.filter((p) => p.id !== action.payload);
      })

      .addCase(confirmPurchase.fulfilled, (state, action: PayloadAction<Purchase>) => {
        const index = state.purchases.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.purchases[index] = action.payload;
        if (state.activePurchase?.id === action.payload.id) state.activePurchase = action.payload;
      })

      .addCase(cancelPurchase.fulfilled, (state, action: PayloadAction<Purchase>) => {
        const index = state.purchases.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.purchases[index] = action.payload;
        if (state.activePurchase?.id === action.payload.id) state.activePurchase = action.payload;
      });
  },
});

export const { clearActivePurchase } = purchaseSlice.actions;
export default purchaseSlice.reducer;
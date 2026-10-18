import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Supplier, SupplierStatus } from "../../types/supplier";
import type { PaginationMeta } from "@/types/dataTable";
import type { SupplierFormValues } from "../../schemas/supplierSchemas";
import { apiRequest, ApiClientError } from "@/lib/apiClient";

interface SupplierState {
  suppliers: Supplier[];
  pagination: PaginationMeta | null;
  activeSupplier: Supplier | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SupplierState = {
  suppliers: [],
  pagination: null,
  activeSupplier: null,
  status: "idle",
  error: null,
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

/**
 * The form carries the nested address/bank objects and numeric fields as
 * flat string inputs — reshape into what the backend expects.
 */
function toApiPayload(formData: Partial<SupplierFormValues>) {
  const {
    street,
    city,
    state,
    pincode,
    country,
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName,
    branchName,
    openingBalance,
    currentBalance,
    openingWeight,
    currentWeight,
    creditPeriod,
    branchId,
    companyId,
    ...rest
  } = formData;

  return {
    ...rest,
    branchId: branchId || null,
    companyId: companyId || null,
    address: { street, city, state, pincode, country },
    bankDetails: { accountHolderName, accountNumber, ifscCode, bankName, branchName },
    openingBalance: openingBalance ? Number(openingBalance) : 0,
    currentBalance: currentBalance ? Number(currentBalance) : undefined,
    openingWeight: openingWeight ? Number(openingWeight) : 0,
    currentWeight: currentWeight ? Number(currentWeight) : undefined,
    creditPeriod: creditPeriod ? Number(creditPeriod) : null,
  };
}

export interface SupplierListQuery {
  search?: string;
  supplierType?: string;
  isBlacklisted?: boolean;
  branchId?: string;
  sortBy?: "supplierName" | "supplierCode" | "supplierType" | "createdAt" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const fetchSuppliers = createAsyncThunk(
  "supplier/fetchSuppliers",
  async (query: SupplierListQuery = {}, { signal }) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.supplierType) params.set("supplierType", query.supplierType);
    if (query.isBlacklisted !== undefined) params.set("isBlacklisted", String(query.isBlacklisted));
    if (query.branchId) params.set("branchId", query.branchId);
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.order) params.set("order", query.order);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const qs = params.toString();
    return apiRequest<{ suppliers: Supplier[]; pagination: PaginationMeta }>(
      `/suppliers${qs ? `?${qs}` : ""}`,
      { signal }
    );
  }
);

export const fetchSupplierById = createAsyncThunk("supplier/fetchSupplierById", async (id: string) => {
  const { supplier } = await apiRequest<{ supplier: Supplier }>(`/suppliers/${id}`);
  return supplier;
});

export const createSupplier = createAsyncThunk<Supplier, SupplierFormValues, { rejectValue: string }>(
  "supplier/createSupplier",
  async (formData, { rejectWithValue }) => {
    try {
      const { supplier } = await apiRequest<{ supplier: Supplier }>("/suppliers", {
        method: "POST",
        body: toApiPayload(formData),
      });
      return supplier;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not create supplier"));
    }
  }
);

export const updateSupplier = createAsyncThunk<Supplier,
  { id: string; formData: Partial<SupplierFormValues> },
  { rejectValue: string }
>("supplier/updateSupplier", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { supplier } = await apiRequest<{ supplier: Supplier }>(`/suppliers/${id}`, {
      method: "PATCH",
      body: toApiPayload(formData),
    });
    return supplier;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not update supplier"));
  }
});

export const deleteSupplier = createAsyncThunk<string, string, { rejectValue: string }>(
  "supplier/deleteSupplier",
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest(`/suppliers/${id}`, { method: "DELETE" });
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not delete supplier"));
    }
  }
);

export const toggleSupplierStatus = createAsyncThunk(
  "supplier/toggleStatus",
  async ({ id }: { id: string; status: SupplierStatus }) => {
    const { supplier } = await apiRequest<{ supplier: Supplier }>(`/suppliers/${id}/status`, { method: "PATCH" });
    return supplier;
  }
);

export const toggleSupplierBlacklist = createAsyncThunk<Supplier,
  { id: string; blacklistReason?: string },
  { rejectValue: string }
>("supplier/toggleBlacklist", async ({ id, blacklistReason }, { rejectWithValue }) => {
  try {
    const { supplier } = await apiRequest<{ supplier: Supplier }>(`/suppliers/${id}/blacklist`, {
      method: "PATCH",
      body: { blacklistReason },
    });
    return supplier;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not update blacklist status"));
  }
});

const supplierSlice = createSlice({
  name: "supplier",
  initialState,
  reducers: {
    clearActiveSupplier: (state) => {
      state.activeSupplier = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchSuppliers.fulfilled,
        (state, action: PayloadAction<{ suppliers: Supplier[]; pagination: PaginationMeta }>) => {
          state.status = "succeeded";
          state.suppliers = action.payload.suppliers;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchSuppliers.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error = "Could not load suppliers";
      })

      .addCase(fetchSupplierById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSupplierById.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.status = "succeeded";
        state.activeSupplier = action.payload;
      })
      .addCase(fetchSupplierById.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load supplier";
      })

      .addCase(createSupplier.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.status = "succeeded";
        state.suppliers.unshift(action.payload);
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not create supplier";
      })

      .addCase(updateSupplier.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action: PayloadAction<Supplier>) => {
        state.status = "succeeded";
        state.activeSupplier = action.payload;
        const index = state.suppliers.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.suppliers[index] = action.payload;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not update supplier";
      })

      .addCase(deleteSupplier.fulfilled, (state, action: PayloadAction<string>) => {
        state.suppliers = state.suppliers.filter((s) => s.id !== action.payload);
      })

      .addCase(toggleSupplierStatus.fulfilled, (state, action: PayloadAction<Supplier>) => {
        const index = state.suppliers.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.suppliers[index] = action.payload;
      })

      .addCase(toggleSupplierBlacklist.fulfilled, (state, action: PayloadAction<Supplier>) => {
        const index = state.suppliers.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.suppliers[index] = action.payload;
        if (state.activeSupplier?.id === action.payload.id) state.activeSupplier = action.payload;
      });
  },
});

export const { clearActiveSupplier } = supplierSlice.actions;
export default supplierSlice.reducer;
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { ProductModel, ProductModelStatus } from "@/types/productModel";
import type { PaginationMeta } from "@/types/dataTable";
import type { ProductModelFormValues } from "@/schemas/productModelSchemas";
import { apiRequest, ApiClientError } from "@/lib/apiClient";

interface ProductModelState {
  productModels: ProductModel[];
  pagination: PaginationMeta | null;
  activeProductModel: ProductModel | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProductModelState = {
  productModels: [],
  pagination: null,
  activeProductModel: null,
  status: "idle",
  error: null,
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

/**
 * The form carries the weight range as two flat string inputs and the
 * overrides as optional strings — reshape into what the backend expects
 * before sending.
 */
function toApiPayload(formData: Partial<ProductModelFormValues>) {
  const {
    grossWeightMin,
    grossWeightMax,
    makingChargeType,
    makingChargeValue,
    wastagePercent,
    stoneDetails,
    openingWeight,
    openingAmount,
    hsnCode,
    occasion,
    metalType,
    gender,
    tagNumber,
    designNumber,
    collectionName,
    designBrand,
    description,
    supplierPayment,
    ...rest
  } = formData;

  return {
    ...rest,
    grossWeightRange:
      grossWeightMin !== undefined && grossWeightMax !== undefined
        ? { min: Number(grossWeightMin), max: Number(grossWeightMax) }
        : undefined,
    openingWeight: openingWeight ? Number(openingWeight) : null,
    openingAmount: openingAmount ? Number(openingAmount) : null,
    hsnCode: hsnCode || null,
    occasion: occasion || null,
    metalType: metalType || null,
    gender: gender || null,
    tagNumber: tagNumber || null,
    designNumber: designNumber || null,
    collectionName: collectionName || null,
    designBrand: designBrand || null,
    description: description || null,
    makingChargeType: makingChargeType ? makingChargeType : null,
    makingChargeValue: makingChargeValue ? Number(makingChargeValue) : null,
    wastagePercent: wastagePercent ? Number(wastagePercent) : null,
    stoneDetails: formData.hasStones
      ? (stoneDetails ?? []).map((s) => ({
          ...s,
          approxWeight: s.approxWeight ? Number(s.approxWeight) : undefined,
        }))
      : [],
    supplierPayment: formData.isPartialProduct
      ? {
          supplierName: supplierPayment?.supplierName || undefined,
          paymentStatus: supplierPayment?.paymentStatus || undefined,
          amountPaid: supplierPayment?.amountPaid ? Number(supplierPayment.amountPaid) : undefined,
          amountDue: supplierPayment?.amountDue ? Number(supplierPayment.amountDue) : undefined,
        }
      : undefined,
  };
}

export interface ProductModelListQuery {
  search?: string;
  productNameId?: string;
  purity?: string;
  hasStones?: boolean;
  sortBy?: "modelName" | "modelCode" | "purity" | "createdAt" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const fetchProductModels = createAsyncThunk(
  "productModel/fetchProductModels",
  async (query: ProductModelListQuery = {}, { signal }) => {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.productNameId) params.set("productNameId", query.productNameId);
    if (query.purity) params.set("purity", query.purity);
    if (query.hasStones !== undefined) params.set("hasStones", String(query.hasStones));
    if (query.sortBy) params.set("sortBy", query.sortBy);
    if (query.order) params.set("order", query.order);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const qs = params.toString();
    return apiRequest<{ productModels: ProductModel[]; pagination: PaginationMeta }>(
      `/inventory/product-models${qs ? `?${qs}` : ""}`,
      { signal }
    );
  }
);

export const fetchProductModelById = createAsyncThunk("productModel/fetchProductModelById", async (id: string) => {
  const { productModel } = await apiRequest<{ productModel: ProductModel }>(`/inventory/product-models/${id}`);
  return productModel;
});

export const createProductModel = createAsyncThunk<ProductModel, ProductModelFormValues, { rejectValue: string }>(
  "productModel/createProductModel",
  async (formData, { rejectWithValue }) => {
    try {
      const { productModel } = await apiRequest<{ productModel: ProductModel }>("/inventory/product-models", {
        method: "POST",
        body: toApiPayload(formData),
      });
      return productModel;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not create product model"));
    }
  }
);

export const updateProductModel = createAsyncThunk<
  ProductModel,
  { id: string; formData: Partial<ProductModelFormValues> },
  { rejectValue: string }
>("productModel/updateProductModel", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { productModel } = await apiRequest<{ productModel: ProductModel }>(`/inventory/product-models/${id}`, {
      method: "PATCH",
      body: toApiPayload(formData),
    });
    return productModel;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not update product model"));
  }
});

export const deleteProductModel = createAsyncThunk<string, string, { rejectValue: string }>(
  "productModel/deleteProductModel",
  async (id, { rejectWithValue }) => {
    try {
      await apiRequest(`/inventory/product-models/${id}`, { method: "DELETE" });
      return id;
    } catch (err) {
      return rejectWithValue(errorMessage(err, "Could not delete product model"));
    }
  }
);

export const toggleProductModelStatus = createAsyncThunk(
  "productModel/toggleStatus",
  async ({ id }: { id: string; status: ProductModelStatus }) => {
    const { productModel } = await apiRequest<{ productModel: ProductModel }>(
      `/inventory/product-models/${id}/status`,
      { method: "PATCH" }
    );
    return productModel;
  }
);

const productModelSlice = createSlice({
  name: "productModel",
  initialState,
  reducers: {
    clearActiveProductModel: (state) => {
      state.activeProductModel = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductModels.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchProductModels.fulfilled,
        (state, action: PayloadAction<{ productModels: ProductModel[]; pagination: PaginationMeta }>) => {
          state.status = "succeeded";
          state.productModels = action.payload.productModels;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchProductModels.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error = "Could not load product models";
      })

      .addCase(fetchProductModelById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductModelById.fulfilled, (state, action: PayloadAction<ProductModel>) => {
        state.status = "succeeded";
        state.activeProductModel = action.payload;
      })
      .addCase(fetchProductModelById.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load product model";
      })

      .addCase(createProductModel.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createProductModel.fulfilled, (state, action: PayloadAction<ProductModel>) => {
        state.status = "succeeded";
        state.productModels.unshift(action.payload);
      })
      .addCase(createProductModel.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not create product model";
      })

      .addCase(updateProductModel.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProductModel.fulfilled, (state, action: PayloadAction<ProductModel>) => {
        state.status = "succeeded";
        state.activeProductModel = action.payload;
        const index = state.productModels.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) state.productModels[index] = action.payload;
      })
      .addCase(updateProductModel.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not update product model";
      })

      .addCase(deleteProductModel.fulfilled, (state, action: PayloadAction<string>) => {
        state.productModels = state.productModels.filter((m) => m.id !== action.payload);
      })

      .addCase(toggleProductModelStatus.fulfilled, (state, action: PayloadAction<ProductModel>) => {
        const index = state.productModels.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) state.productModels[index] = action.payload;
      });
  },
});

export const { clearActiveProductModel } = productModelSlice.actions;
export default productModelSlice.reducer;

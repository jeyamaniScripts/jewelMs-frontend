import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { Employee, EmployeeStatus } from "@/types/employee";
import type { GeneratedCredentials } from "@/types/credentials";
import type { PaginationMeta } from "@/types/dataTable";
import type { EmployeeFormValues } from "@/schemas/employeeSchemas";
import { apiRequest, ApiClientError } from "@/lib/apiClient";

interface EmployeeState {
  employees: Employee[];
  pagination: PaginationMeta | null;
  activeEmployee: Employee | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastCreatedCredentials: GeneratedCredentials | null;
}

const initialState: EmployeeState = {
  employees: [],
  pagination: null,
  activeEmployee: null,
  status: "idle",
  error: null,
  lastCreatedCredentials: null,
};

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiClientError ? err.message : fallback;
}

export interface EmployeeListQuery {
  search?: string;
  role?: string;
  /** Scope to one branch — only meaningful for a Brand Admin or main-branch
   *  Showroom Admin viewing via the switcher; the backend ignores/overrides
   *  this for anyone else. */
  showroomId?: string;
  sortBy?: "fullName" | "createdAt" | "role" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// The backend derives the real scope (brand + showroom, if applicable) from
// the logged-in user's own token — this query is just search/filter/sort/paging.
export const fetchEmployees = createAsyncThunk("employee/fetchEmployees", async (query: EmployeeListQuery = {}) => {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.role) params.set("role", query.role);
  if (query.showroomId) params.set("showroomId", query.showroomId);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.order) params.set("order", query.order);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));

  const qs = params.toString();
  return apiRequest<{ employees: Employee[]; pagination: PaginationMeta }>(`/employees${qs ? `?${qs}` : ""}`);
});

export const fetchEmployeeById = createAsyncThunk("employee/fetchEmployeeById", async (id: string) => {
  const { employee } = await apiRequest<{ employee: Employee }>(`/employees/${id}`);
  return employee;
});

export const createEmployee = createAsyncThunk<
  { employee: Employee; credentials: GeneratedCredentials | null },
  { brandId: string; formData: EmployeeFormValues },
  { rejectValue: string }
>("employee/createEmployee", async ({ formData }, { rejectWithValue }) => {
  try {
    return await apiRequest<{ employee: Employee; credentials: GeneratedCredentials | null }>("/employees", {
      method: "POST",
      body: formData,
    });
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not create employee"));
  }
});

export const updateEmployee = createAsyncThunk<
  Employee,
  { id: string; formData: Partial<EmployeeFormValues> },
  { rejectValue: string }
>("employee/updateEmployee", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { employee } = await apiRequest<{ employee: Employee }>(`/employees/${id}`, {
      method: "PATCH",
      body: formData,
    });
    return employee;
  } catch (err) {
    return rejectWithValue(errorMessage(err, "Could not update employee"));
  }
});

export const deleteEmployee = createAsyncThunk("employee/deleteEmployee", async (id: string) => {
  await apiRequest(`/employees/${id}`, { method: "DELETE" });
  return id;
});

/** For an employee created WITHOUT a login — grants one after the fact. */
export const grantEmployeeCredentials = createAsyncThunk(
  "employee/grantCredentials",
  async ({ employee }: { employee: Employee }) => {
    const { credentials } = await apiRequest<{ credentials: GeneratedCredentials }>(
      `/employees/${employee.id}/grant-credentials`,
      { method: "POST" }
    );
    return { employeeId: employee.id, username: employee.email, credentials };
  }
);

export const regenerateEmployeeCredentials = createAsyncThunk(
  "employee/regenerateCredentials",
  async ({ employee }: { employee: Employee }) => {
    const { credentials } = await apiRequest<{ credentials: GeneratedCredentials }>(
      `/employees/${employee.id}/regenerate-credentials`,
      { method: "POST" }
    );
    return { credentials };
  }
);

export const toggleEmployeeStatus = createAsyncThunk(
  "employee/toggleStatus",
  async ({ id }: { id: string; status: EmployeeStatus }) => {
    const { employee } = await apiRequest<{ employee: Employee }>(`/employees/${id}/status`, {
      method: "PATCH",
    });
    return employee;
  }
);

const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    clearEmployeeCredentials: (state) => {
      state.lastCreatedCredentials = null;
    },
    clearActiveEmployee: (state) => {
      state.activeEmployee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchEmployees.fulfilled,
        (state, action: PayloadAction<{ employees: Employee[]; pagination: PaginationMeta }>) => {
          state.status = "succeeded";
          state.employees = action.payload.employees;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchEmployees.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load employees";
      })

      .addCase(fetchEmployeeById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.status = "succeeded";
        state.activeEmployee = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state) => {
        state.status = "failed";
        state.error = "Could not load employee";
      })

      .addCase(createEmployee.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.employees.unshift(action.payload.employee);
        state.lastCreatedCredentials = action.payload.credentials;
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not create employee";
      })

      .addCase(updateEmployee.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action: PayloadAction<Employee>) => {
        state.status = "succeeded";
        state.activeEmployee = action.payload;
        const index = state.employees.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) state.employees[index] = action.payload;
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not update employee";
      })

      .addCase(deleteEmployee.fulfilled, (state, action: PayloadAction<string>) => {
        state.employees = state.employees.filter((e) => e.id !== action.payload);
      })

      .addCase(grantEmployeeCredentials.fulfilled, (state, action) => {
        const employee = state.employees.find((e) => e.id === action.payload.employeeId);
        if (employee) {
          employee.hasCredentials = true;
          employee.username = action.payload.username;
        }
        state.lastCreatedCredentials = action.payload.credentials;
      })

      .addCase(regenerateEmployeeCredentials.fulfilled, (state, action) => {
        state.lastCreatedCredentials = action.payload.credentials;
      })

      .addCase(toggleEmployeeStatus.fulfilled, (state, action: PayloadAction<Employee>) => {
        const index = state.employees.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) state.employees[index] = action.payload;
      });
  },
});

export const { clearEmployeeCredentials, clearActiveEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;

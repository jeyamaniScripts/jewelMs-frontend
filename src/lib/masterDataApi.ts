import { apiRequest } from "@/lib/apiClient";

export type MasterStatus = "active" | "inactive";

export interface MasterCategory {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

export interface MasterOption {
  id: string;
  categoryId: string;
  label: string;
  status: MasterStatus;
  createdAt: string;
  updatedAt: string;
}

export function listMasterCategories() {
  return apiRequest<{ masterCategories: MasterCategory[] }>("/master-data/categories");
}

export function createMasterCategory(input: { name: string; key: string }) {
  return apiRequest<{ masterCategory: MasterCategory }>("/master-data/categories", {
    method: "POST",
    body: input,
  });
}

export function updateMasterCategory(categoryId: string, input: { name: string }) {
  return apiRequest<{ masterCategory: MasterCategory }>(
    `/master-data/categories/${encodeURIComponent(categoryId)}`,
    { method: "PATCH", body: input },
  );
}

export function deleteMasterCategory(categoryId: string) {
  return apiRequest<void>(
    `/master-data/categories/${encodeURIComponent(categoryId)}`,
    { method: "DELETE" },
  );
}

export function listMasterOptions(
  categoryId: string,
  includeInactive = false,
  signal?: AbortSignal,
) {
  const query = includeInactive ? "?includeInactive=true" : "";
  return apiRequest<{ category: MasterCategory; options: MasterOption[] }>(
    `/master-data/categories/${encodeURIComponent(categoryId)}/options${query}`,
    { signal },
  );
}

export function listActiveMasterOptionsByKey(categoryKey: string, signal?: AbortSignal) {
  return apiRequest<{ category: MasterCategory; options: MasterOption[] }>(
    `/master-data/categories/by-key/${encodeURIComponent(categoryKey)}/options`,
    { signal },
  );
}

export function createMasterOption(categoryId: string, label: string) {
  return apiRequest<{ option: MasterOption }>(
    `/master-data/categories/${encodeURIComponent(categoryId)}/options`,
    { method: "POST", body: { label } },
  );
}

export function toggleMasterOptionStatus(optionId: string) {
  return apiRequest<{ option: MasterOption }>(
    `/master-data/options/${encodeURIComponent(optionId)}/status`,
    { method: "PATCH" },
  );
}

export function deleteMasterOption(optionId: string) {
  return apiRequest<void>(`/master-data/options/${encodeURIComponent(optionId)}`, {
    method: "DELETE",
  });
}

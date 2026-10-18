"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { MdAdd, MdCheckCircle, MdDelete, MdToggleOff } from "react-icons/md";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/layout/PageHeader";
import {
  createMasterCategory,
  createMasterOption,
  deleteMasterCategory,
  deleteMasterOption,
  listMasterCategories,
  listMasterOptions,
  toggleMasterOptionStatus,
  type MasterCategory,
  type MasterOption,
} from "@/lib/masterDataApi";
import { ApiClientError } from "@/lib/apiClient";

function messageFrom(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}

function createCategoryKey(name: string) {
  return name
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function StatusControl({
  active,
  disabled,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors
        disabled:cursor-not-allowed disabled:opacity-50
        ${active ? "bg-success-subtle text-success hover:bg-success/15" : "bg-surface-tint text-ink-muted hover:bg-border"}`}
    >
      {active ? <MdCheckCircle size={15} /> : <MdToggleOff size={15} />}
      {active ? "Active" : "Inactive"}
    </button>
  );
}

export default function MasterDataPage() {
  const [categories, setCategories] = useState<MasterCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [options, setOptions] = useState<MasterOption[]>([]);
  const [optionsCategoryId, setOptionsCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [optionLabel, setOptionLabel] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingOption, setIsSavingOption] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<MasterCategory | null>(null);
  const [optionToDelete, setOptionToDelete] = useState<MasterOption | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const loadCategories = useCallback(async (preferredId?: string) => {
    try {
      const { masterCategories } = await listMasterCategories();
      setCategories(masterCategories);
      setSelectedCategoryId((currentId) => {
        const requested = preferredId
          ? masterCategories.find((category) => category.id === preferredId)
          : undefined;
        if (requested) return requested.id;
        if (masterCategories.some((category) => category.id === currentId)) return currentId;
        return masterCategories[0]?.id ?? "";
      });
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "Could not load master categories."));
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    listMasterCategories()
      .then(({ masterCategories }) => {
        if (!active) return;
        setCategories(masterCategories);
        setSelectedCategoryId(masterCategories[0]?.id ?? "");
        setError("");
      })
      .catch((cause: unknown) => {
        if (active) setError(messageFrom(cause, "Could not load master categories."));
      })
      .finally(() => {
        if (active) setIsLoadingCategories(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      return;
    }
    const controller = new AbortController();
    Promise.resolve()
      .then(() => listMasterOptions(selectedCategoryId, true, controller.signal))
      .then(({ options: categoryOptions }) => {
        setOptions(categoryOptions);
        setOptionsCategoryId(selectedCategoryId);
        setError("");
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(messageFrom(cause, "Could not load labels for this category."));
        setOptions([]);
        setOptionsCategoryId(selectedCategoryId);
      })
    return () => controller.abort();
  }, [selectedCategoryId]);

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = categoryName.trim();
    const key = createCategoryKey(name);
    if (key.length < 2) {
      setError("Enter a category name containing at least two letters or numbers.");
      return;
    }
    setIsSavingCategory(true);
    setError("");
    try {
      const { masterCategory } = await createMasterCategory({ name, key });
      setCategoryName("");
      setIsLoadingCategories(true);
      await loadCategories(masterCategory.id);
    } catch (cause) {
      setError(messageFrom(cause, "Could not create this category."));
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleCreateOption = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCategory) return;
    setIsSavingOption(true);
    setError("");
    try {
      await createMasterOption(selectedCategory.id, optionLabel.trim());
      setOptionLabel("");
      const { options: updatedOptions } = await listMasterOptions(selectedCategory.id, true);
      setOptions(updatedOptions);
      setOptionsCategoryId(selectedCategory.id);
    } catch (cause) {
      setError(messageFrom(cause, "Could not create this label."));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setBusyId(categoryToDelete.id);
    setIsDeleting(true);
    setError("");
    try {
      await deleteMasterCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setOptions([]);
      setOptionsCategoryId("");
      setIsLoadingCategories(true);
      await loadCategories();
    } catch (cause) {
      setError(messageFrom(cause, "Could not delete this category. Delete its labels first."));
      setCategoryToDelete(null);
    } finally {
      setBusyId("");
      setIsDeleting(false);
    }
  };

  const handleDeleteOption = async () => {
    if (!optionToDelete) return;
    setBusyId(optionToDelete.id);
    setIsDeleting(true);
    setError("");
    try {
      await deleteMasterOption(optionToDelete.id);
      setOptions((current) => current.filter((item) => item.id !== optionToDelete.id));
      setOptionToDelete(null);
    } catch (cause) {
      setError(messageFrom(cause, "Could not delete this label."));
      setOptionToDelete(null);
    } finally {
      setBusyId("");
      setIsDeleting(false);
    }
  };

  const handleToggleOption = async (option: MasterOption) => {
    setBusyId(option.id);
    setError("");
    try {
      const { option: updatedOption } = await toggleMasterOptionStatus(option.id);
      setOptions((current) =>
        current.map((item) => item.id === option.id ? updatedOption : item),
      );
    } catch (cause) {
      setError(messageFrom(cause, "Could not update label status."));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <PageHeader title="Master Data" subtitle="Manage reusable form categories and labels." />

      {error && <Alert>{error}</Alert>}

      <div className="grid items-stretch gap-4 lg:h-[min(680px,calc(100dvh-230px))] lg:min-h-[420px] lg:grid-cols-[minmax(270px,0.8fr)_minmax(0,1.6fr)]">
        <section className="flex h-auto min-h-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5 lg:h-full lg:min-h-0">
          <h2 className="font-heading text-base font-semibold text-ink">Categories</h2>
          <form onSubmit={handleCreateCategory} className="mt-4 space-y-3">
            <Input
              name="master-category-name"
              label="New category"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="e.g. Bank"
              maxLength={80}
              required
            />
            <Button type="submit" fullWidth={false} isLoading={isSavingCategory} disabled={!categoryName.trim()}>
              <MdAdd size={18} /> Add category
            </Button>
          </form>

          <div className="master-data-scroll mt-4 max-h-[220px] min-h-0 space-y-2 overflow-y-auto border-t border-border pt-3 pr-1 lg:max-h-none lg:flex-1">
            {isLoadingCategories ? (
              <p className="py-3 text-sm text-ink-muted">Loading categories…</p>
            ) : categories.length === 0 ? (
              <p className="py-3 text-sm text-ink-muted">No categories yet. Create one above.</p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 transition-colors ${
                    selectedCategoryId === category.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-surface hover:bg-surface-tint/50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="min-w-0 flex-1 text-left"
                    aria-pressed={selectedCategoryId === category.id}
                  >
                    <span className="block truncate text-sm font-medium text-ink">{category.name}</span>
                    <code className="mt-0.5 block truncate text-xs text-ink-muted">{category.key}</code>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(category)}
                    disabled={busyId === category.id}
                    aria-label={`Delete ${category.name} category`}
                    title="Delete category"
                    className="shrink-0 rounded-lg p-2 text-ink-muted transition-colors hover:bg-danger-subtle hover:text-danger disabled:opacity-50"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="flex h-auto min-h-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5 lg:h-full lg:min-h-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-semibold text-ink">
                {selectedCategory ? `${selectedCategory.name} labels` : "Labels"}
              </h2>
            </div>
          </div>

          {selectedCategory && (
            <form onSubmit={handleCreateOption} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  name="master-option-label"
                  label="Add label"
                  value={optionLabel}
                  onChange={(event) => setOptionLabel(event.target.value)}
                  placeholder={selectedCategory.key === "bank" ? "e.g. HDFC" : "Enter a label"}
                  maxLength={100}
                  required
                />
              </div>
              <Button
                type="submit"
                fullWidth={false}
                isLoading={isSavingOption}
                disabled={!optionLabel.trim()}
              >
                <MdAdd size={18} /> Add label
              </Button>
            </form>
          )}

          <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border">
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] gap-3 bg-surface-tint px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <span>Label</span>
              <span className="text-right">Status / action</span>
            </div>
            <div className="master-data-scroll max-h-[220px] min-h-0 flex-1 overflow-y-auto lg:max-h-none">
              {optionsCategoryId !== selectedCategoryId && selectedCategoryId ? (
                <p className="px-4 py-5 text-sm text-ink-muted">Loading labels…</p>
              ) : options.length === 0 ? (
                <p className="px-4 py-5 text-sm text-ink-muted">
                  {selectedCategory ? "No labels in this category yet." : "Choose a category to view its labels."}
                </p>
              ) : (
                options.map((option) => (
                  <div
                    key={option.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-border px-4 py-2.5"
                  >
                    <span className={option.status === "active" ? "truncate text-sm font-medium text-ink" : "truncate text-sm text-ink-muted"}>
                      {option.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <StatusControl
                        active={option.status === "active"}
                        disabled={busyId === option.id}
                        onClick={() => void handleToggleOption(option)}
                      />
                      <button
                        type="button"
                        onClick={() => setOptionToDelete(option)}
                        disabled={busyId === option.id}
                        aria-label={`Delete ${option.label} label`}
                        title="Delete label"
                        className="rounded-lg p-2 text-ink-muted transition-colors hover:bg-danger-subtle hover:text-danger disabled:opacity-50"
                      >
                        <MdDelete size={17} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        title="Delete category?"
        message={`Delete "${categoryToDelete?.name ?? ""}"? A category can only be deleted after all its labels have been deleted.`}
        isLoading={isDeleting}
        onConfirm={() => void handleDeleteCategory()}
        onCancel={() => setCategoryToDelete(null)}
      />
      <ConfirmDialog
        open={Boolean(optionToDelete)}
        title="Delete label?"
        message={`Delete "${optionToDelete?.label ?? ""}"? This cannot be undone.`}
        isLoading={isDeleting}
        onConfirm={() => void handleDeleteOption()}
        onCancel={() => setOptionToDelete(null)}
      />
    </div>
  );
}

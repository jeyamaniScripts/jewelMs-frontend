"use client";

import { useEffect, useState } from "react";
import Dropdown from "@/components/ui/Dropdown";
import { listActiveMasterOptionsByKey, type MasterOption } from "@/lib/masterDataApi";

interface MasterOptionSelectProps {
  categoryKey: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function MasterOptionSelect({
  categoryKey,
  value,
  onChange,
  label,
  placeholder = "Select an option",
  disabled = false,
}: MasterOptionSelectProps) {
  const [options, setOptions] = useState<MasterOption[]>([]);
  const [loadedCategoryKey, setLoadedCategoryKey] = useState("");
  const [error, setError] = useState("");
  const isLoading = Boolean(categoryKey) && loadedCategoryKey !== categoryKey;

  useEffect(() => {
    if (!categoryKey) return;
    const controller = new AbortController();
    Promise.resolve()
      .then(() => listActiveMasterOptionsByKey(categoryKey, controller.signal))
      .then(({ options: activeOptions }) => {
        setOptions(activeOptions);
        setLoadedCategoryKey(categoryKey);
        setError("");
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setOptions([]);
        setLoadedCategoryKey(categoryKey);
        setError(cause instanceof Error ? cause.message : "Could not load master options.");
      });
    return () => controller.abort();
  }, [categoryKey]);
  const visibleOptions = loadedCategoryKey === categoryKey ? options : [];

  return (
    <div>
      <Dropdown
        label={label}
        options={visibleOptions.map((option) => ({ value: option.id, label: option.label }))}
        value={value}
        onChange={onChange}
        placeholder={isLoading ? "Loading options..." : placeholder}
        disabled={disabled || isLoading || !categoryKey}
      />
      {error && <p className="mt-1.5 text-caption text-danger">{error}</p>}
      {!error && !isLoading && categoryKey && visibleOptions.length === 0 && (
        <p className="mt-1.5 text-caption text-ink-muted">No active labels in this category.</p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { MdDragIndicator, MdCheck } from "react-icons/md";
import type { ColumnDef } from "@/types/dataTable";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ColumnArrangeModalProps<T> {
  open: boolean;
  onClose: () => void;
  columns: ColumnDef<T>[];
  columnOrder: string[];
  visibleColumnKeys: string[];
  onApply: (order: string[], visible: string[]) => void;
  onSave: (order: string[], visible: string[]) => Promise<void>;
  onResetToDefault: () => Promise<void>;
}

/** Purely a personal-convenience arrangement — drag to reorder, check to
 *  show/hide, and remember it for next time. Nothing more than that. */
export default function ColumnArrangeModal<T>({
  open,
  onClose,
  columns,
  columnOrder,
  visibleColumnKeys,
  onApply,
  onSave,
  onResetToDefault,
}: ColumnArrangeModalProps<T>) {
  const [draftOrder, setDraftOrder] = useState(columnOrder);
  const [draftVisible, setDraftVisible] = useState(visibleColumnKeys);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const columnByKey = new Map(columns.map((c) => [c.key, c]));

  const handleDrop = (targetKey: string) => {
    if (!draggedKey || draggedKey === targetKey) return;
    const next = [...draftOrder];
    const fromIndex = next.indexOf(draggedKey);
    const toIndex = next.indexOf(targetKey);
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, draggedKey);
    setDraftOrder(next);
    setDraggedKey(null);
  };

  const toggleVisible = (key: string) => {
    const column = columnByKey.get(key);
    if (column?.alwaysVisible) return;
    setDraftVisible((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const applyAndClose = () => {
    onApply(draftOrder, draftVisible);
    onClose();
  };

  const runSave = async (task: () => Promise<void>) => {
    onApply(draftOrder, draftVisible);
    setIsSaving(true);
    try {
      await task();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Arrange columns" maxWidth="max-w-md">
      <p className="mb-4 text-sm text-ink-muted">
        Drag to reorder. Uncheck to hide a column — the primary column and Actions can&apos;t be hidden.
      </p>

      <div className="max-h-80 space-y-1 overflow-y-auto">
        {draftOrder.map((key) => {
          const column = columnByKey.get(key);
          if (!column) return null;
          const isVisible = draftVisible.includes(key);
          const isLocked = !!column.alwaysVisible;

          return (
            <div
              key={key}
              draggable
              onDragStart={() => setDraggedKey(key)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(key)}
              className={`flex items-center gap-2.5 rounded-lg border border-border bg-surface px-2.5 py-2
                ${draggedKey === key ? "opacity-40" : ""}`}
            >
              <MdDragIndicator size={18} className="shrink-0 cursor-grab text-ink-muted active:cursor-grabbing" />

              <button
                type="button"
                onClick={() => toggleVisible(key)}
                disabled={isLocked}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border
                  ${isVisible ? "border-primary bg-primary text-white" : "border-border bg-surface"}
                  ${isLocked ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {isVisible && <MdCheck size={14} />}
              </button>

              <span className={`text-sm ${isVisible ? "text-ink" : "text-ink-muted"}`}>{column.header}</span>
              {isLocked && <span className="ml-auto text-caption text-ink-muted">Always shown</span>}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => runSave(onResetToDefault)}
          disabled={isSaving}
          className="text-sm text-ink-muted hover:text-danger disabled:opacity-50"
        >
          Reset to default
        </button>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" fullWidth={false} className="px-4" onClick={applyAndClose}>
            Apply once
          </Button>
          <Button
            type="button"
            fullWidth={false}
            className="px-4"
            isLoading={isSaving}
            onClick={() => runSave(() => onSave(draftOrder, draftVisible))}
          >
            Save my arrangement
          </Button>
        </div>
      </div>
    </Modal>
  );
}

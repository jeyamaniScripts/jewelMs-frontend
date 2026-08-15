"use client";

import { useEffect, useRef, useState } from "react";
import type { ColumnDef } from "@/types/dataTable";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchTableLayouts, savePersonalLayout, resetPersonalLayout } from "@/redux/slices/tableLayoutSlice";
import { showToast } from "@/redux/slices/toastSlice";

/**
 * Purely a personal convenience — how THIS person likes to see this table.
 * No "shared/default for everyone" concept here; every person arranges
 * their own view and it's remembered for them, nothing more.
 */
export function useColumnLayout<T>(module: string | undefined, columns: ColumnDef<T>[]) {
  const dispatch = useAppDispatch();
  const saved = useAppSelector((state) => (module ? state.tableLayout.byModule[module] : undefined));

  const defaultOrder = columns.map((c) => c.key);
  const defaultVisible = columns.filter((c) => c.defaultVisible !== false).map((c) => c.key);

  const [columnOrder, setColumnOrder] = useState<string[]>(defaultOrder);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(defaultVisible);
  const hasAppliedSaved = useRef(false);

  useEffect(() => {
    if (module) dispatch(fetchTableLayouts(module));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, module]);

  useEffect(() => {
    if (!module || hasAppliedSaved.current || saved?.status !== "loaded") return;
    const effective = saved.layout;
    if (effective) {
      // Guard against a saved layout referencing columns that no longer
      // exist (e.g. a column was removed from the table since it was saved).
      const validOrder = effective.columnOrder.filter((key) => defaultOrder.includes(key));
      const validVisible = effective.visibleColumns.filter((key) => defaultOrder.includes(key));
      setColumnOrder(
        validOrder.length ? [...validOrder, ...defaultOrder.filter((k) => !validOrder.includes(k))] : defaultOrder
      );
      setVisibleColumnKeys(validVisible.length ? validVisible : defaultVisible);
    }
    hasAppliedSaved.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module, saved?.status]);

  const saveLayout = async () => {
    if (!module) return;
    await dispatch(savePersonalLayout({ module, layout: { columnOrder, visibleColumns: visibleColumnKeys } }));
    dispatch(showToast("Saved how you like this table arranged", "success"));
  };

  const resetToDefault = async () => {
    setColumnOrder(defaultOrder);
    setVisibleColumnKeys(defaultVisible);
    if (module) {
      await dispatch(resetPersonalLayout(module));
      dispatch(showToast("Reset to default layout", "info"));
    }
  };

  return {
    columnOrder,
    setColumnOrder,
    visibleColumnKeys,
    setVisibleColumnKeys,
    saveLayout,
    resetToDefault,
  };
}

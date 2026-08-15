"use client";

import { useEffect, useMemo } from "react";
import { MdStorefront } from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchBranchOptions, setSelectedBranch } from "@/redux/slices/showroomSlice";
import { showToast } from "@/redux/slices/toastSlice";
import Dropdown from "@/components/ui/Dropdown";

export default function BranchSwitcher() {
  const dispatch = useAppDispatch();
  const brandId = useAppSelector((state) => state.auth.user?.brandId);
  const { branchOptions, selectedBranchId, status, isBranchDataLoading } = useAppSelector((state) => state.showroom);

  useEffect(() => {
    if (!brandId) return;
    dispatch(fetchBranchOptions(brandId))
      .unwrap()
      .catch(() => dispatch(showToast("Could not load your branch list", "error")));
  }, [dispatch, brandId]);

  const options = useMemo(
    () =>
      branchOptions.map((branch) => ({
        value: branch.id,
        label: branch.isMainBranch ? `${branch.showroomName} (Main)` : branch.showroomName,
      })),
    [branchOptions]
  );

  if (status === "idle" || (status === "loading" && branchOptions.length === 0)) return null;
  if (branchOptions.length === 0) return null;

  return (
    <div className="flex w-56 items-center gap-2">
      {isBranchDataLoading ? (
        <FiLoader size={18} className="shrink-0 animate-spin text-primary" />
      ) : (
        <MdStorefront size={18} className="shrink-0 text-ink-muted" />
      )}
      <Dropdown
        options={options}
        value={selectedBranchId ?? ""}
        onChange={(value) => dispatch(setSelectedBranch(value))}
        placeholder="Select branch"
      />
    </div>
  );
}


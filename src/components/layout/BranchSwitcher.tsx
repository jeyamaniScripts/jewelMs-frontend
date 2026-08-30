"use client";

import { useEffect, useMemo, useState } from "react";
import { MdStorefront } from "react-icons/md";
import { FiLoader } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchBranchOptions, setSelectedBranch } from "@/redux/slices/showroomSlice";
import { showToast } from "@/redux/slices/toastSlice";
import Dropdown from "@/components/ui/Dropdown";

// Purely a visual acknowledgment that the click registered — NOT tied to
// any other page's fetch state. A cross-page "is data loading" flag was
// tried here before and got stuck permanently on any page (e.g. Add
// Employee) that never fetches branch-scoped data and so never clears it.
// A fixed, self-contained timer can never get stuck like that — every
// individual table's own `isLoading` (driven by its own request's
// pending/fulfilled/rejected lifecycle) is the real loading signal.
const ACK_DURATION_MS = 500;

export default function BranchSwitcher() {
  const dispatch = useAppDispatch();
  const brandId = useAppSelector((state) => state.auth.user?.brandId);
  const { branchOptions, selectedBranchId, status } = useAppSelector((state) => state.showroom);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

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

  const handleChange = (value: string) => {
    dispatch(setSelectedBranch(value));
    setIsAcknowledging(true);
    window.setTimeout(() => setIsAcknowledging(false), ACK_DURATION_MS);
  };

  if (status === "idle" || (status === "loading" && branchOptions.length === 0)) return null;
  if (branchOptions.length === 0) return null;

  return (
    <div className="flex w-32 items-center gap-1.5 sm:w-44 sm:gap-2 md:w-52">
      {isAcknowledging ? (
        <FiLoader size={18} className="shrink-0 animate-spin text-primary" />
      ) : (
        <MdStorefront size={18} className="shrink-0 text-ink-muted" />
      )}
      <Dropdown options={options} value={selectedBranchId ?? ""} onChange={handleChange} placeholder="Select branch" />
    </div>
  );
}

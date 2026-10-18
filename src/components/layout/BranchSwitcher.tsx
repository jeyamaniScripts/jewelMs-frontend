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
  const user = useAppSelector((state) => state.auth.user);
  const canSwitchBranches = user?.canViewAllBranches === true;
  const brandId = user?.brandId;
  const { branchOptions, selectedBranchId, branchOptionsStatus } = useAppSelector((state) => state.showroom);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  useEffect(() => {
    if (!canSwitchBranches || !brandId) return;
    dispatch(fetchBranchOptions(brandId))
      .unwrap()
      .catch(() => dispatch(showToast("Could not load your branch list", "error")));
  }, [dispatch, brandId, canSwitchBranches]);

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

  const fixedBranch = user?.showroomId
    ? [{ value: user.showroomId, label: user.showroomName || "Current branch" }]
    : [];
  const visibleOptions = canSwitchBranches ? options : fixedBranch;
  const value = canSwitchBranches ? selectedBranchId ?? "" : user?.showroomId ?? "";
  const isLoading = canSwitchBranches && branchOptionsStatus === "loading";

  return (
    <div className="flex w-[min(25vw,7rem)] min-w-[4.75rem] items-center gap-1 sm:w-44 sm:gap-2 md:w-52">
      {isAcknowledging ? (
        <FiLoader size={18} className="hidden shrink-0 animate-spin text-primary sm:block" />
      ) : (
        <MdStorefront size={18} className="hidden shrink-0 text-ink-muted sm:block" />
      )}
      <Dropdown
        options={visibleOptions}
        value={value}
        onChange={handleChange}
        placeholder={isLoading ? "Loading..." : canSwitchBranches ? "Select branch" : "Branch"}
        disabled={!canSwitchBranches || isLoading || visibleOptions.length === 0}
      />
    </div>
  );
}

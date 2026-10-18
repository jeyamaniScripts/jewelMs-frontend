"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MdMenu,
  MdKeyboardArrowDown,
  MdLogout,
  MdPerson,
} from "react-icons/md";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { openSidebar } from "@/redux/slices/uiSlice";
import { logoutUser } from "@/redux/slices/authSlice";
import { ROLE_LABEL } from "@/constants/roles";
import { MdDiamond } from "react-icons/md";
import ThemeToggle from "@/components/theme/ThemeToggle";
import NotificationBell from "@/components/layout/NotificationBell";
import BranchSwitcher from "@/components/layout/BranchSwitcher";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const role = useAppSelector((state) => state.auth.role);
  const companyName =
    user?.companyName || user?.companyShortName || "Ashira Jewels";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/login");
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-30 flex h-14 min-w-0 shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-2 sm:px-4 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          onClick={() => dispatch(openSidebar())}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-tint lg:hidden"
          aria-label="Open menu"
        >
          <MdMenu size={22} />
        </button>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white lg:hidden">
          <MdDiamond size={16} />
        </span>
        <span className="min-w-0 max-w-[min(35vw,15rem)] truncate font-heading text-sm font-semibold text-ink sm:max-w-[15rem] sm:text-base">
          {companyName}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
        {(user?.canViewAllBranches || user?.showroomId) && <BranchSwitcher />}
        <ThemeToggle className="h-8 w-8 sm:h-9 sm:w-9" />
        {role && <NotificationBell />}

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-1 rounded-xl py-1 pl-1 pr-0.5 hover:bg-surface-tint sm:gap-2 sm:py-1.5 sm:pl-1.5 sm:pr-2.5"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight text-ink">
                {user?.fullName ?? "Guest"}
              </span>
              <span className="block text-caption leading-tight text-ink-muted">
                {role ? ROLE_LABEL[role] : ""}
              </span>
            </span>
            <MdKeyboardArrowDown
              size={18}
              className={`hidden text-ink-muted transition-transform sm:block ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-floating">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/profile");
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink hover:bg-surface-tint"
              >
                <MdPerson size={17} /> Profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/10"
              >
                <MdLogout size={17} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

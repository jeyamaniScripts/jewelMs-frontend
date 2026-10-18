"use client";

import { useState } from "react";
import { useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDiamond, MdChevronLeft, MdChevronRight, MdClose, MdExpandMore, MdSearch } from "react-icons/md";
import { FiX } from "react-icons/fi";

import { MENU_CONFIG, type MenuItem } from "@/constants/menuConfig";
import type { Role } from "@/types/auth";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeSidebar, toggleSidebarCollapsed } from "@/redux/slices/uiSlice";

function isItemActive(item: MenuItem, pathname: string): boolean {
  if (pathname === item.path || pathname.startsWith(`${item.path}/`)) return true;
  return !!item.children?.some((child) => isItemActive(child, pathname));
}

function filterMenuItems(
  items: MenuItem[],
  role: Role | null,
  isMainBranchSelected: boolean,
): MenuItem[] {
  return items.flatMap((item) => {
    if (
      !role ||
      !item.roles.includes(role) ||
      (item.branchAccess === "main" && !isMainBranchSelected)
    ) {
      return [];
    }

    const children = item.children
      ? filterMenuItems(item.children, role, isMainBranchSelected)
      : undefined;
    if (item.children && !children?.length) return [];

    return [{ ...item, children }];
  });
}

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.role);
  const user = useAppSelector((state) => state.auth.user);
  const branchOptions = useAppSelector((state) => state.showroom.branchOptions);
  const selectedBranchId = useAppSelector((state) => state.showroom.selectedBranchId);
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const [search, setSearch] = useState("");
  const searchId = useId();
  const companyName =
    user?.companyName || user?.companyShortName || "Ashira Jewels";

  const selectedBranch = branchOptions.find((branch) => branch.id === selectedBranchId);
  const isMainBranchSelected = selectedBranch?.isMainBranch === true;
  const items = filterMenuItems(MENU_CONFIG, role, isMainBranchSelected);
  const query = search.trim().toLocaleLowerCase();
  const filteredItems = items.flatMap((item) => {
    const children = item.children;
    if (!query) return [{ ...item, children }];
    if (item.label.toLocaleLowerCase().includes(query)) return [{ ...item, children }];
    const matches = children?.filter((child) =>
      child.label.toLocaleLowerCase().includes(query),
    );
    return matches?.length ? [{ ...item, children: matches }] : [];
  });

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  /**
   * `isCollapsed` is only ever true for the DESKTOP rail. The mobile drawer
   * always calls this with `false` — icon-only mode makes no sense in an
   * already-narrow off-canvas drawer, and previously both desktop + mobile
   * shared one JSX block that read the same `collapsed` value from Redux,
   * so collapsing on desktop then shrinking to mobile left the drawer stuck
   * in icon-only mode too. Passing it explicitly per-render fixes that.
   */
  function renderNav(isCollapsed: boolean, navId: string) {
    return (
      <div className="flex h-full flex-col bg-surface">
        {/* Logo row */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <MdDiamond size={16} />
            </div>
            {!isCollapsed && (
              <span className="truncate font-heading text-[15px] font-medium text-ink">
                {companyName}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => dispatch(closeSidebar())}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-tint lg:hidden"
            aria-label="Close menu"
          >
            <MdClose size={19} />
          </button>
        </div>

        {/* Menu */}
        {!isCollapsed && (
          <div className="shrink-0 px-2 pt-3">
            <label className="sr-only" htmlFor={`${navId}-menu-search`}>Search menu</label>
            <div className="relative">
              <MdSearch size={17} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                id={`${navId}-menu-search`}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search menu"
                autoComplete="off"
                className="w-full rounded-lg border border-border bg-surface py-2 pl-8 pr-8 text-sm text-ink placeholder:text-ink-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear menu search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-muted hover:bg-surface-tint hover:text-ink"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item, pathname);
            const visibleChildren = item.children;
            const hasChildren = !!visibleChildren?.length;
            const isOpen = Boolean(query) || (expanded[item.key] ?? active);

            if (hasChildren) {
              return (
                <div key={item.key}>
                  <button
                    type="button"
                    onClick={() => (isCollapsed ? undefined : toggleGroup(item.key))}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors
                      ${active ? "bg-primary/10 text-primary" : "text-ink-muted hover:bg-surface-tint hover:text-primary"}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 truncate text-left">{item.label}</span>
                        <MdExpandMore
                          size={17}
                          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </>
                    )}
                  </button>

                  {!isCollapsed && isOpen && (
                    <div className="ml-3.5 mt-0.5 space-y-0.5 border-l border-border pl-2.5">
                      {visibleChildren!.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname === child.path;
                        return (
                          <Link
                            key={child.key}
                            href={child.path}
                            onClick={() => dispatch(closeSidebar())}
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors
                              ${
                                childActive
                                  ? "bg-primary text-white"
                                  : "text-ink-muted hover:bg-surface-tint hover:text-primary"
                              }`}
                          >
                            <ChildIcon size={15} className="shrink-0" />
                            <span className="truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.path}
                onClick={() => dispatch(closeSidebar())}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors
                  ${
                    active
                      ? "bg-primary text-white"
                      : "text-ink-muted hover:bg-surface-tint hover:text-primary"
                  }`}
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
          {query && filteredItems.length === 0 && (
            <p className="px-2.5 py-4 text-sm text-ink-muted">
              No menu items match “{search}”.
            </p>
          )}
        </nav>

        {/* Desktop collapse toggle — hidden via CSS below lg, so it's a no-op in the mobile drawer */}
        <button
          type="button"
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className="hidden shrink-0 items-center justify-center gap-2 border-t border-border py-2.5
            text-ink-muted hover:bg-surface-tint hover:text-primary lg:flex"
        >
          {isCollapsed ? <MdChevronRight size={17} /> : <MdChevronLeft size={17} />}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar — respects the collapsed toggle */}
      <div
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-border transition-all duration-200 lg:block
          ${collapsed ? "w-[72px]" : "w-60"}`}
      >
        {renderNav(collapsed, `${searchId}-desktop`)}
      </div>

      {/* Mobile drawer + branded backdrop — ALWAYS expanded, ignores the desktop collapse state */}
      <div
        className={`fixed inset-0 z-40 transition-opacity lg:hidden
          ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ background: "rgba(9, 99, 126, 0.55)" }}
        onClick={() => dispatch(closeSidebar())}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform border-r border-border
          shadow-floating transition-transform duration-200 lg:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {renderNav(false, `${searchId}-mobile`)}
      </div>
    </>
  );
}

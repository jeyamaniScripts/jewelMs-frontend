"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDiamond, MdChevronLeft, MdChevronRight, MdClose, MdExpandMore } from "react-icons/md";

import { MENU_CONFIG, type MenuItem } from "@/constants/menuConfig";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { closeSidebar, toggleSidebarCollapsed } from "@/redux/slices/uiSlice";

function isItemActive(item: MenuItem, pathname: string): boolean {
  if (pathname === item.path || pathname.startsWith(`${item.path}/`)) return true;
  return !!item.children?.some((child) => isItemActive(child, pathname));
}

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.role);
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed);

  const items = MENU_CONFIG.filter((item) => role && item.roles.includes(role));

  // Auto-expand whichever group contains the active route.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const next: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.children && isItemActive(item, pathname)) next[item.key] = true;
    });
    setExpanded((prev) => ({ ...prev, ...next }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
  function renderNav(isCollapsed: boolean) {
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
                Ashira Jewels
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
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item, pathname);
            const visibleChildren = item.children?.filter(
              (child) => role && child.roles.includes(role)
            );
            const hasChildren = !!visibleChildren?.length;
            const isOpen = !!expanded[item.key];

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
        {renderNav(collapsed)}
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
        {renderNav(false)}
      </div>
    </>
  );
}

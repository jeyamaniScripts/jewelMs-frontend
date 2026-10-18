"use client";

import type { ReactNode } from "react";
import type { IconType } from "react-icons";

export interface TabItem {
  id: string;
  label: string;
  icon?: IconType;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  children: ReactNode;
}

export default function Tabs({ items, activeId, onChange, children }: TabsProps) {
  return (
    <div>
      <div
        role="tablist"
        aria-label="Settings sections"
        className="mb-6 flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:thin]"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              id={`${item.id}-tab`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${item.id}-panel`}
              onClick={() => onChange(item.id)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors
                ${isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-ink-muted hover:border-border hover:text-ink"}`}
            >
              {Icon && <Icon size={17} aria-hidden="true" />}
              {item.label}
            </button>
          );
        })}
      </div>
      <section
        id={`${activeId}-panel`}
        role="tabpanel"
        aria-labelledby={`${activeId}-tab`}
        tabIndex={0}
      >
        {children}
      </section>
    </div>
  );
}

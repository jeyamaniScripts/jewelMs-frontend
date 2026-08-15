import type { IconType } from "react-icons";

export default function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: IconType;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-caption font-medium uppercase tracking-wide text-ink-muted">
          {label}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-h3 text-ink">{value}</p>
    </div>
  );
}

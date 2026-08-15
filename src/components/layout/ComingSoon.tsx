import type { IconType } from "react-icons";

export default function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: IconType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center shadow-card">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon size={26} />
      </span>
      <h3 className="mt-4 text-h4">{title}</h3>
      <p className="mt-2 max-w-md text-body text-ink-muted">{description}</p>
    </div>
  );
}

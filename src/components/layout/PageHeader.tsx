export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h1 className="text-h2">{title}</h1>
      {subtitle && <p className="mt-1 text-body text-ink-muted">{subtitle}</p>}
    </div>
  );
}

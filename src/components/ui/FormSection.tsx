export default function FormSection({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-border pb-2 pt-1 first:pt-0">
      <h3 className="text-h4">{title}</h3>
      {description && <p className="mt-0.5 text-caption text-ink-muted">{description}</p>}
    </div>
  );
}

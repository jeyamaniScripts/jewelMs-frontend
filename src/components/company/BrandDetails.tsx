import type { Brand, AuditUserRef } from "@/types/company";

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-caption font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}

/** createdBy/updatedBy come back populated ({fullName,email}) from the API,
 *  but could be a plain id string right after creation — display whichever we have. */
function auditRefLabel(ref?: AuditUserRef | string): string | undefined {
  if (!ref) return undefined;
  return typeof ref === "string" ? ref : `${ref.fullName} (${ref.email})`;
}

export default function BrandDetails({ brand }: { brand: Brand }) {
  const address = [brand.addressLine1, brand.addressLine2, brand.city, brand.state, brand.pincode, brand.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {brand.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.logoUrl} alt="" className="h-16 w-16 rounded-xl border border-border object-cover" />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Company name" value={brand.companyName} />
        <Field label="Owner" value={brand.ownerName} />
        <Field label="Email" value={brand.email} />
        <Field label="Phone" value={brand.phone} />
        <Field label="Alternate phone" value={brand.alternatePhone} />
        <Field label="Website" value={brand.website} />
        <Field label="GST number" value={brand.gstNumber} />
        <Field label="PAN number" value={brand.panNumber} />
        <Field label="Business reg. number" value={brand.businessRegNumber} />
        <Field label="Showrooms" value={String(brand.showroomsCount)} />
      </div>

      {address && <Field label="Address" value={address} />}

      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">Record</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Created by" value={auditRefLabel(brand.createdBy)} />
          <Field label="Created" value={new Date(brand.createdAt).toLocaleString()} />
          <Field label="Updated by" value={auditRefLabel(brand.updatedBy)} />
          <Field label="Updated" value={brand.updatedAt ? new Date(brand.updatedAt).toLocaleString() : undefined} />
        </div>
      </div>
    </div>
  );
}

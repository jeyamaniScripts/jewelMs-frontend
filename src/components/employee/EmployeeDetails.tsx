import type { Employee } from "@/types/employee";
import { EMPLOYEE_ROLE_LABEL } from "@/constants/employeeRoles";

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-caption font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="text-sm text-ink">{value}</p>
    </div>
  );
}

export default function EmployeeDetails({ employee }: { employee: Employee }) {
  const address = [
    employee.addressLine1,
    employee.addressLine2,
    employee.city,
    employee.state,
    employee.pincode,
    employee.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {employee.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={employee.profilePhotoUrl}
            alt=""
            className="h-16 w-16 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
            {employee.fullName.slice(0, 1)}
          </div>
        )}
        <div>
          <p className="font-heading text-base font-medium text-ink">{employee.fullName}</p>
          <p className="text-sm text-ink-muted">{employee.employeeCode}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">Contact</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Mobile" value={employee.mobile} />
          <Field label="Alternate mobile" value={employee.alternateMobile} />
          <Field label="Email" value={employee.email} />
          <Field label="Gender" value={employee.gender} />
          <Field label="Date of birth" value={employee.dateOfBirth} />
        </div>
        {address && <div className="mt-3"><Field label="Address" value={address} /></div>}
      </div>

      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">
          Identity Documents
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Aadhaar number" value={employee.aadhaarNumber} />
          <Field label="PAN number" value={employee.panNumber} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">Employment</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Role" value={EMPLOYEE_ROLE_LABEL[employee.role]} />
          <Field label="Department" value={employee.department} />
          <Field label="Designation" value={employee.designation} />
          <Field label="Employee type" value={employee.employeeType} />
          <Field label="Joining date" value={employee.joiningDate} />
          <Field label="Experience" value={employee.experienceYears ? `${employee.experienceYears} years` : undefined} />
          <Field label="Salary" value={employee.salary ? `₹${employee.salary.toLocaleString("en-IN")}` : undefined} />
        </div>
      </div>

      {(employee.bankName || employee.accountNumber) && (
        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">Bank Details</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Bank name" value={employee.bankName} />
            <Field label="Account number" value={employee.accountNumber} />
            <Field label="IFSC code" value={employee.ifscCode} />
            <Field label="UPI ID" value={employee.upiId} />
          </div>
        </div>
      )}

      {(employee.emergencyContactName || employee.emergencyContactNumber) && (
        <div>
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">
            Emergency Contact
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" value={employee.emergencyContactName} />
            <Field label="Number" value={employee.emergencyContactNumber} />
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-muted">Record</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Login access" value={employee.hasCredentials ? "Enabled" : "Not enabled"} />
          <Field label="Username" value={employee.username} />
          <Field label="Created by" value={employee.createdBy} />
          <Field label="Created" value={new Date(employee.createdAt).toLocaleDateString()} />
          <Field label="Updated by" value={employee.updatedBy} />
          <Field label="Updated" value={employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString() : undefined} />
        </div>
      </div>
    </div>
  );
}

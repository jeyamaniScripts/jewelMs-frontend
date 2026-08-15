
export type EmployeeStatus = "active" | "inactive";
export type Gender = "male" | "female" | "other";
export type EmployeeType = "full_time" | "part_time" | "contract" | "intern";

export interface Employee {
  id: string;
  employeeCode: string; // human-facing "Employee ID", e.g. EMP-LX3K9F2A
  brandId: string;
  /** Present only for showroom-scoped roles (showroom_admin/manager/cashier/staff). */
  showroomId?: string;

  // Personal
  firstName: string;
  lastName: string;
  fullName: string; // derived: `${firstName} ${lastName}`
  profilePhotoUrl?: string;
  gender?: Gender;
  dateOfBirth?: string; // ISO date

  // Contact
  mobile: string;
  alternateMobile?: string;
  email: string;

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;

  // Identity documents
  aadhaarNumber?: string;
  panNumber?: string;

  // Employment
  department?: string;
  designation?: string;
  employeeType?: EmployeeType;
  joiningDate?: string; // ISO date
  experienceYears?: number;
  salary?: number;

  // Bank details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;

  // Emergency contact
  emergencyContactName?: string;
  emergencyContactNumber?: string;

  // Access
  /** A built-in Role value, or a custom roleKey (e.g. "custom_inventory_lead_abc123") from Roles & Permissions. */
  role: string;
  status: EmployeeStatus;
  hasCredentials: boolean;
  username?: string; // only meaningful when hasCredentials is true

  // Audit (system-managed, not user-entered on the form)
  createdBy: string;
  updatedBy?: string;
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date
}

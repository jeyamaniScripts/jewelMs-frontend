"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiUser, FiMail, FiPhone, FiMapPin, FiHash, FiBriefcase, FiDollarSign } from "react-icons/fi";

import { employeeSchema, type EmployeeFormValues } from "@/schemas/employeeSchemas";
import { createEmployee, updateEmployee } from "@/redux/slices/employeeSlice";
import { fetchShowrooms } from "@/redux/slices/showroomSlice";
import { fetchRolePermissions } from "@/redux/slices/permissionSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ASSIGNABLE_ROLES_BY_CREATOR, isShowroomScopedRole } from "@/constants/employeeRoles";
import type { Role } from "@/types/auth";

import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Dropdown from "@/components/ui/Dropdown";
import DatePicker from "@/components/ui/DatePicker";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import ImageUpload from "@/components/ui/ImageUpload";
import FormSection from "@/components/ui/FormSection";

// Desktop shows up to 4 fields per row — short fields take 1 column,
// longer ones span 2.
const FIELD_GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4";

const DEPARTMENT_OPTIONS = [
  { value: "Sales", label: "Sales" },
  { value: "Inventory", label: "Inventory" },
  { value: "Accounts & Finance", label: "Accounts & Finance" },
  { value: "HR", label: "HR" },
  { value: "Security", label: "Security" },
  { value: "Administration", label: "Administration" },
  { value: "Customer Service", label: "Customer Service" },
];

const EMPLOYEE_TYPE_OPTIONS = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
];

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function EmployeeForm({
  onCreated,
  editingEmployeeId,
  defaultValues,
}: {
  onCreated: (hasCredentials: boolean) => void;
  editingEmployeeId?: string;
  defaultValues?: Partial<EmployeeFormValues>;
}) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentRole = useAppSelector((state) => state.auth.role);
  const { status, error } = useAppSelector((state) => state.employee);
  const showrooms = useAppSelector((state) => state.showroom.showrooms);
  const allRoles = useAppSelector((state) => state.permission.roles);
  const isSubmitting = status === "loading";
  const isEditing = !!editingEmployeeId;

  // Built-in roles are gated by the static "who can assign what" map so this
  // form never offers e.g. Super Admin. Custom roles (from Roles &
  // Permissions) are already scoped to the requester's own brand by the
  // backend — anything the API returned as `isCustom` is fair game here.
  const assignableBuiltInRoles = (currentRole && ASSIGNABLE_ROLES_BY_CREATOR[currentRole]) || [];
  const roleOptions = allRoles
    .filter((r) => r.isCustom || assignableBuiltInRoles.includes(r.roleKey as Role))
    .map((r) => ({ value: r.roleKey, label: r.isCustom ? `${r.label} (custom)` : r.label }));
  const showroomOptions = showrooms.map((sr) => ({ value: sr.id, label: sr.showroomName }));
  const showShowroomPicker = currentRole === "brand_admin";

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      profilePhotoUrl: undefined,
      gender: "",
      dateOfBirth: "",
      mobile: "",
      alternateMobile: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      aadhaarNumber: "",
      panNumber: "",
      department: "",
      designation: "",
      employeeType: "",
      joiningDate: "",
      experienceYears: "",
      salary: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      role: "",
      showroomId: "",
      status: "active",
      wantsCredentials: true,
      username: "",
      passwordMode: "auto",
      manualPassword: "",
      ...defaultValues,
    },
  });

  const selectedRole = watch("role") as Role | "";
  const wantsCredentials = watch("wantsCredentials");
  const passwordMode = watch("passwordMode");
  const email = watch("email");
  const selectedRoleRecord = allRoles.find((r) => r.roleKey === selectedRole);
  const isBuiltInShowroomRole = !!selectedRole && isShowroomScopedRole(selectedRole as Role);
  const isCustomRoleSelected = !!selectedRoleRecord?.isCustom;
  // Built-in showroom-scoped roles (Showroom Manager, Cashier, Staff) always
  // need a showroom. Custom roles might be showroom-level or brand-level —
  // we can't tell from the name, so the field shows up but stays optional.
  const needsShowroomField = showShowroomPicker && selectedRole && (isBuiltInShowroomRole || isCustomRoleSelected);

  useEffect(() => {
    dispatch(fetchRolePermissions());
  }, [dispatch]);

  useEffect(() => {
    if (showShowroomPicker && currentUser?.brandId) {
      dispatch(fetchShowrooms({ brandId: currentUser.brandId }));
    }
  }, [dispatch, showShowroomPicker, currentUser?.brandId]);

  const onSubmit = async (formValues: EmployeeFormValues) => {
    if (!currentUser?.brandId) return;

    const submission: EmployeeFormValues = {
      ...formValues,
      showroomId: showShowroomPicker ? formValues.showroomId : currentUser.showroomId,
      username: formValues.wantsCredentials ? formValues.username || formValues.email : "",
    };

    if (isEditing) {
      const result = await dispatch(updateEmployee({ id: editingEmployeeId, formData: submission }));
      if (updateEmployee.fulfilled.match(result)) onCreated(submission.wantsCredentials);
      return;
    }

    const result = await dispatch(createEmployee({ brandId: currentUser.brandId, formData: submission }));
    if (createEmployee.fulfilled.match(result)) {
      reset();
      onCreated(submission.wantsCredentials);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Alert variant="error">{error}</Alert>

      <FormSection title="Personal Details" />
      <Controller
        name="profilePhotoUrl"
        control={control}
        render={({ field }) => (
          <ImageUpload label="Profile photo" value={field.value} onChange={field.onChange} shape="circle" />
        )}
      />
      <div className={FIELD_GRID}>
        <Input label="First name" icon={FiUser} error={errors.firstName?.message} {...register("firstName")} />
        <Input label="Last name" icon={FiUser} error={errors.lastName?.message} {...register("lastName")} />
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Gender (optional)"
              options={GENDER_OPTIONS}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.gender?.message}
            />
          )}
        />
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Date of birth (optional)"
              value={field.value}
              onChange={field.onChange}
              maxDate={new Date()}
              error={errors.dateOfBirth?.message}
            />
          )}
        />
      </div>

      <FormSection title="Contact & Address" />
      <div className={FIELD_GRID}>
        <Input
          label="Mobile number"
          type="tel"
          icon={FiPhone}
          placeholder="9876543210"
          error={errors.mobile?.message}
          {...register("mobile")}
        />
        <Input
          label="Alternate mobile (optional)"
          type="tel"
          icon={FiPhone}
          error={errors.alternateMobile?.message}
          {...register("alternateMobile")}
        />
        <div className="sm:col-span-2">
          <Input
            label="Email"
            type="email"
            icon={FiMail}
            placeholder="staff@brand.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Address line 1 (optional)"
            icon={FiMapPin}
            error={errors.addressLine1?.message}
            {...register("addressLine1")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Address line 2 (optional)"
            icon={FiMapPin}
            error={errors.addressLine2?.message}
            {...register("addressLine2")}
          />
        </div>
        <Input label="City (optional)" error={errors.city?.message} {...register("city")} />
        <Input label="State (optional)" error={errors.state?.message} {...register("state")} />
        <Input label="Pincode (optional)" error={errors.pincode?.message} {...register("pincode")} />
        <Input label="Country (optional)" error={errors.country?.message} {...register("country")} />
      </div>

      <FormSection title="Identity Documents" description="Optional." />
      <div className={FIELD_GRID}>
        <div className="sm:col-span-2">
          <Input
            label="Aadhaar number"
            icon={FiHash}
            placeholder="123412341234"
            error={errors.aadhaarNumber?.message}
            {...register("aadhaarNumber")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="PAN number"
            icon={FiHash}
            placeholder="ABCDE1234F"
            error={errors.panNumber?.message}
            {...register("panNumber")}
          />
        </div>
      </div>

      <FormSection title="Employment Details" />
      <div className={FIELD_GRID}>
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Department (optional)"
              options={DEPARTMENT_OPTIONS}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.department?.message}
            />
          )}
        />
        <Input
          label="Designation (optional)"
          icon={FiBriefcase}
          placeholder="Senior Sales Executive"
          error={errors.designation?.message}
          {...register("designation")}
        />
        <Controller
          name="employeeType"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Employee type (optional)"
              options={EMPLOYEE_TYPE_OPTIONS}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.employeeType?.message}
            />
          )}
        />
        <Controller
          name="joiningDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Joining date (optional)"
              value={field.value}
              onChange={field.onChange}
              error={errors.joiningDate?.message}
            />
          )}
        />
        <div className="sm:col-span-2">
          <Input
            label="Experience (years, optional)"
            type="number"
            min={0}
            error={errors.experienceYears?.message}
            {...register("experienceYears")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Salary (optional)"
            type="number"
            min={0}
            icon={FiDollarSign}
            error={errors.salary?.message}
            {...register("salary")}
          />
        </div>
      </div>

      <FormSection title="Bank Details" description="Optional." />
      <div className={FIELD_GRID}>
        <div className="sm:col-span-2">
          <Input label="Bank name" error={errors.bankName?.message} {...register("bankName")} />
        </div>
        <Input label="Account number" error={errors.accountNumber?.message} {...register("accountNumber")} />
        <Input
          label="IFSC code"
          placeholder="HDFC0001234"
          error={errors.ifscCode?.message}
          {...register("ifscCode")}
        />
        <div className="sm:col-span-2">
          <Input label="UPI ID" placeholder="name@bank" error={errors.upiId?.message} {...register("upiId")} />
        </div>
      </div>

      <FormSection title="Emergency Contact" description="Optional." />
      <div className={FIELD_GRID}>
        <div className="sm:col-span-2">
          <Input
            label="Contact name"
            error={errors.emergencyContactName?.message}
            {...register("emergencyContactName")}
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            label="Contact number"
            type="tel"
            error={errors.emergencyContactNumber?.message}
            {...register("emergencyContactNumber")}
          />
        </div>
      </div>

      <FormSection title="Role & Access" />
      <div className={FIELD_GRID}>
        <div className="sm:col-span-2">
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Role"
                placeholder="Select a role"
                options={roleOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.role?.message}
              />
            )}
          />
        </div>
        <div className="sm:col-span-2">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Dropdown
                label="Status"
                options={STATUS_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.status?.message}
              />
            )}
          />
        </div>
        {needsShowroomField && (
          <div className="sm:col-span-2">
            <Controller
              name="showroomId"
              control={control}
              render={({ field }) => (
                <Dropdown
                  label={isBuiltInShowroomRole ? "Showroom" : "Showroom (optional)"}
                  options={showroomOptions}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  error={errors.showroomId?.message}
                />
              )}
            />
          </div>
        )}
      </div>

      {!isEditing && (
        <>
          <FormSection title="Login Credentials" />
          <Checkbox
            label="This employee needs login access to the system"
            {...register("wantsCredentials")}
          />

          {wantsCredentials && (
            <div className="space-y-4 rounded-xl border border-border bg-surface-tint p-4">
              <Input
                label="Username"
                placeholder={email || "Defaults to email if left blank"}
                error={errors.username?.message}
                {...register("username")}
              />

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="radio" value="auto" style={{ accentColor: "#088395" }} {...register("passwordMode")} />
                  Auto-generate temporary password
                </label>
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="radio" value="manual" style={{ accentColor: "#088395" }} {...register("passwordMode")} />
                  Set password manually
                </label>
              </div>

              {passwordMode === "manual" && (
                <PasswordInput
                  label="Password"
                  error={errors.manualPassword?.message}
                  {...register("manualPassword")}
                />
              )}

              <p className="text-caption text-ink-muted">
                The employee will be required to set their own password on first login regardless of
                which option you choose.
              </p>
            </div>
          )}
          {!wantsCredentials && (
            <p className="text-caption text-ink-muted">
              No login will be created. You can grant access later from the employee list.
            </p>
          )}
        </>
      )}
      {isEditing && (
        <p className="text-caption text-ink-muted">
          Login access isn&apos;t changed here — use the reset/grant-access icon on the employee
          list to manage credentials.
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} fullWidth={false} className="px-8">
        {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create employee"}
      </Button>
    </form>
  );
}

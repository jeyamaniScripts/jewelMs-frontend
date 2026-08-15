"use client";

import { useState } from "react";
import { MdPerson, MdLockReset, MdCheckCircle } from "react-icons/md";
import { useAppSelector } from "@/redux/hooks";
import { ROLE_LABEL } from "@/constants/roles";
import PageHeader from "@/components/layout/PageHeader";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const role = useAppSelector((state) => state.auth.role);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [justChanged, setJustChanged] = useState(false);

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account details." />

      <div className="max-w-md space-y-6">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MdPerson size={26} />
            </span>
            <div>
              <p className="font-heading text-lg font-semibold text-ink">{user?.fullName}</p>
              <p className="text-sm text-ink-muted">{role ? ROLE_LABEL[role] : ""}</p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-ink-muted">Email</dt>
              <dd className="text-ink">{user?.email}</dd>
            </div>
            {user?.brandId && (
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-ink-muted">Brand ID</dt>
                <dd className="text-ink">{user.brandId}</dd>
              </div>
            )}
            {user?.showroomId && (
              <div className="flex justify-between border-b border-border pb-3">
                <dt className="text-ink-muted">Showroom ID</dt>
                <dd className="text-ink">{user.showroomId}</dd>
              </div>
            )}
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-ink-muted">Last signed in</dt>
              <dd className="text-ink">{formatDateTime(user?.lastLoginAt)}</dd>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <dt className="text-ink-muted">Password last changed</dt>
              <dd className="text-ink">{formatDateTime(user?.passwordChangedAt)}</dd>
            </div>
            <div className="flex justify-between pb-1">
              <dt className="text-ink-muted">User ID</dt>
              <dd className="text-ink">{user?.id}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <MdLockReset size={20} className="text-primary" />
              <p className="font-heading text-base font-medium text-ink">Password</p>
            </div>
            {!isChangingPassword && (
              <button
                type="button"
                onClick={() => {
                  setJustChanged(false);
                  setIsChangingPassword(true);
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Change password
              </button>
            )}
          </div>

          {justChanged && !isChangingPassword && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-success">
              <MdCheckCircle size={16} /> Password updated.
            </p>
          )}

          {isChangingPassword && (
            <div className="mt-5">
              <ChangePasswordForm
                onSuccess={() => {
                  setIsChangingPassword(false);
                  setJustChanged(true);
                }}
              />
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="mt-3 text-sm text-ink-muted hover:text-ink"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MdPerson,
  MdLockReset,
  MdCheckCircle,
  MdDevices,
  MdLogout,
  MdRefresh,
} from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ROLE_LABEL } from "@/constants/roles";
import PageHeader from "@/components/layout/PageHeader";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ApiClientError } from "@/lib/apiClient";
import {
  fetchMySessions,
  revokeOtherSessions,
  revokeSession,
  type UserSession,
} from "@/lib/sessionApi";
import { showToast } from "@/redux/slices/toastSlice";

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const role = useAppSelector((state) => state.auth.role);
  const dispatch = useAppDispatch();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [justChanged, setJustChanged] = useState(false);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<UserSession | null>(null);
  const [confirmRevokeOthers, setConfirmRevokeOthers] = useState(false);

  const loadSessions = useCallback(async (signal?: AbortSignal) => {
    setIsLoadingSessions(true);
    try {
      const response = await fetchMySessions(signal);
      setSessions(response.sessions);
    } catch (error) {
      if (signal?.aborted) return;
      dispatch(
        showToast(
          error instanceof ApiClientError
            ? error.message
            : "Could not load active sessions.",
          "error",
        ),
      );
    } finally {
      if (!signal?.aborted) setIsLoadingSessions(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const controller = new AbortController();
    fetchMySessions(controller.signal)
      .then((response) => setSessions(response.sessions))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        dispatch(
          showToast(
            error instanceof ApiClientError
              ? error.message
              : "Could not load active sessions.",
            "error",
          ),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingSessions(false);
      });
    return () => controller.abort();
  }, [dispatch]);

  const revokeSelectedSession = async () => {
    if (!sessionToRevoke) return;
    setIsRevokingSessions(true);
    try {
      await revokeSession(sessionToRevoke.id);
      setSessions((current) => current.filter((session) => session.id !== sessionToRevoke.id));
      setSessionToRevoke(null);
      dispatch(showToast("Session signed out.", "success"));
    } catch (error) {
      dispatch(
        showToast(
          error instanceof ApiClientError ? error.message : "Could not sign out this session.",
          "error",
        ),
      );
    } finally {
      setIsRevokingSessions(false);
    }
  };

  const revokeAllOtherSessions = async () => {
    setIsRevokingSessions(true);
    try {
      await revokeOtherSessions();
      setSessions((current) => current.filter((session) => session.isCurrent));
      setConfirmRevokeOthers(false);
      dispatch(showToast("All other sessions have been signed out.", "success"));
    } catch (error) {
      dispatch(
        showToast(
          error instanceof ApiClientError ? error.message : "Could not sign out other sessions.",
          "error",
        ),
      );
    } finally {
      setIsRevokingSessions(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account details." />

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MdPerson size={26} />
              </span>
              <div>
                <p className="font-heading text-lg font-semibold text-ink">
                  {user?.fullName}
                </p>
                <p className="text-sm text-ink-muted">
                  {role ? ROLE_LABEL[role] : ""}
                </p>
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
                <dd className="text-ink">
                  {formatDateTime(user?.passwordChangedAt)}
                </dd>
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
                <p className="font-heading text-base font-medium text-ink">
                  Password
                </p>
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

        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <MdDevices size={20} className="text-primary" />
                <h2 className="font-heading text-base font-medium text-ink">Account sessions</h2>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                Review signed-in devices and end sessions you no longer use.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                fullWidth={false}
                className="px-3"
                onClick={() => void loadSessions()}
                disabled={isLoadingSessions}
              >
                <MdRefresh size={17} className="mr-1.5 inline" /> Refresh
              </Button>
              {sessions.some((session) => !session.isCurrent) && (
                <Button
                  type="button"
                  variant="danger"
                  fullWidth={false}
                  className="px-3"
                  onClick={() => setConfirmRevokeOthers(true)}
                >
                  Sign out other devices
                </Button>
              )}
            </div>
          </div>

          <div className="mt-5 divide-y divide-border">
            {isLoadingSessions ? (
              <p className="py-5 text-sm text-ink-muted">Loading active sessions…</p>
            ) : sessions.length === 0 ? (
              <p className="py-5 text-sm text-ink-muted">No active sessions found.</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                      <MdDevices size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 break-all text-sm font-medium text-ink">
                        {session.userAgent || "Unknown device"}
                        {session.isCurrent && (
                          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                            This device
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {session.ipAddress || "Unknown IP"} · Signed in {formatDateTime(session.loginAt)}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Last active {formatDateTime(session.lastUsedAt)}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth={false}
                      className="self-start px-3 sm:self-auto"
                      onClick={() => setSessionToRevoke(session)}
                    >
                      <MdLogout size={16} className="mr-1.5 inline" /> Sign out
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={Boolean(sessionToRevoke)}
        title="Sign out this device?"
        message={`This device will lose access to your account. ${sessionToRevoke?.userAgent ?? ""}`}
        confirmLabel="Sign out"
        isLoading={isRevokingSessions}
        onConfirm={() => void revokeSelectedSession()}
        onCancel={() => setSessionToRevoke(null)}
      />
      <ConfirmDialog
        open={confirmRevokeOthers}
        title="Sign out other devices?"
        message="All other active sessions will be signed out immediately. This device will stay signed in."
        confirmLabel="Sign out others"
        isLoading={isRevokingSessions}
        onConfirm={() => void revokeAllOtherSessions()}
        onCancel={() => setConfirmRevokeOthers(false)}
      />
    </div>
  );
}

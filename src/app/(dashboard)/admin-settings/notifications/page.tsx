"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { MdNotificationsActive, MdHistory, MdSave, MdSearch } from "react-icons/md";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import PageHeader from "@/components/layout/PageHeader";
import { ROLE_LABEL } from "@/constants/roles";
import { ApiClientError } from "@/lib/apiClient";
import {
  fetchNotificationHistory,
  fetchNotificationSettings,
  saveNotificationSettings,
  type NotificationEventSetting,
  type NotificationAudience,
  type NotificationChannel,
  type NotificationHistoryItem,
  type NotificationSettingsResponse,
} from "@/lib/notificationApi";
import type { Role } from "@/types/auth";

type Tab = "rules" | "history" | "audit";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function updateEvent(
  events: NotificationEventSetting[],
  eventType: string,
  update: Partial<NotificationEventSetting>,
) {
  return events.map((event) =>
    event.type === eventType ? { ...event, ...update } : event,
  );
}

function EventCard({
  event,
  availableRoles,
  availableAudiences,
  availableChannels,
  onChange,
}: {
  event: NotificationEventSetting;
  availableRoles: Role[];
  availableAudiences: NotificationAudience[];
  availableChannels: NotificationChannel[];
  onChange: (update: Partial<NotificationEventSetting>) => void;
}) {
  const handleRoleToggle = (role: Role, checked: boolean) => {
    const recipientRoles = checked
      ? [...new Set([...event.recipientRoles, role])]
      : event.recipientRoles.filter((item) => item !== role);
    onChange({ recipientRoles });
  };
  const toggleValue = <T extends string>(
    current: T[],
    value: T,
    checked: boolean,
  ) => checked
    ? [...new Set([...current, value])]
    : current.filter((item) => item !== value);
  const inAppEnabled = event.channels.includes("in_app");

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-caption font-semibold uppercase tracking-wide text-primary">
            {event.category}
          </p>
          <h3 className="mt-1 text-h4">{event.label}</h3>
          <p className="mt-1 text-sm text-ink-muted">{event.description}</p>
        </div>
      </div>

      <fieldset className="mt-4 border-t border-border pt-4">
        <legend className="mb-2 text-sm font-semibold text-ink">Channels</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {availableChannels.map((channel) => (
            <label
              key={channel.key}
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={event.channels.includes(channel.key)}
                onChange={(change) => onChange({
                  channels: toggleValue(event.channels, channel.key, change.target.checked),
                })}
                className="h-4 w-4 accent-primary"
              />
              {channel.label}
              {!channel.available && (
                <span className="rounded-full bg-warning-subtle px-2 py-0.5 text-[10px] font-semibold text-warning">
                  Provider required
                </span>
              )}
            </label>
          ))}
        </div>
        <p className="mt-2 text-caption text-ink-muted">
          Only in-app delivery is active today. Email, SMS, and WhatsApp selections are saved as setup preferences, but will not send until a provider is connected.
        </p>
      </fieldset>

      <fieldset className="mt-4 border-t border-border pt-4">
        <legend className="mb-2 text-sm font-semibold text-ink">Recipients</legend>
        <p className="mb-2 text-xs font-medium text-ink-muted">Retailer / admin team roles</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {availableRoles.map((role) => (
            <label key={role} className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={event.recipientRoles.includes(role)}
                onChange={(change) => handleRoleToggle(role, change.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              {ROLE_LABEL[role]}
            </label>
          ))}
        </div>
        {event.recipientRoles.length === 0 && inAppEnabled && (
          <p className="mt-2 text-caption text-warning">
            Select at least one team role to receive in-app notifications.
          </p>
        )}

        <p className="mb-2 mt-4 text-xs font-medium text-ink-muted">External recipients</p>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {availableAudiences.map((audience) => (
            <label
              key={audience.key}
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={event.audiences.includes(audience.key)}
                onChange={(change) => onChange({
                  audiences: toggleValue(event.audiences, audience.key, change.target.checked),
                })}
                className="h-4 w-4 accent-primary"
              />
              {audience.label}
              {!audience.available && (
                <span className="rounded-full bg-surface-tint px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                  Recipient data required
                </span>
              )}
            </label>
          ))}
        </div>

        <label className="mt-4 block text-sm font-semibold text-ink">
          In-app message template
          <textarea
            value={event.messageTemplate}
            onChange={(change) => onChange({ messageTemplate: change.target.value })}
            maxLength={300}
            rows={2}
            className="mt-1.5 block w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm font-normal text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label={`${event.label} message template`}
          />
        </label>
        <p className="mt-1 text-caption text-ink-muted">
          Use {"{message}"} for event details and {"{actor}"} for the person who performed the action.
        </p>
      </fieldset>
    </article>
  );
}

function HistoryRow({ item }: { item: NotificationHistoryItem }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-sm font-medium text-ink">{item.message}</td>
      <td className="px-4 py-3 text-sm text-ink-muted">{item.type.replaceAll("_", " ")}</td>
      <td className="px-4 py-3 text-sm text-ink-muted">{item.actorName || "System"}</td>
      <td className="px-4 py-3 text-sm text-ink-muted">{formatTimestamp(item.createdAt)}</td>
      <td className="px-4 py-3 text-sm text-ink-muted">In-app</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            item.isRead ? "bg-surface-tint text-ink-muted" : "bg-primary/10 text-primary"
          }`}
        >
          {item.isRead ? "Read" : "Unread"}
        </span>
      </td>
    </tr>
  );
}

export default function NotificationManagementPage() {
  const [tab, setTab] = useState<Tab>("rules");
  const [settings, setSettings] = useState<NotificationSettingsResponse | null>(null);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyType, setHistoryType] = useState("");
  const [historySearchInput, setHistorySearchInput] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetchNotificationSettings(controller.signal)
      .then(setSettings)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load notification settings."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (tab !== "history") return;
    const controller = new AbortController();
    fetchNotificationHistory(
      { page: historyPage, limit: 20, type: historyType, search: historySearch },
      controller.signal,
    )
      .then(({ notifications, pagination }) => {
        setHistory(notifications);
        setHistoryTotalPages(pagination.totalPages);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(cause, "Could not load notification history."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsHistoryLoading(false);
      });
    return () => controller.abort();
  }, [historyPage, historySearch, historyType, tab]);

  const eventTypes = useMemo(
    () =>
      [
        { value: "", label: "All event types" },
        ...(settings?.events ?? []).map((event) => ({
          value: event.type,
          label: event.label,
        })),
      ],
    [settings?.events],
  );

  const enabledCount = settings?.events.filter((event) => event.channels.includes("in_app")).length ?? 0;
  const updateEventSetting = (
    eventType: string,
    update: Partial<NotificationEventSetting>,
  ) => {
    if (!settings) return;
    setSuccess("");
    setSettings({
      ...settings,
      events: updateEvent(settings.events, eventType, update),
    });
  };

  const saveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await saveNotificationSettings(settings.events);
      setSettings({
        ...settings,
        events: response.events,
        updatedAt: response.updatedAt,
        updatedBy: response.updatedBy,
        auditTrail: response.auditTrail,
      });
      setSuccess("Notification settings saved.");
    } catch (cause) {
      setError(errorMessage(cause, "Could not save notification settings."));
    } finally {
      setIsSaving(false);
    }
  };

  const runHistorySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsHistoryLoading(true);
    setHistoryPage(1);
    setHistorySearch(historySearchInput.trim());
  };

  const selectTab = (nextTab: Tab) => {
    setError("");
    setSuccess("");
    if (nextTab === "history") setIsHistoryLoading(true);
    setTab(nextTab);
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Notification Management"
          subtitle="Choose which in-app events are delivered and which roles receive them."
        />
        <Link
          href="/admin-settings"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to Admin Settings
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <p className="text-caption text-ink-muted">Configured events</p>
          <p className="mt-1 text-h3 text-ink">{settings?.events.length ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <p className="text-caption text-ink-muted">In-app alerts enabled</p>
          <p className="mt-1 text-h3 text-primary">{enabledCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
          <p className="text-caption text-ink-muted">Active delivery channel</p>
          <p className="mt-1 text-h4 text-ink">In-app notifications</p>
          {settings?.updatedAt && (
            <p className="mt-1 text-caption text-ink-muted">
              Last saved {formatTimestamp(settings.updatedAt)}
              {settings.updatedBy ? ` by ${settings.updatedBy}` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4 flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => selectTab("rules")}
          className={`inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold ${
            tab === "rules" ? "border-primary text-primary" : "border-transparent text-ink-muted"
          }`}
        >
          <MdNotificationsActive size={18} /> Event settings
        </button>
        <button
          type="button"
          onClick={() => selectTab("history")}
          className={`inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold ${
            tab === "history" ? "border-primary text-primary" : "border-transparent text-ink-muted"
          }`}
        >
          <MdHistory size={18} /> Notification history
        </button>
        <button
          type="button"
          onClick={() => selectTab("audit")}
          className={`inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold ${
            tab === "audit" ? "border-primary text-primary" : "border-transparent text-ink-muted"
          }`}
        >
          <MdHistory size={18} /> Settings audit
        </button>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      {tab === "rules" && (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div>
              <p className="text-sm font-semibold text-ink">Channel foundation</p>
              <p className="mt-1 text-sm text-ink-muted">
                In-app delivery is active. Email, SMS, and WhatsApp are reserved for later provider and consent setup.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {settings?.availableChannels.map((channel) => (
                  <span
                    key={channel.key}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      channel.available
                        ? "bg-success-subtle text-success"
                        : "bg-surface-tint text-ink-muted"
                    }`}
                  >
                    {channel.label}: {channel.available ? "Available" : "Planned"}
                  </span>
                ))}
              </div>
            </div>
            <Button
              type="button"
              onClick={saveSettings}
              isLoading={isSaving}
              disabled={isLoading || !settings}
              fullWidth={false}
              className="px-5"
            >
              <MdSave size={18} /> Save settings
            </Button>
          </div>

          {isLoading ? (
            <p className="py-10 text-center text-sm text-ink-muted">Loading notification settings...</p>
          ) : settings ? (
            <div className="max-h-[68vh] space-y-4 overflow-y-auto pr-1">
              {settings.events.map((event) => (
                <EventCard
                  key={event.type}
                  event={event}
                  availableRoles={settings.availableRoles}
                  availableAudiences={settings.availableAudiences}
                  availableChannels={settings.availableChannels}
                  onChange={(update) => updateEventSetting(event.type, update)}
                />
              ))}
            </div>
          ) : null}
        </section>
      )}

      {tab === "history" && (
        <section>
          <form
            onSubmit={runHistorySearch}
            className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card md:grid-cols-[minmax(0,1fr)_16rem_auto]"
          >
            <label className="relative block">
              <span className="sr-only">Search notification messages</span>
              <MdSearch
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
              />
              <input
                value={historySearchInput}
                onChange={(event) => setHistorySearchInput(event.target.value)}
                placeholder="Search message"
                className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <Dropdown
              options={eventTypes}
              value={historyType}
              onChange={(value) => {
                setIsHistoryLoading(true);
                setHistoryType(value);
                setHistoryPage(1);
              }}
              placeholder="All event types"
            />
            <Button type="submit" fullWidth={false} className="px-5">
              Search
            </Button>
          </form>

          <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-card">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-surface-tint">
                <tr>
                  {["Message", "Event", "Actor", "Date", "Channel", "Status"].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((item) => <HistoryRow key={item.id} item={item} />)}
                {!history.length && !isHistoryLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">
                      No notification history found.
                    </td>
                  </tr>
                )}

                {isHistoryLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">
                      Loading notification history...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              Page {historyPage} of {historyTotalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={historyPage <= 1 || isHistoryLoading}
                onClick={() => {
                  setIsHistoryLoading(true);
                  setHistoryPage((page) => page - 1);
                }}
                fullWidth={false}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={historyPage >= historyTotalPages || isHistoryLoading}
                onClick={() => {
                  setIsHistoryLoading(true);
                  setHistoryPage((page) => page + 1);
                }}
                fullWidth={false}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      )}

      {tab === "audit" && (
        <section className="space-y-3">
          <p className="text-sm text-ink-muted">
            Recent notification-setting changes, including who changed them and which event rules were updated.
          </p>
          {isLoading ? (
            <p className="py-10 text-center text-sm text-ink-muted">Loading settings audit...</p>
          ) : settings?.auditTrail.length ? (
            settings.auditTrail.map((entry, index) => (
              <article
                key={`${entry.changedAt}-${index}`}
                className="rounded-2xl border border-border bg-surface p-4 shadow-card"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold text-ink">{entry.actorName}</p>
                  <time className="text-sm text-ink-muted">{formatTimestamp(entry.changedAt)}</time>
                </div>
                <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
                  {entry.changedEvents.map((change) => {
                    const eventLabel =
                      settings.events.find((event) => event.type === change.type)?.label ??
                      change.type.replaceAll("_", " ");
                    const fields = change.fields.map((field) => {
                      if (field === "channels" || field === "inAppEnabled") return "delivery channels";
                      if (field === "recipientRoles") return "recipient roles";
                      if (field === "audiences") return "recipient audiences";
                      return "message template";
                    });
                    return (
                      <li key={change.type}>
                        <span className="font-medium text-ink">{eventLabel}</span>
                        {" — "}
                        {fields.join(", ")}
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-border bg-surface px-4 py-10 text-center text-sm text-ink-muted">
              No notification setting changes have been recorded yet.
            </div>
          )}
        </section>
      )}
    </div>
  );
}

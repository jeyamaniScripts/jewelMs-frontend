import type { Role } from "@/types/auth";
import type { PaginationMeta } from "@/types/dataTable";
import { apiRequest } from "@/lib/apiClient";

export interface NotificationEventSetting {
  type: string;
  label: string;
  category: string;
  description: string;
  channels: Array<"in_app" | "email" | "sms" | "whatsapp">;
  recipientRoles: Role[];
  audiences: Array<"retailer_team" | "customers" | "suppliers">;
  messageTemplate: string;
}

export type NotificationEventSettingInput = Pick<
  NotificationEventSetting,
  "type" | "channels" | "recipientRoles" | "audiences" | "messageTemplate"
>;

export interface NotificationChannel {
  key: "in_app" | "email" | "sms" | "whatsapp";
  label: string;
  available: boolean;
}

export interface NotificationAudience {
  key: "retailer_team" | "customers" | "suppliers";
  label: string;
  available: boolean;
}

export interface NotificationSettingsResponse {
  events: NotificationEventSetting[];
  availableRoles: Role[];
  availableAudiences: NotificationAudience[];
  availableChannels: NotificationChannel[];
  updatedAt: string | null;
  updatedBy: string | null;
  auditTrail: NotificationSettingsAuditEntry[];
}

export interface NotificationSettingsAuditEntry {
  actorName: string;
  changedAt: string;
  changedEvents: Array<{
    type: string;
    fields: Array<
      "inAppEnabled" | "channels" | "recipientRoles" | "audiences" | "messageTemplate"
    >;
  }>;
}

export interface NotificationHistoryItem {
  id: string;
  type: string;
  message: string;
  actorName: string | null;
  createdAt: string;
  isRead: boolean;
}

export function fetchNotificationSettings(signal?: AbortSignal) {
  return apiRequest<NotificationSettingsResponse>("/notifications/settings", { signal });
}

export function saveNotificationSettings(events: NotificationEventSetting[]) {
  return apiRequest<
    Pick<NotificationSettingsResponse, "events" | "updatedAt" | "updatedBy" | "auditTrail">
  >(
    "/notifications/settings",
    {
      method: "PUT",
      body: {
        events: events.map(
          ({ type, channels, recipientRoles, audiences, messageTemplate }): NotificationEventSettingInput => ({
            type,
            channels,
            recipientRoles,
            audiences,
            messageTemplate,
          }),
        ),
      },
    },
  );
}

export function fetchNotificationHistory(
  query: { page?: number; limit?: number; type?: string; search?: string },
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.type) params.set("type", query.type);
  if (query.search) params.set("search", query.search);
  return apiRequest<{
    notifications: NotificationHistoryItem[];
    pagination: PaginationMeta;
  }>(`/notifications/history?${params.toString()}`, { signal });
}

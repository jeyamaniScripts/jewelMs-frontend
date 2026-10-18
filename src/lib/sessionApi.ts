import { apiRequest } from "@/lib/apiClient";

export interface UserSession {
  id: string;
  userAgent: string;
  ipAddress: string;
  loginAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export function fetchMySessions(signal?: AbortSignal) {
  return apiRequest<{ sessions: UserSession[] }>("/auth/sessions/mine", {
    signal,
  });
}

export function revokeOtherSessions() {
  return apiRequest<{ revokedCount: number }>("/auth/sessions/mine", {
    method: "DELETE",
  });
}

export function revokeSession(sessionId: string) {
  return apiRequest<void>(`/auth/sessions/mine/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });
}

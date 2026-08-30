import { getStoredToken, setStoredToken, clearStoredToken } from "@/lib/tokenStorage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiClientError extends Error {
  statusCode: number;
  details?: Record<string, string>;

  constructor(statusCode: number, message: string, details?: Record<string, string>) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  details?: Record<string, string>;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean; // defaults to true — set false for login/register/forgot-password
  /** Cancels this request if the caller's effect is cleaned up (e.g. a
   *  branch switch superseding it) before the response arrives. */
  signal?: AbortSignal;
  /** Internal — prevents infinite retry loops if the refreshed request also 401s. */
  _isRetry?: boolean;
}

// Called when a refresh attempt itself fails — i.e. the session is truly
// gone, not just the access token being stale. Registered once by
// SessionExpiredListener so this module stays framework-agnostic (no
// direct Redux/router import here).
let sessionExpiredHandler: (() => void) | null = null;
export function setSessionExpiredHandler(handler: () => void) {
  sessionExpiredHandler = handler;
}

// Multiple requests can 401 around the same moment (e.g. a page firing several
// fetches at once) — dedupe so only one refresh call actually goes out.
let refreshPromise: Promise<string | null> | null = null;

/**
 * Exchanges the httpOnly refresh-token cookie for a fresh access token.
 * Exported (not just used internally on a 401) so restoreSession can call
 * this proactively on every hard page load — the localStorage access token
 * is short-lived (15 min), so on a refresh after any idle time it's very
 * likely already expired. Trying refresh first here means session restore
 * never depends on a stale token surviving until the next request.
 */
export async function attemptTokenRefresh(): Promise<string | null> {
  return refreshAccessToken();
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: "POST",
          credentials: "include", // sends the httpOnly refresh-token cookie
        });
        const parsed: ApiEnvelope<{ token: string }> = await response.json();
        if (!response.ok || !parsed.success || !parsed.data) return null;
        setStoredToken(parsed.data.token);
        return parsed.data.token;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/**
 * Thin wrapper around fetch that matches the backend's response envelope
 * exactly. On a 401 from an authenticated request, it transparently tries
 * to refresh the access token once (via the httpOnly refresh cookie) and
 * retries the original request — callers never see the expiry, they just
 * get their data or a genuine "you're logged out" failure.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal, _isRetry = false } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (response.status === 401 && auth && !_isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiRequest<T>(path, { ...options, _isRetry: true });
    }
    clearStoredToken();
    sessionExpiredHandler?.();
    throw new ApiClientError(401, "Your session has expired — please sign in again");
  }

  const text = await response.text();
  const parsed: ApiEnvelope<T> = text ? JSON.parse(text) : { success: response.ok, message: "" };

  if (!response.ok || !parsed.success) {
    throw new ApiClientError(response.status, parsed.message || "Request failed", parsed.details);
  }

  return parsed.data as T;
}

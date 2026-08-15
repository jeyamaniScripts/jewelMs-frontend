export interface ActiveSessionsSummary {
  activeAccountsCount: number;
  activeSessionsCount: number;
}

/** Every row here is, by definition, a currently-active session — logged-out
 *  sessions are deleted server-side rather than flagged, so there's no
 *  status field to check. */
export interface ActiveSessionEntry {
  id: string;
  user: { fullName: string; email: string; role: string } | null;
  loginAt: string;
  lastUsedAt: string;
  ipAddress: string;
  userAgent: string;
}

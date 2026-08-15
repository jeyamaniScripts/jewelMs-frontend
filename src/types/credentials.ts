/**
 * Generic, once-shown credentials result — reused for Brand Admin,
 * Showroom Admin, and Employee account creation/reset flows.
 */
export interface GeneratedCredentials {
  accountLabel: string; // brand name / showroom name / employee name — whatever the account belongs to
  loginEmail: string;
  temporaryPassword: string;
  mustChangePassword: true;
}

/** Generates a human-facing Employee ID, e.g. "EMP-LX3K9F2A". */
export function generateEmployeeCode(): string {
  return `EMP-${Date.now().toString(36).toUpperCase()}`;
}

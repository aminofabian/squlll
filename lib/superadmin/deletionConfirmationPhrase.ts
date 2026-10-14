import type { TenantRecord } from "./types";

/**
 * What the operator must type before schools are permanently deleted:
 * the subdomain for one school, "delete N schools" for several.
 */
export function deletionConfirmationPhrase(
  schools: Pick<TenantRecord, "subdomain">[],
): string {
  if (schools.length === 1) return schools[0].subdomain;
  return `delete ${schools.length} schools`;
}

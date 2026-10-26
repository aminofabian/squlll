import { superAdminGraphqlRequest } from "./graphql";
import type { AuditLogRecord } from "./types";

/**
 * The API returns the most recent audit rows. A higher cap than the original
 * 100 means older user/school/billing events are not silently pushed out by a
 * busy impersonation trail; the page paginates client-side.
 */
export const AUDIT_LOG_FETCH_LIMIT = 1000;

const AUDIT_LOG_FIELDS = `
  id
  message
  source
  level
  metadata
  timestamp
`;

const AUDIT_LOGS_QUERY = `
  query GetAuditLogs($limit: Int) {
    getAuditLogs(limit: $limit) {
      ${AUDIT_LOG_FIELDS}
    }
  }
`;

/**
 * Fallback for an API that has not yet shipped the optional `limit` argument.
 * Keeps the frontend deployable before the backend.
 */
const LEGACY_AUDIT_LOGS_QUERY = `
  query GetAuditLogs {
    getAuditLogs {
      ${AUDIT_LOG_FIELDS}
    }
  }
`;

export async function fetchAuditLogs(
  limit = AUDIT_LOG_FETCH_LIMIT,
): Promise<AuditLogRecord[]> {
  try {
    const data = await superAdminGraphqlRequest<{
      getAuditLogs: AuditLogRecord[];
    }>(AUDIT_LOGS_QUERY, { limit });
    return data.getAuditLogs ?? [];
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/unknown argument.*limit/i.test(message)) throw error;

    const data = await superAdminGraphqlRequest<{
      getAuditLogs: AuditLogRecord[];
    }>(LEGACY_AUDIT_LOGS_QUERY);
    return data.getAuditLogs ?? [];
  }
}

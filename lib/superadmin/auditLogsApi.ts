import { superAdminGraphqlRequest } from "./graphql";
import type { AuditLogRecord } from "./types";

const AUDIT_LOGS_QUERY = `
  query GetAuditLogs {
    getAuditLogs {
      id
      message
      source
      level
      metadata
      timestamp
    }
  }
`;

export async function fetchAuditLogs(): Promise<AuditLogRecord[]> {
  const data = await superAdminGraphqlRequest<{ getAuditLogs: AuditLogRecord[] }>(
    AUDIT_LOGS_QUERY,
  );
  return data.getAuditLogs ?? [];
}

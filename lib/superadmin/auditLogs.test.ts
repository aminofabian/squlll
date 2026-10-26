import { describe, expect, it } from "vitest";
import {
  countAuditLogsByCategory,
  extractAuditTarget,
  filterAuditLogs,
  getAuditActor,
  getAuditTarget,
  parseAuditMetadata,
} from "./auditLogs";
import type { AuditLogRecord } from "./types";

function log(
  overrides: Partial<AuditLogRecord> & { message: string },
): AuditLogRecord {
  return {
    id: overrides.id ?? "1",
    message: overrides.message,
    source: overrides.source ?? "SUPER_ADMIN",
    level: overrides.level ?? "INFO",
    metadata: overrides.metadata ?? null,
    timestamp: overrides.timestamp ?? "2026-05-31T00:00:00Z",
  };
}

describe("parseAuditMetadata", () => {
  it("parses JSON string metadata", () => {
    expect(parseAuditMetadata('{"name":"Alpha"}')).toEqual({ name: "Alpha" });
  });

  it("returns null for invalid metadata", () => {
    expect(parseAuditMetadata("{bad json")).toBeNull();
  });
});

describe("extractAuditTarget", () => {
  it("prefers school name from tenant creation metadata", () => {
    const entry = log({
      message: "CREATE_TENANT",
      metadata: { name: "Green Valley Academy", subdomain: "green-valley" },
    });

    expect(extractAuditTarget(entry)).toBe("Green Valley Academy");
  });

  it("uses the structured target label for new audit rows", () => {
    const entry = log({
      message: "CREATE_TENANT",
      metadata: {
        targetType: "SCHOOL",
        targetId: "school-1",
        targetLabel: "Mirema",
        name: "Mirema",
      },
    });

    expect(getAuditTarget(entry)).toMatchObject({
      label: "Mirema",
      kind: "School",
      id: "school-1",
    });
  });

  it("falls back to the school subdomain for legacy impersonation rows", () => {
    const entry = log({
      message: "IMPERSONATE_TENANT_ADMIN",
      metadata: {
        subdomain: "mirema",
        actorEmail: "super@squl.co.ke",
        targetName: "Fabian Amino",
      },
    });

    expect(extractAuditTarget(entry)).toBe("mirema");
  });
});

describe("getAuditActor", () => {
  it("reads the actor identity from structured metadata", () => {
    const actor = getAuditActor(
      log({
        message: "CREATE_USER",
        metadata: {
          actorId: "actor-1",
          actorEmail: "super@squl.co.ke",
          actorName: "Super Admin",
        },
      }),
    );

    expect(actor.displayName).toBe("Super Admin");
    expect(actor.detail).toBe("super@squl.co.ke");
    expect(actor.initials).toBe("SA");
  });

  it("does not mistake the target email for the actor", () => {
    const actor = getAuditActor(
      log({
        message: "CREATE_USER",
        metadata: { email: "new-teacher@school.test" },
      }),
    );

    expect(actor.email).toBeNull();
    expect(actor.displayName).toBe("Super admin");
  });
});

describe("countAuditLogsByCategory", () => {
  const logs: AuditLogRecord[] = [
    log({ id: "1", message: "CREATE_USER" }),
    log({ id: "2", message: "CREATE_TENANT" }),
    log({ id: "3", message: "PLAN_UPDATED" }),
    log({ id: "4", message: "IMPERSONATE_TENANT_ADMIN" }),
    log({ id: "5", message: "SOMETHING_ELSE" }),
  ];

  it("groups events into the audit categories", () => {
    expect(countAuditLogsByCategory(logs, "all")).toBe(5);
    expect(countAuditLogsByCategory(logs, "user")).toBe(1);
    expect(countAuditLogsByCategory(logs, "school")).toBe(1);
    expect(countAuditLogsByCategory(logs, "billing")).toBe(1);
    expect(countAuditLogsByCategory(logs, "access")).toBe(1);
    expect(countAuditLogsByCategory(logs, "system")).toBe(1);
  });
});

describe("filterAuditLogs", () => {
  const logs: AuditLogRecord[] = [
    log({
      id: "1",
      message: "IMPERSONATE_TENANT_ADMIN",
      metadata: { subdomain: "mirema", actorEmail: "super@squl.co.ke" },
    }),
    log({
      id: "2",
      message: "CREATE_TENANT",
      metadata: { name: "Green Valley Academy", subdomain: "green-valley" },
    }),
    log({
      id: "3",
      message: "CREATE_USER",
      metadata: {
        email: "teacher@greenvalley.test",
        tenantId: "tenant-1",
      },
    }),
  ];

  it("filters by category and action", () => {
    expect(
      filterAuditLogs(logs, { category: "school" }).map((entry) => entry.id),
    ).toEqual(["2"]);
    expect(
      filterAuditLogs(logs, { action: "CREATE_USER" }).map((entry) => entry.id),
    ).toEqual(["3"]);
  });

  it("searches actor, target and metadata", () => {
    expect(
      filterAuditLogs(logs, { query: "super@squl" }).map((entry) => entry.id),
    ).toEqual(["1"]);
    expect(
      filterAuditLogs(logs, { query: "green valley" }).map((entry) => entry.id),
    ).toEqual(["2"]);
    expect(
      filterAuditLogs(logs, { query: "teacher@green" }).map((entry) => entry.id),
    ).toEqual(["3"]);
  });
});

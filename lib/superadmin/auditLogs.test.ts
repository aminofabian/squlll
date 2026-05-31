import { describe, expect, it } from "vitest";
import {
  countAuditLogsByCategory,
  extractAuditTarget,
  parseAuditMetadata,
} from "./auditLogs";
import type { AuditLogRecord } from "./types";

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
    const entry: AuditLogRecord = {
      id: "1",
      message: "CREATE_TENANT",
      source: "SUPER_ADMIN",
      level: "INFO",
      metadata: { name: "Green Valley Academy", subdomain: "green-valley" },
      timestamp: "2026-05-31T00:00:00Z",
    };

    expect(extractAuditTarget(entry)).toBe("Green Valley Academy");
  });
});

describe("countAuditLogsByCategory", () => {
  const logs: AuditLogRecord[] = [
    {
      id: "1",
      message: "CREATE_USER",
      source: "SUPER_ADMIN",
      level: "INFO",
      metadata: null,
      timestamp: "2026-05-31T00:00:00Z",
    },
    {
      id: "2",
      message: "CREATE_TENANT",
      source: "SUPER_ADMIN",
      level: "INFO",
      metadata: null,
      timestamp: "2026-05-31T00:00:00Z",
    },
    {
      id: "3",
      message: "PLAN_UPDATED",
      source: "SUPER_ADMIN",
      level: "INFO",
      metadata: null,
      timestamp: "2026-05-31T00:00:00Z",
    },
  ];

  it("counts user and plan categories separately from tenant events", () => {
    expect(countAuditLogsByCategory(logs, "user")).toBe(1);
    expect(countAuditLogsByCategory(logs, "plan")).toBe(1);
    expect(countAuditLogsByCategory(logs, "system")).toBe(0);
  });
});

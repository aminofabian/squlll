import {
  Activity,
  Building2,
  CreditCard,
  Shield,
  ToggleLeft,
  UserPlus,
  UserX,
  type LucideIcon,
} from "lucide-react";
import type { AuditLogRecord } from "./types";

export function parseAuditMetadata(
  metadata: unknown,
): Record<string, unknown> | null {
  if (!metadata) return null;
  if (typeof metadata === "object") return metadata as Record<string, unknown>;
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

export function getAuditActionMeta(entry: AuditLogRecord): {
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
} {
  const msg = entry.message || "";
  if (msg.includes("CREATE_TENANT")) {
    return {
      label: "School created",
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    };
  }
  if (msg.includes("CREATE_USER")) {
    return {
      label: "User created",
      icon: UserPlus,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    };
  }
  if (msg.includes("DELETE_USER")) {
    return {
      label: "User deleted",
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-900/30",
    };
  }
  if (msg.includes("CHANGE_STATUS")) {
    return {
      label: "Status changed",
      icon: ToggleLeft,
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    };
  }
  if (msg.includes("SUBSCRIPTION") || msg.includes("PLAN")) {
    return {
      label: "Plan change",
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    };
  }
  return {
    label: msg.replace(/_/g, " ").toLowerCase(),
    icon: Shield,
    color: "text-slate-600",
    bg: "bg-slate-100 dark:bg-slate-800/50",
  };
}

export function formatAuditTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function extractAuditTarget(entry: AuditLogRecord): string {
  const meta = parseAuditMetadata(entry.metadata);
  if (meta?.name && typeof meta.name === "string") return meta.name;
  if (meta?.subdomain && typeof meta.subdomain === "string") {
    return meta.subdomain;
  }
  if (meta?.email && typeof meta.email === "string") return meta.email;
  if (meta?.tenantName && typeof meta.tenantName === "string") {
    return meta.tenantName;
  }
  if (meta?.userId && typeof meta.userId === "string") return meta.userId;
  if (meta?.role && typeof meta.role === "string") return meta.role;
  return "—";
}

export function formatAuditMetadata(metadata: unknown): string | null {
  const parsed = parseAuditMetadata(metadata);
  if (!parsed || Object.keys(parsed).length === 0) return null;
  return JSON.stringify(parsed, null, 2);
}

export function countAuditLogsByCategory(
  logs: AuditLogRecord[],
  category: "user" | "plan" | "system",
): number {
  return logs.filter((entry) => {
    const msg = entry.message || "";
    if (category === "user") return msg.includes("USER");
    if (category === "plan") {
      return msg.includes("PLAN") || msg.includes("SUBSCRIPTION");
    }
    return (
      !msg.includes("USER") &&
      !msg.includes("PLAN") &&
      !msg.includes("SUBSCRIPTION") &&
      !msg.includes("TENANT")
    );
  }).length;
}

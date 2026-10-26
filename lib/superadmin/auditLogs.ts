import {
  Building2,
  CreditCard,
  LogIn,
  Shield,
  ShieldCheck,
  TicketCheck,
  ToggleLeft,
  UserPlus,
  UserX,
  type LucideIcon,
} from "lucide-react";
import type { AuditLogRecord } from "./types";

export type AuditCategory = "user" | "school" | "billing" | "access" | "system";
export type AuditCategoryFilter = "all" | AuditCategory;

export interface AuditActionMeta {
  /** Raw machine code shown to operators (e.g. CREATE_TENANT). */
  code: string;
  label: string;
  description: string;
  category: AuditCategory;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export interface AuditActor {
  id: string | null;
  name: string | null;
  email: string | null;
  displayName: string;
  detail: string;
  initials: string;
}

export interface AuditTarget {
  id: string | null;
  label: string;
  kind: string;
}

export interface AuditMetadataEntry {
  key: string;
  label: string;
  value: string;
  mono: boolean;
}

interface ActionDefinition {
  label: string;
  description: string;
  category: AuditCategory;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const ACTION_DEFINITIONS: Record<string, ActionDefinition> = {
  CREATE_TENANT: {
    label: "School created",
    description: "A new school was onboarded to the platform.",
    category: "school",
    icon: Building2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  UPDATE_TENANT: {
    label: "School updated",
    description: "School profile details were changed.",
    category: "school",
    icon: Building2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  DELETE_TENANT: {
    label: "School deleted",
    description: "A school and its data were permanently removed.",
    category: "school",
    icon: Building2,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  CREATE_USER: {
    label: "User created",
    description: "A platform user or school staff account was created.",
    category: "user",
    icon: UserPlus,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  DELETE_USER: {
    label: "User deleted",
    description: "A user was removed from every school they belonged to.",
    category: "user",
    icon: UserX,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  CHANGE_STATUS: {
    label: "User status changed",
    description: "An account was suspended or reactivated.",
    category: "user",
    icon: ToggleLeft,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  CREATE_PLAN: {
    label: "Plan created",
    description: "A subscription plan was added.",
    category: "billing",
    icon: CreditCard,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  UPDATE_PLAN: {
    label: "Plan updated",
    description: "Plan pricing, limits or features were changed.",
    category: "billing",
    icon: CreditCard,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  DELETE_PLAN: {
    label: "Plan deleted",
    description: "A subscription plan was removed.",
    category: "billing",
    icon: CreditCard,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  CREATE_SUBSCRIPTION: {
    label: "Subscription started",
    description: "A school was subscribed to a plan.",
    category: "billing",
    icon: TicketCheck,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  UPDATE_SUBSCRIPTION: {
    label: "Subscription updated",
    description: "A school's plan, status or renewal was changed.",
    category: "billing",
    icon: TicketCheck,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
  CANCEL_SUBSCRIPTION: {
    label: "Subscription cancelled",
    description: "A school's subscription was cancelled.",
    category: "billing",
    icon: TicketCheck,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  IMPERSONATE_TENANT_ADMIN: {
    label: "Entered school portal",
    description: "A super admin opened a school portal as its admin.",
    category: "access",
    icon: LogIn,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
  },
  SIGN_IN: {
    label: "Signed in",
    description: "A super admin signed in to platform control.",
    category: "access",
    icon: ShieldCheck,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
  },
};

export const AUDIT_CATEGORY_META: Record<
  AuditCategory,
  { label: string; description: string; icon: LucideIcon; color: string }
> = {
  user: {
    label: "Users",
    description: "Accounts created, suspended or deleted",
    icon: UserPlus,
    color: "text-emerald-600",
  },
  school: {
    label: "Schools",
    description: "Schools onboarded or removed",
    icon: Building2,
    color: "text-blue-600",
  },
  billing: {
    label: "Billing",
    description: "Plans and subscriptions",
    icon: CreditCard,
    color: "text-violet-600",
  },
  access: {
    label: "Portal access",
    description: "Entries into school portals",
    icon: LogIn,
    color: "text-sky-600",
  },
  system: {
    label: "Other",
    description: "System events without a dedicated category",
    icon: Shield,
    color: "text-slate-600",
  },
};

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

function normalizeAction(action: string | null | undefined): string {
  return (action ?? "").trim().toUpperCase();
}

/** Maps an audit row to friendly copy, an icon and a category. */
export function getAuditActionMeta(entry: AuditLogRecord): AuditActionMeta {
  const code = normalizeAction(entry.message);
  const exact = ACTION_DEFINITIONS[code];
  if (exact) return { code, ...exact };

  // Legacy / unknown action codes: infer a category from the message shape so
  // older rows still render with a sensible icon instead of a generic shield.
  const isAccess = code.includes("IMPERSONAT") || code.includes("SIGN_IN");
  const isSchool = code.includes("TENANT") || code.includes("SCHOOL");
  const isBilling = code.includes("PLAN") || code.includes("SUBSCRIPTION");
  const isUser = code.includes("USER") || code.includes("STATUS");

  const category: AuditCategory = isAccess
    ? "access"
    : isSchool
      ? "school"
      : isBilling
        ? "billing"
        : isUser
          ? "user"
          : "system";

  const categoryMeta = AUDIT_CATEGORY_META[category];

  return {
    code,
    label: humanizeAction(code),
    description: categoryMeta.description,
    category,
    icon: isAccess ? LogIn : categoryMeta.icon,
    color: `${categoryMeta.color} dark:text-slate-300`,
    bg: "bg-slate-100 dark:bg-slate-800/60",
  };
}

function humanizeAction(code: string): string {
  if (!code) return "Platform event";
  const spaced = code.replace(/_/g, " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function getAuditCategory(entry: AuditLogRecord): AuditCategory {
  return getAuditActionMeta(entry).category;
}

/** Actor identity from structured metadata, with graceful fallbacks for old rows. */
export function getAuditActor(entry: AuditLogRecord): AuditActor {
  const meta = parseAuditMetadata(entry.metadata) ?? {};
  const name = readString(meta.actorName);
  const email =
    readString(meta.actorEmail) ?? readString(meta.performedByEmail);
  const id = readString(meta.actorId) ?? readString(meta.performedBy);

  const displayName = name ?? email ?? "Super admin";
  const detail =
    name && email
      ? email
      : email
        ? "Super admin"
        : id
          ? `ID ${shortId(id)}`
          : "Actor not recorded";

  return {
    id,
    name,
    email,
    displayName,
    detail,
    initials: initialsFor(name ?? email ?? "SA"),
  };
}

/** Human target (school, user, plan, …) for the audit row. */
export function getAuditTarget(entry: AuditLogRecord): AuditTarget {
  const meta = parseAuditMetadata(entry.metadata) ?? {};
  const code = normalizeAction(entry.message);

  const explicitType = readString(meta.targetType);
  const explicitLabel = readString(meta.targetLabel);
  const explicitId = readString(meta.targetId);

  const fallbackLabel = targetFallback(code, meta);
  const fallbackId = targetFallbackId(code, meta);

  const kind =
    (explicitType ? targetKind(explicitType) : null) ??
    inferTargetKind(code, meta) ??
    "Platform";

  return {
    id: explicitId ?? fallbackId,
    label:
      explicitLabel ??
      fallbackLabel ??
      (kind === "Platform" ? "Platform" : "Not recorded"),
    kind,
  };
}

function targetFallbackId(
  code: string,
  meta: Record<string, unknown>,
): string | null {
  if (code.includes("IMPERSONAT")) {
    // `targetUserId` on old impersonation rows is the school admin we signed in
    // as, not the school, so it must not be shown as the target's ID.
    return readString(meta.tenantId);
  }
  if (code.includes("TENANT") || code.includes("SCHOOL")) {
    return readString(meta.tenantId);
  }
  if (code.includes("PLAN")) {
    return readString(meta.planId);
  }
  if (code.includes("SUBSCRIPTION")) {
    return readString(meta.subscriptionId) ?? readString(meta.tenantId);
  }
  if (code.includes("USER") || code.includes("STATUS")) {
    return readString(meta.targetUserId) ?? readString(meta.userId);
  }
  return readString(meta.tenantId) ?? readString(meta.subscriptionId);
}

function targetFallback(
  code: string,
  meta: Record<string, unknown>,
): string | null {
  if (code.includes("IMPERSONAT")) {
    return (
      readString(meta.subdomain) ??
      readString(meta.tenantName) ??
      readString(meta.name)
    );
  }
  if (code.includes("TENANT") || code.includes("SCHOOL")) {
    return (
      readString(meta.name) ??
      readString(meta.subdomain) ??
      readString(meta.tenantName)
    );
  }
  if (code.includes("PLAN")) {
    return readString(meta.planName) ?? readString(meta.name);
  }
  if (code.includes("SUBSCRIPTION")) {
    return (
      readString(meta.tenantName) ??
      readString(meta.name) ??
      readString(meta.tenantId)
    );
  }
  if (code.includes("USER") || code.includes("STATUS")) {
    return (
      readString(meta.email) ??
      readString(meta.targetEmail) ??
      readString(meta.targetName) ??
      readString(meta.name)
    );
  }
  return (
    readString(meta.name) ??
    readString(meta.tenantName) ??
    readString(meta.subdomain) ??
    readString(meta.email)
  );
}

function inferTargetKind(
  code: string,
  meta: Record<string, unknown>,
): string | null {
  if (
    code.includes("IMPERSONAT") ||
    code.includes("TENANT") ||
    code.includes("SCHOOL")
  ) {
    return "School";
  }
  if (code.includes("USER") || code.includes("STATUS")) return "User";
  if (code.includes("PLAN")) return "Plan";
  if (code.includes("SUBSCRIPTION")) return "School";
  if (readString(meta.subdomain)) return "School";
  return null;
}

function targetKind(type: string): string {
  switch (type.toUpperCase()) {
    case "SCHOOL":
      return "School";
    case "USER":
      return "User";
    case "PLAN":
      return "Plan";
    case "SUBSCRIPTION":
      return "School";
    case "DOMAIN":
      return "Domain";
    case "SETTING":
      return "Setting";
    default:
      return type;
  }
}

export function formatAuditTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function formatAuditExactTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function extractAuditTarget(entry: AuditLogRecord): string {
  return getAuditTarget(entry).label;
}

export function formatAuditMetadata(metadata: unknown): string | null {
  const parsed = parseAuditMetadata(metadata);
  if (!parsed || Object.keys(parsed).length === 0) return null;
  return JSON.stringify(parsed, null, 2);
}

const HIDDEN_METADATA_KEYS = new Set([
  // Already rendered in the row's actor/target columns.
  "actorid",
  "actoremail",
  "actorname",
  "performedby",
  "targettype",
  "targetlabel",
]);

/** Label/value pairs for the expandable row, with IDs and money handled nicely. */
export function getAuditMetadataEntries(
  entry: AuditLogRecord,
): AuditMetadataEntry[] {
  const meta = parseAuditMetadata(entry.metadata);
  if (!meta) return [];

  const entries = Object.entries(meta)
    .filter(
      ([key, value]) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !HIDDEN_METADATA_KEYS.has(key.toLowerCase()),
    )
    .map(([key, value]) => {
      const mono =
        /id$/i.test(key) ||
        key === "planId" ||
        key === "tenantId" ||
        key === "userId" ||
        key === "subscriptionId";
      return {
        key,
        label: humanizeKey(key),
        value: formatMetadataValue(value),
        mono,
      };
    });

  const priority = [
    "name",
    "tenantname",
    "subdomain",
    "email",
    "role",
    "previousstatus",
    "newstatus",
    "status",
    "planname",
    "monthlyprice",
    "yearlyprice",
    "usersdeleted",
    "reason",
  ];

  return entries.sort((a, b) => {
    const aIndex = priority.indexOf(a.key.toLowerCase());
    const bIndex = priority.indexOf(b.key.toLowerCase());
    if (aIndex === -1 && bIndex === -1) return a.label.localeCompare(b.label);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

const ACRONYMS = new Set(["id", "url", "sms", "api", "ip"]);

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) =>
      ACRONYMS.has(part.toLowerCase())
        ? part.toUpperCase()
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join(" ");
}

function formatMetadataValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString("en-KE");
  if (Array.isArray(value)) {
    return value.map((item) => formatMetadataValue(item)).join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function countAuditLogsByCategory(
  logs: AuditLogRecord[],
  category: AuditCategoryFilter,
): number {
  if (category === "all") return logs.length;
  return logs.filter((entry) => getAuditCategory(entry) === category).length;
}

export interface AuditFilter {
  query?: string;
  category?: AuditCategoryFilter;
  action?: string;
}

export function filterAuditLogs(
  logs: AuditLogRecord[],
  filter: AuditFilter = {},
): AuditLogRecord[] {
  const { query = "", category = "all", action = "all" } = filter;
  const term = query.trim().toLowerCase();
  const actionCode = action.trim().toUpperCase();

  return logs.filter((entry) => {
    if (category !== "all" && getAuditCategory(entry) !== category) {
      return false;
    }
    if (
      actionCode &&
      actionCode !== "ALL" &&
      normalizeAction(entry.message) !== actionCode
    ) {
      return false;
    }
    if (!term) return true;

    const actor = getAuditActor(entry);
    const target = getAuditTarget(entry);
    const meta = parseAuditMetadata(entry.metadata) ?? {};
    const haystack = [
      entry.message,
      entry.source,
      entry.level,
      actor.displayName,
      actor.email,
      target.label,
      target.kind,
      target.id,
      JSON.stringify(meta),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  });
}

export function getAuditActionOptions(
  logs: AuditLogRecord[],
): Array<{ value: string; label: string; category: AuditCategory }> {
  const seen = new Map<
    string,
    { value: string; label: string; category: AuditCategory }
  >();

  for (const entry of logs) {
    const code = normalizeAction(entry.message);
    if (!code || seen.has(code)) continue;
    const meta = getAuditActionMeta(entry);
    seen.set(code, {
      value: code,
      label: meta.label,
      category: meta.category,
    });
  }

  return [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function readString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function initialsFor(value: string): string {
  const local = value.includes("@") ? value.split("@")[0] : value;
  const parts = local.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "SA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

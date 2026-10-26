import type { AdminUserListItem, MembershipInfo } from "./types";

/**
 * Role-aware helpers for the super-admin user directory.
 *
 * A user can hold several memberships (one per school). The directory needs a
 * single, stable "primary" role per person so filtering, sorting and grouping
 * agree everywhere — including the row actions that change membership status.
 */

export const ALL_ROLES = "ALL";
export const ALL_STATUSES = "ALL";
export const UNKNOWN_ROLE = "UNKNOWN";
export const NO_STATUS = "NONE";

export type RoleTone =
  | "rose"
  | "indigo"
  | "sky"
  | "emerald"
  | "amber"
  | "slate"
  | "stone"
  | "orange"
  | "blue"
  | "cyan"
  | "teal";

export interface RoleDefinition {
  key: string;
  /** Singular, sentence-case label: "School admin". */
  label: string;
  /** Plural label used for group headers: "School admins". */
  plural: string;
  /** Short explanation used in tooltips. */
  description: string;
  tone: RoleTone;
  /** Seniority order — lower ranks are shown first. */
  rank: number;
}

/**
 * Mirrors the backend `MembershipRole` enum, ordered from most to least
 * privileged. Any role missing from this list still renders (title-cased) and
 * sorts after the known roles.
 */
export const ROLE_DEFINITIONS: readonly RoleDefinition[] = [
  {
    key: "SUPER_ADMIN",
    label: "Super admin",
    plural: "Super admins",
    description: "Platform-wide administrator",
    tone: "rose",
    rank: 0,
  },
  {
    key: "SCHOOL_ADMIN",
    label: "School admin",
    plural: "School admins",
    description: "Runs a school account",
    tone: "indigo",
    rank: 1,
  },
  {
    key: "SCHOOL_MANAGER",
    label: "School manager",
    plural: "School managers",
    description: "Manages day-to-day school operations",
    tone: "sky",
    rank: 2,
  },
  {
    key: "TEACHER",
    label: "Teacher",
    plural: "Teachers",
    description: "Teaching staff",
    tone: "emerald",
    rank: 3,
  },
  {
    key: "TREASURER",
    label: "Treasurer",
    plural: "Treasurers",
    description: "Handles school finances",
    tone: "amber",
    rank: 4,
  },
  {
    key: "STAFF",
    label: "Staff",
    plural: "Staff",
    description: "Non-teaching school staff",
    tone: "slate",
    rank: 5,
  },
  {
    key: "STUDENT",
    label: "Student",
    plural: "Students",
    description: "Learner account",
    tone: "blue",
    rank: 6,
  },
  {
    key: "PARENT",
    label: "Parent",
    plural: "Parents",
    description: "Guardian account",
    tone: "orange",
    rank: 7,
  },
  {
    key: "DRIVER",
    label: "Driver",
    plural: "Drivers",
    description: "School transport driver",
    tone: "cyan",
    rank: 8,
  },
  {
    key: "CONDUCTOR",
    label: "Conductor",
    plural: "Conductors",
    description: "School transport conductor",
    tone: "teal",
    rank: 9,
  },
] as const;

const ROLE_BY_KEY = new Map(ROLE_DEFINITIONS.map((role) => [role.key, role]));

/** Membership status precedence when a user belongs to several schools. */
const STATUS_PRECEDENCE: Record<string, number> = {
  ACTIVE: 0,
  PENDING: 1,
  SUSPENDED: 2,
  EXPIRED: 3,
};

const UNKNOWN_ROLE_DEFINITION: RoleDefinition = {
  key: UNKNOWN_ROLE,
  label: "Unassigned",
  plural: "Unassigned",
  description: "No school membership yet",
  tone: "stone",
  rank: 999,
};

function sentenceCase(value: string): string {
  const joined = value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .join(" ");
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

/** Uppercase/trim a raw role or status value coming from the API. */
export function normalizeRoleKey(raw?: string | null): string {
  return (raw ?? "").trim().toUpperCase();
}

export function roleDefinition(
  raw?: string | null,
): RoleDefinition | undefined {
  const key = normalizeRoleKey(raw);
  if (!key) return undefined;
  if (key === UNKNOWN_ROLE) return UNKNOWN_ROLE_DEFINITION;
  return ROLE_BY_KEY.get(key);
}

export function roleLabel(raw?: string | null): string {
  const definition = roleDefinition(raw);
  if (definition) return definition.label;

  const key = normalizeRoleKey(raw);
  return key ? sentenceCase(key) : "Unassigned";
}

export function rolePlural(raw?: string | null): string {
  const definition = roleDefinition(raw);
  if (definition) return definition.plural;

  const key = normalizeRoleKey(raw);
  return key ? sentenceCase(key) : "Unassigned";
}

export function roleTone(raw?: string | null): RoleTone {
  return roleDefinition(raw)?.tone ?? "stone";
}

/** Seniority rank used to order roles; unknown roles sort last. */
export function roleRank(raw?: string | null): number {
  return roleDefinition(raw)?.rank ?? 500;
}

/**
 * The membership that best represents a user: highest-ranking role first,
 * then the healthiest status (active beats pending beats suspended).
 */
export function primaryMembership(
  user: AdminUserListItem,
): MembershipInfo | undefined {
  const memberships = user.memberships ?? [];
  if (memberships.length === 0) return undefined;

  return memberships.reduce((best, candidate) => {
    const rankDelta = roleRank(candidate.role) - roleRank(best.role);
    if (rankDelta !== 0) return rankDelta < 0 ? candidate : best;

    const statusDelta =
      (STATUS_PRECEDENCE[normalizeRoleKey(candidate.status)] ?? 9) -
      (STATUS_PRECEDENCE[normalizeRoleKey(best.status)] ?? 9);
    return statusDelta < 0 ? candidate : best;
  });
}

/** Primary role key for a user (`SUPER_ADMIN`, `TEACHER`, …). */
export function resolveUserRole(user: AdminUserListItem): string {
  if (
    user.isGlobalAdmin ||
    normalizeRoleKey(user.globalRole) === "SUPER_ADMIN"
  ) {
    return "SUPER_ADMIN";
  }

  const role = normalizeRoleKey(primaryMembership(user)?.role);
  return role || UNKNOWN_ROLE;
}

/** Primary membership status for a user (`ACTIVE`, `SUSPENDED`, …). */
export function resolveUserStatus(user: AdminUserListItem): string {
  return normalizeRoleKey(primaryMembership(user)?.status) || NO_STATUS;
}

/** Number of extra schools beyond the primary membership. */
export function extraSchoolCount(user: AdminUserListItem): number {
  return Math.max(0, (user.memberships?.length ?? 0) - 1);
}

export interface RoleFacet {
  key: string;
  label: string;
  plural: string;
  description: string;
  tone: RoleTone;
  rank: number;
  count: number;
}

/** Count users per primary role, ordered by seniority. */
export function countUsersByRole(
  users: readonly AdminUserListItem[],
): RoleFacet[] {
  const counts = new Map<string, number>();
  for (const user of users) {
    const role = resolveUserRole(user);
    counts.set(role, (counts.get(role) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, count]) => {
      const definition = roleDefinition(key);
      return {
        key,
        label: roleLabel(key),
        plural: rolePlural(key),
        description: definition?.description ?? "",
        tone: roleTone(key),
        rank: roleRank(key),
        count,
      };
    })
    .sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label));
}

export interface UserDirectoryFilters {
  /** `ALL_ROLES` (or omitted) shows every role. */
  role?: string;
  /** `ALL_STATUSES` (or omitted) shows every membership status. */
  status?: string;
  /** Free-text search across name, contact, role and schools. */
  query?: string;
}

/**
 * Multi-word search: every whitespace-separated token must match somewhere, so
 * "teacher nairobi" narrows instead of widening the result set.
 */
export function userMatchesSearch(
  user: AdminUserListItem,
  query: string,
): boolean {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = [
    user.name,
    user.email,
    user.phoneNumber ?? "",
    roleLabel(resolveUserRole(user)),
    ...(user.memberships ?? []).map(
      (membership) =>
        `${membership.tenantName} ${membership.tenantSubdomain} ${roleLabel(membership.role)}`,
    ),
  ]
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

export function filterUsers(
  users: readonly AdminUserListItem[],
  filters: UserDirectoryFilters = {},
): AdminUserListItem[] {
  const role = normalizeRoleKey(filters.role) || ALL_ROLES;
  const status = normalizeRoleKey(filters.status) || ALL_STATUSES;
  const query = filters.query ?? "";

  return users.filter((user) => {
    if (role !== ALL_ROLES && resolveUserRole(user) !== role) return false;
    if (status !== ALL_STATUSES && resolveUserStatus(user) !== status) {
      return false;
    }
    return userMatchesSearch(user, query);
  });
}

export type UserSortKey =
  | "name"
  | "role"
  | "lastLogin"
  | "created"
  | "school";

export const USER_SORT_OPTIONS: readonly {
  value: UserSortKey;
  label: string;
}[] = [
  { value: "role", label: "Role (seniority)" },
  { value: "name", label: "Name (A–Z)" },
  { value: "lastLogin", label: "Recently active" },
  { value: "created", label: "Newest accounts" },
  { value: "school", label: "School (A–Z)" },
] as const;

function timestamp(value?: string | null): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function compareNames(a: AdminUserListItem, b: AdminUserListItem): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}

/**
 * Sort a copy of the list. Each sort key encodes its own natural direction
 * (roles by seniority, activity and creation newest-first, names A→Z).
 */
export function sortUsers(
  users: readonly AdminUserListItem[],
  sort: UserSortKey = "name",
): AdminUserListItem[] {
  const list = [...users];

  list.sort((a, b) => {
    switch (sort) {
      case "role": {
        const rankDelta = roleRank(resolveUserRole(a)) - roleRank(resolveUserRole(b));
        return rankDelta !== 0 ? rankDelta : compareNames(a, b);
      }
      case "lastLogin": {
        const delta = timestamp(b.lastLoginAt) - timestamp(a.lastLoginAt);
        return delta !== 0 ? delta : compareNames(a, b);
      }
      case "created": {
        const delta = timestamp(b.createdAt) - timestamp(a.createdAt);
        return delta !== 0 ? delta : compareNames(a, b);
      }
      case "school": {
        const aSchool = primaryMembership(a)?.tenantName ?? "";
        const bSchool = primaryMembership(b)?.tenantName ?? "";
        // Users without a school go last regardless of alphabet.
        if (!aSchool && bSchool) return 1;
        if (aSchool && !bSchool) return -1;
        const delta = aSchool.localeCompare(bSchool, undefined, {
          sensitivity: "base",
        });
        return delta !== 0 ? delta : compareNames(a, b);
      }
      case "name":
      default:
        return compareNames(a, b);
    }
  });

  return list;
}

export interface UserRoleGroup {
  role: string;
  label: string;
  plural: string;
  tone: RoleTone;
  rank: number;
  users: AdminUserListItem[];
}

/** Group an already-sorted list into role sections, ordered by seniority. */
export function groupUsersByRole(
  users: readonly AdminUserListItem[],
): UserRoleGroup[] {
  const groups = new Map<string, AdminUserListItem[]>();

  for (const user of users) {
    const role = resolveUserRole(user);
    const bucket = groups.get(role);
    if (bucket) bucket.push(user);
    else groups.set(role, [user]);
  }

  return Array.from(groups.entries())
    .map(([role, members]) => ({
      role,
      label: roleLabel(role),
      plural: rolePlural(role),
      tone: roleTone(role),
      rank: roleRank(role),
      users: members,
    }))
    .sort((a, b) => a.rank - b.rank || a.label.localeCompare(b.label));
}

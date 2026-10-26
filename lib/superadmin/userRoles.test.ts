import { describe, expect, it } from "vitest";
import type { AdminUserListItem, MembershipInfo } from "./types";
import {
  ALL_ROLES,
  ALL_STATUSES,
  countUsersByRole,
  extraSchoolCount,
  filterUsers,
  groupUsersByRole,
  primaryMembership,
  resolveUserRole,
  resolveUserStatus,
  roleLabel,
  roleRank,
  sortUsers,
  userMatchesSearch,
} from "./userRoles";

function membership(overrides: Partial<MembershipInfo> = {}): MembershipInfo {
  return {
    id: "m1",
    role: "TEACHER",
    status: "ACTIVE",
    tenantId: "t1",
    tenantName: "Mwangaza Academy",
    tenantSubdomain: "mwangaza",
    joinedAt: "2026-01-05T00:00:00.000Z",
    ...overrides,
  };
}

function user(overrides: Partial<AdminUserListItem> = {}): AdminUserListItem {
  return {
    id: "u1",
    email: "jane@school.test",
    name: "Jane Wanjiku",
    isGlobalAdmin: false,
    globalRole: "NONE",
    createdAt: "2026-01-01T00:00:00.000Z",
    memberships: [membership()],
    ...overrides,
  };
}

describe("role labels", () => {
  it("uses friendly labels for known membership roles", () => {
    expect(roleLabel("SCHOOL_ADMIN")).toBe("School admin");
    expect(roleLabel("teacher")).toBe("Teacher");
    expect(roleLabel("CONDUCTOR")).toBe("Conductor");
  });

  it("title-cases roles the UI does not know yet", () => {
    expect(roleLabel("LIBRARY_ASSISTANT")).toBe("Library assistant");
    expect(roleLabel(null)).toBe("Unassigned");
  });

  it("orders known roles by seniority and unknown roles last", () => {
    expect(roleRank("SUPER_ADMIN")).toBeLessThan(roleRank("SCHOOL_ADMIN"));
    expect(roleRank("SCHOOL_ADMIN")).toBeLessThan(roleRank("TEACHER"));
    expect(roleRank("TEACHER")).toBeLessThan(roleRank("STUDENT"));
    expect(roleRank("SOMETHING_ELSE")).toBeGreaterThan(roleRank("STUDENT"));
  });
});

describe("primary role resolution", () => {
  it("treats global admins as super admins", () => {
    expect(resolveUserRole(user({ isGlobalAdmin: true }))).toBe("SUPER_ADMIN");
  });

  it("prefers the most senior membership when a user has several", () => {
    const multi = user({
      memberships: [
        membership({ id: "a", role: "TEACHER", status: "ACTIVE" }),
        membership({ id: "b", role: "SCHOOL_ADMIN", status: "PENDING" }),
      ],
    });

    expect(primaryMembership(multi)?.id).toBe("b");
    expect(resolveUserRole(multi)).toBe("SCHOOL_ADMIN");
    expect(resolveUserStatus(multi)).toBe("PENDING");
    expect(extraSchoolCount(multi)).toBe(1);
  });

  it("breaks ties on healthiest membership status", () => {
    const multi = user({
      memberships: [
        membership({ id: "suspended", status: "SUSPENDED" }),
        membership({ id: "active", status: "ACTIVE" }),
      ],
    });

    expect(primaryMembership(multi)?.id).toBe("active");
  });

  it("marks users without memberships as unassigned", () => {
    const noMembership = user({ memberships: [] });
    expect(resolveUserRole(noMembership)).toBe("UNKNOWN");
    expect(resolveUserStatus(noMembership)).toBe("NONE");
    expect(roleLabel(resolveUserRole(noMembership))).toBe("Unassigned");
  });
});

describe("role facets", () => {
  it("counts users once by primary role in seniority order", () => {
    const users = [
      user({ id: "1", memberships: [membership({ role: "SCHOOL_ADMIN" })] }),
      user({ id: "2", memberships: [membership({ role: "TEACHER" })] }),
      user({ id: "3", memberships: [membership({ role: "TEACHER" })] }),
      user({ id: "4", isGlobalAdmin: true, memberships: [] }),
      user({ id: "5", memberships: [] }),
    ];

    const facets = countUsersByRole(users);

    expect(facets.map((facet) => [facet.key, facet.count])).toEqual([
      ["SUPER_ADMIN", 1],
      ["SCHOOL_ADMIN", 1],
      ["TEACHER", 2],
      ["UNKNOWN", 1],
    ]);
  });
});

describe("filtering", () => {
  const users = [
    user({
      id: "teacher",
      name: "Alice Mwangi",
      email: "alice@mwangaza.test",
      memberships: [membership({ role: "TEACHER" })],
    }),
    user({
      id: "admin",
      name: "Brian Otieno",
      email: "brian@mwangaza.test",
      phoneNumber: "+254712000111",
      memberships: [
        membership({ id: "m2", role: "SCHOOL_ADMIN", tenantName: "Mwangaza Academy" }),
      ],
    }),
    user({
      id: "suspended",
      name: "Cynthia Achieng",
      email: "cynthia@lakeview.test",
      memberships: [
        membership({
          id: "m3",
          role: "TEACHER",
          status: "SUSPENDED",
          tenantName: "Lakeview School",
          tenantSubdomain: "lakeview",
        }),
      ],
    }),
    user({
      id: "global",
      name: "Dennis Kip",
      email: "dennis@squl.test",
      isGlobalAdmin: true,
      memberships: [],
    }),
  ];

  it("filters by role", () => {
    expect(filterUsers(users, { role: "TEACHER" }).map((u) => u.id)).toEqual([
      "teacher",
      "suspended",
    ]);
    expect(filterUsers(users, { role: ALL_ROLES })).toHaveLength(4);
  });

  it("filters by membership status", () => {
    expect(filterUsers(users, { status: "SUSPENDED" }).map((u) => u.id)).toEqual([
      "suspended",
    ]);
    expect(filterUsers(users, { status: ALL_STATUSES })).toHaveLength(4);
  });

  it("combines role and status filters", () => {
    expect(
      filterUsers(users, { role: "TEACHER", status: "ACTIVE" }).map((u) => u.id),
    ).toEqual(["teacher"]);
  });

  it("searches names, email, phone, school and role label", () => {
    expect(filterUsers(users, { query: "alice" }).map((u) => u.id)).toEqual([
      "teacher",
    ]);
    expect(filterUsers(users, { query: "254712" }).map((u) => u.id)).toEqual([
      "admin",
    ]);
    expect(filterUsers(users, { query: "lakeview" }).map((u) => u.id)).toEqual([
      "suspended",
    ]);
    expect(filterUsers(users, { query: "school admin" }).map((u) => u.id)).toEqual([
      "admin",
    ]);
  });

  it("requires every search token to match", () => {
    expect(userMatchesSearch(users[1], "brian mwangaza")).toBe(true);
    expect(userMatchesSearch(users[1], "brian lakeview")).toBe(false);
  });
});

describe("sorting", () => {
  const users = [
    user({ id: "b", name: "Brian", createdAt: "2026-03-01T00:00:00.000Z", lastLoginAt: "2026-03-10T00:00:00.000Z" }),
    user({
      id: "a",
      name: "alice",
      createdAt: "2026-01-01T00:00:00.000Z",
      lastLoginAt: null,
      memberships: [membership({ role: "SCHOOL_ADMIN", tenantName: "Zeta School" })],
    }),
    user({
      id: "c",
      name: "Cynthia",
      createdAt: "2026-02-01T00:00:00.000Z",
      lastLoginAt: "2026-03-12T00:00:00.000Z",
      memberships: [],
    }),
  ];

  it("sorts names case-insensitively", () => {
    expect(sortUsers(users, "name").map((u) => u.id)).toEqual(["a", "b", "c"]);
  });

  it("sorts by role seniority", () => {
    expect(sortUsers(users, "role").map((u) => u.id)).toEqual(["a", "b", "c"]);
  });

  it("puts the most recent sign-ins first and never-signed-in last", () => {
    expect(sortUsers(users, "lastLogin").map((u) => u.id)).toEqual([
      "c",
      "b",
      "a",
    ]);
  });

  it("puts newest accounts first", () => {
    expect(sortUsers(users, "created").map((u) => u.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
  });

  it("sorts schools alphabetically with unassigned users last", () => {
    expect(sortUsers(users, "school").map((u) => u.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
  });

  it("does not mutate the input array", () => {
    const original = [...users];
    sortUsers(users, "name");
    expect(users).toEqual(original);
  });
});

describe("grouping", () => {
  it("groups by primary role in seniority order and keeps row order", () => {
    const users = [
      user({ id: "t1", name: "Zoe", memberships: [membership({ role: "TEACHER" })] }),
      user({ id: "a1", name: "Amy", memberships: [membership({ role: "SCHOOL_ADMIN" })] }),
      user({ id: "t2", name: "Adam", memberships: [membership({ role: "TEACHER" })] }),
    ];

    const groups = groupUsersByRole(users);

    expect(groups.map((group) => group.role)).toEqual([
      "SCHOOL_ADMIN",
      "TEACHER",
    ]);
    expect(groups[1].users.map((u) => u.id)).toEqual(["t1", "t2"]);
  });
});

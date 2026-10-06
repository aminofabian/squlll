import { afterEach, describe, expect, it, vi } from "vitest";
import { isSuperAdminSession, getSuperAdminRoleFromCookie } from "./auth";

function withCookie(cookie: string) {
  vi.stubGlobal("window", {});
  vi.stubGlobal("document", { cookie });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isSuperAdminSession", () => {
  it("is true for a super-admin session", () => {
    withCookie("userRole=SUPER_ADMIN");
    expect(isSuperAdminSession()).toBe(true);
  });

  it("is false for a non-super-admin role", () => {
    withCookie("userRole=SCHOOL_ADMIN");
    expect(isSuperAdminSession()).toBe(false);
  });

  it("is true when a stale duplicate cookie is also present", () => {
    // Regression: a leftover shared-domain cookie from a school session must not
    // make the guard treat a valid super-admin session as signed out.
    withCookie("userRole=SCHOOL_ADMIN; userRole=SUPER_ADMIN");
    expect(isSuperAdminSession()).toBe(true);
  });

  it("is true when the browser hands over a comma-joined value", () => {
    withCookie("userRole=SCHOOL_ADMIN, SUPER_ADMIN");
    expect(isSuperAdminSession()).toBe(true);
  });
});

describe("getSuperAdminRoleFromCookie", () => {
  it("returns the first role token", () => {
    withCookie("userRole=SCHOOL_ADMIN, SUPER_ADMIN");
    expect(getSuperAdminRoleFromCookie()).toBe("SCHOOL_ADMIN");
  });
});

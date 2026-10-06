import { describe, expect, it } from "vitest";
import {
  cookieHasRole,
  parseRoleCookieValues,
  SUPER_ADMIN_ROLE,
} from "./role-cookie";

describe("parseRoleCookieValues", () => {
  it("returns an empty array for empty input", () => {
    expect(parseRoleCookieValues(undefined)).toEqual([]);
    expect(parseRoleCookieValues(null)).toEqual([]);
    expect(parseRoleCookieValues("")).toEqual([]);
  });

  it("parses a single value", () => {
    expect(parseRoleCookieValues("SUPER_ADMIN")).toEqual(["SUPER_ADMIN"]);
  });

  it("splits comma-joined duplicate values and trims them", () => {
    expect(parseRoleCookieValues("SCHOOL_ADMIN, SUPER_ADMIN")).toEqual([
      "SCHOOL_ADMIN",
      "SUPER_ADMIN",
    ]);
  });

  it("decodes percent-encoded values", () => {
    expect(parseRoleCookieValues("SUPER%5FADMIN")).toEqual(["SUPER_ADMIN"]);
  });
});

describe("cookieHasRole", () => {
  it("matches a plain value", () => {
    expect(cookieHasRole("SUPER_ADMIN", SUPER_ADMIN_ROLE)).toBe(true);
    expect(cookieHasRole("SCHOOL_ADMIN", SUPER_ADMIN_ROLE)).toBe(false);
  });

  it("matches when the role is one of several comma-joined values", () => {
    expect(cookieHasRole("SCHOOL_ADMIN, SUPER_ADMIN", SUPER_ADMIN_ROLE)).toBe(
      true,
    );
    expect(cookieHasRole("SUPER_ADMIN,SCHOOL_ADMIN", SUPER_ADMIN_ROLE)).toBe(
      true,
    );
  });

  it("does not match missing or unrelated values", () => {
    expect(cookieHasRole(undefined, SUPER_ADMIN_ROLE)).toBe(false);
    expect(cookieHasRole("SUPER_ADMIN_VIEWER", SUPER_ADMIN_ROLE)).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { getCookie } from "./utils";

function withCookie(cookie: string) {
  vi.stubGlobal("window", {});
  vi.stubGlobal("document", { cookie });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getCookie", () => {
  it("reads a single cookie value", () => {
    withCookie("userRole=SUPER_ADMIN; userId=abc");
    expect(getCookie("userRole")).toBe("SUPER_ADMIN");
    expect(getCookie("userId")).toBe("abc");
  });

  it("returns null for a missing cookie", () => {
    withCookie("userRole=SUPER_ADMIN");
    expect(getCookie("accessToken")).toBeNull();
  });

  it("returns the last value when a name appears more than once", () => {
    // A host-only cookie can coexist with a shared-domain cookie of the same
    // name; the most recently written one must win rather than yielding null.
    withCookie("userRole=SCHOOL_ADMIN; userRole=SUPER_ADMIN; userId=abc");
    expect(getCookie("userRole")).toBe("SUPER_ADMIN");
  });
});

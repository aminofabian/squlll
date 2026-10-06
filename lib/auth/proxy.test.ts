import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

function makeRequest(cookie?: string): NextRequest {
  return new NextRequest("http://localhost:3002/dashboard", {
    headers: {
      host: "localhost:3002",
      ...(cookie ? { cookie } : {}),
    },
  });
}

function redirectedTo(response: Response): string | null {
  if (response.status !== 307 && response.status !== 308) return null;
  return response.headers.get("location");
}

describe("proxy /dashboard super-admin guard", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirects to the super-admin login when there is no session", async () => {
    const res = await proxy(makeRequest());
    expect(redirectedTo(res)).toContain("/superadmin/login");
  });

  it("allows a valid super-admin session through", async () => {
    const res = await proxy(makeRequest("accessToken=abc; userRole=SUPER_ADMIN"));
    expect(redirectedTo(res)).toBeNull();
  });

  it("rejects a non-super-admin role", async () => {
    const res = await proxy(makeRequest("accessToken=abc; userRole=SCHOOL_ADMIN"));
    expect(redirectedTo(res)).toContain("/superadmin/login");
  });

  it("allows a comma-joined value that contains SUPER_ADMIN", async () => {
    const res = await proxy(
      makeRequest("accessToken=abc; userRole=SCHOOL_ADMIN, SUPER_ADMIN"),
    );
    expect(redirectedTo(res)).toBeNull();
  });
});

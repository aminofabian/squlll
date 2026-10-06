import { describe, expect, it } from "vitest";
import { getAuthCookieOptions, resolveCookieDomain } from "./cookie-domain";

describe("resolveCookieDomain", () => {
  it("scopes platform zones to the shared domain", () => {
    expect(resolveCookieDomain("squl.co.ke")).toBe(".squl.co.ke");
    expect(resolveCookieDomain("mirema.squl.co.ke")).toBe(".squl.co.ke");
    expect(resolveCookieDomain("alpha.squl.com:3000")).toBe(".squl.com");
  });

  it("keeps custom domains host-only", () => {
    expect(resolveCookieDomain("mirema.ac.ke")).toBeUndefined();
    expect(resolveCookieDomain("shop.mirema.ac.ke")).toBeUndefined();
  });

  it("keeps localhost host-only", () => {
    expect(resolveCookieDomain("localhost")).toBeUndefined();
    expect(resolveCookieDomain("mirema.localhost:3002")).toBeUndefined();
  });
});

describe("getAuthCookieOptions", () => {
  const request = (forwardedHost: string) =>
    new Request("http://internal/", {
      headers: { "x-forwarded-host": forwardedHost },
    });

  it("uses a shared domain + SameSite=None on a platform zone", () => {
    const options = getAuthCookieOptions(request("mirema.squl.co.ke"));
    expect(options.domain).toBe(".squl.co.ke");
    expect(options.sameSite).toBe("none");
  });

  it("uses a host-only cookie + SameSite=Lax on a custom domain", () => {
    const options = getAuthCookieOptions(request("mirema.ac.ke"));
    expect(options.domain).toBeUndefined();
    expect(options.sameSite).toBe("lax");
  });
});

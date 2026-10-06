import { describe, expect, it } from "vitest";
import {
  isIpLiteral,
  normalizeHostname,
  subdomainFromPlatformHost,
} from "./hostname";

describe("normalizeHostname", () => {
  it("lowercases, strips the port and trailing dot", () => {
    expect(normalizeHostname("Mirema.SQUL.co.ke:3002")).toBe("mirema.squl.co.ke");
    expect(normalizeHostname("mirema.ac.ke.")).toBe("mirema.ac.ke");
  });

  it("takes the first entry of an X-Forwarded-Host list", () => {
    expect(normalizeHostname("mirema.ac.ke, proxy.local")).toBe("mirema.ac.ke");
  });

  it("returns null for empty input", () => {
    expect(normalizeHostname("")).toBeNull();
    expect(normalizeHostname(undefined)).toBeNull();
  });
});

describe("subdomainFromPlatformHost", () => {
  it("extracts the subdomain on a platform zone", () => {
    expect(subdomainFromPlatformHost("mirema.squl.co.ke")).toBe("mirema");
    expect(subdomainFromPlatformHost("mirema.localhost:3000")).toBe("mirema");
    expect(subdomainFromPlatformHost("alpha.squl.com")).toBe("alpha");
  });

  it("returns null for the apex and www", () => {
    expect(subdomainFromPlatformHost("squl.co.ke")).toBeNull();
    expect(subdomainFromPlatformHost("www.squl.co.ke")).toBeNull();
  });

  it("returns null for custom domains (caller falls back to the API)", () => {
    expect(subdomainFromPlatformHost("mirema.ac.ke")).toBeNull();
  });
});

describe("isIpLiteral", () => {
  it("detects IPv4 and IPv6 literals", () => {
    expect(isIpLiteral("148.113.255.170")).toBe(true);
    expect(isIpLiteral("[::1]:3000")).toBe(true);
    expect(isIpLiteral("mirema.ac.ke")).toBe(false);
  });
});

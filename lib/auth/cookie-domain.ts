import { normalizeHostname } from "@/lib/hostname";

/** Platform zones that share a cross-subdomain session cookie. */
const PLATFORM_ZONES = ["squl.co.ke", "squl.com"];

export interface AuthCookieOptions {
  domain: string | undefined;
  sameSite: "lax" | "none";
  secure: boolean;
}

/**
 * Cookie `Domain` for the host the browser is actually on.
 *
 * - a platform zone (`*.squl.co.ke` / `*.squl.com`) → `.{zone}` so subdomains
 *   share the session;
 * - a tenant's own custom domain → `undefined` (host-only), because a cookie
 *   scoped to `.squl.co.ke` is never sent to `mirema.ac.ke`;
 * - localhost → `undefined` (browsers reject `Domain=.localhost` anyway).
 */
export function resolveCookieDomain(
  rawHost: string | null | undefined,
): string | undefined {
  const host = normalizeHostname(rawHost);
  if (!host) return undefined;
  for (const zone of PLATFORM_ZONES) {
    if (host === zone || host.endsWith(`.${zone}`)) return `.${zone}`;
  }
  return undefined;
}

/** Best-effort public host from a request (proxy-aware). */
export function hostFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");
  if (forwarded || host) return forwarded ?? host ?? "";
  try {
    return new URL(request.url).host;
  } catch {
    return "";
  }
}

export function getAuthCookieOptions(request: Request): AuthCookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  const domain = resolveCookieDomain(hostFromRequest(request));
  return {
    domain,
    // `SameSite=None` requires a shared domain; host-only cookies use `lax`.
    sameSite: domain ? "none" : "lax",
    secure: isProd,
  };
}

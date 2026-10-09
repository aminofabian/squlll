/**
 * Client-side session cookie hygiene.
 *
 * `accessToken` / `refreshToken` are httpOnly and can only be cleared by the
 * server (the login and sign-out routes do that). The cookies below are
 * client-readable identity cookies; clearing them on the login page stops a
 * stale or duplicated `userRole` (e.g. from a previous admin session) from
 * making the next sign-in ambiguous.
 */

const CLIENT_SESSION_COOKIES = [
  "userId",
  "email",
  "userName",
  "userRole",
  "membershipId",
  "tenantId",
  "tenantName",
  "subdomainUrl",
  "tenantSubdomain",
  "schoolUrl",
] as const;

/** Scopes the platform session may have been written with. */
const COOKIE_SCOPES = ["", "; domain=.squl.co.ke", "; domain=.squl.com"];

export function clearClientSessionCookies(): void {
  if (typeof document === "undefined") return;
  for (const name of CLIENT_SESSION_COOKIES) {
    for (const scope of COOKIE_SCOPES) {
      // Max-Age=0 expires the cookie for each scope it may exist under.
      document.cookie = `${name}=; Max-Age=0; path=/${scope}`;
    }
  }
}

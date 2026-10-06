export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

/**
 * Parse a raw `userRole` cookie value into individual role tokens.
 *
 * A single cookie value can be comma-joined when a proxy or client merges
 * duplicate `Cookie` headers, or when a host-only and a shared-domain cookie
 * share a name. Splitting lets callers test membership instead of comparing the
 * whole string (which would silently fail).
 */
export function parseRoleCookieValues(
  rawValue: string | null | undefined,
): string[] {
  if (!rawValue) return [];

  return rawValue
    .split(",")
    .map((value) => {
      const trimmed = value.trim();
      if (!trimmed) return "";
      try {
        return decodeURIComponent(trimmed);
      } catch {
        return trimmed;
      }
    })
    .filter(Boolean);
}

/** True when any token in a raw role cookie equals `role`. */
export function cookieHasRole(
  rawValue: string | null | undefined,
  role: string,
): boolean {
  return parseRoleCookieValues(rawValue).includes(role);
}

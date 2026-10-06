/**
 * Hostname normalisation shared by the edge proxy (middleware) and Node routes.
 * Trims, lower-cases, drops the port / response comma-lists, and strips a
 * trailing dot. Returns null when nothing usable remains.
 */
export function normalizeHostname(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = raw.trim().toLowerCase();
  if (!value) return null;

  // X-Forwarded-Host may be a comma list — take the first entry.
  const comma = value.indexOf(',');
  if (comma >= 0) value = value.slice(0, comma).trim();

  if (value.startsWith('[')) {
    const end = value.indexOf(']');
    return end > 0 ? value.slice(1, end) : value;
  }

  const firstColon = value.indexOf(':');
  if (firstColon > 0 && value.indexOf(':', firstColon + 1) === -1) {
    value = value.slice(0, firstColon);
  }

  value = value.replace(/\.$/, '');
  return value || null;
}

const PLATFORM_HOST_RE = /^([a-z0-9-]+)\.(localhost|squl\.co\.ke|squl\.com)$/;
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

export function isIpLiteral(host: string | null | undefined): boolean {
  const value = normalizeHostname(host);
  if (!value) return false;
  return IPV4_RE.test(value) || value.includes(':');
}

/**
 * Fast, backend-free inference of a tenant subdomain for hosts on a known
 * platform zone or `*.localhost`. Returns null for custom domains (callers
 * should then ask the backend via `resolveHostViaBackend`).
 */
export function subdomainFromPlatformHost(raw: string): string | null {
  const host = normalizeHostname(raw);
  if (!host) return null;
  const match = host.match(PLATFORM_HOST_RE);
  if (!match) return null;
  const sub = match[1];
  return sub === 'www' ? null : sub;
}

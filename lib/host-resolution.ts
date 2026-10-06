import { resolveGraphqlEndpoint } from '@/lib/graphql-endpoint';
import {
  isIpLiteral,
  normalizeHostname,
  subdomainFromPlatformHost,
} from '@/lib/hostname';

/**
 * Host → tenant resolution backed by the API's public `resolveHost` query.
 *
 * Edge-safe (no Node APIs) so the middleware/proxy can use it directly. Uses
 * `NEXT_PUBLIC_API_BASE_URL` / `GRAPHQL_API_URL`, both of which are available
 * at build and runtime for the middleware bundle. Results are cached in-process
 * with separate hit/miss TTLs so a newly-added domain appears within ~30s.
 */
export interface HostResolution {
  kind: string;
  host: string;
  zone: string | null;
  subdomain: string | null;
  tenantId: string | null;
  tenantName: string | null;
  tenantStatus: string | null;
  isApex: boolean;
}

const RESOLVE_HOST_QUERY = `
  query ResolveHost($host: String!) {
    resolveHost(host: $host) {
      kind
      host
      zone
      subdomain
      tenantId
      tenantName
      tenantStatus
      isApex
    }
  }
`;

const HIT_TTL_MS = 5 * 60 * 1000;
const MISS_TTL_MS = 30 * 1000;
const TIMEOUT_MS = 2_000;

const cache = new Map<string, { expiresAt: number; value: HostResolution | null }>();

export async function resolveHostViaBackend(
  rawHost: string | null | undefined,
): Promise<HostResolution | null> {
  const host = normalizeHostname(rawHost);
  if (!host || isIpLiteral(host)) return null;

  const cached = cache.get(host);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  let value: HostResolution | null = null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(resolveGraphqlEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: RESOLVE_HOST_QUERY, variables: { host } }),
      signal: controller.signal,
    });
    const json = (await response.json()) as {
      data?: { resolveHost?: HostResolution | null };
    };
    value = json?.data?.resolveHost ?? null;
  } catch {
    value = null;
  } finally {
    clearTimeout(timer);
  }

  cache.set(host, {
    expiresAt: Date.now() + (value ? HIT_TTL_MS : MISS_TTL_MS),
    value,
  });
  return value;
}

/** Derive a tenant subdomain for any host — platform zone fast-path, else API. */
export async function tenantSubdomainForHost(
  rawHost: string | null | undefined,
): Promise<string | null> {
  const host = normalizeHostname(rawHost);
  if (!host) return null;
  const platform = subdomainFromPlatformHost(host);
  if (platform) return platform;
  const resolved = await resolveHostViaBackend(host);
  return resolved?.subdomain ?? null;
}

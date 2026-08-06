import { resolveUpstreamGraphqlEndpoint } from '@/lib/graphql-endpoint'
import { parseHomepageConfig } from '@/lib/types/homepage-config'
import type { HomepageConfig } from '@/lib/types/homepage-config'

const PUBLIC_HOMEPAGE_QUERY = `
  query PublicHomepageConfig($subdomain: String!) {
    publicHomepageConfig(subdomain: $subdomain)
  }
`

/**
 * Server-side fetch of the published homepage config for a school subdomain.
 * Used by the public homepage route so visitors get SSR markup instead of a
 * client-side fetch + loading spinner. Never cached — publish must be visible
 * immediately (the backend keeps a short TTL cache for bursts).
 */
export async function fetchPublicHomepageConfigServer(
  subdomain: string,
  schoolName?: string,
): Promise<HomepageConfig> {
  try {
    const res = await fetch(resolveUpstreamGraphqlEndpoint(PUBLIC_HOMEPAGE_QUERY), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-subdomain': subdomain,
      },
      body: JSON.stringify({
        query: PUBLIC_HOMEPAGE_QUERY,
        variables: { subdomain },
      }),
      cache: 'no-store',
    })
    const json = await res.json()
    return parseHomepageConfig(json.data?.publicHomepageConfig, schoolName)
  } catch {
    // Public site must still render if the backend is unreachable.
    return parseHomepageConfig(null, schoolName)
  }
}

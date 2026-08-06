import { resolveUpstreamGraphqlEndpoint } from '@/lib/graphql-endpoint'
import {
  parseHomepageConfig,
  type HomepageConfig,
  type PublicSchoolLevel,
} from '@/lib/types/homepage-config'

const PUBLIC_HOMEPAGE_QUERY = `
  query PublicHomepageConfig($subdomain: String!) {
    publicHomepageConfig(subdomain: $subdomain)
  }
`

const PUBLIC_SCHOOL_LEVELS_QUERY = `
  query PublicSchoolLevels($subdomain: String!) {
    publicSchoolLevels(subdomain: $subdomain) {
      id
      name
      description
      gradeLevels {
        id
        name
      }
      subjects {
        id
        name
      }
    }
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
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({
        query: PUBLIC_HOMEPAGE_QUERY,
        variables: { subdomain },
      }),
      cache: 'no-store',
      next: { revalidate: 0 },
    })
    const json = await res.json()
    if (json.errors?.length) {
      console.error(
        '[publicHomepageConfig]',
        subdomain,
        json.errors[0]?.message,
      )
    }
    return parseHomepageConfig(json.data?.publicHomepageConfig, schoolName)
  } catch (err) {
    console.error('[publicHomepageConfig] fetch failed', subdomain, err)
    // Public site must still render if the backend is unreachable.
    return parseHomepageConfig(null, schoolName)
  }
}

/**
 * Server-side fetch of the school's levels (curricula) for the public
 * homepage programs section. Returns [] when unavailable so the section
 * gracefully falls back to its "coming soon" state.
 */
export async function fetchPublicSchoolLevelsServer(
  subdomain: string,
): Promise<PublicSchoolLevel[]> {
  try {
    const res = await fetch(
      resolveUpstreamGraphqlEndpoint(PUBLIC_SCHOOL_LEVELS_QUERY),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-subdomain': subdomain,
        },
        body: JSON.stringify({
          query: PUBLIC_SCHOOL_LEVELS_QUERY,
          variables: { subdomain },
        }),
        cache: 'no-store',
      },
    )
    const json = await res.json()
    return Array.isArray(json.data?.publicSchoolLevels)
      ? (json.data.publicSchoolLevels as PublicSchoolLevel[])
      : []
  } catch {
    return []
  }
}

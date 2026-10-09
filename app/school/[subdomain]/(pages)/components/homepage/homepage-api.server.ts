import { cache } from 'react'
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

export interface PublicHomepageConfigResult {
  config: HomepageConfig
  /** True only when the school has actually published a homepage config. */
  published: boolean
}

/**
 * Server-side fetch of the published homepage config for a school subdomain,
 * plus whether a config is actually published. Used by the public homepage so
 * visitors get SSR markup (and thin, unpublished sites can be kept out of
 * search). Never cached — publish must be visible immediately (the backend keeps
 * a short TTL cache for bursts).
 *
 * Wrapped in React `cache` so the layout metadata and the page share a single
 * request instead of hitting the backend twice.
 */
export const fetchPublicHomepageConfigMeta = cache(
  async function fetchPublicHomepageConfigMetaInner(
    subdomain: string,
    schoolName?: string,
  ): Promise<PublicHomepageConfigResult> {
    try {
      const res = await fetch(
        resolveUpstreamGraphqlEndpoint(PUBLIC_HOMEPAGE_QUERY),
        {
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
        },
      )
      const json = await res.json()
      if (json.errors?.length) {
        console.error(
          '[publicHomepageConfig]',
          subdomain,
          json.errors[0]?.message,
        )
      }
      const raw = json.data?.publicHomepageConfig ?? null
      return {
        config: parseHomepageConfig(raw, schoolName),
        published: raw != null,
      }
    } catch (err) {
      console.error('[publicHomepageConfig] fetch failed', subdomain, err)
      // Public site must still render if the backend is unreachable.
      return { config: parseHomepageConfig(null, schoolName), published: false }
    }
  },
)

/** Convenience wrapper returning just the (parsed) homepage config. */
export async function fetchPublicHomepageConfigServer(
  subdomain: string,
  schoolName?: string,
): Promise<HomepageConfig> {
  return (await fetchPublicHomepageConfigMeta(subdomain, schoolName)).config
}

/**
 * Server-side fetch of the school's levels (curricula) for the public
 * homepage programs section. Returns [] when unavailable so the section
 * gracefully falls back to its "coming soon" state.
 */
export const fetchPublicSchoolLevelsServer = cache(
  async function fetchPublicSchoolLevelsServerInner(
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
  },
)

import {
  parseHomepageConfig,
  type HomepageConfig,
  type HomepageConfigRecord,
} from '@/lib/types/homepage-config'

export async function fetchPublicHomepageConfig(
  subdomain: string,
  schoolName?: string,
): Promise<HomepageConfig> {
  try {
    const res = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-subdomain': subdomain,
      },
      body: JSON.stringify({
        query: `
          query PublicHomepageConfig($subdomain: String!) {
            publicHomepageConfig(subdomain: $subdomain)
          }
        `,
        variables: { subdomain },
      }),
      cache: 'no-store',
    })
    const json = await res.json()
    return parseHomepageConfig(json.data?.publicHomepageConfig, schoolName)
  } catch {
    return parseHomepageConfig(null, schoolName)
  }
}

export async function fetchAdminHomepageConfig(): Promise<HomepageConfigRecord> {
  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      query: `
        query HomepageConfig {
          homepageConfig {
            draft
            published
            publishedAt
            updatedAt
          }
        }
      `,
    }),
    cache: 'no-store',
  })
  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || 'Failed to load homepage config')
  }
  const data = json.data?.homepageConfig
  const draft = parseHomepageConfig(data?.draft)
  return {
    draft,
    published: data?.published ? parseHomepageConfig(data.published) : null,
    publishedAt: data?.publishedAt ?? null,
    updatedAt: data?.updatedAt ?? null,
  }
}

export async function saveHomepageDraft(
  draft: HomepageConfig,
): Promise<HomepageConfigRecord> {
  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      query: `
        mutation UpsertHomepageConfig($input: UpsertHomepageConfigInput!) {
          upsertHomepageConfig(input: $input) {
            draft
            published
            publishedAt
            updatedAt
          }
        }
      `,
      variables: { input: { draft } },
    }),
  })
  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || 'Failed to save draft')
  }
  const data = json.data?.upsertHomepageConfig
  return {
    draft: parseHomepageConfig(data?.draft),
    published: data?.published ? parseHomepageConfig(data.published) : null,
    publishedAt: data?.publishedAt ?? null,
    updatedAt: data?.updatedAt ?? null,
  }
}

export async function publishHomepageConfig(
  draft?: HomepageConfig,
): Promise<HomepageConfigRecord> {
  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      query: `
        mutation PublishHomepageConfig($input: PublishHomepageConfigInput) {
          publishHomepageConfig(input: $input) {
            draft
            published
            publishedAt
            updatedAt
          }
        }
      `,
      variables: { input: draft ? { draft } : {} },
    }),
  })
  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || 'Failed to publish')
  }
  const data = json.data?.publishHomepageConfig
  return {
    draft: parseHomepageConfig(data?.draft),
    published: data?.published ? parseHomepageConfig(data.published) : null,
    publishedAt: data?.publishedAt ?? null,
    updatedAt: data?.updatedAt ?? null,
  }
}

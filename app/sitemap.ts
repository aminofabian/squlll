import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getAllArticles } from '@/lib/content/articles'
import { normalizeHostname } from '@/lib/hostname'
import { resolveHostViaBackend } from '@/lib/host-resolution'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.squl.co.ke'

/**
 * Host-aware sitemap: a tenant host gets a small sitemap canonical to that
 * domain; the platform apex keeps the full marketing + blog sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerList = await headers()
  const host = normalizeHostname(
    headerList.get('x-forwarded-host') ?? headerList.get('host'),
  )

  if (host) {
    const resolution = await resolveHostViaBackend(host)
    if (resolution?.tenantId) {
      const base = `https://${host}`
      return [
        { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
        { url: `${base}/apply`, changeFrequency: 'monthly', priority: 0.5 },
      ]
    }
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${SITE_URL}/custom-domains`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${SITE_URL}/schools`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/register`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/login`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const articles: MetadataRoute.Sitemap = getAllArticles().map((article) => ({
    url: `${SITE_URL}${article.path}`,
    lastModified: new Date(article.updated),
    changeFrequency: 'monthly',
    priority: article.kind === 'pillar' ? 0.9 : 0.7,
  }))

  return [...staticRoutes, ...articles]
}

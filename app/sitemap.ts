import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/content/articles'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.squl.co.ke'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/schools`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/register`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/login`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const articles: MetadataRoute.Sitemap = getAllArticles().map((article) => ({
    url: `${siteUrl}${article.path}`,
    lastModified: new Date(article.updated),
    changeFrequency: 'monthly',
    priority: article.kind === 'pillar' ? 0.9 : 0.7,
  }))

  return [...staticRoutes, ...articles]
}

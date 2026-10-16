import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/content/articles'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.squl.co.ke'

/**
 * Dedicated blog sitemap served at `/blog/sitemap.xml`.
 *
 * The platform sitemap (`app/sitemap.ts`) also lists every article; this feed
 * exists so the content library can be submitted and monitored on its own in
 * Search Console. It is intentionally host-agnostic — tenant hosts get their
 * own compact sitemap and never serve the platform blog.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles()

  // Index freshness should reflect the newest article, not build time.
  const latest = articles.reduce(
    (newest, article) => (article.updated > newest ? article.updated : newest),
    articles[0]?.updated ?? '1970-01-01',
  )

  const index: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(latest),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const entries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}${article.path}`,
    lastModified: new Date(article.updated),
    changeFrequency: 'monthly',
    priority: article.kind === 'pillar' ? 0.9 : 0.7,
  }))

  return [...index, ...entries]
}

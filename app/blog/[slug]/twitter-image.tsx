import { getArticle } from '@/lib/content/articles'
import { OG_SIZE, renderArticleCard } from '@/lib/og/card'

export const runtime = 'nodejs'
export const alt = 'SQUL guide for Kenyan schools'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  return renderArticleCard({
    title: article?.h1 ?? 'School management guides for Kenyan schools',
    kicker: article?.kind === 'pillar' ? 'Featured guide' : (article?.kicker ?? 'Guides'),
  })
}

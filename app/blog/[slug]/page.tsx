import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, GraduationCap } from 'lucide-react'
import { Header } from '@/components/Header'
import { ArticleBody, ArticleCta, ArticleRelated } from '@/components/blog/article-body'
import { getArticle, getArticleSlugs } from '@/lib/content/articles'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.squl.co.ke'

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return { title: 'Article not found | SQUL' }

  const url = `${siteUrl}${article.path}`

  return {
    title: `${article.title} | SQUL`,
    description: article.description,
    keywords: [article.primaryKeyword, ...article.secondaryKeywords],
    alternates: { canonical: article.path },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.description,
      siteName: 'SQUL',
      publishedTime: article.updated,
      modifiedTime: article.updated,
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const url = `${siteUrl}${article.path}`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.h1,
    description: article.description,
    datePublished: article.updated,
    dateModified: article.updated,
    author: { '@type': 'Organization', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: 'SQUL',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/squl-logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: article.image ? `${siteUrl}${article.image}` : undefined,
    keywords: [article.primaryKeyword, ...article.secondaryKeywords].join(', '),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: article.h1, item: url },
    ],
  }

  const faqSchema =
    article.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }
      : null

  return (
    <div className="squl-marketing min-h-screen bg-[#f3f7f5] font-sans text-[#0a1f1a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <div className="relative overflow-hidden bg-[#0a1f1a] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 15% 20%, rgba(36,106,89,0.55), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 10%, rgba(45,133,112,0.35), transparent 50%), linear-gradient(180deg, transparent 60%, #0a1f1a)',
          }}
        />
        <Header variant="hero" />

        <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-28 sm:px-6 sm:pt-32 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-white/55">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <Link href="/blog" className="transition-colors hover:text-white">
              Blog
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="truncate text-white/80">{article.kicker}</span>
          </nav>

          <p className="mt-4 font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
            {article.kicker}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.08] tracking-tight text-white">
            {article.h1}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/60">
            <span>{article.author}</span>
            <span aria-hidden>·</span>
            <span>Updated {formatDate(article.updated)}</span>
            <span aria-hidden>·</span>
            <span>{article.readingMinutes} min read</span>
            {article.kind === 'pillar' ? (
              <>
                <span aria-hidden>·</span>
                <span className="font-ui font-semibold uppercase tracking-wide text-emerald-300/90">
                  Pillar guide
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <main className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <article>
          {article.image ? (
            <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden border border-[#1a4d42]/15 bg-[#eef4f1]">
              <Image
                src={article.image}
                alt={article.h1}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          ) : null}
          <ArticleBody article={article} />
          <ArticleCta cta={article.cta} />
          <ArticleRelated article={article} />
        </article>
      </main>

      <footer className="border-t border-emerald-900/25 bg-[#0a1f1a] py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-300" />
            <span className="font-display text-lg tracking-wide">SQUL</span>
          </Link>
          <p className="text-sm text-white/55">
            School management built for Kenyan classrooms.
          </p>
        </div>
      </footer>
    </div>
  )
}

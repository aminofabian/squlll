import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { SqulWordmark } from '@/components/brand/SqulMark'
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
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: article.h1 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: ['/og-image.png'],
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
    <div className="squl-marketing min-h-screen bg-[#f7f4ec] font-sans text-[#14201b]">
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

      <div className="relative overflow-hidden bg-[#0d201a] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(ellipse 65% 60% at 18% 15%, rgba(44,87,74,0.55), transparent 62%), radial-gradient(ellipse 40% 40% at 92% 5%, rgba(169,138,85,0.12), transparent 60%)',
          }}
        />
        <div className="mk-grain mk-grain--light" aria-hidden />
        <Header variant="hero" />

        <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-32 sm:px-8 sm:pt-36 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[0.6875rem] text-white/40">
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

          <p className="mk-eyebrow mk-eyebrow--light mt-8">
            {article.kicker}
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[1.05] tracking-[-0.025em] text-[#f7f4ec]">
            {article.h1}
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.6875rem] uppercase tracking-[0.1em] text-white/40">
            <span>{article.author}</span>
            <span aria-hidden>·</span>
            <span>Updated {formatDate(article.updated)}</span>
            <span aria-hidden>·</span>
            <span>{article.readingMinutes} min read</span>
            {article.kind === 'pillar' ? (
              <>
                <span aria-hidden>·</span>
                <span className="text-[#d8c9ab]">
                  Pillar guide
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <main className="relative mx-auto max-w-3xl px-6 py-14 sm:px-8 sm:py-20 lg:px-8">
        <article>
          {article.image ? (
            <div className="relative mb-12 aspect-[16/9] w-full overflow-hidden border border-[#14201b]/10 bg-[#efeadd]">
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

      <footer className="bg-[#0d201a] text-[#f7f4ec]">
        <div className="mk-container flex flex-col gap-6 border-t border-white/10 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="SQUL home" className="w-fit">
            <SqulWordmark tone="light" markSize={28} />
          </Link>
          <p className="text-[0.6875rem] leading-relaxed text-white/35">
            School management built for Kenyan classrooms.
          </p>
          <div className="flex gap-6 text-[0.6875rem] text-white/45">
            <Link href="/blog" className="transition-colors hover:text-[#d8c9ab]">
              All guides
            </Link>
            <Link href="/schools" className="transition-colors hover:text-[#d8c9ab]">
              Schools
            </Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 text-[#d8c9ab]">
              Start free
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

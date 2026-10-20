import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { SqulWordmark } from '@/components/brand/SqulMark'
import { getTopicGroups } from '@/lib/content/articles'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.squl.co.ke'

export const metadata: Metadata = {
  title: 'Blog | Guides for Kenyan Schools | SQUL',
  description:
    'Practical guides for Kenyan schools — running a school, CBC assessment, fees and M-Pesa, WhatsApp and SMS parent messaging, timetables and attendance.',
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/blog`,
    title: 'SQUL Blog | Guides for Kenyan Schools',
    description:
      'Practical guides on school management, CBC assessment, M-Pesa fees, WhatsApp messaging, timetables and attendance for Kenyan schools.',
    siteName: 'SQUL',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SQUL — guides for Kenyan schools' }],
  },
}

const FUNNEL_LABEL: Record<string, string> = {
  BoFu: 'Decisions',
  MoFu: 'Evaluating',
  ToFu: 'Getting started',
}

type Cluster = ReturnType<typeof getTopicGroups>[number]['clusters'][number]

function ClusterCard({ article }: { article: Cluster }) {
  return (
    <Link href={article.path} className="group flex h-full flex-col border-t border-[#14201b]/12 pt-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.5625rem] uppercase tracking-[0.18em] text-[#1c3d32]">
          {article.kicker}
        </span>
        <span className="text-[0.5625rem] uppercase tracking-[0.12em] text-[#7c857d]">
          {FUNNEL_LABEL[article.funnelStage] ?? article.funnelStage}
        </span>
      </div>
      <h3 className="mt-4 font-display text-[1.35rem] leading-[1.15] tracking-[-0.015em] text-[#14201b] transition-colors duration-200 group-hover:text-[#1c3d32]">
        {article.h1}
      </h3>
      <p className="mt-2.5 line-clamp-3 flex-1 text-[0.8125rem] leading-[1.65] text-[#4d574f]">
        {article.description}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-[0.5625rem] uppercase tracking-[0.18em] text-[#1c3d32]">
        {article.readingMinutes} min read
        <span
          className="h-px w-6 bg-[#1c3d32]/30 transition-all duration-200 group-hover:w-9 group-hover:bg-[#1c3d32]"
          aria-hidden
        />
      </span>
    </Link>
  )
}

export default function BlogIndexPage() {
  const groups = getTopicGroups()

  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: groups.flatMap((group) =>
      [group.pillar, ...group.clusters].filter(Boolean).map((article) => ({
        '@type': 'ListItem',
        url: `${siteUrl}${article!.path}`,
        name: article!.h1,
      })),
    ),
  }

  return (
    <div className="squl-marketing min-h-screen bg-[#f7f4ec] font-sans text-[#14201b]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-[#0d201a] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 65% 60% at 18% 15%, rgba(44,87,74,0.55), transparent 62%), radial-gradient(ellipse 40% 40% at 92% 5%, rgba(169,138,85,0.12), transparent 60%)',
          }}
          aria-hidden
        />
        <div className="mk-grain mk-grain--light" aria-hidden />
        <Header variant="hero" />

        <div className="relative mk-container pb-20 pt-32 lg:pb-24 lg:pt-40">
          <p className="mk-eyebrow mk-eyebrow--light">Guides &amp; resources</p>
          <h1 className="mt-8 max-w-3xl font-display text-[clamp(2.7rem,5.4vw,4.35rem)] leading-[1.0] tracking-[-0.025em] text-[#f7f4ec]">
            Guides for
            <span className="mt-1 block italic text-[#d8c9ab]">Kenyan schools.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-[1.0625rem] leading-[1.7] text-white/60">
            Four libraries in one place: how to run a school in Kenya, how to
            choose and use school software, a feature-by-feature tour of what an
            all-in-one system does, and the day-to-day work of CBC assessment.
          </p>
        </div>
      </div>

      {/* Guides */}
      <main className="mk-section">
        <div className="mk-container">
          {groups.map((group) => (
            <section key={group.topic} className="mb-24 last:mb-0">
              <div className="flex items-end justify-between gap-4 border-b border-[#14201b]/10 pb-5">
                <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] leading-tight tracking-[-0.02em] text-[#14201b]">
                  {group.topic}
                </h2>
                <p className="shrink-0 text-[0.5625rem] uppercase tracking-[0.16em] text-[#7c857d]">
                  {group.clusters.length + (group.pillar ? 1 : 0)} guides
                </p>
              </div>

              {group.pillar ? (
                <Link href={group.pillar.path} className="group mt-8 block">
                  <article className="relative overflow-hidden bg-[#0d201a] px-7 py-9 text-white sm:px-10 sm:py-11">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-60"
                      style={{
                        backgroundImage:
                          'radial-gradient(ellipse 60% 70% at 85% 0%, rgba(44,87,74,0.45), transparent 65%)',
                      }}
                      aria-hidden
                    />
                    <div className="relative">
                      <span className="text-[0.5625rem] uppercase tracking-[0.2em] text-[#d8c9ab]/80">
                        Featured guide
                      </span>
                      <h3 className="mt-4 max-w-3xl font-display text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.08] tracking-[-0.02em] text-[#f7f4ec]">
                        {group.pillar.h1}
                      </h3>
                      <p className="mt-4 max-w-2xl text-[0.9375rem] leading-[1.7] text-white/55">
                        {group.pillar.description}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-2 text-[0.625rem] uppercase tracking-[0.18em] text-[#d8c9ab]">
                        Read the guide
                        <ArrowUpRight
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </article>
                </Link>
              ) : null}

              <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {group.clusters.map((article) => (
                  <ClusterCard key={article.path} article={article} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Closing */}
      <section className="relative overflow-hidden bg-[#0d201a]">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(247,244,236,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(247,244,236,0.045) 1px, transparent 1px)',
            backgroundSize: '88px 44px',
          }}
          aria-hidden
        />
        <div className="mk-grain mk-grain--light" aria-hidden />
        <div className="relative mk-container py-20 text-center sm:py-24">
          <p className="mk-eyebrow mk-eyebrow--light justify-center">Go deeper</p>
          <h2 className="mx-auto mt-7 max-w-2xl font-display text-[clamp(2.3rem,4.6vw,3.8rem)] leading-[1.04] tracking-[-0.025em] text-[#f7f4ec]">
            See it running
            <span className="mt-1 block italic text-[#d8c9ab]">on your own data.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[0.9375rem] leading-[1.7] text-white/50">
            Start a free term — reconcile M-Pesa, message parents on WhatsApp and
            SMS, and print CBC report cards without a credit card.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="mk-btn mk-btn--paper w-full sm:w-auto">
              Start your free term
              <ArrowRight className="mk-arrow h-4 w-4" aria-hidden />
            </Link>
            <Link href="/schools" className="mk-btn mk-btn--ghost-light w-full sm:w-auto">
              Schools on SQUL
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d201a] text-[#f7f4ec]">
        <div className="mk-container flex flex-col gap-6 border-t border-white/10 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="SQUL home" className="w-fit">
            <SqulWordmark tone="light" markSize={28} />
          </Link>
          <p className="text-[0.6875rem] leading-relaxed text-white/35">
            School management built for Kenyan classrooms.
          </p>
          <div className="flex gap-6 text-[0.6875rem] text-white/45">
            <Link href="/schools" className="transition-colors hover:text-[#d8c9ab]">
              Schools
            </Link>
            <Link href="/custom-domains" className="transition-colors hover:text-[#d8c9ab]">
              Domains
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[#d8c9ab]">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[#d8c9ab]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

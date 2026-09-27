import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, GraduationCap } from 'lucide-react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { getTopicGroups } from '@/lib/content/articles'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.squl.co.ke'

export const metadata: Metadata = {
  title: 'Blog | Guides for Kenyan Schools | SQUL',
  description:
    'Practical guides for Kenyan schools — running a school, fees and M-Pesa, WhatsApp and SMS parent messaging, CBC report cards, timetables and attendance.',
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/blog`,
    title: 'SQUL Blog | Guides for Kenyan Schools',
    description:
      'Practical guides on school management, M-Pesa fees, WhatsApp messaging, CBC report cards, timetables and attendance for Kenyan schools.',
    siteName: 'SQUL',
  },
}

const FUNNEL_LABEL: Record<string, string> = {
  BoFu: 'Decisions',
  MoFu: 'Evaluating',
  ToFu: 'Getting started',
}

function ClusterCard({ article }: { article: ReturnType<typeof getTopicGroups>[number]['clusters'][number] }) {
  return (
    <Link href={article.path} className="group h-full">
      <article className="flex h-full flex-col border border-[#1a4d42]/12 bg-white p-6 shadow-[4px_4px_0_0_rgba(10,31,26,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#1d5547]/25 hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1d5547]/80">
            {article.kicker}
          </span>
          <span className="font-ui text-[10px] font-semibold uppercase tracking-wide text-[#1a4d42]/45">
            {FUNNEL_LABEL[article.funnelStage] ?? article.funnelStage}
          </span>
        </div>
        <h3 className="mt-3 text-lg leading-snug text-[#0a1f1a] transition-colors group-hover:text-[#1d5547]">
          {article.h1}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1a4d42]/70">{article.description}</p>
        <span className="mt-4 inline-flex items-center gap-2 font-ui text-xs font-semibold text-[#1d5547]">
          {article.readingMinutes} min read
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </article>
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
    <div className="squl-marketing min-h-screen bg-[#f3f7f5] font-sans text-[#0a1f1a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />

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

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
          <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
            Guides &amp; resources
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.4rem,6vw,3.75rem)] leading-[1.05] tracking-tight text-white">
            Guides for Kenyan schools
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Two libraries in one place: how to <strong className="font-semibold text-white">run a school</strong> in
            Kenya, and how to <strong className="font-semibold text-white">choose and use school software</strong> —
            written for heads, bursars, directors and teachers.
          </p>
        </div>
      </div>

      <main className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {groups.map((group) => (
          <section key={group.topic} className="mb-16 last:mb-0">
            <div className="flex items-end justify-between gap-4 border-b border-[#1a4d42]/12 pb-4">
              <h2 className="font-display text-2xl tracking-tight text-[#0a1f1a] sm:text-3xl">
                {group.topic}
              </h2>
              <p className="text-sm text-[#1a4d42]/60">
                {group.clusters.length + (group.pillar ? 1 : 0)} guides
              </p>
            </div>

            {group.pillar ? (
              <Link href={group.pillar.path} className="group mt-6 block">
                <article className="border border-[#1d5547]/20 bg-[#0a1f1a] p-7 text-white transition-all hover:-translate-y-0.5 hover:border-emerald-300/40 sm:p-9">
                  <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                    ★ Featured pillar guide
                  </span>
                  <h3 className="mt-3 font-display text-2xl leading-snug text-white sm:text-3xl">
                    {group.pillar.h1}
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">
                    {group.pillar.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 font-ui text-sm font-semibold text-emerald-300">
                    Read the guide
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </article>
              </Link>
            ) : null}

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.clusters.map((article) => (
                <ClusterCard key={article.path} article={article} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <section className="border-t border-[#1a4d42]/12 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-[#0a1f1a] sm:text-3xl">
              See it running on your own data
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#1a4d42]/70 sm:text-base">
              Start a free term — reconcile M-Pesa, message parents on WhatsApp and SMS,
              and print CBC report cards without a credit card.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button className="h-11 rounded-lg bg-[#1d5547] px-6 font-semibold text-white hover:bg-[#246a59]">
                Start free term
              </Button>
            </Link>
            <Link href="/schools">
              <Button
                variant="outline"
                className="h-11 rounded-lg border-[#1a4d42]/25 px-6 font-semibold text-[#0a1f1a]"
              >
                See schools on SQUL
              </Button>
            </Link>
          </div>
        </div>
      </section>

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

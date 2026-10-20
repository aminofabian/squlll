import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { SqulWordmark } from '@/components/brand/SqulMark'
import { resolveGraphqlEndpoint } from '@/lib/graphql-endpoint'
import { schoolPortalUrl } from '@/lib/auth/post-login-navigation'
import { SchoolsDirectory } from './SchoolsDirectory'
import type { PlatformSchool } from './types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.squl.co.ke'

export const metadata: Metadata = {
  title: 'Schools on Squl | Kenya School Management',
  description:
    'Browse schools across Kenya running admissions, fees, CBC marks, and parent portals on Squl.',
  alternates: { canonical: '/schools' },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/schools`,
    title: 'Schools on Squl | Kenya School Management',
    description:
      'Browse schools across Kenya running admissions, fees, CBC marks, and parent portals on Squl.',
  },
}

async function fetchPlatformSchools(): Promise<PlatformSchool[]> {
  try {
    const res = await fetch(resolveGraphqlEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query PublicPlatformSchools {
            publicPlatformSchools {
              id
              name
              subdomain
              description
              logoUrl
              tagline
              published
              addressLocality
              addressRegion
            }
          }
        `,
      }),
      next: { revalidate: 60 },
    })

    if (!res.ok) return []
    const json = (await res.json()) as {
      data?: { publicPlatformSchools?: PlatformSchool[] }
      errors?: unknown
    }
    if (json.errors) return []
    return json.data?.publicPlatformSchools || []
  } catch {
    return []
  }
}

export default async function SchoolsPage() {
  // Only list schools whose public site is live — an un-published school has a
  // placeholder site that is noindexed, so linking to it would waste crawl budget.
  const schools = (await fetchPlatformSchools()).filter((s) => s.published)

  // Help crawlers discover every school site from the directory hub.
  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Schools on Squl',
    url: `${SITE_URL}/schools`,
    numberOfItems: schools.length,
    itemListElement: schools.map((school, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: school.name,
      url: schoolPortalUrl(school.subdomain),
    })),
  }

  return (
    <div className="squl-marketing min-h-screen bg-[#f7f4ec]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0d201a]">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 60% at 20% 15%, rgba(44,87,74,0.5), transparent 60%), radial-gradient(ellipse 40% 40% at 88% 0%, rgba(169,138,85,0.12), transparent 60%)',
          }}
          aria-hidden
        />
        <div className="mk-grain mk-grain--light" aria-hidden />
        <Header variant="hero" />

        <div className="relative mk-container pb-20 pt-32 lg:pb-24 lg:pt-40">
          <p className="mk-eyebrow mk-eyebrow--light">The directory</p>
          <h1 className="mt-8 max-w-4xl font-display text-[clamp(2.7rem,5.4vw,4.35rem)] leading-[1.0] tracking-[-0.025em] text-[#f7f4ec]">
            Schools running their day
            <span className="mt-1 block italic text-[#d8c9ab]">on SQUL, across Kenya.</span>
          </h1>

          <div className="mt-12 grid gap-8 lg:grid-cols-12">
            <p className="max-w-xl text-[1rem] leading-[1.7] text-white/60 lg:col-span-5">
              From admissions desks to M-Pesa fee counters — a growing directory of
              campuses that publish their public site with us.
            </p>
            <div className="flex items-end justify-between gap-6 lg:col-span-4 lg:col-start-9">
              {schools.length > 0 ? (
                <div>
                  <p className="font-display text-[2.6rem] leading-none tabular-nums text-[#f7f4ec]">
                    {schools.length}
                  </p>
                  <p className="mt-2 text-[0.5625rem] uppercase tracking-[0.18em] text-white/35">
                    {schools.length === 1 ? 'School listed' : 'Schools listed'}
                  </p>
                </div>
              ) : (
                <p className="max-w-[12rem] text-[0.5625rem] uppercase leading-relaxed tracking-[0.18em] text-[#d8c9ab]/70">
                  Founding schools are joining now
                </p>
              )}
              <Link href="/register" className="mk-link mk-link--light shrink-0 text-[0.8125rem]">
                Add your school
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Directory */}
      <main className="mk-section">
        <div className="mk-container">
          <SchoolsDirectory schools={schools} />
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
          <p className="mk-eyebrow mk-eyebrow--light justify-center">Your school</p>
          <h2 className="mx-auto mt-7 max-w-2xl font-display text-[clamp(2.3rem,4.6vw,3.8rem)] leading-[1.04] tracking-[-0.025em] text-[#f7f4ec]">
            Open with your name
            <span className="mt-1 block italic text-[#d8c9ab]">on the map.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[0.9375rem] leading-[1.7] text-white/50">
            Start a 90-day free term — admissions, M-Pesa fees, CBC marks and parent
            SMS. No credit card.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="mk-btn mk-btn--paper w-full sm:w-auto">
              Start your free term
              <ArrowRight className="mk-arrow h-4 w-4" aria-hidden />
            </Link>
            <Link href="/login" className="mk-btn mk-btn--ghost-light w-full sm:w-auto">
              Sign in
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
            <Link href="/custom-domains" className="transition-colors hover:text-[#d8c9ab]">
              Domains
            </Link>
            <Link href="/blog" className="transition-colors hover:text-[#d8c9ab]">
              Guides
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[#d8c9ab]">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[#d8c9ab]">
              Terms
            </Link>
          </div>
        </div>
        <div className="mk-container flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5">
          <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-white/25">
            © {new Date().getFullYear()} SQUL · All rights reserved
          </p>
          <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-white/25">
            Nairobi, Kenya
          </p>
        </div>
      </footer>
    </div>
  )
}

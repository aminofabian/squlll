import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, GraduationCap } from 'lucide-react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { resolveGraphqlEndpoint } from '@/lib/graphql-endpoint'
import { SchoolsDirectory } from './SchoolsDirectory'
import type { PlatformSchool } from './types'

export const metadata: Metadata = {
  title: 'Schools on Squl | Kenya School Management',
  description:
    'Browse schools across Kenya running admissions, fees, CBC marks, and parent portals on Squl.',
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
  const schools = await fetchPlatformSchools()

  return (
    <div className="squl-marketing min-h-screen bg-[#f3f7f5] font-sans text-[#0a1f1a]">
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
            Schools on Squl
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.4rem,6vw,3.75rem)] leading-[1.05] tracking-tight text-white">
            Campuses already running the day on Squl
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            From admissions desks to M-Pesa fee counters — these schools use Squl
            for the work that used to live in ledgers, WhatsApp, and scattered
            spreadsheets.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/80">
              <Building2 className="h-4 w-4 text-emerald-300" />
              <span className="tabular-nums font-semibold text-white">
                {schools.length}
              </span>
              <span>{schools.length === 1 ? 'school' : 'schools'} listed</span>
            </div>
            <Link href="/register">
              <Button className="h-10 rounded-lg border-0 bg-emerald-500 px-5 font-semibold text-[#0a1f1a] hover:bg-emerald-400">
                Add your school
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SchoolsDirectory schools={schools} />
      </main>

      <section className="border-t border-[#1a4d42]/12 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <h2 className="font-display text-2xl tracking-tight text-[#0a1f1a] sm:text-3xl">
              Ready to put your school on the map?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#1a4d42]/70 sm:text-base">
              Start a 90-day free term — fees, admissions, CBC marks, and parent
              SMS without a credit card.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button className="h-11 rounded-lg bg-[#1d5547] px-6 font-semibold text-white hover:bg-[#246a59]">
                Start free term
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="h-11 rounded-lg border-[#1a4d42]/25 px-6 font-semibold text-[#0a1f1a]"
              >
                Sign in
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

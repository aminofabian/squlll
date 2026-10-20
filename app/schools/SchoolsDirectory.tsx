'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import type { PlatformSchool } from './types'
import { schoolPortalUrl } from '@/lib/auth/post-login-navigation'

function schoolSiteUrl(subdomain: string): string {
  return schoolPortalUrl(subdomain)
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/** "Mirema, Nairobi" — town and county, de-duplicated when they coincide. */
function schoolLocation(school: PlatformSchool): string | null {
  const parts = [school.addressLocality, school.addressRegion]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
  const unique = Array.from(new Set(parts))
  return unique.length > 0 ? unique.join(', ') : null
}

export function SchoolsDirectory({ schools }: { schools: PlatformSchool[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return schools
    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.subdomain.toLowerCase().includes(q) ||
        (s.tagline || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.addressLocality || '').toLowerCase().includes(q) ||
        (s.addressRegion || '').toLowerCase().includes(q),
    )
  }, [schools, query])

  /* ── Empty directory: an invitation, not a broken panel ───────────────── */
  if (schools.length === 0) {
    return (
      <div className="grid gap-12 border-t border-[#14201b]/10 pt-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <p className="mk-caption">The directory</p>
          <h2 className="mk-h2 mt-6">
            The first names
            <span className="block">
              <em>are on their way.</em>
            </span>
          </h2>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <p className="mk-lede">
            School sites appear here once a campus publishes its public page. If
            you run a school, yours can be first — with its own address and an
            admissions form parents can actually find.
          </p>

          <ol className="mt-8">
            {[
              'Start a free term — no card, no consultant.',
              'Add your school name, logo and location.',
              'Publish your site, then point a domain at it.',
            ].map((step, index) => (
              <li
                key={step}
                className="flex items-baseline gap-4 border-t border-[#14201b]/10 py-4 text-[0.8125rem] text-[#4d574f] last:border-b"
              >
                <span className="font-mono text-[0.5625rem] tabular-nums text-[#14201b]/30">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a href="/register" className="mk-btn mk-btn--ink h-11 px-5 text-[0.8125rem]">
              Put your school on the map
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
            <a href="/custom-domains" className="mk-link text-[0.8125rem]">
              About school domains
            </a>
          </div>
        </div>
      </div>
    )
  }

  /* ── Populated directory ──────────────────────────────────────────────── */
  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-[#14201b]/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mk-caption">The directory</p>
          <h2 className="mk-h2 mt-5">Campuses, A—Z.</h2>
          <p className="mt-4 max-w-md text-[0.8125rem] leading-relaxed text-[#4d574f]">
            Open a school site to see its public campus and admissions form.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <p className="mb-2 text-right text-[0.5625rem] uppercase tracking-[0.16em] text-[#7c857d]">
            {filtered.length} {filtered.length === 1 ? 'school' : 'schools'} shown
          </p>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7c857d]"
              strokeWidth={1.5}
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or town"
              className="h-10 w-full border-0 border-b border-[#14201b]/20 bg-transparent pl-6 pr-2 text-[0.8125rem] text-[#14201b] placeholder:text-[#7c857d]/60 focus:border-[#14201b] focus:outline-none focus:ring-0"
              aria-label="Search schools"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="border-b border-[#14201b]/10 py-12 text-center text-[0.8125rem] text-[#7c857d]">
          No schools match “{query}”.
        </p>
      ) : (
        <ul className="grid gap-x-10 gap-y-12 pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((school) => {
            const href = schoolSiteUrl(school.subdomain)
            const location = schoolLocation(school)
            return (
              <li key={school.id} className="h-full">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex h-full flex-col border-t border-[#14201b]/15 pt-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    {school.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={school.logoUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 object-contain grayscale transition-[filter] duration-200 group-hover:grayscale-0"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#14201b]/12 font-display text-[0.8125rem] text-[#1c3d32]">
                        {initials(school.name) || '?'}
                      </span>
                    )}
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-[#14201b]/25 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#1c3d32]"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </div>

                  <h3 className="mt-6 font-display text-[1.55rem] leading-[1.1] tracking-[-0.015em] text-[#14201b] transition-colors duration-200 group-hover:text-[#1c3d32]">
                    {school.name}
                  </h3>
                  <p className="mt-2 font-mono text-[0.5625rem] uppercase tracking-[0.08em] text-[#7c857d]">
                    {school.subdomain}.squl.co.ke
                  </p>
                  {location && (
                    <p className="mt-2.5 text-[0.6875rem] text-[#4d574f]">{location}</p>
                  )}

                  {(school.tagline || school.description) && (
                    <p className="mt-4 line-clamp-3 flex-1 text-[0.8125rem] leading-[1.65] text-[#4d574f]">
                      {school.tagline || school.description}
                    </p>
                  )}

                  <span className="mt-6 inline-flex items-center gap-2 text-[0.5625rem] uppercase tracking-[0.18em] text-[#1c3d32]">
                    Visit campus
                    <span className="h-px w-7 bg-[#1c3d32]/30 transition-all duration-200 group-hover:w-10 group-hover:bg-[#1c3d32]" aria-hidden />
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

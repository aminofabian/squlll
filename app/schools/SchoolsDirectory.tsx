'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, Building2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { PlatformSchool } from './types'

function schoolSiteUrl(subdomain: string): string {
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd) return `https://${subdomain}.squl.co.ke`
  return `http://${subdomain}.localhost:3000`
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
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
        (s.description || '').toLowerCase().includes(q),
    )
  }, [schools, query])

  if (schools.length === 0) {
    return (
      <div className="border border-[#1a4d42]/12 bg-white px-6 py-16 text-center shadow-[4px_4px_0_0_rgba(10,31,26,0.04)]">
        <Building2 className="mx-auto h-10 w-10 text-[#246a59]/40" />
        <h2 className="mt-4 font-display text-2xl text-[#0a1f1a]">
          Schools are joining every week
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#1a4d42]/65">
          The public directory will fill in as campuses publish their sites.
          Yours can be first.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-tight text-[#0a1f1a] sm:text-3xl">
            Directory
          </h2>
          <p className="mt-1 text-sm text-[#1a4d42]/60">
            Open a school site to see their public campus and apply form.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a4d42]/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="h-11 rounded-none border-[#1a4d42]/15 bg-white pl-9 shadow-none focus-visible:ring-[#246a59]/25"
            aria-label="Search schools"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-[#1a4d42]/20 bg-white/60 px-4 py-10 text-center text-sm text-[#1a4d42]/55">
          No schools match “{query}”.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((school, index) => {
            const href = schoolSiteUrl(school.subdomain)
            return (
              <li key={school.id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    'group flex h-full flex-col border border-[#1a4d42]/12 bg-white p-5 shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] transition-all',
                    'hover:-translate-y-0.5 hover:border-[#246a59]/35 hover:shadow-[4px_4px_0_0_rgba(36,106,89,0.18)]',
                  )}
                  style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
                >
                  <div className="flex items-start gap-3">
                    {school.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={school.logoUrl}
                        alt=""
                        className="h-12 w-12 shrink-0 object-contain"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#0a1f1a] text-sm font-semibold text-white">
                        {initials(school.name) || '?'}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl leading-tight tracking-tight text-[#0a1f1a] transition-colors group-hover:text-[#246a59]">
                        {school.name}
                      </h3>
                      <p className="mt-1 truncate font-mono text-[11px] text-[#1a4d42]/45">
                        {school.subdomain}.squl.co.ke
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#1a4d42]/30 transition-colors group-hover:text-[#246a59]" />
                  </div>

                  {(school.tagline || school.description) && (
                    <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-[#1a4d42]/70">
                      {school.tagline || school.description}
                    </p>
                  )}

                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#246a59]">
                    Visit campus site
                    <ArrowUpRight className="h-3.5 w-3.5" />
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

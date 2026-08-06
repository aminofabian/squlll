'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Building2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { HomepageConfig } from '@/lib/types/homepage-config'
import {
  HomepageShellStyles,
  shellClass,
  themeStyle,
} from '../(pages)/components/homepage/shared'
import { authPrimaryButtonClass } from '../(pages)/components/homepage/SchoolAuthShell'

const STEPS = [
  {
    title: 'Start an application',
    body: 'Share a few facts about the learner and who walks with them — it takes a few minutes.',
  },
  {
    title: 'We review & reach out',
    body: 'Admissions reads every application and writes back with next steps, usually within a few school days.',
  },
  {
    title: 'Visit & enrol',
    body: 'Tour campus when it helps, gather documents, and confirm a place for the coming term.',
  },
]

const PATHWAYS = [
  {
    title: 'Early Years',
    body: 'Play, wonder, and first friendships — a gentle start to school life.',
  },
  {
    title: 'Primary',
    body: 'Strong foundations with room to explore subjects, sport, and the arts.',
  },
  {
    title: 'Junior Secondary',
    body: 'Curiosity meeting real challenge as learners find their stride.',
  },
  {
    title: 'Senior Secondary',
    body: 'Depth, direction, and exam preparation with care for who they are becoming.',
  },
]

export default function AdmissionsContent({
  config,
  schoolName,
  logoUrl,
  tagline,
}: {
  config: HomepageConfig
  schoolName: string
  logoUrl?: string
  tagline?: string
}) {
  const isAssembly = config.templateId === 'assembly-hall'
  const isPlayfield = config.templateId === 'playfield'
  const isGarden = config.templateId === 'garden-court'
  const isStory = config.templateId === 'story-scroll'
  const isHorizon = config.templateId === 'horizon-board'
  const themed = isAssembly || isPlayfield || isGarden || isStory || isHorizon
  const soft =
    config.theme.radiusMode === 'soft' ||
    themed
  const primaryBtn = authPrimaryButtonClass(config)
  const initials = schoolName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={shellClass(
        config,
        cn(
          'flex min-h-screen flex-col',
          isAssembly && 'assembly-hall-shell',
          isPlayfield && 'playfield-shell',
          isGarden && 'garden-court-shell',
          isStory && 'story-scroll-shell',
          isHorizon && 'horizon-board-shell',
        ),
      )}
      style={themeStyle(config.theme)}
    >
      <HomepageShellStyles
        assembly={isAssembly}
        playfield={isPlayfield}
        garden={isGarden}
        story={isStory}
        horizon={isHorizon}
      />

      <header
        className={cn(
          'sticky top-0 z-40 border-b',
          isAssembly &&
            'border-[var(--school-ink)]/15 bg-[var(--ah-cream,#FBF6E9)]/95 backdrop-blur-md',
          isPlayfield && 'border-[var(--primary-dark)] bg-[var(--school-ink)]',
          isGarden &&
            'border-[var(--school-ink)]/10 bg-[var(--gc-linen,#F4EFE4)]/95 backdrop-blur-md',
          isStory &&
            'border-primary/20 bg-[var(--ss-sage,#EEF0E2)]/95 backdrop-blur-md',
          isHorizon &&
            'border-[var(--school-ink)]/12 bg-[var(--hb-cream,#F4ECD8)]/95 backdrop-blur-md',
          !themed &&
            'border-[var(--school-ink)]/8 bg-[var(--school-paper)]/90 backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-[var(--school-nav-h)] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-10 w-10 object-contain sm:h-11 sm:w-11"
              />
            ) : (
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11',
                  soft ? 'rounded-xl' : 'rounded-none',
                  isPlayfield
                    ? 'border border-primary bg-transparent text-primary'
                    : 'bg-primary text-white',
                )}
              >
                {isPlayfield ? (
                  <span className="text-[11px] font-bold tracking-wide">
                    {initials}
                  </span>
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </div>
            )}
            <div className="min-w-0">
              <span
                className={cn(
                  'block truncate font-display text-lg leading-none tracking-[-0.02em] sm:text-xl',
                  isPlayfield && 'text-[var(--school-paper)]',
                )}
              >
                {schoolName}
              </span>
              <span
                className={cn(
                  'mt-1 block truncate text-[11px]',
                  isPlayfield ? 'text-[#9FB3B0]' : 'text-[var(--school-ink)]/45',
                )}
              >
                {tagline || 'Admissions'}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className={cn(
                'inline-flex h-10 items-center gap-2 border px-3.5 text-sm font-semibold transition-colors',
                soft ? 'rounded-lg' : 'rounded-sm',
                isPlayfield
                  ? 'border-primary/40 text-[var(--school-paper)] hover:bg-primary hover:text-[var(--school-ink)]'
                  : 'border-[var(--school-ink)]/15 text-[var(--school-ink)]/80 hover:border-primary hover:text-primary',
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Button asChild className={cn(primaryBtn, 'hidden h-10 w-auto px-4 sm:inline-flex')}>
              <Link href="/apply">
                Apply now
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className={cn('relative flex-1', isAssembly && 'ah-ruled', isPlayfield && 'pf-hero')}>
        <section className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="max-w-2xl">
            <h1
              className={cn(
                'font-display text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em]',
                isPlayfield
                  ? 'font-semibold text-[var(--school-paper)]'
                  : 'text-[var(--school-ink)]',
                isStory && 'ss-italic',
                isHorizon && 'hb-italic',
              )}
            >
              Join {schoolName}
            </h1>
            <p
              className={cn(
                'mt-4 max-w-[42ch] text-lg leading-relaxed',
                isPlayfield ? 'text-[#B9CBC8]' : 'text-[var(--school-ink)]/60',
              )}
            >
              A clear path from first enquiry to a seat in class — start online,
              talk with admissions, then visit when you’re ready.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className={cn(primaryBtn, 'w-auto min-w-[160px] px-6')}>
                <Link href="/apply">
                  Start application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={cn(
                  'h-12 border-2 px-6 font-semibold',
                  soft ? 'rounded-lg' : 'rounded-none',
                  isPlayfield
                    ? 'border-primary/40 text-[var(--school-paper)] hover:bg-primary/10'
                    : 'border-[var(--school-ink)]/15 text-[var(--school-ink)]',
                )}
              >
                <Link href="/contact">Talk to admissions</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h2
            className={cn(
              'font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl',
              isPlayfield ? 'text-[var(--school-paper)]' : 'text-[var(--school-ink)]',
            )}
          >
            How admissions works
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <span
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center border-2 border-primary bg-primary/10 text-sm font-bold text-primary',
                    soft ? 'rounded-full' : 'rounded-sm',
                  )}
                >
                  {i + 1}
                </span>
                <h3
                  className={cn(
                    'mt-4 font-display text-lg font-bold tracking-[-0.02em]',
                    isPlayfield
                      ? 'text-[var(--school-paper)]'
                      : 'text-[var(--school-ink)]',
                  )}
                >
                  {step.title}
                </h3>
                <p
                  className={cn(
                    'mt-2 text-sm leading-relaxed',
                    isPlayfield ? 'text-[#B9CBC8]' : 'text-[var(--school-ink)]/55',
                  )}
                >
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:pb-20">
          <h2
            className={cn(
              'font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl',
              isPlayfield ? 'text-[var(--school-paper)]' : 'text-[var(--school-ink)]',
            )}
          >
            Pathways we welcome
          </h2>
          <p
            className={cn(
              'mt-3 max-w-[48ch] text-base leading-relaxed',
              isPlayfield ? 'text-[#B9CBC8]' : 'text-[var(--school-ink)]/55',
            )}
          >
            Tell us where your learner is headed — we’ll help place them in the
            right year and intake.
          </p>
          <ul className="mt-8 divide-y divide-[var(--school-ink)]/10 border-y border-[var(--school-ink)]/10">
            {PATHWAYS.map((p) => (
              <li
                key={p.title}
                className="flex items-start gap-4 py-5 sm:gap-6"
              >
                <span
                  className={cn(
                    'mt-1 flex h-5 w-5 shrink-0 items-center justify-center border border-primary bg-primary text-white',
                    soft ? 'rounded-full' : 'rounded-[3px]',
                  )}
                >
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <div>
                  <h3
                    className={cn(
                      'font-display text-lg font-bold tracking-[-0.02em]',
                      isPlayfield
                        ? 'text-[var(--school-paper)]'
                        : 'text-[var(--school-ink)]',
                    )}
                  >
                    {p.title}
                  </h3>
                  <p
                    className={cn(
                      'mt-1 text-sm leading-relaxed',
                      isPlayfield
                        ? 'text-[#B9CBC8]'
                        : 'text-[var(--school-ink)]/55',
                    )}
                  >
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Button asChild className={cn(primaryBtn, 'w-auto min-w-[180px] px-6')}>
              <Link href="/apply">
                Apply for admission
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {isAssembly && <div className="ah-tear" aria-hidden />}
      </main>
    </div>
  )
}

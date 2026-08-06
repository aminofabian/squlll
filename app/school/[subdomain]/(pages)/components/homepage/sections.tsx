'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  LogIn,
  Mail,
  MapPin,
  Menu,
  PhoneCall,
  UserPlus,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getSection,
  type HomepageConfig,
  type HomepageCta,
  type HomepageGalleryImage,
  type HomepageNavLink,
  type HomepageOfferingItem,
  type HomepageStatItem,
  type HomepageTestimonial,
  type PublicSchoolLevel,
} from '@/lib/types/homepage-config'
import { SchoolConfiguration } from '@/lib/types/school-config'
import { cn } from '@/lib/utils'
import { SchoolHomepageFeeDownloads } from '../SchoolHomepageFeeDownloads'
import { HomepageRuntime, Reveal, SectionIcon } from './shared'

export function HomepageNav({
  config,
  runtime,
  variant = 'default',
}: {
  config: HomepageConfig
  runtime: HomepageRuntime
  variant?: string
}) {
  const data = getSection<{
    showTagline?: boolean
    portalLabel?: string
    applyLabel?: string
    links?: HomepageNavLink[]
  }>(config, 'nav')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!data) return null
  const { slots } = data
  const links = slots.links || []
  const isNotebook = variant === 'notebook'
  const isTerminal = variant === 'terminal'
  const solid = scrolled || open || variant === 'solid' || isNotebook || isTerminal
  const logoUrl = config.logoUrl || runtime.logoUrl
  const initials = runtime.schoolName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (isTerminal) {
    return (
      <nav
        className={cn(
          'inset-x-0 top-0 z-50 border-b border-[var(--primary-dark)] bg-[var(--school-ink)]',
          runtime.preview ? 'absolute' : 'fixed',
        )}
      >
        <div className="mx-auto flex h-[var(--school-nav-h)] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-10 w-10 object-contain sm:h-11 sm:w-11"
              />
            ) : (
              <div className="pf-mono rounded-sm border border-primary px-2.5 py-1.5 text-[12px] font-bold tracking-wide text-primary">
                {initials}·EST
              </div>
            )}
            <div className="min-w-0">
              <span className="block truncate font-display text-lg leading-none text-[var(--school-paper)] sm:text-xl">
                {runtime.schoolName}
              </span>
              {slots.showTagline !== false && (
                <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.14em] text-[#9FB3B0]">
                  {runtime.tagline || 'Terminal campus'}
                </span>
              )}
            </div>
          </Link>

          <div className="hidden items-center lg:flex">
            {links.map((link, i) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={cn(
                  'px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-[#CFE0DD] transition-colors hover:text-primary',
                  i > 0 && 'border-l border-white/15',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-sm border border-primary bg-transparent px-4 text-[11px] font-bold uppercase tracking-wide text-[var(--school-paper)] shadow-none hover:bg-primary hover:text-[var(--school-ink)]"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-3.5 w-3.5" />
                {slots.portalLabel || 'Check-in'}
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-sm border border-primary bg-primary px-5 text-[11px] font-bold uppercase tracking-wide text-[var(--school-ink)] shadow-none hover:bg-[var(--primary-light)]"
            >
              <Link href="/apply">
                {slots.applyLabel || 'Reserve a seat'}
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center border border-white/25 text-[var(--school-paper)] lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 bg-[var(--school-ink)] lg:hidden">
            <div className="space-y-1 px-4 py-4">
              {links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-2 py-3 text-sm uppercase tracking-wide text-[#CFE0DD] hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    )
  }

  return (
    <nav
      className={cn(
        'inset-x-0 top-0 z-50 transition-all duration-300',
        runtime.preview ? 'absolute' : 'fixed',
        isNotebook
          ? 'border-b-2 border-[var(--school-ink)] bg-[var(--ah-cream,#FBF6E9)]'
          : solid
            ? 'border-b border-black/10 bg-white/95 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        variant === 'glass' && !solid && 'bg-white/10 backdrop-blur-md',
        variant === 'crest' && 'border-b border-black/10 bg-white',
      )}
    >
      <div className="mx-auto flex h-[var(--school-nav-h)] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className={cn(
                'h-10 w-10 object-contain sm:h-11 sm:w-11',
                isNotebook && 'rounded-full border-2 border-[var(--school-accent)]',
              )}
            />
          ) : (
            <div
              className={cn(
                'relative flex h-10 w-10 items-center justify-center text-white sm:h-11 sm:w-11',
                isNotebook
                  ? 'rounded-full border-2 border-[var(--school-accent)] bg-[var(--school-ink)] font-display text-sm font-extrabold'
                  : 'bg-primary',
              )}
            >
              {isNotebook ? (
                initials
              ) : (
                <>
                  <Building2 className="h-5 w-5" />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center bg-[var(--school-ink)] text-[9px] font-semibold text-white">
                    {initials}
                  </span>
                </>
              )}
            </div>
          )}
          <div className="min-w-0">
            <span
              className={cn(
                'block truncate font-display text-lg leading-none tracking-tight sm:text-xl',
                solid || variant === 'crest' || isNotebook
                  ? 'text-[var(--school-ink)]'
                  : 'text-white',
                isNotebook && 'font-extrabold uppercase tracking-wide',
              )}
            >
              {runtime.schoolName}
            </span>
            {slots.showTagline !== false && (
              <span
                className={cn(
                  'mt-1 block truncate text-[10px] font-medium uppercase tracking-[0.16em] sm:text-[11px]',
                  isNotebook
                    ? 'ah-hand normal-case tracking-normal text-[var(--ah-muted,#5B5241)]'
                    : solid || variant === 'crest'
                      ? 'text-primary'
                      : 'text-white/70',
                )}
              >
                {runtime.tagline || 'Inspiring excellence every day'}
              </span>
            )}
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link, i) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                isNotebook
                  ? cn(
                      'relative font-semibold tracking-wide text-[var(--school-ink)] after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100',
                      i === 0 && 'text-primary after:scale-x-100',
                    )
                  : solid || variant === 'crest'
                    ? 'text-slate-600 hover:text-primary'
                    : 'text-white/85 hover:text-white',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            asChild
            variant="outline"
            className={cn(
              'h-10 px-4 text-sm font-semibold shadow-none',
              isNotebook
                ? 'rounded-lg border-2 border-[var(--school-ink)] bg-transparent text-[var(--school-ink)] hover:bg-[var(--school-ink)] hover:text-[var(--ah-cream,#FBF6E9)]'
                : 'rounded-none border',
              !isNotebook &&
                (solid || variant === 'crest'
                  ? 'border-primary/30 text-primary hover:bg-primary hover:text-white'
                  : 'border-white/40 bg-white/10 text-white hover:bg-white hover:text-[var(--school-ink)]'),
            )}
          >
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              {slots.portalLabel || 'Portal'}
            </Link>
          </Button>
          <Button
            asChild
            className={cn(
              'h-10 px-5 text-sm font-semibold text-white shadow-none',
              isNotebook
                ? 'rounded-lg border-2 border-[var(--school-ink)] bg-[var(--school-ink)] hover:border-primary hover:bg-primary'
                : 'rounded-none bg-primary hover:bg-primary-dark',
            )}
          >
            <Link href="/apply">
              {slots.applyLabel || 'Apply now'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center border lg:hidden',
            isNotebook && 'rounded-full border-[1.5px] border-[var(--school-ink)]',
            solid || variant === 'crest' || isNotebook
              ? 'border-black/10 text-[var(--school-ink)]'
              : 'border-white/30 text-white',
          )}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          className={cn(
            'border-t border-black/10 lg:hidden',
            isNotebook ? 'bg-[var(--ah-cream,#FBF6E9)]' : 'bg-white',
          )}
        >
          <div className="space-y-1 px-4 py-4">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-2 py-3 text-base font-medium text-slate-700 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export function HomepageHero({
  config,
  runtime,
  variant = 'dawn',
}: {
  config: HomepageConfig
  runtime: HomepageRuntime
  variant?: string
}) {
  const data = getSection<{
    backgroundImage?: string
    overlayStrength?: number
    eyebrow?: string
    headline?: string
    subcopy?: string
    primaryCta?: HomepageCta
    secondaryCta?: HomepageCta
  }>(config, 'hero')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!data) return null
  const { slots } = data
  const overlay = Math.min(0.9, Math.max(0.2, Number(slots.overlayStrength ?? 0.55)))
  const img = slots.backgroundImage || '/schooll.png'

  if (variant === 'assembly') {
    const stats = getSection<{ items?: HomepageStatItem[] }>(config, 'stats')
    const firstStat = stats?.slots.items?.[0]
    const tickerBits = [
      slots.eyebrow,
      firstStat ? `${firstStat.value} ${firstStat.label}` : null,
      slots.primaryCta?.label,
    ].filter(Boolean) as string[]
    const tickerLine =
      tickerBits.length > 0
        ? tickerBits.join('  ·  ')
        : `Welcome to ${runtime.schoolName}`

    const headline = slots.headline || runtime.schoolName
    const headlineParts = headline.trim().split(/\s+/)
    const accentWord =
      headlineParts.length > 1 ? headlineParts[headlineParts.length - 1] : null
    const headlineLead =
      accentWord && headlineParts.length > 1
        ? headlineParts.slice(0, -1).join(' ')
        : headline

    return (
      <>
        <div className="pt-[var(--school-nav-h)]">
          <div className="overflow-hidden border-b-2 border-[var(--school-accent)] bg-[var(--school-ink)] text-[var(--ah-cream,#FBF6E9)]">
            <div className="ah-ticker-track ah-mono inline-block whitespace-nowrap py-2.5 text-[12px] tracking-[0.08em]">
              <span className="mx-7">{tickerLine}</span>
              <span className="mx-7" aria-hidden>
                {tickerLine}
              </span>
            </div>
          </div>
        </div>
        <section className="ah-ruled relative overflow-hidden pb-24 pt-16 sm:pb-28 sm:pt-24">
          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20 lg:px-8">
            <div className={cn('school-hero-copy max-w-xl pl-6 sm:pl-10', ready ? '' : 'opacity-0')}>
              {slots.eyebrow && (
                <p className="ah-margin-note mb-5">{slots.eyebrow}</p>
              )}
              <h1 className="font-display text-[clamp(2.75rem,6vw,4.5rem)] font-extrabold leading-[0.98] text-[var(--school-ink)]">
                {headlineLead}
                {accentWord ? (
                  <>
                    {' '}
                    <em className="font-medium italic text-primary [font-family:Literata,Georgia,serif]">
                      {accentWord}
                    </em>
                  </>
                ) : null}
              </h1>
              <p className="ah-prose mt-7 text-[1.125rem]">
                {slots.subcopy}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <HeroButtons slots={slots} tone="notebook" />
              </div>
            </div>

            <div
              className={cn(
                'relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end',
                ready ? '' : 'opacity-0',
              )}
            >
              <div className="ah-scribble absolute -inset-x-5 -inset-y-7 bg-[var(--school-ink)] opacity-[0.92] sm:-inset-x-6" />
              <div className="ah-stat-card relative z-10 border-2 border-[var(--school-ink)] bg-[var(--ah-cream,#FBF6E9)] px-7 pb-7 pt-9 sm:px-8">
                <div className="ah-stamp absolute -right-3 -top-4 flex h-[76px] w-[76px] flex-col items-center justify-center rounded-full border-[3px] border-dashed border-primary bg-[var(--ah-cream,#FBF6E9)] text-center font-display text-[11px] font-extrabold leading-tight text-primary">
                  <span className="text-[1.15rem] leading-none">A+</span>
                  Campus
                </div>
                {img ? (
                  <div className="mb-5 aspect-[5/3] overflow-hidden border border-[var(--school-ink)]/20">
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.03]"
                      fetchPriority="high"
                    />
                  </div>
                ) : null}
                <h3 className="ah-hand text-[1.35rem] font-bold leading-tight text-[var(--school-ink)]">
                  {runtime.schoolName}
                </h3>
                {firstStat ? (
                  <>
                    <p className="mt-1 font-display text-[3.25rem] font-extrabold leading-none tracking-tight text-primary sm:text-[3.75rem]">
                      {firstStat.value}
                    </p>
                    <p className="mt-2 text-[0.95rem] leading-snug text-[var(--ah-muted,#4A4235)]">
                      {firstStat.label}
                      {firstStat.hint ? (
                        <span className="ah-hand ml-1 text-primary">
                          · {firstStat.hint}
                        </span>
                      ) : null}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-[var(--ah-muted,#4A4235)]">
                    {slots.subcopy}
                  </p>
                )}
                {slots.primaryCta && (
                  <Link
                    href={slots.primaryCta.href}
                    className="mt-6 block w-full rounded-lg bg-[var(--school-ink)] px-4 py-3.5 text-center font-display text-sm font-bold tracking-wide text-[var(--ah-cream,#FBF6E9)] transition-[background-color,transform] duration-200 hover:bg-primary active:scale-[0.98]"
                  >
                    {slots.primaryCta.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
        <div className="ah-tear" aria-hidden />
      </>
    )
  }

  if (variant === 'boarding') {
    const stats = getSection<{ items?: HomepageStatItem[] }>(config, 'stats')
    const firstStat = stats?.slots.items?.[0]
    const headline = slots.headline || runtime.schoolName
    const parts = headline.trim().split(/\s+/)
    const accent =
      parts.length > 2 ? parts.slice(-2).join(' ') : parts[parts.length - 1]
    const lead =
      parts.length > 2 ? parts.slice(0, -2).join(' ') : parts.slice(0, -1).join(' ')

    return (
      <section className="pf-hero relative overflow-hidden pb-24 pt-[calc(var(--school-nav-h)+3.5rem)] sm:pb-28 sm:pt-[calc(var(--school-nav-h)+4.5rem)]">
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8">
          <div className={cn('school-hero-copy max-w-xl', ready ? '' : 'opacity-0')}>
            {slots.eyebrow && (
              <p className="pf-mono mb-5 text-[12px] uppercase tracking-[0.16em] text-primary">
                {slots.eyebrow}
              </p>
            )}
            <h1 className="font-display text-[clamp(2.5rem,4.6vw,4.1rem)] font-semibold leading-[1.06] text-[var(--school-paper)]">
              {lead ? (
                <>
                  {lead}{' '}
                  <em className="font-medium italic text-primary">{accent}</em>
                </>
              ) : (
                headline
              )}
            </h1>
            <p className="mt-6 max-w-md text-[1.08rem] leading-relaxed text-[#B9CBC8]">
              {slots.subcopy}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              {slots.primaryCta && (
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-sm border border-primary bg-primary px-7 text-[12px] font-bold uppercase tracking-wide text-[var(--school-ink)] shadow-none hover:bg-[var(--primary-light)]"
                >
                  <Link href={slots.primaryCta.href}>
                    {slots.primaryCta.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              {slots.secondaryCta && (
                <Link
                  href={slots.secondaryCta.href}
                  className="border-b border-primary pb-0.5 text-sm font-semibold text-[var(--school-paper)]"
                >
                  {slots.secondaryCta.label} →
                </Link>
              )}
            </div>
          </div>

          <div
            className={cn(
              'pf-pass relative mx-auto w-full max-w-md overflow-hidden rounded-md bg-[var(--school-paper)] lg:mx-0',
              ready ? '' : 'opacity-0',
            )}
          >
            <div className="grid grid-cols-[1fr_auto]">
              <div className="relative border-r-2 border-dashed border-[var(--school-ink)]/25 p-7">
                <div className="mb-4 flex justify-between gap-3">
                  <div>
                    <span className="pf-mono block text-[9.5px] uppercase tracking-[0.12em] text-[var(--pf-teal,#3E7D78)]">
                      Passenger
                    </span>
                    <span className="font-display text-base font-semibold text-[var(--school-ink)]">
                      Future you
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="pf-mono block text-[9.5px] uppercase tracking-[0.12em] text-[var(--pf-teal,#3E7D78)]">
                      Class
                    </span>
                    <span className="font-display text-base font-semibold text-[var(--school-ink)]">
                      All years
                    </span>
                  </div>
                </div>
                <div className="mb-4 flex justify-between gap-3">
                  <div>
                    <span className="pf-mono block text-[9.5px] uppercase tracking-[0.12em] text-[var(--pf-teal,#3E7D78)]">
                      From
                    </span>
                    <span className="font-display text-base font-semibold">
                      Where you are
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="pf-mono block text-[9.5px] uppercase tracking-[0.12em] text-[var(--pf-teal,#3E7D78)]">
                      To
                    </span>
                    <span className="font-display text-base font-semibold">
                      Who you&apos;ll become
                    </span>
                  </div>
                </div>
                {firstStat ? (
                  <div className="mt-3">
                    <p className="pf-mono text-[2.4rem] font-bold leading-none text-[var(--school-accent)]">
                      {firstStat.value}
                    </p>
                    <p className="mt-1 text-[12.5px] text-[var(--school-ink)]/70">
                      {firstStat.label}
                    </p>
                  </div>
                ) : img ? (
                  <div className="mt-3 aspect-[5/2] overflow-hidden">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="pf-barcode mt-5" aria-hidden />
                {slots.primaryCta && (
                  <Link
                    href={slots.primaryCta.href}
                    className="mt-5 block rounded-sm bg-[var(--school-accent)] px-3 py-3 text-center pf-mono text-[11px] uppercase tracking-wide text-[var(--school-paper)]"
                  >
                    {slots.primaryCta.label}
                  </Link>
                )}
              </div>
              <div className="relative flex w-[74px] flex-col items-center justify-between bg-[var(--pf-navy-2,#153E44)] px-3 py-6 text-[var(--school-paper)]">
                <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-[var(--school-ink)]" />
                <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-[var(--school-ink)]" />
                <span className="pf-mono [writing-mode:vertical-rl] text-[10px] tracking-[0.2em]">
                  {runtime.schoolName.slice(0, 12).toUpperCase()}
                </span>
                <span className="font-display text-2xl font-semibold">A1</span>
                <span className="pf-mono [writing-mode:vertical-rl] text-[10px] tracking-[0.16em]">
                  SEAT OPEN
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'crest') {
    return (
      <section className="relative bg-[var(--school-paper)] pt-[var(--school-nav-h)]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center border-2 border-primary bg-white shadow-[6px_6px_0_var(--primary)]">
            {config.logoUrl || runtime.logoUrl ? (
              <img
                src={config.logoUrl || runtime.logoUrl}
                alt=""
                className="h-16 w-16 object-contain"
              />
            ) : (
              <Building2 className="h-12 w-12 text-primary" />
            )}
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            {slots.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-5xl tracking-tight text-[var(--school-ink)] sm:text-6xl lg:text-7xl">
            {slots.headline || runtime.schoolName}
          </h1>
          <div className="mx-auto mt-6 h-0.5 w-24 bg-[var(--school-accent)]" />
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {slots.subcopy}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <HeroButtons slots={slots} />
          </div>
        </div>
        <div className="h-56 w-full overflow-hidden sm:h-72 lg:h-96">
          <img src={img} alt="" className="h-full w-full object-cover" />
        </div>
      </section>
    )
  }

  const isNight = variant === 'night' || variant === 'horizon'
  const isPlayfield = variant === 'playfield'
  const isStudio = variant === 'studio'

  return (
    <section
      className={cn(
        'relative min-h-[100svh] overflow-hidden bg-[var(--school-ink)]',
        isPlayfield && 'min-h-[90svh]',
      )}
    >
      <div className="absolute inset-0">
        <img
          src={img}
          alt=""
          aria-hidden
          fetchPriority="high"
          className={cn(
            'school-hero-media h-full w-full object-cover',
            isPlayfield ? 'object-[70%_30%] scale-110 origin-top-right' : 'object-[58%_30%]',
            ready ? '' : 'opacity-0',
          )}
        />
        <div
          className="absolute inset-0"
          style={{ background: `rgba(10,31,26,${overlay * 0.65})` }}
        />
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-[var(--school-ink)]/90 via-[var(--school-ink)]/55 to-transparent',
            isStudio && 'bg-gradient-to-tr from-[var(--school-ink)]/95 via-[var(--school-ink)]/40 to-transparent',
            isNight && 'from-black/90 via-black/50 to-transparent',
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--school-ink)]/90 via-transparent to-[var(--school-ink)]/40" />
      </div>

      <div
        className={cn(
          'relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-16 pt-[calc(var(--school-nav-h)+2rem)] sm:px-6 lg:px-8',
          isStudio && 'items-end text-right',
        )}
      >
        <div className={cn('max-w-2xl lg:max-w-3xl', isStudio && 'ml-auto')}>
          <p
            className={cn(
              'school-hero-copy mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--school-accent)] sm:text-xs',
              ready ? '' : 'opacity-0',
            )}
          >
            {slots.eyebrow}
          </p>
          <h1
            className={cn(
              'school-hero-copy school-hero-copy-delay font-display tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]',
              'text-[3.25rem] leading-[0.95] sm:text-6xl lg:text-[4.5rem]',
              ready ? '' : 'opacity-0',
            )}
          >
            {slots.headline || runtime.schoolName}
          </h1>
          <div
            className={cn(
              'school-accent-line mt-6 h-0.5 w-20 bg-[var(--school-accent)]',
              isStudio && 'ml-auto',
              ready ? '' : 'opacity-0',
            )}
          />
          <p
            className={cn(
              'school-hero-copy school-hero-copy-delay-2 mt-6 max-w-lg text-base leading-relaxed text-white/95 sm:text-lg',
              isStudio && 'ml-auto',
              ready ? '' : 'opacity-0',
            )}
          >
            {slots.subcopy}
          </p>
          <div
            className={cn(
              'school-hero-copy school-hero-copy-delay-2 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center',
              isStudio && 'justify-end',
              ready ? '' : 'opacity-0',
            )}
          >
            <HeroButtons slots={slots} />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroButtons({
  slots,
  tone = 'dark',
}: {
  slots: {
    primaryCta?: HomepageCta
    secondaryCta?: HomepageCta
  }
  tone?: 'dark' | 'notebook'
}) {
  const notebook = tone === 'notebook'
  return (
    <>
      {slots.primaryCta && (
        <Button
          asChild
          size="lg"
          className={cn(
            'h-12 px-8 text-base font-semibold shadow-none',
            notebook
              ? 'rounded-lg border-2 border-[var(--school-ink)] bg-[var(--school-ink)] text-[var(--ah-cream,#FBF6E9)] hover:border-primary hover:bg-primary'
              : 'rounded-none bg-primary text-white hover:bg-primary-dark',
          )}
        >
          <Link href={slots.primaryCta.href}>
            {slots.primaryCta.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
      {slots.secondaryCta && (
        notebook ? (
          <Link
            href={slots.secondaryCta.href}
            className="border-b-2 border-primary pb-0.5 text-sm font-semibold text-[var(--school-ink)]"
          >
            {slots.secondaryCta.label}
          </Link>
        ) : (
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 rounded-none border-white/50 bg-white/10 px-8 text-base font-semibold text-white shadow-none backdrop-blur-sm hover:bg-white hover:text-[var(--school-ink)]"
          >
            <Link href={slots.secondaryCta.href}>
              <LogIn className="mr-2 h-4 w-4" />
              {slots.secondaryCta.label}
            </Link>
          </Button>
        )
      )}
    </>
  )
}

export function HomepageStats({
  config,
  variant = 'band',
}: {
  config: HomepageConfig
  variant?: string
}) {
  const data = getSection<{ items?: HomepageStatItem[] }>(config, 'stats')
  if (!data) return null
  const items = data.slots.items || []
  if (!items.length) return null

  if (variant === 'scoreboard') {
    return (
      <section className="bg-primary py-8 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          {items.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 60}>
              <div className="border border-white/20 bg-white/5 px-4 py-5 text-center">
                <p className="font-display text-3xl sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    )
  }

  if (variant === 'plaques') {
    return (
      <section className="bg-[var(--school-ink)] py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          {items.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 60}>
              <div className="border border-[var(--school-accent)]/30 bg-black/30 px-4 py-8 text-center shadow-[inset_0_0_40px_rgba(167,243,208,0.06)]">
                <p className="font-display text-3xl text-[var(--school-accent)] sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    )
  }

  if (variant === 'chalk') {
    return (
      <section className="ah-chalk-surface bg-[var(--school-ink)] py-20 text-[var(--ah-cream,#FBF6E9)] sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="ah-margin-note text-[var(--school-accent)]">
              Chalked up this year
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-bold leading-tight">
              The numbers on the board.
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
            {items.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 70}>
                <div className="border-l border-white/20 pl-5">
                  <p className="ah-hand ah-chalk-num text-[clamp(2.5rem,4vw,3.25rem)] font-bold leading-none">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-[0.9rem] leading-snug tracking-[0.01em] text-[#D4CEB8]">
                    {stat.label}
                    {stat.hint ? (
                      <span className="mt-1 block text-[0.8rem] text-[#B8B19A]">
                        {stat.hint}
                      </span>
                    ) : null}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'stamps') {
    return (
      <section className="bg-[var(--pf-ivory-2,#E8DCC0)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="pf-tag text-[var(--school-accent)]">Stamped and approved</p>
            <h2 className="mt-3 font-display text-[clamp(1.85rem,3.5vw,2.5rem)] text-[var(--school-ink)]">
              The numbers, visa-stamped.
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
            {items.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 70}>
                <div className="pf-stamp-card flex flex-col items-center justify-center p-4 text-center">
                  <p className="pf-mono text-[2.1rem] font-bold text-[var(--school-accent)]">
                    {stat.value}
                  </p>
                  <p className="pf-stamp mt-2 text-[10.5px] uppercase leading-snug tracking-wide text-[var(--pf-navy-2,#153E44)]">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-b border-black/10 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-black/10 lg:grid-cols-4 lg:divide-y-0">
        {items.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 70}>
            <div className="px-6 py-10 text-center sm:px-8 sm:py-12">
              <p className="font-display text-4xl tracking-tight text-primary sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {stat.label}
              </p>
              {stat.hint && (
                <p className="mt-1 text-xs text-slate-400">{stat.hint}</p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export function HomepageOfferings({
  config,
  variant = 'grid',
}: {
  config: HomepageConfig
  variant?: string
}) {
  const data = getSection<{
    eyebrow?: string
    headline?: string
    subcopy?: string
    items?: HomepageOfferingItem[]
  }>(config, 'offerings')
  if (!data) return null
  const { slots } = data
  const items = slots.items || []

  if (variant === 'periods') {
    const periodColors = [
      '#3D6FB4',
      '#B4553D',
      '#4F9A6B',
      '#9A6BB0',
      '#D6A226',
      '#AE3A2B',
    ]
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 max-w-xl">
              {slots.eyebrow && (
                <p className="ah-margin-note mb-2">{slots.eyebrow}</p>
              )}
              <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-bold leading-tight text-[var(--school-ink)]">
                {slots.headline}
              </h2>
              <p className="ah-prose mt-4">{slots.subcopy}</p>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <Reveal key={item.title} delay={index * 70}>
                <div className="ah-period group relative overflow-hidden rounded-md border-2 border-[var(--school-ink)] bg-[var(--ah-cream,#FBF6E9)] px-5 pb-6 pt-9">
                  <span className="ah-mono absolute left-5 top-0 rounded-b-md bg-[var(--school-ink)] px-2.5 py-1 text-[10px] tracking-[0.06em] text-[var(--ah-cream,#FBF6E9)]">
                    P{index + 1}
                  </span>
                  <h3 className="flex items-start gap-2.5 font-display text-[1.2rem] font-bold leading-snug text-[var(--school-ink)]">
                    <span
                      className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        background: periodColors[index % periodColors.length],
                      }}
                      aria-hidden
                    />
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--ah-muted,#4A4235)]">
                    {item.body}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-5 inline-flex items-center border-b-2 border-transparent text-sm font-semibold text-primary transition-[border-color] hover:border-primary"
                  >
                    {item.ctaLabel}
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'gates') {
    const gates = ['A', 'B', 'C', 'D', 'E', 'F']
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 max-w-xl">
              {slots.eyebrow && (
                <p className="pf-tag mb-2 text-[var(--school-accent)]">
                  {slots.eyebrow}
                </p>
              )}
              <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.5rem)] text-[var(--school-ink)]">
                {slots.headline}
              </h2>
              <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-[var(--pf-muted,#5B564A)]">
                {slots.subcopy}
              </p>
            </div>
          </Reveal>
          <div className="relative flex flex-wrap justify-between gap-y-10 px-1">
            <div
              className="pointer-events-none absolute left-[6%] right-[6%] top-[26px] hidden border-t-2 border-dashed border-[var(--school-ink)]/40 md:block"
              aria-hidden
            />
            {items.map((item, index) => (
              <Reveal
                key={item.title}
                delay={index * 70}
                className="relative z-10 flex w-1/2 flex-col items-center px-2 text-center sm:w-1/3 md:w-[15%]"
              >
                <div className="mb-3.5 flex h-[54px] w-[54px] items-center justify-center rounded-full border-2 border-primary bg-[var(--school-ink)] pf-mono text-[15px] font-bold text-primary">
                  {gates[index % gates.length]}
                </div>
                <h3 className="font-display text-[0.95rem] text-[var(--school-ink)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[0.78rem] leading-snug text-[var(--pf-muted,#5B564A)]">
                  {item.body}
                </p>
                <Link
                  href={item.href}
                  className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--school-accent)]"
                >
                  {item.ctaLabel} →
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden py-20 sm:py-24',
        variant === 'chapters' && 'bg-white',
      )}
    >
      {variant !== 'open' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(36,106,89,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(36,106,89,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
          }}
        />
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className={cn(variant === 'magazine' && 'max-w-xl')}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {slots.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-[var(--school-ink)] sm:text-5xl">
              {slots.headline}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {slots.subcopy}
            </p>
          </div>
        </Reveal>

        <div
          className={cn(
            'mt-12',
            variant === 'open' && 'grid gap-10 md:grid-cols-3',
            variant === 'grid' && 'grid gap-px bg-black/10 sm:grid-cols-3',
            variant === 'numbered' && 'grid gap-6 md:grid-cols-3',
            variant === 'magazine' && 'mt-16 grid gap-8 md:grid-cols-2',
            variant === 'chapters' && 'mt-16 space-y-16',
          )}
        >
          {items.map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              <div
                className={cn(
                  variant === 'grid' &&
                    'group flex h-full flex-col bg-[var(--school-paper)] p-8 transition-colors hover:bg-white sm:p-10',
                  variant === 'open' && 'group',
                  variant === 'numbered' &&
                    'border border-black/10 bg-white p-8',
                  variant === 'magazine' &&
                    (index === 0 ? 'md:col-span-2 md:flex md:gap-10' : 'border-t border-black/10 pt-8'),
                  variant === 'chapters' && 'grid gap-4 md:grid-cols-[140px_1fr] md:gap-10',
                )}
              >
                {variant === 'numbered' || variant === 'chapters' ? (
                  <span className="font-display text-4xl text-primary/40">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                ) : (
                  <SectionIcon name={item.icon} className="h-6 w-6 text-primary" />
                )}
                <div>
                  <h3 className="mt-6 font-display text-2xl tracking-tight text-[var(--school-ink)] group-[.mt-0]:mt-0">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                    {item.body}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-6 inline-flex items-center text-sm font-semibold text-primary"
                  >
                    {item.ctaLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomepagePrograms({
  config,
  schoolConfig,
  levels,
}: {
  config: HomepageConfig
  schoolConfig?: SchoolConfiguration
  /** Public SSR levels — preferred over schoolConfig when provided. */
  levels?: PublicSchoolLevel[]
}) {
  const data = getSection<{
    eyebrow?: string
    headline?: string
    subcopy?: string
    useSchoolConfig?: boolean
    ctaLabel?: string
    href?: string
  }>(config, 'programs')
  if (!data) return null
  const { slots } = data
  const programLevels = levels ?? schoolConfig?.selectedLevels ?? []

  return (
    <section className="border-y border-black/10 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                {slots.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-4xl tracking-tight text-[var(--school-ink)] sm:text-5xl">
                {slots.headline}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                {slots.subcopy}
              </p>
            </div>
            <Button
              asChild
              className="h-11 w-fit rounded-none bg-primary px-6 text-sm font-semibold text-white shadow-none hover:bg-primary-dark"
            >
              <Link href={slots.href || '/programs'}>
                {slots.ctaLabel || 'View all programs'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>

        {programLevels.length > 0 ? (
          <div className="mt-12 space-y-4">
            {programLevels.map((level, index) => (
              <Reveal key={level.id} delay={index * 60}>
                <div className="border border-black/10 bg-[var(--school-paper)] p-6 sm:p-8">
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs font-semibold tabular-nums text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display text-2xl tracking-tight text-[var(--school-ink)] sm:text-3xl">
                      {level.name}
                    </h3>
                  </div>
                  {level.description && (
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                      {level.description}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {level.gradeLevels.map((grade) => (
                      <span
                        key={grade.id}
                        className="border border-primary/20 bg-white px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {grade.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="mt-12 border border-dashed border-black/15 bg-[var(--school-paper)] px-6 py-14 text-center">
              <p className="font-display text-2xl text-[var(--school-ink)]">
                Programs coming soon
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Ask admissions about our current pathways and intake.
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

export function HomepageGallery({
  config,
  variant = 'default',
}: {
  config: HomepageConfig
  variant?: string
}) {
  const data = getSection<{
    eyebrow?: string
    headline?: string
    images?: HomepageGalleryImage[]
  }>(config, 'gallery')
  if (!data) return null
  const images = (data.slots.images || []).filter((i) => i.url)
  if (!images.length) return null

  if (variant === 'cork') {
    const noteColors = ['#F6E27A', '#9AD1C8', '#F2A6A0', '#B7C9F2']
    const rotates = ['-rotate-3', 'rotate-2', '-rotate-2', 'rotate-3']
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            {data.slots.eyebrow && (
              <p className="ah-margin-note mb-2">{data.slots.eyebrow}</p>
            )}
            <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-bold leading-tight text-[var(--school-ink)]">
              {data.slots.headline}
            </h2>
          </Reveal>
          <Reveal>
            <div className="relative mt-12 overflow-hidden rounded-[12px] bg-[var(--ah-cork,#8B5E3C)] p-7 shadow-[inset_0_0_80px_rgba(0,0,0,0.32)] sm:p-11">
              <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'radial-gradient(rgba(0,0,0,0.18) 1px, transparent 1.4px)',
                  backgroundSize: '10px 10px',
                }}
              />
              <div className="relative z-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
                {images.slice(0, 8).map((image, i) => (
                  <figure
                    key={image.url + i}
                    className={cn(
                      'ah-sticky relative min-h-[188px] p-3.5 shadow-[4px_8px_14px_rgba(0,0,0,0.28)]',
                      rotates[i % rotates.length],
                    )}
                    style={{ background: noteColors[i % noteColors.length] }}
                  >
                    <span className="absolute -top-2.5 left-1/2 h-[15px] w-[15px] -translate-x-1/2 rounded-full bg-primary shadow-[0_2px_4px_rgba(0,0,0,0.45),inset_-1px_-1px_0_rgba(0,0,0,0.2)]" />
                    <div className="aspect-[4/3] overflow-hidden bg-black/5">
                      <img
                        src={image.url}
                        alt={image.caption || ''}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {image.caption && (
                      <figcaption className="ah-hand mt-2.5 px-0.5 text-[0.95rem] leading-snug text-[var(--school-ink)]">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  if (variant === 'tickets') {
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            {data.slots.eyebrow && (
              <p className="pf-tag mb-2 text-[var(--school-accent)]">
                {data.slots.eyebrow}
              </p>
            )}
            <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.5rem)] text-[var(--school-ink)]">
              {data.slots.headline}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {images.slice(0, 8).map((image, i) => (
              <Reveal key={image.url + i} delay={i * 60}>
                <figure className="pf-ticket overflow-hidden rounded border border-[var(--school-ink)] bg-white">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.caption || ''}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="border-t-2 border-dashed border-[var(--school-ink)]/35 px-4 py-3">
                    <span className="pf-mono text-[10px] uppercase tracking-wide text-[var(--pf-teal,#3E7D78)]">
                      Gate {String.fromCharCode(65 + (i % 6))}
                    </span>
                    {image.caption && (
                      <figcaption className="mt-1 font-display text-[1.05rem] text-[var(--school-ink)]">
                        {image.caption}
                      </figcaption>
                    )}
                  </div>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {data.slots.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-[var(--school-ink)] sm:text-5xl">
            {data.slots.headline}
          </h2>
        </Reveal>
        <div className="mt-10 flex gap-4 overflow-x-auto pb-4">
          {images.map((image, i) => (
            <Reveal key={image.url + i} delay={i * 50}>
              <figure className="w-[280px] shrink-0 sm:w-[360px]">
                <div className="aspect-[4/3] overflow-hidden bg-black/5">
                  <img
                    src={image.url}
                    alt={image.caption || ''}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                {image.caption && (
                  <figcaption className="mt-3 text-sm text-slate-600">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomepageTestimonials({
  config,
  variant = 'default',
}: {
  config: HomepageConfig
  variant?: string
}) {
  const data = getSection<{
    eyebrow?: string
    headline?: string
    items?: HomepageTestimonial[]
  }>(config, 'testimonials')
  if (!data) return null
  const items = data.slots.items || []
  if (!items.length) return null

  if (variant === 'yearbook') {
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            {data.slots.eyebrow && (
              <p className="ah-margin-note mb-2">{data.slots.eyebrow}</p>
            )}
            <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] font-bold leading-tight text-[var(--school-ink)]">
              {data.slots.headline}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {items.map((item, i) => (
              <Reveal key={item.name + i} delay={i * 70}>
                <blockquote className="relative flex h-full flex-col rounded-sm border border-[var(--school-ink)] bg-[var(--ah-cream,#FBF6E9)] p-6 shadow-[4px_5px_0_var(--ah-shadow,rgba(28,43,69,0.14))]">
                  <p className="flex-1 text-[1.05rem] leading-relaxed text-[var(--school-ink)]">
                    <span className="ah-hand mr-1 text-2xl leading-none text-primary" aria-hidden>
                      “
                    </span>
                    {item.quote}
                  </p>
                  <footer className="mt-6 flex items-center gap-3 border-t border-[var(--school-ink)]/10 pt-4">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--school-ink)]/10"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--school-ink)] font-display text-xs font-bold text-[var(--ah-cream,#FBF6E9)]">
                        {item.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[var(--school-ink)]">
                        {item.name}
                      </p>
                      <p className="ah-hand text-[0.9rem] text-[var(--ah-muted,#4A4235)]">
                        {item.role}
                      </p>
                    </div>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'luggage') {
    return (
      <section className="bg-[var(--school-ink)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            {data.slots.eyebrow && (
              <p className="pf-tag mb-2">{data.slots.eyebrow}</p>
            )}
            <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.5rem)] text-[var(--school-paper)]">
              {data.slots.headline}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {items.map((item, i) => (
              <Reveal key={item.name + i} delay={i * 70}>
                <blockquote className="pf-luggage relative rounded-md bg-[var(--school-paper)] p-6 pt-7">
                  <p className="pf-mono text-[1.05rem] font-bold text-[var(--school-accent)]">
                    → {item.role}
                  </p>
                  <p className="mt-3 text-[0.92rem] leading-relaxed text-[#332F27]">
                    {item.quote}
                  </p>
                  <footer className="mt-5">
                    <p className="font-display text-[0.95rem] text-[var(--school-ink)]">
                      {item.name}
                    </p>
                    <p className="pf-stamp text-[0.78rem] text-[var(--pf-teal,#3E7D78)]">
                      Alumni
                    </p>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-y border-black/10 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {data.slots.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-[var(--school-ink)] sm:text-5xl">
            {data.slots.headline}
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.name + i} delay={i * 70}>
              <blockquote className="border border-black/10 bg-[var(--school-paper)] p-8">
                <p className="font-display text-xl leading-snug text-[var(--school-ink)] sm:text-2xl">
                  “{item.quote}”
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  {item.photoUrl && (
                    <img
                      src={item.photoUrl}
                      alt=""
                      className="h-10 w-10 object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[var(--school-ink)]">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomepageCtaBand({
  config,
  runtime,
  variant = 'primary',
}: {
  config: HomepageConfig
  runtime: HomepageRuntime
  variant?: string
}) {
  const data = getSection<{
    headline?: string
    body?: string
    primaryCta?: HomepageCta
    secondaryCta?: HomepageCta
  }>(config, 'cta')
  if (!data) return null
  const { slots } = data

  if (variant === 'fees') {
    return (
      <section className="sticky bottom-0 z-40 border-t-2 border-[var(--school-ink)] bg-[var(--ah-cream,#FBF6E9)]/95 py-3.5 shadow-[0_-8px_28px_rgba(28,43,69,0.1)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="font-display text-lg font-bold leading-tight text-[var(--school-ink)] sm:text-xl">
              {slots.headline}
            </p>
            <p className="mt-0.5 max-w-xl text-sm leading-snug text-[var(--ah-muted,#4A4235)]">
              {slots.body?.replace(/\{schoolName\}/g, runtime.schoolName) ||
                slots.body}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {slots.primaryCta && (
              <Button
                asChild
                className="h-11 rounded-lg border-2 border-[var(--school-ink)] bg-[var(--school-ink)] px-6 text-sm font-bold text-[var(--ah-cream,#FBF6E9)] shadow-none transition-[background-color,border-color,transform] hover:border-primary hover:bg-primary active:scale-[0.98]"
              >
                <Link href={slots.primaryCta.href}>
                  {slots.primaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            {slots.secondaryCta && (
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-lg border-2 border-[var(--school-ink)] bg-transparent px-5 text-sm font-bold text-[var(--school-ink)] shadow-none hover:bg-[var(--school-ink)] hover:text-[var(--ah-cream,#FBF6E9)]"
              >
                <Link href={slots.secondaryCta.href}>
                  {slots.secondaryCta.label}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'checkin') {
    return (
      <section className="sticky bottom-0 z-40 border-t border-[var(--primary-dark)] bg-[var(--pf-navy-3,#0A2226)] py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="font-display text-lg italic text-[var(--school-paper)] sm:text-xl">
              {slots.headline}
            </p>
            <p className="mt-0.5 max-w-xl text-sm text-[#9FB3B0]">
              {slots.body?.replace(/\{schoolName\}/g, runtime.schoolName) ||
                slots.body}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {slots.primaryCta && (
              <Button
                asChild
                className="h-11 rounded-sm border border-primary bg-primary px-6 text-[12px] font-bold uppercase tracking-wide text-[var(--school-ink)] shadow-none hover:bg-[var(--primary-light)]"
              >
                <Link href={slots.primaryCta.href}>
                  {slots.primaryCta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            {slots.secondaryCta && (
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-sm border border-primary bg-transparent px-5 text-[12px] font-bold uppercase tracking-wide text-[var(--school-paper)] shadow-none hover:bg-primary hover:text-[var(--school-ink)]"
              >
                <Link href={slots.secondaryCta.href}>
                  {slots.secondaryCta.label}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden py-20 sm:py-24',
        variant === 'primary' && 'bg-primary',
        variant === 'ink' && 'bg-[var(--school-ink)]',
        variant === 'block' && 'bg-[var(--school-paper)]',
      )}
    >
      <div
        className={cn(
          'relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8',
          variant === 'block' &&
            'max-w-5xl border border-black/10 bg-primary px-8 py-16 text-left sm:px-12',
        )}
      >
        <Reveal>
          <h2
            className={cn(
              'font-display text-4xl tracking-tight sm:text-5xl',
              variant === 'block' ? 'text-white' : 'text-white',
            )}
          >
            {slots.headline}
          </h2>
          <p
            className={cn(
              'mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg',
              'text-white/85',
              variant === 'block' && 'mx-0',
            )}
          >
            {slots.body?.replace(/\{schoolName\}/g, runtime.schoolName) ||
              slots.body}
          </p>
          <div
            className={cn(
              'mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center',
              variant === 'block' && 'justify-start',
            )}
          >
            {slots.primaryCta && (
              <Button
                asChild
                size="lg"
                className="h-12 rounded-none bg-white px-8 text-base font-semibold text-primary shadow-none hover:bg-[var(--school-accent)] hover:text-[var(--school-ink)]"
              >
                <Link href={slots.primaryCta.href}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {slots.primaryCta.label}
                </Link>
              </Button>
            )}
            {slots.secondaryCta && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-none border-white/40 bg-transparent px-8 text-base font-semibold text-white shadow-none hover:bg-white/10"
              >
                <Link href={slots.secondaryCta.href}>
                  <MapPin className="mr-2 h-4 w-4" />
                  {slots.secondaryCta.label}
                </Link>
              </Button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function HomepageFooter({
  config,
  runtime,
}: {
  config: HomepageConfig
  runtime: HomepageRuntime
}) {
  const data = getSection<{
    blurb?: string
    quickLinks?: HomepageNavLink[]
    email?: string
    phone?: string
  }>(config, 'footer')
  if (!data) return null
  const { slots } = data

  return (
    <footer className="bg-[var(--school-ink)] py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-primary">
                {config.logoUrl || runtime.logoUrl ? (
                  <img
                    src={config.logoUrl || runtime.logoUrl}
                    alt=""
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <p className="font-display text-xl leading-none tracking-tight">
                  {runtime.schoolName}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">
                  {runtime.tagline || 'Inspiring excellence every day'}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              {slots.blurb}
            </p>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Quick links
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {(slots.quickLinks || []).map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Contact
            </h3>
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary-light" />
                <span>
                  {slots.email || `info@${runtime.subdomain}.edu`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <PhoneCall className="h-4 w-4 shrink-0 text-primary-light" />
                <span>{slots.phone || '+254 700 000 000'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} {runtime.schoolName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export function HomepageFeeSection({
  config,
  runtime,
}: {
  config: HomepageConfig
  runtime: HomepageRuntime
}) {
  const data = getSection<{
    eyebrow?: string
    headline?: string
    subcopy?: string
  }>(config, 'feeDownloads')
  if (!data) return null
  return (
    <SchoolHomepageFeeDownloads
      subdomain={runtime.subdomain}
      schoolName={runtime.schoolName}
      eyebrow={data.slots.eyebrow}
      headline={data.slots.headline}
      subcopy={data.slots.subcopy}
    />
  )
}

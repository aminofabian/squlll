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
  const solid = scrolled || open || variant === 'solid'
  const initials = runtime.schoolName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solid
          ? 'border-b border-black/10 bg-white/95 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
        variant === 'glass' && !solid && 'bg-white/10 backdrop-blur-md',
        variant === 'crest' && 'border-b border-black/10 bg-white',
      )}
    >
      <div className="mx-auto flex h-[var(--school-nav-h)] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {runtime.logoUrl ? (
            <img
              src={runtime.logoUrl}
              alt=""
              className="h-10 w-10 object-contain sm:h-11 sm:w-11"
            />
          ) : (
            <div className="relative flex h-10 w-10 items-center justify-center bg-primary text-white sm:h-11 sm:w-11">
              <Building2 className="h-5 w-5" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center bg-[var(--school-ink)] text-[9px] font-semibold text-white">
                {initials}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <span
              className={cn(
                'block truncate font-display text-lg leading-none tracking-tight sm:text-xl',
                solid || variant === 'crest' ? 'text-[var(--school-ink)]' : 'text-white',
              )}
            >
              {runtime.schoolName}
            </span>
            {slots.showTagline !== false && (
              <span
                className={cn(
                  'mt-1 block truncate text-[10px] font-medium uppercase tracking-[0.16em] sm:text-[11px]',
                  solid || variant === 'crest' ? 'text-primary' : 'text-white/70',
                )}
              >
                {runtime.tagline || 'Inspiring excellence every day'}
              </span>
            )}
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href + link.label}
              href={link.href}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                solid || variant === 'crest'
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
              'h-10 rounded-none border px-4 text-sm font-semibold shadow-none',
              solid || variant === 'crest'
                ? 'border-primary/30 text-primary hover:bg-primary hover:text-white'
                : 'border-white/40 bg-white/10 text-white hover:bg-white hover:text-[var(--school-ink)]',
            )}
          >
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              {slots.portalLabel || 'Portal'}
            </Link>
          </Button>
          <Button
            asChild
            className="h-10 rounded-none bg-primary px-5 text-sm font-semibold text-white shadow-none hover:bg-primary-dark"
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
            solid || variant === 'crest'
              ? 'border-black/10 text-[var(--school-ink)]'
              : 'border-white/30 text-white',
          )}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-black/10 bg-white lg:hidden">
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

  if (variant === 'crest') {
    return (
      <section className="relative bg-[var(--school-paper)] pt-[var(--school-nav-h)]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center border-2 border-primary bg-white shadow-[6px_6px_0_var(--primary)]">
            {runtime.logoUrl ? (
              <img src={runtime.logoUrl} alt="" className="h-16 w-16 object-contain" />
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
  const isAssembly = variant === 'assembly'

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
          isAssembly && 'items-center text-center',
          isStudio && 'items-end text-right',
        )}
      >
        <div className={cn('max-w-2xl lg:max-w-3xl', isAssembly && 'mx-auto', isStudio && 'ml-auto')}>
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
              isAssembly
                ? 'text-5xl sm:text-7xl lg:text-8xl'
                : 'text-[3.25rem] leading-[0.95] sm:text-6xl lg:text-[4.5rem]',
              ready ? '' : 'opacity-0',
            )}
          >
            {slots.headline || runtime.schoolName}
          </h1>
          <div
            className={cn(
              'school-accent-line mt-6 h-0.5 w-20 bg-[var(--school-accent)]',
              isAssembly && 'mx-auto',
              isStudio && 'ml-auto',
              ready ? '' : 'opacity-0',
            )}
          />
          <p
            className={cn(
              'school-hero-copy school-hero-copy-delay-2 mt-6 max-w-lg text-base leading-relaxed text-white/95 sm:text-lg',
              isAssembly && 'mx-auto',
              isStudio && 'ml-auto',
              ready ? '' : 'opacity-0',
            )}
          >
            {slots.subcopy}
          </p>
          <div
            className={cn(
              'school-hero-copy school-hero-copy-delay-2 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center',
              isAssembly && 'justify-center',
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
}: {
  slots: {
    primaryCta?: HomepageCta
    secondaryCta?: HomepageCta
  }
}) {
  return (
    <>
      {slots.primaryCta && (
        <Button
          asChild
          size="lg"
          className="h-12 rounded-none bg-primary px-8 text-base font-semibold text-white shadow-none hover:bg-primary-dark"
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
          size="lg"
          variant="outline"
          className="h-12 rounded-none border-white/50 bg-white/10 px-8 text-base font-semibold text-white shadow-none backdrop-blur-sm hover:bg-white hover:text-[var(--school-ink)]"
        >
          <Link href={slots.secondaryCta.href}>
            <LogIn className="mr-2 h-4 w-4" />
            {slots.secondaryCta.label}
          </Link>
        </Button>
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
}: {
  config: HomepageConfig
  schoolConfig?: SchoolConfiguration
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
  const levels = schoolConfig?.selectedLevels || []

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

        {levels.length > 0 ? (
          <div className="mt-12 space-y-4">
            {levels.map((level, index) => (
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

export function HomepageGallery({ config }: { config: HomepageConfig }) {
  const data = getSection<{
    eyebrow?: string
    headline?: string
    images?: HomepageGalleryImage[]
  }>(config, 'gallery')
  if (!data) return null
  const images = (data.slots.images || []).filter((i) => i.url)
  if (!images.length) return null

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

export function HomepageTestimonials({ config }: { config: HomepageConfig }) {
  const data = getSection<{
    eyebrow?: string
    headline?: string
    items?: HomepageTestimonial[]
  }>(config, 'testimonials')
  if (!data) return null
  const items = data.slots.items || []
  if (!items.length) return null

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
                <Building2 className="h-5 w-5 text-white" />
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

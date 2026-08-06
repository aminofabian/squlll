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
  Star,
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
  const isCloister = variant === 'cloister'
  const isVine = variant === 'vine'
  const isDisc = variant === 'disc'
  const isFolio = variant === 'folio'
  const isMarquee = variant === 'marquee'
  const solid =
    scrolled ||
    open ||
    variant === 'solid' ||
    isNotebook ||
    isTerminal ||
    isCloister ||
    isVine ||
    isDisc ||
    isFolio ||
    isMarquee
  const logoUrl = config.logoUrl || runtime.logoUrl
  const initials = runtime.schoolName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (isFolio) {
    return (
      <nav
        className={cn(
          'inset-x-0 top-0 z-50 border-b-2 border-[var(--fo-ink)] bg-[var(--fo-cream)]/95 backdrop-blur-md',
          runtime.preview ? 'absolute' : 'fixed',
        )}
      >
        <div className="mx-auto flex h-[var(--school-nav-h)] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-baseline gap-3">
            <span className="font-display text-[1.3rem] leading-none tracking-tight text-[var(--fo-ink)]">
              {runtime.schoolName}
            </span>
            {slots.showTagline !== false && (
              <span className="fo-mono hidden text-[9.5px] uppercase tracking-[0.18em] text-[var(--fo-vermilion)] sm:block">
                {runtime.tagline || 'The student review'}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="px-3 py-2 text-sm font-semibold text-[var(--fo-ink)]/70 transition-colors hover:text-[var(--fo-vermilion)]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-none border-[var(--fo-ink)]/30 px-4 text-sm font-semibold text-[var(--fo-ink)] shadow-none hover:border-[var(--fo-ink)] hover:bg-[var(--fo-ink)] hover:text-[var(--fo-cream)]"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                {slots.portalLabel || 'Portal'}
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-none bg-[var(--fo-ink)] px-5 text-sm font-semibold text-[var(--fo-cream)] shadow-none hover:bg-[var(--fo-vermilion)]"
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
            className="inline-flex h-10 w-10 items-center justify-center border border-[var(--fo-ink)]/25 text-[var(--fo-ink)] lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t-2 border-[var(--fo-ink)] bg-[var(--fo-cream)] lg:hidden">
            <div className="space-y-1 px-4 py-4">
              {links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-2 py-3 font-display text-xl text-[var(--fo-ink)] hover:text-[var(--fo-vermilion)]"
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

  if (isMarquee) {
    return (
      <nav
        className={cn(
          'inset-x-0 top-0 z-50 border-b border-white/10 bg-[var(--nl-ink)]/85 backdrop-blur-md',
          runtime.preview ? 'absolute' : 'fixed',
        )}
      >
        <div className="mx-auto flex h-[var(--school-nav-h)] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-9 w-9 object-contain sm:h-10 sm:w-10"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--nl-neon)]/50 bg-[var(--nl-ink-2)] text-[var(--nl-neon)]">
                <Building2 className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0">
              <span className="block truncate font-display text-base leading-none tracking-wide text-white sm:text-lg">
                {runtime.schoolName}
              </span>
              {slots.showTagline !== false && (
                <span className="nl-mono mt-1 block truncate text-[9px] uppercase tracking-[0.26em] text-[var(--nl-neon)]">
                  {runtime.tagline || 'After dark on campus'}
                </span>
              )}
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="relative px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white after:absolute after:inset-x-3.5 after:bottom-0.5 after:h-px after:bg-[var(--nl-neon)] after:opacity-0 hover:after:opacity-100"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-white/20 px-4 text-sm font-medium text-white shadow-none hover:border-[var(--nl-neon)] hover:text-[var(--nl-neon)]"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                {slots.portalLabel || 'Portal'}
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-full bg-[var(--nl-neon)] px-5 text-sm font-bold text-[var(--nl-ink)] shadow-[0_0_18px_rgba(79,227,201,0.35)] hover:bg-white"
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 bg-[var(--nl-ink-2)] lg:hidden">
            <div className="space-y-1 px-4 py-4">
              {links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-2 py-3 text-base font-medium text-white/85 hover:text-[var(--nl-neon)]"
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

  if (isDisc) {
    return (
      <nav
        className={cn(
          'inset-x-0 top-0 z-50 border-b-2 border-[var(--school-ink)] bg-[var(--hb-cream,#F4ECD8)]',
          runtime.preview ? 'absolute' : 'sticky',
        )}
      >
        <div className="mx-auto flex h-[var(--school-nav-h)] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-9 w-9 rounded-full border-2 border-[var(--hb-gold,#C9A227)] object-contain sm:h-10 sm:w-10"
              />
            ) : (
              <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-[var(--hb-gold,#C9A227)] bg-[var(--school-ink)] font-display text-[15px] font-bold text-[var(--hb-gold,#C9A227)]">
                {initials.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <span className="block truncate font-display text-[1.25rem] font-bold leading-none text-[var(--school-ink)]">
                {runtime.schoolName}
              </span>
              {slots.showTagline !== false && (
                <span className="hb-mono mt-1 block truncate text-[10px] uppercase tracking-[0.1em] text-primary">
                  {runtime.tagline || 'Conservatory campus'}
                </span>
              )}
            </div>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="relative pb-0.5 text-[13.5px] font-semibold text-[var(--hb-charcoal,#332720)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2.5 lg:flex">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-[3px] border-[1.5px] border-[var(--school-ink)] bg-transparent px-4 text-[13.5px] font-bold text-[var(--school-ink)] shadow-none hover:bg-[var(--school-ink)] hover:text-[var(--hb-cream,#F4ECD8)]"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-3.5 w-3.5" />
                {slots.portalLabel || 'Portal'}
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-[3px] border-[1.5px] border-primary bg-primary px-4 text-[13.5px] font-bold text-[var(--hb-cream,#F4ECD8)] shadow-none hover:bg-[var(--primary-dark)]"
            >
              <Link href="/apply">
                {slots.applyLabel || 'Apply'}
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[3px] border border-[var(--school-ink)] text-[var(--school-ink)] lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-[var(--school-ink)]/15 bg-[var(--hb-cream,#F4ECD8)] lg:hidden">
            <div className="space-y-1 px-4 py-4">
              {links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-2 py-3 text-sm font-semibold text-[var(--hb-charcoal,#332720)] hover:text-primary"
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

  if (isVine) {
    return (
      <nav
        className={cn(
          'inset-x-0 top-0 z-50 border-b-[1.5px] border-primary bg-[var(--ss-sage,#EEF0E2)]',
          runtime.preview ? 'absolute' : 'sticky',
        )}
      >
        <div className="mx-auto flex h-[var(--school-nav-h)] max-w-7xl items-center justify-between gap-4 pl-12 pr-4 sm:pl-16 sm:pr-6 lg:pl-[4.75rem] lg:pr-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-9 w-9 object-contain sm:h-10 sm:w-10"
              />
            ) : (
              <svg
                className="h-9 w-9 shrink-0"
                viewBox="0 0 40 40"
                fill="none"
                aria-hidden
              >
                <path
                  d="M4 18 L20 6 L36 18 V34 H4 Z"
                  stroke="var(--ss-moss,#2F4A34)"
                  strokeWidth="2"
                  fill="var(--ss-sage,#EEF0E2)"
                />
                <path
                  d="M4 18 H36"
                  stroke="var(--ss-moss,#2F4A34)"
                  strokeWidth="1.5"
                />
                <path
                  d="M20 6 V34"
                  stroke="var(--ss-moss,#2F4A34)"
                  strokeWidth="1.2"
                  opacity=".5"
                />
                <path
                  d="M12 34 V22 H28 V34"
                  stroke="var(--ss-terra,#C1652E)"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            )}
            <div className="min-w-0">
              <span className="block truncate font-display text-[1.25rem] leading-none tracking-tight text-[var(--school-ink)]">
                {runtime.schoolName}
              </span>
              {slots.showTagline !== false && (
                <span className="ss-mono mt-1 block truncate text-[10.5px] uppercase tracking-[0.05em] text-[var(--ss-moss-2,#3E6247)]">
                  {runtime.tagline || 'Greenhouse campus'}
                </span>
              )}
            </div>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="relative pb-0.5 text-[13.5px] font-semibold text-[var(--ss-soil,#4A3728)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-[var(--ss-terra,#C1652E)] after:transition-transform hover:after:scale-x-100"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2.5 lg:flex">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-[1.5px] border-primary bg-transparent px-4 text-[13.5px] font-bold text-primary shadow-none hover:bg-primary hover:text-[var(--ss-sage,#EEF0E2)]"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-3.5 w-3.5" />
                {slots.portalLabel || 'Visit'}
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-full border-[1.5px] border-[var(--ss-terra,#C1652E)] bg-[var(--ss-terra,#C1652E)] px-4 text-[13.5px] font-bold text-white shadow-none hover:bg-[#A6541F]"
            >
              <Link href="/apply">
                {slots.applyLabel || 'Enrol this season'}
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-primary lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-primary/15 bg-[var(--ss-sage,#EEF0E2)] lg:hidden">
            <div className="space-y-1 px-4 py-4 pl-12">
              {links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-2 py-3 text-sm font-semibold text-[var(--ss-soil,#4A3728)] hover:text-primary"
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

  if (isCloister) {
    return (
      <nav
        className={cn(
          'inset-x-0 top-0 z-50 border-b border-[var(--school-ink)]/12 bg-[var(--gc-linen,#F4EFE4)]/95 backdrop-blur-md',
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
              <div className="gc-arch flex h-11 w-10 items-center justify-center bg-primary font-display text-sm font-semibold text-[var(--school-paper)]">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <span className="block truncate font-display text-xl leading-none tracking-tight text-[var(--school-ink)] sm:text-[1.35rem]">
                {runtime.schoolName}
              </span>
              {slots.showTagline !== false && (
                <span className="gc-label mt-1.5 block truncate text-[var(--gc-clay,#C17A4A)]">
                  {runtime.tagline || 'Walled courtyard'}
                </span>
              )}
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="px-3.5 py-2 text-[0.9rem] font-medium text-[var(--school-ink)]/75 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border border-[var(--school-ink)]/20 bg-transparent px-5 text-sm font-semibold text-[var(--school-ink)] shadow-none hover:border-primary hover:bg-primary hover:text-[var(--school-paper)]"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-3.5 w-3.5" />
                {slots.portalLabel || 'Portal'}
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-full border-0 bg-[var(--school-accent)] px-5 text-sm font-semibold text-[var(--school-paper)] shadow-none hover:bg-[var(--primary-dark)]"
            >
              <Link href="/apply">
                {slots.applyLabel || 'Visit the court'}
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--school-ink)]/20 text-[var(--school-ink)] lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-[var(--school-ink)]/10 bg-[var(--gc-linen,#F4EFE4)] lg:hidden">
            <div className="space-y-1 px-4 py-4">
              {links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-2 py-3 text-sm font-medium text-[var(--school-ink)] hover:text-primary"
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
      parts.length > 2
        ? parts.slice(0, -2).join(' ')
        : parts.slice(0, -1).join(' ')
    const overlay = Math.min(
      0.85,
      Math.max(0.35, Number(slots.overlayStrength ?? 0.55)),
    )

    return (
      <section className="relative min-h-[min(100svh,920px)] overflow-hidden bg-[var(--school-ink)]">
        {/* Full-bleed campus photo — the terminal window */}
        <div className="absolute inset-0">
          <img
            src={img}
            alt=""
            aria-hidden
            fetchPriority="high"
            className={cn(
              'school-hero-media h-full w-full scale-105 object-cover object-[58%_30%]',
              ready ? '' : 'opacity-0',
            )}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(105deg, rgba(10,34,38,${0.92 * overlay + 0.08}) 0%, rgba(14,46,51,${0.78 * overlay}) 42%, rgba(14,46,51,${0.45 * overlay}) 68%, rgba(14,46,51,0.28) 100%)`,
            }}
          />
          <div
            className="pf-hero-dots pointer-events-none absolute inset-0 opacity-60"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--school-ink)]/80 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-[calc(var(--school-nav-h)+3rem)] sm:gap-14 sm:px-6 sm:pb-24 sm:pt-[calc(var(--school-nav-h)+4rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
          <div
            className={cn(
              'school-hero-copy max-w-xl',
              ready ? '' : 'opacity-0',
            )}
          >
            <h1 className="font-display text-[clamp(2.6rem,5vw,4.25rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-[var(--school-paper)]">
              {lead ? (
                <>
                  {lead}{' '}
                  <em className="font-medium italic text-primary">{accent}</em>
                </>
              ) : (
                headline
              )}
            </h1>
            <p className="mt-6 max-w-[36ch] text-[1.08rem] leading-[1.7] text-[#D4E2DF]">
              {slots.subcopy}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              {slots.primaryCta && (
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-sm border border-primary bg-primary px-7 text-[12px] font-bold uppercase tracking-wide text-[var(--school-ink)] shadow-none transition-[background-color,transform] hover:bg-[var(--primary-light)] active:scale-[0.98]"
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
                  className="border-b border-primary/80 pb-0.5 text-sm font-semibold text-[var(--school-paper)] transition-colors hover:text-primary"
                >
                  {slots.secondaryCta.label} →
                </Link>
              )}
            </div>
            {slots.eyebrow && (
              <p className="pf-mono mt-10 text-[11px] uppercase tracking-[0.14em] text-primary/90">
                {slots.eyebrow}
              </p>
            )}
          </div>

          <div
            className={cn(
              'pf-pass relative mx-auto w-full max-w-[26rem] lg:mx-0 lg:justify-self-end',
              ready ? '' : 'opacity-0',
            )}
          >
            <div className="grid grid-cols-[1fr_auto] overflow-hidden rounded-md bg-[var(--school-paper)]">
              <div className="relative border-r-2 border-dashed border-[var(--school-ink)]/20 p-5 sm:p-6">
                {/* Passport photo window */}
                <div className="mb-4 flex gap-3">
                  <div className="h-[72px] w-[58px] shrink-0 overflow-hidden border border-[var(--school-ink)]/25 bg-[var(--school-ink)]/5 shadow-[inset_0_0_0_1px_rgba(14,46,51,0.06)]">
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="min-w-0 flex-1 self-end">
                    <span className="pf-mono block text-[9px] uppercase tracking-[0.12em] text-[var(--pf-teal,#3E7D78)]">
                      Passenger
                    </span>
                    <span className="font-display text-[1.05rem] font-semibold leading-tight text-[var(--school-ink)]">
                      Future you
                    </span>
                    <span className="pf-mono mt-1 block text-[9px] uppercase tracking-[0.1em] text-[var(--school-ink)]/45">
                      {runtime.schoolName}
                    </span>
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-3">
                  <div>
                    <span className="pf-mono block text-[9px] uppercase tracking-[0.12em] text-[var(--pf-teal,#3E7D78)]">
                      From
                    </span>
                    <span className="font-display text-[0.95rem] font-semibold text-[var(--school-ink)]">
                      Where you are
                    </span>
                  </div>
                  <div>
                    <span className="pf-mono block text-[9px] uppercase tracking-[0.12em] text-[var(--pf-teal,#3E7D78)]">
                      To
                    </span>
                    <span className="font-display text-[0.95rem] font-semibold text-[var(--school-ink)]">
                      Who you&apos;ll become
                    </span>
                  </div>
                </div>

                {firstStat && (
                  <div className="mt-2 border-t border-[var(--school-ink)]/10 pt-3">
                    <p className="pf-mono text-[2.15rem] font-bold leading-none text-[var(--school-accent)]">
                      {firstStat.value}
                    </p>
                    <p className="mt-1 text-[12px] leading-snug text-[var(--school-ink)]/65">
                      {firstStat.label}
                    </p>
                  </div>
                )}

                <div className="pf-barcode mt-4" aria-hidden />

                {slots.primaryCta && (
                  <Link
                    href={slots.primaryCta.href}
                    className="mt-4 block rounded-sm bg-[var(--school-accent)] px-3 py-3 text-center pf-mono text-[11px] uppercase tracking-wide text-[var(--school-paper)] transition-colors hover:bg-[var(--school-ink)]"
                  >
                    {slots.primaryCta.label}
                  </Link>
                )}
              </div>

              <div className="relative flex w-[68px] flex-col items-center justify-between bg-[var(--pf-navy-2,#153E44)] px-2.5 py-5 text-[var(--school-paper)] sm:w-[74px]">
                <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-[var(--school-ink)]" />
                <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-[var(--school-ink)]" />
                <span className="pf-mono [writing-mode:vertical-rl] text-[10px] tracking-[0.18em]">
                  {runtime.schoolName.slice(0, 10).toUpperCase()}
                </span>
                <span className="font-display text-[1.35rem] font-semibold">
                  A1
                </span>
                <span className="pf-mono [writing-mode:vertical-rl] text-[10px] tracking-[0.14em]">
                  OPEN
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'courtyard') {
    const stats = getSection<{ items?: HomepageStatItem[] }>(config, 'stats')
    const firstStat = stats?.slots.items?.[0]
    const headline = slots.headline || runtime.schoolName
    const parts = headline.trim().split(/\s+/)
    const accent =
      parts.length > 1 ? parts[parts.length - 1] : null
    const lead =
      accent && parts.length > 1
        ? parts.slice(0, -1).join(' ')
        : headline
    const overlay = Math.min(
      0.8,
      Math.max(0.35, Number(slots.overlayStrength ?? 0.5)),
    )

    return (
      <section className="relative min-h-[min(100svh,900px)] overflow-hidden bg-[var(--school-ink)]">
        <div className="absolute inset-0">
          <img
            src={img}
            alt=""
            aria-hidden
            fetchPriority="high"
            className={cn(
              'school-hero-media h-full w-full scale-105 object-cover object-[50%_35%]',
              ready ? '' : 'opacity-0',
            )}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(115deg, rgba(36,48,40,${0.88 * overlay + 0.1}) 0%, rgba(36,48,40,${0.55 * overlay}) 48%, rgba(95,125,90,${0.28 * overlay}) 100%)`,
            }}
          />
          <div
            className="gc-panes pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--school-ink)]/70 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-[calc(var(--school-nav-h)+3rem)] sm:gap-14 sm:px-6 sm:pb-24 sm:pt-[calc(var(--school-nav-h)+4rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
          <div
            className={cn(
              'school-hero-copy max-w-xl',
              ready ? '' : 'opacity-0',
            )}
          >
            {slots.eyebrow && (
              <p className="gc-label mb-5 text-[var(--school-accent)]">
                {slots.eyebrow}
              </p>
            )}
            <h1 className="font-display text-[clamp(2.75rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-[var(--school-paper)]">
              {lead}
              {accent ? (
                <>
                  {' '}
                  <em className="gc-italic font-medium text-[var(--school-accent)]">
                    {accent}
                  </em>
                </>
              ) : null}
            </h1>
            <p className="mt-6 max-w-[38ch] text-[1.08rem] leading-[1.7] text-[#D8E0D4]">
              {slots.subcopy}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              {slots.primaryCta && (
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full border-0 bg-[var(--school-accent)] px-7 text-sm font-semibold text-[var(--school-paper)] shadow-none transition-[background-color,transform] hover:bg-[var(--primary-light)] active:scale-[0.98]"
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
                  className="border-b border-[var(--school-paper)]/50 pb-0.5 text-sm font-semibold text-[var(--school-paper)] transition-colors hover:border-[var(--school-accent)] hover:text-[var(--school-accent)]"
                >
                  {slots.secondaryCta.label} →
                </Link>
              )}
            </div>
          </div>

          <div
            className={cn(
              'relative mx-auto w-full max-w-[22rem] lg:mx-0 lg:justify-self-end',
              ready ? '' : 'opacity-0',
            )}
          >
            <div className="gc-label-card relative rounded-sm px-5 pb-6 pt-7 sm:px-6">
              <span className="gc-pin absolute left-5 top-3" aria-hidden />
              <span className="gc-pin absolute right-5 top-3" aria-hidden />
              <p className="gc-label mb-3 text-center text-[var(--gc-clay,#C17A4A)]">
                Herbarium · Specimen
              </p>
              <div className="gc-arch mx-auto aspect-[4/5] max-w-[11.5rem] overflow-hidden bg-[var(--school-ink)]/5">
                <img
                  src={img}
                  alt=""
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                />
              </div>
              <h3 className="mt-5 text-center font-display text-[1.45rem] leading-tight text-[var(--school-ink)]">
                {runtime.schoolName}
              </h3>
              {firstStat ? (
                <p className="mt-2 text-center">
                  <span className="font-display text-3xl font-semibold text-primary">
                    {firstStat.value}
                  </span>
                  <span className="mt-1 block text-[0.85rem] text-[var(--school-ink)]/65">
                    {firstStat.label}
                  </span>
                </p>
              ) : (
                <p className="gc-italic mt-2 text-center text-[1.05rem] text-[var(--school-ink)]/70">
                  Cultivated minds, open doors
                </p>
              )}
              {slots.primaryCta && (
                <Link
                  href={slots.primaryCta.href}
                  className="mt-5 block w-full rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-[var(--school-paper)] transition-colors hover:bg-[var(--primary-dark)]"
                >
                  {slots.primaryCta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'pane') {
    const stats = getSection<{ items?: HomepageStatItem[] }>(config, 'stats')
    const firstStat = stats?.slots.items?.[0]
    const headline = slots.headline || runtime.schoolName
    const parts = headline.trim().split(/\s+/)
    const accentWord =
      parts.length > 1 ? parts.slice(-2).join(' ') : parts[parts.length - 1]
    const lead =
      parts.length > 2
        ? parts.slice(0, -2).join(' ')
        : parts.length > 1
          ? parts.slice(0, -1).join(' ')
          : ''

    return (
      <section className="relative overflow-hidden pb-24 pt-16 sm:pb-28 sm:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-14 pl-12 pr-4 sm:gap-16 sm:pl-16 sm:pr-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pl-[4.75rem] lg:pr-8">
          <div
            className={cn(
              'school-hero-copy max-w-xl',
              ready ? '' : 'opacity-0',
            )}
          >
            {slots.eyebrow && (
              <p className="ss-tag mb-5">{slots.eyebrow}</p>
            )}
            <h1 className="ss-italic font-display text-[clamp(2.5rem,4.6vw,4.2rem)] leading-[1.08] text-[var(--ss-moss-3,#1F3226)]">
              {lead ? (
                <>
                  {lead}{' '}
                  <span className="not-italic text-[var(--ss-terra,#C1652E)]">
                    {accentWord}
                  </span>
                </>
              ) : (
                headline
              )}
            </h1>
            <p className="mt-6 max-w-[460px] text-[1.1rem] leading-[1.7] text-[var(--ss-soil,#4A3728)]">
              {slots.subcopy}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              {slots.primaryCta && (
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-full border-[1.5px] border-[var(--ss-terra,#C1652E)] bg-[var(--ss-terra,#C1652E)] px-6 text-[13.5px] font-bold text-white shadow-none hover:bg-[#A6541F]"
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
                  className="border-b-2 border-[var(--ss-terra,#C1652E)] pb-0.5 text-sm font-bold text-[var(--ss-moss-3,#1F3226)]"
                >
                  {slots.secondaryCta.label} ↓
                </Link>
              )}
            </div>
          </div>

          <div
            className={cn(
              'relative mx-auto w-full max-w-md lg:mx-0',
              ready ? '' : 'opacity-0',
            )}
          >
            <div className="ss-pane-back" aria-hidden />
            <div className="ss-pane relative px-7 pb-7 pt-9 sm:px-8">
              <span className="ss-mono mb-2 block text-[11px] uppercase tracking-[0.1em] text-[var(--ss-moss-2,#3E6247)]">
                Est. · Campus
              </span>
              <h3 className="font-display text-[1.5rem] text-[var(--ss-moss-3,#1F3226)]">
                {runtime.schoolName}, in numbers
              </h3>
              {img ? (
                <div className="mt-4 aspect-[5/3] overflow-hidden rounded-sm border border-[var(--ss-moss-3,#1F3226)]/15">
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                    fetchPriority="high"
                  />
                </div>
              ) : null}
              {firstStat ? (
                <>
                  <p className="ss-mono mt-5 text-[3.2rem] font-bold leading-none text-[var(--ss-terra,#C1652E)]">
                    {firstStat.value}
                  </p>
                  <p className="mt-2 text-sm text-[var(--ss-soil,#4A3728)]">
                    {firstStat.label}
                    {firstStat.hint ? ` · ${firstStat.hint}` : ''}
                  </p>
                </>
              ) : (
                <p className="ss-italic mt-5 text-[1.15rem] text-[var(--ss-soil,#4A3728)]">
                  Every learner is still growing.
                </p>
              )}
              {slots.primaryCta && (
                <Link
                  href={slots.primaryCta.href}
                  className="mt-6 block rounded-full bg-primary px-4 py-3.5 text-center text-[13.5px] font-bold text-[var(--ss-sage,#EEF0E2)] transition-colors hover:bg-[var(--ss-moss-2,#3E6247)]"
                >
                  {slots.primaryCta.label}
                </Link>
              )}
              {slots.secondaryCta && (
                <Link
                  href={slots.secondaryCta.href}
                  className="mt-3 block text-center text-[13px] font-bold text-[var(--ss-moss-2,#3E6247)]"
                >
                  {slots.secondaryCta.label} →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'label') {
    const stats = getSection<{ items?: HomepageStatItem[] }>(config, 'stats')
    const firstStat = stats?.slots.items?.[0]
    const headline = slots.headline || runtime.schoolName
    const parts = headline.trim().split(/\s+/)
    const accentWord =
      parts.length > 1 ? parts.slice(-2).join(' ') : parts[parts.length - 1]
    const lead =
      parts.length > 2
        ? parts.slice(0, -2).join(' ')
        : parts.length > 1
          ? parts.slice(0, -1).join(' ')
          : ''
    const overlay = Math.min(
      0.85,
      Math.max(0.35, Number(slots.overlayStrength ?? 0.55)),
    )

    return (
      <section className="relative min-h-[min(100svh,900px)] overflow-hidden bg-[var(--school-ink)]">
        <div className="absolute inset-0">
          <img
            src={img}
            alt=""
            aria-hidden
            fetchPriority="high"
            className={cn(
              'school-hero-media h-full w-full scale-105 object-cover object-[52%_28%]',
              ready ? '' : 'opacity-0',
            )}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(112deg, rgba(27,21,18,${0.94 * overlay + 0.06}) 0%, rgba(74,22,32,${0.78 * overlay}) 38%, rgba(27,21,18,${0.42 * overlay}) 72%, rgba(27,21,18,0.22) 100%)`,
            }}
          />
          <div
            className="hb-staff pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-soft-light"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--school-ink)]/85 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-[calc(var(--school-nav-h)+3rem)] sm:gap-14 sm:px-6 sm:pb-24 sm:pt-[calc(var(--school-nav-h)+4rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
          <div
            className={cn(
              'school-hero-copy max-w-xl',
              ready ? '' : 'opacity-0',
            )}
          >
            <h1 className="hb-italic font-display text-[clamp(2.6rem,5vw,4.35rem)] leading-[1.04] tracking-[-0.02em] text-[var(--hb-cream,#F4ECD8)]">
              {lead ? (
                <>
                  {lead}{' '}
                  <span className="not-italic text-[var(--hb-gold,#C9A227)]">
                    {accentWord}
                  </span>
                </>
              ) : (
                headline
              )}
            </h1>
            <p className="mt-6 max-w-[38ch] text-[1.08rem] leading-[1.7] text-[#E8DCC6]">
              {slots.subcopy}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              {slots.primaryCta && (
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-[3px] border-[1.5px] border-primary bg-primary px-7 text-[13.5px] font-bold text-[var(--hb-cream,#F4ECD8)] shadow-none transition-[background-color,transform] hover:bg-[var(--primary-dark)] active:scale-[0.98]"
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
                  className="border-b-2 border-[var(--hb-gold,#C9A227)]/80 pb-0.5 text-sm font-bold text-[var(--hb-cream,#F4ECD8)] transition-colors hover:border-[var(--hb-gold,#C9A227)] hover:text-[var(--hb-gold,#C9A227)]"
                >
                  {slots.secondaryCta.label} ↓
                </Link>
              )}
            </div>
            {slots.eyebrow && (
              <p className="hb-mono mt-10 text-[11px] uppercase tracking-[0.14em] text-[var(--hb-gold,#C9A227)]/90">
                {slots.eyebrow}
              </p>
            )}
          </div>

          <div
            className={cn(
              'hb-label-settle relative mx-auto flex w-full max-w-[22rem] flex-col items-center lg:mx-0 lg:justify-self-end',
              ready ? '' : 'opacity-0',
            )}
          >
            <div className="hb-label-disc">
              <img
                src={img}
                alt=""
                aria-hidden
                className="hb-label-photo absolute inset-[7%] rounded-full object-cover"
              />
              <div
                className="hb-label-grooves pointer-events-none absolute inset-[7%] rounded-full"
                aria-hidden
              />
              <span
                className="absolute left-1/2 top-[5%] z-20 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-[var(--school-ink)] bg-[var(--hb-cream,#F4ECD8)] shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
                aria-hidden
              />
              <div className="hb-label-center relative z-10">
                {firstStat ? (
                  <>
                    <p className="font-display text-[clamp(1.9rem,4vw,2.7rem)] font-bold leading-none tracking-tight">
                      {firstStat.value}
                    </p>
                    <p className="mt-2 max-w-[14ch] text-[11px] leading-snug text-[#E9D9C6]">
                      {firstStat.label}
                    </p>
                  </>
                ) : (
                  <p className="hb-italic text-[1.15rem] leading-snug">
                    {runtime.schoolName}
                  </p>
                )}
                {slots.primaryCta && (
                  <Link
                    href={slots.primaryCta.href}
                    className="mt-4 inline-block rounded-[3px] border border-[var(--hb-gold,#C9A227)]/50 bg-[var(--school-ink)]/35 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-[var(--hb-cream,#F4ECD8)] transition-colors hover:bg-[var(--school-ink)]/55"
                  >
                    {slots.primaryCta.label}
                  </Link>
                )}
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

  if (variant === 'folio') {
    const headline = slots.headline || runtime.schoolName
    const headlineParts = headline.trim().split(/\s+/)
    const accentWord =
      headlineParts.length > 1 ? headlineParts[headlineParts.length - 1] : null
    const headlineLead =
      accentWord && headlineParts.length > 1
        ? headlineParts.slice(0, -1).join(' ')
        : headline
    return (
      <section className="relative overflow-hidden pt-[var(--school-nav-h)]">
        {/* Masthead rule */}
        <div className="border-b-2 border-[var(--fo-ink)] bg-[var(--fo-cream)]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
            <span className="fo-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--fo-ink)]/70">
              The {runtime.schoolName} review
            </span>
            <span className="fo-mono hidden text-[9.5px] uppercase tracking-[0.2em] text-[var(--fo-vermilion)] sm:block">
              Vol. {new Date().getFullYear()} · Est. edition
            </span>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-8">
          <div
            className={cn(
              'school-hero-copy max-w-xl',
              ready ? '' : 'opacity-0',
            )}
          >
            {slots.eyebrow && (
              <p className="fo-mono mb-4 text-[11px] uppercase tracking-[0.24em] text-[var(--fo-vermilion)]">
                {slots.eyebrow}
              </p>
            )}
            <h1 className="font-display text-[clamp(2.9rem,6vw,5rem)] leading-[0.98] text-[var(--fo-ink)]">
              {headlineLead}
              {accentWord ? (
                <>
                  {' '}
                  <em className="fo-italic text-[var(--fo-vermilion)]">
                    {accentWord}
                  </em>
                </>
              ) : null}
            </h1>
            <div className="mt-6 flex items-center gap-4">
              <span className="h-px w-16 bg-[var(--fo-vermilion)]" />
              <span className="fo-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--fo-ink-soft)]">
                A campus in print
              </span>
            </div>
            <p className="mt-6 max-w-[46ch] text-[1.06rem] leading-[1.75] text-[var(--fo-ink-soft)]">
              {slots.subcopy}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <HeroButtons slots={slots} tone="folio" />
            </div>
          </div>

          {/* Framed feature image — always rendered */}
          <div
            className={cn(
              'relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end',
              ready ? '' : 'opacity-0',
            )}
          >
            <div className="fo-crop absolute -inset-4" aria-hidden />
            <figure className="fo-frame relative bg-white">
              <img
                src={img}
                alt=""
                fetchPriority="high"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="flex items-center justify-between gap-3 border-t-[3px] border-[var(--fo-ink)] px-4 py-3">
                <span className="fo-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--fo-ink-soft)]">
                  Feature · {runtime.schoolName}
                </span>
                <span className="font-display text-lg italic leading-none text-[var(--fo-vermilion)]">
                  № 01
                </span>
              </figcaption>
            </figure>
            <span className="absolute -left-4 -top-4 rotate-[-7deg] bg-[var(--fo-vermilion)] px-3 py-1.5 fo-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-white shadow-[4px_4px_0_var(--fo-ink)]">
              Cover story
            </span>
          </div>
        </div>

        <div className="border-t-2 border-[var(--fo-ink)]" aria-hidden />
      </section>
    )
  }

  if (variant === 'marquee') {
    const stats = getSection<{ items?: HomepageStatItem[] }>(config, 'stats')
    const firstStat = stats?.slots.items?.[0]
    const headline = slots.headline || runtime.schoolName
    const parts = headline.trim().split(/\s+/)
    const accentWord =
      parts.length > 1 ? parts.slice(-2).join(' ') : parts[parts.length - 1]
    const lead =
      parts.length > 2
        ? parts.slice(0, -2).join(' ')
        : parts.length > 1
          ? parts.slice(0, -1).join(' ')
          : ''
    return (
      <section className="relative min-h-[min(100svh,960px)] overflow-hidden bg-[var(--nl-ink)] pt-[var(--school-nav-h)]">
        {/* Night sky: stars, beams, glow orbs */}
        <div className="nl-stars pointer-events-none absolute inset-0" aria-hidden />
        <div className="nl-beams pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[var(--nl-neon)]/14 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-0 h-[460px] w-[460px] rounded-full bg-[var(--nl-gold)]/10 blur-[130px]"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--nl-ink)] to-transparent" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20 lg:px-8">
          <div
            className={cn(
              'school-hero-copy max-w-xl',
              ready ? '' : 'opacity-0',
            )}
          >
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[var(--nl-neon)]/40 bg-[var(--nl-neon)]/10 px-3.5 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--nl-neon)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--nl-neon)]" />
              </span>
              <span className="nl-mono text-[10px] uppercase tracking-[0.26em] text-[var(--nl-neon)]">
                {slots.eyebrow || 'Now showing'}
              </span>
            </div>
            <h1 className="font-display text-[clamp(2.4rem,5.4vw,4.4rem)] font-semibold leading-[1.06] text-white">
              {lead ? (
                <>
                  {lead} <span className="nl-glow">{accentWord}</span>
                </>
              ) : (
                headline
              )}
            </h1>
            <p className="mt-6 max-w-[40ch] text-[1.05rem] leading-[1.75] text-[#AEBFCC]">
              {slots.subcopy}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              {slots.primaryCta && (
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-[var(--nl-neon)] px-8 text-sm font-bold text-[var(--nl-ink)] shadow-[0_0_24px_rgba(79,227,201,0.4)] hover:bg-white"
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
                  className="border-b border-white/30 pb-0.5 text-sm font-semibold text-white/80 transition-colors hover:border-[var(--nl-neon)] hover:text-[var(--nl-neon)]"
                >
                  {slots.secondaryCta.label}
                </Link>
              )}
            </div>
            <div className="nl-mono mt-10 flex flex-wrap items-center gap-3 text-[9.5px] uppercase tracking-[0.22em] text-white/40">
              <span>{runtime.schoolName}</span>
              <span className="h-px w-10 bg-white/20" aria-hidden />
              <span>Est. {new Date().getFullYear()}</span>
              {firstStat && (
                <>
                  <span className="h-px w-10 bg-white/20" aria-hidden />
                  <span className="text-[var(--nl-gold)]">
                    {firstStat.value} {firstStat.label}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Glowing framed still — always rendered */}
          <div
            className={cn(
              'relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end',
              ready ? '' : 'opacity-0',
            )}
          >
            <div className="nl-frame relative overflow-hidden rounded-2xl">
              <img
                src={img}
                alt=""
                fetchPriority="high"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--nl-ink)]/85 via-transparent to-transparent" />
              <div className="nl-sprockets absolute bottom-0 right-0 top-0 w-6 bg-[var(--nl-ink-2)]" aria-hidden />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 pr-8">
                <div>
                  <p className="nl-mono text-[9px] uppercase tracking-[0.26em] text-[var(--nl-gold)]">
                    Featured · Night one
                  </p>
                  <p className="mt-1 font-display text-xl leading-tight text-white">
                    {runtime.schoolName}
                  </p>
                </div>
                {firstStat && (
                  <p className="nl-glow font-display text-3xl font-semibold leading-none">
                    {firstStat.value}
                  </p>
                )}
              </div>
            </div>
            <span className="nl-sign absolute -right-3 -top-5 rotate-[5deg] rounded-md bg-[var(--nl-gold)] px-3 py-1.5 nl-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-[var(--nl-ink)] shadow-[0_0_24px_rgba(255,200,87,0.45)]">
              Tonight
            </span>
          </div>
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
  tone?: 'dark' | 'notebook' | 'folio'
}) {
  const notebook = tone === 'notebook'
  const folio = tone === 'folio'
  return (
    <>
      {slots.primaryCta && (
        <Button
          asChild
          size="lg"
          className={cn(
            'h-12 px-8 text-base font-semibold shadow-none',
            folio
              ? 'rounded-none bg-[var(--fo-ink)] text-[var(--fo-cream)] hover:bg-[var(--fo-vermilion)]'
              : notebook
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
      {slots.secondaryCta &&
        (notebook ? (
          <Link
            href={slots.secondaryCta.href}
            className="border-b-2 border-primary pb-0.5 text-sm font-semibold text-[var(--school-ink)]"
          >
            {slots.secondaryCta.label}
          </Link>
        ) : folio ? (
          <Link
            href={slots.secondaryCta.href}
            className="border-b-2 border-[var(--fo-vermilion)] pb-0.5 text-sm font-semibold text-[var(--fo-ink)] transition-colors hover:text-[var(--fo-vermilion)]"
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
        ))}
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

  if (variant === 'planters') {
    return (
      <section className="bg-[var(--gc-linen-2,#EAE3D4)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="gc-label text-[var(--gc-clay,#C17A4A)]">
              Grown this season
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.85rem,3.5vw,2.75rem)] text-[var(--school-ink)]">
              From the courtyard beds.
            </h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-10">
            {items.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 70}>
                <div className="flex flex-col items-center text-center">
                  <div className="gc-planter flex min-h-[7.5rem] w-full max-w-[9.5rem] flex-col items-center justify-center px-3 pb-5 pt-4 text-[var(--school-paper)]">
                    <p className="font-display text-[clamp(1.85rem,3vw,2.4rem)] font-semibold leading-none">
                      {stat.value}
                    </p>
                  </div>
                  <p className="mt-4 max-w-[12ch] text-[0.9rem] font-medium leading-snug text-[var(--school-ink)]">
                    {stat.label}
                  </p>
                  {stat.hint && (
                    <p className="gc-italic mt-1 text-[0.85rem] text-[var(--school-ink)]/55">
                      {stat.hint}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'harvest') {
    return (
      <section className="bg-[var(--ss-moss-3,#1F3226)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl pl-12 pr-4 sm:pl-16 sm:pr-6 lg:pl-[4.75rem] lg:pr-8">
          <Reveal>
            <p className="ss-tag text-[var(--ss-gold,#E3A73F)]">
              The harvest report
            </p>
            <h2 className="ss-italic mt-3 font-display text-[clamp(1.85rem,3.5vw,2.4rem)] text-[var(--ss-sage,#EEF0E2)]">
              What last season yielded.
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-6">
            {items.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 70}>
                <div className="ss-crate px-5 py-6 text-center">
                  <p className="ss-mono text-[2.3rem] font-bold leading-none text-[var(--ss-gold,#E3A73F)]">
                    {stat.value}
                  </p>
                  <p className="ss-mono mt-2 text-[10px] uppercase tracking-[0.1em] text-[#E7E0C6]">
                    {stat.label}
                  </p>
                  {stat.hint && (
                    <p className="mt-1 text-[0.78rem] text-[#9FB397]">
                      {stat.hint}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'score') {
    const markings = ['Allegro', '12 / 1', 'Con brio', 'Da capo']
    return (
      <section className="bg-[var(--school-ink)] py-20 text-[var(--hb-cream,#F4ECD8)] sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="hb-tag text-[var(--hb-gold,#C9A227)]">The score</p>
            <h2 className="hb-italic mt-3 font-display text-[clamp(1.85rem,3.5vw,2.4rem)]">
              Marked up, term by term.
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-6">
            {items.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 70}>
                <div className="hb-score-card px-5 py-6 text-center">
                  <p className="hb-italic mb-2.5 font-display text-[1.7rem] text-[var(--hb-gold,#C9A227)]">
                    {markings[i % markings.length]}
                  </p>
                  <p className="hb-mono text-[1.9rem] font-bold leading-none">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[0.82rem] leading-snug text-[#C9BCA9]">
                    {stat.label}
                    {stat.hint ? ` · ${stat.hint}` : ''}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'ledger') {
    return (
      <section className="border-y-2 border-[var(--fo-ink)] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
          {items.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 60}>
              <div
                className={cn(
                  'flex h-full flex-col justify-between gap-3 px-6 py-9 sm:px-8',
                  i > 0 && 'border-l border-[var(--fo-ink)]/15',
                )}
              >
                <p className="font-display text-[2.9rem] leading-none tracking-tight text-[var(--fo-ink)]">
                  {stat.value}
                </p>
                <div>
                  <p className="fo-mono text-[10px] uppercase tracking-[0.2em] text-[var(--fo-vermilion)]">
                    {stat.label}
                  </p>
                  {stat.hint && (
                    <p className="mt-1.5 text-xs text-[var(--fo-ink-soft)]/70">
                      {stat.hint}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    )
  }

  if (variant === 'starlight') {
    return (
      <section className="border-y border-white/10 bg-[var(--nl-ink-2)] py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 sm:grid-cols-4">
          {items.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 60}>
              <div className="relative px-6 text-center">
                {i > 0 && (
                  <span
                    className="absolute -left-3 top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 rotate-45 bg-[var(--nl-neon)] sm:block"
                    aria-hidden
                  />
                )}
                <p className="nl-glow font-display text-[2.6rem] font-semibold leading-none">
                  {stat.value}
                </p>
                <p className="nl-mono mt-2.5 text-[10px] uppercase tracking-[0.24em] text-[var(--nl-neon)]">
                  {stat.label}
                </p>
                {stat.hint && (
                  <p className="mt-1.5 text-xs text-[var(--nl-muted)]">{stat.hint}</p>
                )}
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

  if (variant === 'specimens') {
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 max-w-xl">
              {slots.eyebrow && (
                <p className="gc-label mb-2 text-[var(--gc-clay,#C17A4A)]">
                  {slots.eyebrow}
                </p>
              )}
              <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] text-[var(--school-ink)]">
                {slots.headline}
              </h2>
              <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-[var(--school-ink)]/65">
                {slots.subcopy}
              </p>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <Reveal key={item.title} delay={index * 70}>
                <div className="gc-specimen group relative flex h-full flex-col p-5 sm:p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="gc-label text-[var(--school-ink)]/45">
                      GC–{String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="mt-0.5 inline-block h-2.5 w-2.5 rounded-full bg-primary"
                      aria-hidden
                    />
                  </div>
                  <h3 className="font-display text-[1.35rem] leading-snug text-[var(--school-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-[var(--school-ink)]/65">
                    {item.body}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-5 inline-flex items-center text-sm font-semibold text-[var(--gc-clay,#C17A4A)] transition-colors hover:text-primary"
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

  if (variant === 'seasons') {
    const plantTags = [
      'MATHS',
      'SCIENCES',
      'LANGUAGES',
      'ARTS',
      'TECH',
      'SPORT',
    ]
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl pl-12 pr-4 sm:pl-16 sm:pr-6 lg:pl-[4.75rem] lg:pr-8">
          <Reveal>
            <div className="mb-12 max-w-xl">
              {slots.eyebrow && (
                <p className="ss-tag mb-2">{slots.eyebrow}</p>
              )}
              <h2 className="ss-italic font-display text-[clamp(1.85rem,3.5vw,2.4rem)] text-[var(--ss-moss-3,#1F3226)]">
                {slots.headline}
              </h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-[var(--ss-soil,#4A3728)]">
                {slots.subcopy}
              </p>
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <Reveal key={item.title} delay={index * 70}>
                <div className="ss-season group flex h-full flex-col px-6 pb-7 pt-7">
                  <span className="ss-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--ss-moss-2,#3E6247)]">
                    Season {index + 1}
                  </span>
                  <h3 className="mt-2.5 font-display text-[1.5rem] text-[var(--ss-moss-3,#1F3226)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[0.93rem] leading-relaxed text-[var(--ss-soil,#4A3728)]">
                    {item.body}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-5 inline-flex items-center text-sm font-bold text-[var(--ss-terra,#C1652E)]"
                  >
                    {item.ctaLabel}
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {plantTags.map((tag) => (
              <div key={tag} className="flex w-[5.5rem] flex-col items-center">
                <div className="h-3.5 w-0.5 bg-[var(--ss-soil,#4A3728)]" />
                <div className="ss-plant-tag w-full">{tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'movements') {
    const romans = ['I.', 'II.', 'III.', 'IV.', 'V.', 'VI.']
    const stages = [
      'Exposition',
      'Development',
      'Recapitulation',
      'Coda',
      'Encore',
      'Finale',
    ]
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 max-w-xl">
              {slots.eyebrow && (
                <p className="hb-tag mb-2">{slots.eyebrow}</p>
              )}
              <h2 className="hb-italic font-display text-[clamp(1.85rem,3.5vw,2.4rem)] text-[var(--school-ink)]">
                {slots.headline}
              </h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-[var(--hb-charcoal,#332720)]">
                {slots.subcopy}
              </p>
            </div>
          </Reveal>
          <div className="space-y-5">
            {items.map((item, index) => (
              <Reveal key={item.title} delay={index * 70}>
                <div className="hb-movement grid gap-5 px-6 py-7 sm:grid-cols-[150px_1fr] sm:gap-7 sm:px-8">
                  <div>
                    <span className="hb-italic font-display text-[2.6rem] leading-none text-[var(--hb-gold-dim,#8E7420)]">
                      {romans[index % romans.length]}
                    </span>
                    <span className="hb-mono mt-1.5 block text-[10.5px] uppercase tracking-[0.1em] text-primary">
                      {stages[index % stages.length]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-[1.5rem] text-[var(--school-ink)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.94rem] leading-relaxed text-[var(--hb-charcoal,#332720)]">
                      {item.body}
                    </p>
                    <Link
                      href={item.href}
                      className="mt-4 inline-flex items-center text-sm font-bold text-primary"
                    >
                      {item.ctaLabel}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
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

  if (variant === 'spread') {
    const folioNumbers = ['01', '02', '03']
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 grid gap-6 border-b-2 border-[var(--fo-ink)] pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-xl">
                {slots.eyebrow && (
                  <p className="fo-mono mb-3 text-[11px] uppercase tracking-[0.22em] text-[var(--fo-vermilion)]">
                    {slots.eyebrow}
                  </p>
                )}
                <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight text-[var(--fo-ink)]">
                  {slots.headline}
                </h2>
                <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-[var(--fo-ink-soft)]">
                  {slots.subcopy}
                </p>
              </div>
              <span className="fo-mono text-[9.5px] uppercase tracking-[0.2em] text-[var(--fo-ink-soft)]">
                The contents
              </span>
            </div>
          </Reveal>
          <div className="space-y-0">
            {items.map((item, index) => (
              <Reveal key={item.title} delay={index * 60}>
                <article className="group grid gap-4 border-b border-[var(--fo-ink)]/20 py-8 sm:grid-cols-[72px_1fr_auto] sm:gap-8 sm:py-10">
                  <span className="fo-mono text-sm font-bold text-[var(--fo-vermilion)]">
                    {folioNumbers[index % folioNumbers.length]}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-[1.7rem] leading-tight text-[var(--fo-ink)] transition-colors group-hover:text-[var(--fo-vermilion)]">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 max-w-2xl text-[0.98rem] leading-relaxed text-[var(--fo-ink-soft)]">
                      {item.body}
                    </p>
                  </div>
                  <Link
                    href={item.href}
                    className="fo-mono self-center text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--fo-vermilion)]"
                  >
                    {item.ctaLabel} →
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'premieres') {
    const showtimes = ['7:30 PM', '8:45 PM', '10:00 PM']
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                {slots.eyebrow && (
                  <p className="nl-mono mb-3 text-[10px] uppercase tracking-[0.26em] text-[var(--nl-neon)]">
                    {slots.eyebrow}
                  </p>
                )}
                <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.7rem)] leading-tight text-white">
                  {slots.headline}
                </h2>
                <p className="mt-4 text-[1rem] leading-relaxed text-[var(--nl-slate)]">
                  {slots.subcopy}
                </p>
              </div>
              <span className="nl-mono text-[9.5px] uppercase tracking-[0.22em] text-white/35">
                This season&apos;s premieres
              </span>
            </div>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {items.map((item, index) => (
              <Reveal key={item.title} delay={index * 70}>
                <article className="group relative h-full rounded-2xl border border-white/10 bg-[var(--nl-ink-2)] p-7 transition-colors hover:border-[var(--nl-neon)]/50">
                  <div className="flex items-start justify-between">
                    <SectionIcon name={item.icon} className="h-6 w-6 text-[var(--nl-neon)]" />
                    <span className="nl-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
                      {showtimes[index % showtimes.length]}
                    </span>
                  </div>
                  <h3 className="mt-7 font-display text-xl leading-tight text-white transition-colors group-hover:text-[var(--nl-neon)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--nl-slate)]">
                    {item.body}
                  </p>
                  <Link
                    href={item.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--nl-neon)]"
                  >
                    {item.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
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

  if (variant === 'greenhouse') {
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            {data.slots.eyebrow && (
              <p className="gc-label mb-2 text-[var(--gc-clay,#C17A4A)]">
                {data.slots.eyebrow}
              </p>
            )}
            <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] text-[var(--school-ink)]">
              {data.slots.headline}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {images.slice(0, 8).map((image, i) => (
              <Reveal key={image.url + i} delay={i * 60}>
                <figure className="gc-greenhouse-frame">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--school-ink)]/5">
                    <img
                      src={image.url}
                      alt={image.caption || ''}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <div
                      className="gc-panes pointer-events-none absolute inset-0 opacity-25"
                      aria-hidden
                    />
                  </div>
                  {image.caption && (
                    <figcaption className="mt-3 px-1">
                      <span className="gc-label text-[var(--school-ink)]/40">
                        Pane {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="gc-italic mt-1 text-[1.05rem] text-[var(--school-ink)]">
                        {image.caption}
                      </p>
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

  if (variant === 'almanac') {
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl pl-12 pr-4 sm:pl-16 sm:pr-6 lg:pl-[4.75rem] lg:pr-8">
          <Reveal>
            {data.slots.eyebrow && (
              <p className="ss-tag mb-2">{data.slots.eyebrow}</p>
            )}
            <h2 className="ss-italic font-display text-[clamp(1.85rem,3.5vw,2.4rem)] text-[var(--ss-moss-3,#1F3226)]">
              {data.slots.headline}
            </h2>
          </Reveal>
          <Reveal>
            <div className="ss-almanac mt-10">
              {images.slice(0, 8).map((image, i) => (
                <div
                  key={image.url + i}
                  className={cn(
                    'grid grid-cols-[88px_1fr] items-center gap-4 px-5 py-5 sm:grid-cols-[110px_1fr] sm:gap-5 sm:px-7',
                    i < images.length - 1 &&
                      'border-b border-[var(--ss-sage-2,#E3E7D3)]',
                  )}
                >
                  <span className="ss-mono text-sm font-bold text-[var(--ss-terra,#C1652E)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="hidden h-14 w-20 shrink-0 overflow-hidden rounded-sm sm:block">
                      <img
                        src={image.url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-display text-[1.05rem] text-[var(--ss-moss-3,#1F3226)]">
                        {image.caption || `Campus moment ${i + 1}`}
                      </h4>
                      <p className="mt-0.5 truncate text-[0.88rem] text-[var(--ss-soil,#4A3728)]">
                        From the planting calendar
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  if (variant === 'programme') {
    const venues = ['Main Hall', 'Pool Deck', 'Studio A', 'Whole Campus']
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            {data.slots.eyebrow && (
              <p className="hb-tag mb-2">{data.slots.eyebrow}</p>
            )}
            <h2 className="hb-italic font-display text-[clamp(1.85rem,3.5vw,2.4rem)] text-[var(--school-ink)]">
              {data.slots.headline}
            </h2>
          </Reveal>
          <Reveal>
            <div className="hb-programme mt-10">
              {images.slice(0, 8).map((image, i) => (
                <div
                  key={image.url + i}
                  className={cn(
                    'grid grid-cols-[88px_1fr] items-center gap-4 px-5 py-5 sm:grid-cols-[120px_1fr_110px] sm:gap-5 sm:px-7',
                    i < Math.min(images.length, 8) - 1 &&
                      'border-b border-[var(--hb-cream-2,#EBE0C4)]',
                  )}
                >
                  <span className="hb-mono text-sm font-bold text-primary">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h4 className="hb-italic font-display text-[1.05rem] text-[var(--school-ink)]">
                      {image.caption || `Programme item ${i + 1}`}
                    </h4>
                    <p className="mt-0.5 text-[0.86rem] text-[var(--hb-charcoal,#332720)]">
                      From this term&apos;s calendar
                    </p>
                  </div>
                  <span className="hb-mono hidden text-right text-[11px] text-[var(--hb-gold-dim,#8E7420)] sm:block">
                    {venues[i % venues.length]}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  if (variant === 'contact') {
    return (
      <section className="border-t-2 border-[var(--fo-ink)] bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-10 flex items-end justify-between gap-4 border-b-2 border-[var(--fo-ink)] pb-5">
              <div>
                {data.slots.eyebrow && (
                  <p className="fo-mono mb-2 text-[11px] uppercase tracking-[0.22em] text-[var(--fo-vermilion)]">
                    {data.slots.eyebrow}
                  </p>
                )}
                <h2 className="font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight text-[var(--fo-ink)]">
                  {data.slots.headline}
                </h2>
              </div>
              <span className="fo-mono hidden shrink-0 text-[9.5px] uppercase tracking-[0.2em] text-[var(--fo-ink-soft)] sm:block">
                Contact sheet · {String(images.length).padStart(2, '0')} frames
              </span>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-px bg-[var(--fo-ink)]/12 md:grid-cols-4">
            {images.slice(0, 8).map((image, i) => (
              <Reveal key={image.url + i} delay={i * 40}>
                <figure className="group relative bg-[var(--fo-cream)]">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.caption || ''}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <figcaption className="flex items-center justify-between gap-2 border-t border-[var(--fo-ink)]/15 px-3 py-2">
                    <span className="truncate text-[11px] text-[var(--fo-ink-soft)]">
                      {image.caption || `Frame ${String(i + 1).padStart(2, '0')}`}
                    </span>
                    <span className="fo-mono shrink-0 text-[9px] text-[var(--fo-vermilion)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (variant === 'reel') {
    return (
      <section className="overflow-hidden border-y border-white/10 bg-[var(--nl-ink)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                {data.slots.eyebrow && (
                  <p className="nl-mono mb-2 text-[10px] uppercase tracking-[0.26em] text-[var(--nl-neon)]">
                    {data.slots.eyebrow}
                  </p>
                )}
                <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.7rem)] leading-tight text-white">
                  {data.slots.headline}
                </h2>
              </div>
              <span className="nl-mono shrink-0 text-[9.5px] uppercase tracking-[0.22em] text-white/35">
                Reel · {String(images.length).padStart(2, '0')} stills
              </span>
            </div>
          </Reveal>
        </div>
        <div className="flex gap-5 overflow-x-auto px-4 pb-6 sm:px-[max(1.5rem,calc((100vw-80rem)/2+2rem))]">
          {images.map((image, i) => (
            <Reveal key={image.url + i} delay={i * 40}>
              <figure className="w-[240px] shrink-0 sm:w-[300px]">
                <div className="aspect-[3/4] overflow-hidden rounded-xl border border-white/10">
                  <img
                    src={image.url}
                    alt={image.caption || ''}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="mt-3 flex items-center justify-between gap-3">
                  <span className="truncate text-[0.85rem] text-[var(--nl-slate)]">
                    {image.caption || `Still ${String(i + 1).padStart(2, '0')}`}
                  </span>
                  <span className="nl-mono shrink-0 text-[9px] text-[var(--nl-neon)]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
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

  if (variant === 'bench') {
    return (
      <section className="bg-primary/10 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            {data.slots.eyebrow && (
              <p className="gc-label mb-2 text-[var(--gc-clay,#C17A4A)]">
                {data.slots.eyebrow}
              </p>
            )}
            <h2 className="font-display text-[clamp(1.85rem,3.5vw,2.75rem)] text-[var(--school-ink)]">
              {data.slots.headline}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {items.map((item, i) => (
              <Reveal key={item.name + i} delay={i * 70}>
                <blockquote className="gc-bench relative flex h-full flex-col rounded-2xl px-6 pb-7 pt-8">
                  <span
                    className="absolute left-6 top-0 h-1.5 w-12 rounded-b-full bg-[var(--school-accent)]"
                    aria-hidden
                  />
                  <p className="gc-italic flex-1 text-[1.15rem] leading-relaxed text-[var(--school-ink)]">
                    “{item.quote}”
                  </p>
                  <footer className="mt-6 flex items-center gap-3 border-t border-[var(--school-ink)]/10 pt-4">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="gc-arch flex h-10 w-9 items-center justify-center bg-primary font-display text-xs font-semibold text-[var(--school-paper)]">
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
                      <p className="text-[0.8rem] text-[var(--school-ink)]/55">
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

  if (variant === 'pressed') {
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl pl-12 pr-4 sm:pl-16 sm:pr-6 lg:pl-[4.75rem] lg:pr-8">
          <Reveal>
            {data.slots.eyebrow && (
              <p className="ss-tag mb-2">{data.slots.eyebrow}</p>
            )}
            <h2 className="ss-italic font-display text-[clamp(1.85rem,3.5vw,2.4rem)] text-[var(--ss-moss-3,#1F3226)]">
              {data.slots.headline}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {items.map((item, i) => (
              <Reveal key={item.name + i} delay={i * 70}>
                <blockquote className="ss-bloom relative flex h-full flex-col overflow-hidden px-6 pb-7 pt-7">
                  <span
                    className="pointer-events-none absolute -right-1 top-2 h-16 w-16 rounded-full border border-[var(--ss-terra,#C1652E)]/25 opacity-40"
                    aria-hidden
                  />
                  <p className="ss-mono text-[0.95rem] font-bold text-[var(--ss-terra,#C1652E)]">
                    → {item.role}
                  </p>
                  <p className="mt-3 flex-1 text-[0.93rem] leading-relaxed text-[var(--ss-soil,#4A3728)]">
                    {item.quote}
                  </p>
                  <footer className="mt-5">
                    <p className="ss-italic font-display text-[1.05rem] text-[var(--ss-moss-3,#1F3226)]">
                      {item.name}
                    </p>
                    <p className="ss-mono mt-0.5 text-[0.78rem] text-[var(--ss-moss-2,#3E6247)]">
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

  if (variant === 'liner') {
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            {data.slots.eyebrow && (
              <p className="hb-tag mb-2">{data.slots.eyebrow}</p>
            )}
            <h2 className="hb-italic font-display text-[clamp(1.85rem,3.5vw,2.4rem)] text-[var(--school-ink)]">
              {data.slots.headline}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {items.map((item, i) => (
              <Reveal key={item.name + i} delay={i * 70}>
                <blockquote className="hb-liner relative flex h-full flex-col px-6 pb-7 pt-7">
                  <p className="hb-mono text-[0.9rem] font-bold text-[var(--hb-gold,#C9A227)]">
                    → {item.role}
                  </p>
                  <p className="mt-3 flex-1 text-[0.94rem] leading-relaxed text-[#F1E6D5]">
                    {item.quote}
                  </p>
                  <footer className="mt-5">
                    <p className="hb-italic font-display text-[1.05rem]">
                      {item.name}
                    </p>
                    <p className="hb-hand mt-0.5 text-base text-[#E3C98E]">
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

  if (variant === 'pullquote') {
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 border-l-[3px] border-[var(--fo-vermilion)] pl-5">
              {data.slots.eyebrow && (
                <p className="fo-mono text-[11px] uppercase tracking-[0.22em] text-[var(--fo-vermilion)]">
                  {data.slots.eyebrow}
                </p>
              )}
              <h2 className="mt-1 font-display text-[clamp(1.9rem,3.6vw,2.9rem)] leading-tight text-[var(--fo-ink)]">
                {data.slots.headline}
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Reveal key={item.name + i} delay={i * 60}>
                <blockquote className="flex h-full flex-col">
                  <span className="font-display text-6xl leading-[0.6] text-[var(--fo-vermilion)]">
                    “
                  </span>
                  <p className="mt-3 flex-1 font-display text-[1.35rem] leading-snug text-[var(--fo-ink)]">
                    {item.quote}
                  </p>
                  <footer className="mt-6 border-t-2 border-[var(--fo-ink)] pt-3">
                    <p className="fo-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--fo-ink)]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-[0.85rem] text-[var(--fo-ink-soft)]">
                      {item.role}
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

  if (variant === 'reviews') {
    return (
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              {data.slots.eyebrow && (
                <p className="nl-mono text-[10px] uppercase tracking-[0.28em] text-[var(--nl-neon)]">
                  {data.slots.eyebrow}
                </p>
              )}
              <h2 className="mt-2 font-display text-[clamp(1.85rem,3.5vw,2.7rem)] leading-tight text-white">
                {data.slots.headline}
              </h2>
              <div className="mt-4 flex items-center justify-center gap-1 text-[var(--nl-gold)]">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="h-4 w-4 fill-current" />
                ))}
                <span className="nl-mono ml-2 text-[9.5px] uppercase tracking-[0.2em] text-white/40">
                  Parent reviews
                </span>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {items.map((item, i) => (
              <Reveal key={item.name + i} delay={i * 60}>
                <blockquote className="flex h-full flex-col rounded-2xl border border-white/10 bg-[var(--nl-ink-2)] p-7">
                  <div className="flex gap-1 text-[var(--nl-gold)]">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 flex-1 text-[1.02rem] leading-relaxed text-[#D6E1E8]">
                    “{item.quote}”
                  </p>
                  <footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--nl-neon)]/15 font-display text-sm font-semibold text-[var(--nl-neon)]">
                      {(item.name || '?').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-[var(--nl-muted)]">
                        {item.role}
                      </p>
                    </div>
                    <span className="nl-mono ml-auto shrink-0 rounded-full border border-[var(--nl-gold)]/40 px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-[var(--nl-gold)]">
                      Pick
                    </span>
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

  if (variant === 'gate') {
    return (
      <section className="sticky bottom-0 z-40 border-t border-[var(--school-ink)]/12 bg-[var(--gc-linen,#F4EFE4)]/95 py-3.5 shadow-[0_-10px_32px_rgba(36,48,40,0.1)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight text-[var(--school-ink)] sm:text-xl">
              {slots.headline}
            </p>
            <p className="mt-0.5 max-w-xl text-sm leading-snug text-[var(--school-ink)]/60">
              {slots.body?.replace(/\{schoolName\}/g, runtime.schoolName) ||
                slots.body}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {slots.primaryCta && (
              <Button
                asChild
                className="h-11 rounded-full border-0 bg-primary px-6 text-sm font-semibold text-[var(--school-paper)] shadow-none hover:bg-[var(--primary-dark)]"
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
                className="h-11 rounded-full border border-[var(--school-ink)]/20 bg-transparent px-5 text-sm font-semibold text-[var(--school-ink)] shadow-none hover:border-[var(--school-accent)] hover:bg-[var(--school-accent)] hover:text-[var(--school-paper)]"
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

  if (variant === 'bench') {
    return (
      <section className="sticky bottom-0 z-40 border-t-2 border-[var(--ss-gold,#E3A73F)] bg-[var(--ss-soil,#4A3728)] py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 pl-12 pr-4 sm:flex-row sm:items-center sm:pl-16 sm:pr-6 lg:pl-[4.75rem] lg:pr-8">
          <div className="min-w-0">
            <p className="ss-italic font-display text-[1.05rem] text-white sm:text-lg">
              {slots.headline}
            </p>
            <p className="mt-0.5 max-w-xl text-sm text-[#E7DFCB]/60">
              {slots.body?.replace(/\{schoolName\}/g, runtime.schoolName) ||
                slots.body}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {slots.primaryCta && (
              <Button
                asChild
                className="h-11 rounded-full border-[1.5px] border-[var(--ss-terra,#C1652E)] bg-[var(--ss-terra,#C1652E)] px-6 text-[13.5px] font-bold text-white shadow-none hover:bg-[#A6541F]"
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
                className="h-11 rounded-full border border-[#E7DFCB]/35 bg-transparent px-5 text-[13.5px] font-bold text-[#E7DFCB] shadow-none hover:bg-[#E7DFCB] hover:text-[var(--ss-soil,#4A3728)]"
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

  if (variant === 'boxoffice') {
    return (
      <section className="sticky bottom-0 z-40 border-t-2 border-[var(--hb-gold,#C9A227)] bg-[var(--school-ink)] py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="hb-italic font-display text-[1.05rem] text-[var(--hb-cream,#F4ECD8)] sm:text-lg">
              {slots.headline}
            </p>
            <p className="mt-0.5 max-w-xl text-sm text-[#C9BCA9]">
              {slots.body?.replace(/\{schoolName\}/g, runtime.schoolName) ||
                slots.body}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {slots.primaryCta && (
              <Button
                asChild
                className="h-11 rounded-[3px] border-[1.5px] border-primary bg-primary px-6 text-[13.5px] font-bold text-[var(--hb-cream,#F4ECD8)] shadow-none hover:bg-[var(--primary-dark)]"
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
                className="h-11 rounded-[3px] border border-[var(--hb-gold,#C9A227)]/50 bg-transparent px-5 text-[13.5px] font-bold text-[var(--hb-cream,#F4ECD8)] shadow-none hover:bg-[var(--hb-gold,#C9A227)] hover:text-[var(--school-ink)]"
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

  if (variant === 'subscription') {
    return (
      <section className="border-t-2 border-[var(--fo-ink)] bg-[var(--fo-ink)] py-16 text-[var(--fo-cream)] sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative border-2 border-dashed border-[var(--fo-cream)]/40 px-6 py-12 text-center sm:px-12">
              <span className="fo-mono absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[var(--fo-ink)] px-3 text-[9.5px] uppercase tracking-[0.22em] text-[var(--fo-cream)]">
                Subscribe
              </span>
              <h2 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] leading-tight">
                {slots.headline}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[1rem] leading-relaxed text-[var(--fo-cream)]/70">
                {slots.body?.replace(/\{schoolName\}/g, runtime.schoolName) ||
                  slots.body}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {slots.primaryCta && (
                  <Button
                    asChild
                    className="h-12 rounded-none bg-[var(--fo-vermilion)] px-8 text-sm font-semibold text-white shadow-none hover:bg-white hover:text-[var(--fo-ink)]"
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
                    className="h-12 rounded-none border-[var(--fo-cream)]/40 px-8 text-sm font-semibold text-[var(--fo-cream)] shadow-none hover:bg-[var(--fo-cream)] hover:text-[var(--fo-ink)]"
                  >
                    <Link href={slots.secondaryCta.href}>
                      {slots.secondaryCta.label}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  if (variant === 'encore') {
    return (
      <section className="sticky bottom-0 z-40 border-t border-white/10 bg-[var(--nl-ink)]/92 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight text-white sm:text-xl">
              {slots.headline}
            </p>
            <p className="mt-0.5 max-w-xl text-sm text-[var(--nl-slate)]">
              {slots.body?.replace(/\{schoolName\}/g, runtime.schoolName) ||
                slots.body}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {slots.primaryCta && (
              <Button
                asChild
                className="h-11 rounded-full bg-[var(--nl-neon)] px-6 text-sm font-bold text-[var(--nl-ink)] shadow-[0_0_20px_rgba(79,227,201,0.35)] hover:bg-white"
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
                className="h-11 rounded-full border-white/25 px-5 text-sm font-semibold text-white shadow-none hover:border-[var(--nl-neon)] hover:text-[var(--nl-neon)]"
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

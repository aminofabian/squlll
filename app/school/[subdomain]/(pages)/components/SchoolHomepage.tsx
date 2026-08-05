'use client'

import { Button } from '../../../../../components/ui/button'
import {
  Users,
  GraduationCap,
  BookOpen,
  ArrowRight,
  MapPin,
  Heart,
  LogIn,
  Menu,
  X,
  PhoneCall,
  Mail,
  Building2,
  UserPlus,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { SchoolConfiguration } from '../../../../../lib/types/school-config'
import brandingJson from '../../../../../lib/data/tenant-branding.template.json'
import { SchoolHomepageFeeDownloads } from './SchoolHomepageFeeDownloads'

interface SchoolHomepageProps {
  config?: SchoolConfiguration
}

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ease-out will-change-transform motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
    >
      {children}
    </div>
  )
}

function isPlaceholderCopy(value?: string | null) {
  if (!value?.trim()) return true
  const lower = value.toLowerCase()
  return (
    lower.includes('optional short description') ||
    lower.includes('your school') ||
    lower.includes('tenant.example')
  )
}

export function SchoolHomepage({ config }: SchoolHomepageProps) {
  const params = useParams()
  const subdomain = params.subdomain as string
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [heroReady, setHeroReady] = useState(false)

  const branding = brandingJson as any

  const getSchoolNameFromSubdomain = (value: string) =>
    value
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

  const readCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()!.split(';').shift() || null
    return null
  }

  const initialName =
    (branding?.brand?.name as string) || getSchoolNameFromSubdomain(subdomain)
  const [resolvedSchoolName, setResolvedSchoolName] = useState<string>(initialName)

  useEffect(() => {
    if (!branding?.brand?.name) {
      const cookieName = readCookie('schoolName')
      if (cookieName && cookieName.trim().length > 0) {
        setResolvedSchoolName(cookieName)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setHeroReady(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const tagline = isPlaceholderCopy(branding?.brand?.tagline)
    ? 'Inspiring excellence every day'
    : ((branding?.brand?.tagline as string) || 'Inspiring excellence every day')

  const description = isPlaceholderCopy(branding?.brand?.description)
    ? 'A place where curious minds grow into confident learners — through rigorous academics, character, and community.'
    : (branding?.brand?.description as string)

  // Prefer tenant school theme, then SQUL product greens (globals / onboarding).
  const schoolTheme = config?.theme?.colors
  const primary = schoolTheme?.primary || '#246a59'
  const primaryDark = schoolTheme?.primaryDark || '#1a4c40'
  const primaryLight = schoolTheme?.primaryLight || '#2d8570'
  const themeVars: Record<string, string> = {
    '--primary': primary,
    '--primary-dark': primaryDark,
    '--primary-light': primaryLight,
    '--school-ink': '#0a1f1a',
    '--school-paper': '#f3f7f5',
    '--school-accent': '#a7f3d0',
  }

  const totalSubjects =
    config?.selectedLevels?.reduce((acc, level) => acc + level.subjects.length, 0) || 0
  const totalGrades =
    config?.selectedLevels?.reduce((acc, level) => acc + level.gradeLevels.length, 0) || 0

  const configuredHero = branding?.assets?.heroImage as string | undefined
  const normalizedHero = configuredHero
    ?.replace(/^\/public/, '')
    .trim()
  const heroImage =
    normalizedHero &&
    !normalizedHero.includes('hero.jpg') &&
    !normalizedHero.includes('example')
      ? normalizedHero
      : '/schooll.png'

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/programs', label: 'Programs' },
    { href: '/admissions', label: 'Admissions' },
    { href: '/contact', label: 'Contact' },
  ]

  const offerings = [
    {
      icon: BookOpen,
      title: 'Academic excellence',
      body: 'A rigorous pathway across core disciplines — designed to challenge, inspire, and prepare every learner.',
      href: '/academics',
      cta: 'Explore academics',
    },
    {
      icon: GraduationCap,
      title: 'Life beyond class',
      body: 'Sports, arts, clubs, and leadership — space for talent and character to grow outside the timetable.',
      href: '/activities',
      cta: 'View activities',
    },
    {
      icon: Heart,
      title: 'Student support',
      body: 'Guidance, tutoring, and care so every student has the academic and personal backing they need.',
      href: '/support',
      cta: 'Learn more',
    },
  ]

  const stats = [
    { value: '1,200+', label: 'Students' },
    { value: '98%', label: 'Success rate' },
    { value: totalSubjects > 0 ? `${totalSubjects}+` : '40+', label: 'Subjects' },
    { value: '25+', label: 'Years' },
  ]

  const initials = resolvedSchoolName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="school-home min-h-screen bg-[var(--school-paper)] text-[var(--school-ink)]"
      style={themeVars}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        .school-home { --school-nav-h: 4.5rem; }
        .school-home, .school-home * { border-radius: 0 !important; }
        @keyframes school-hero-rise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes school-hero-ken {
          from { transform: scale(1.06); }
          to { transform: scale(1); }
        }
        @keyframes school-line-draw {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .school-hero-copy {
          animation: school-hero-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .school-hero-copy-delay { animation-delay: 0.12s; }
        .school-hero-copy-delay-2 { animation-delay: 0.24s; }
        .school-hero-media { animation: school-hero-ken 8s ease-out both; }
        .school-accent-line {
          transform-origin: left;
          animation: school-line-draw 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
        }
        @media (prefers-reduced-motion: reduce) {
          .school-hero-copy, .school-hero-media, .school-accent-line { animation: none !important; }
        }
      `}} />

      {/* Navigation */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled || isMobileMenuOpen
            ? 'border-b border-black/10 bg-white/95 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-[var(--school-nav-h)] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            {branding?.logos?.primary ? (
              <img
                src={branding.logos.primary as string}
                alt={`${resolvedSchoolName} logo`}
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
                className={`block truncate font-display text-lg leading-none tracking-tight sm:text-xl ${
                  scrolled || isMobileMenuOpen ? 'text-[var(--school-ink)]' : 'text-white'
                }`}
              >
                {resolvedSchoolName}
              </span>
              <span
                className={`mt-1 block truncate text-[10px] font-medium uppercase tracking-[0.16em] sm:text-[11px] ${
                  scrolled || isMobileMenuOpen ? 'text-primary' : 'text-white/70'
                }`}
              >
                {tagline}
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-slate-600 hover:text-primary'
                    : 'text-white/85 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              asChild
              variant="outline"
              className={`h-10 rounded-none border px-4 text-sm font-semibold shadow-none ${
                scrolled
                  ? 'border-primary/30 bg-transparent text-primary hover:bg-primary hover:text-white'
                  : 'border-white/40 bg-white/10 text-white hover:bg-white hover:text-[var(--school-ink)]'
              }`}
            >
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Portal
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded-none bg-primary px-5 text-sm font-semibold text-white shadow-none hover:bg-primary-dark"
            >
              <Link href="/apply">
                Apply now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className={`inline-flex h-10 w-10 items-center justify-center border lg:hidden ${
              scrolled || isMobileMenuOpen
                ? 'border-black/10 text-[var(--school-ink)]'
                : 'border-white/30 text-white'
            }`}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-black/10 bg-white lg:hidden">
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-2 py-3 text-base font-medium text-slate-700 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="grid gap-2 border-t border-black/10 px-4 py-4">
              <Button
                asChild
                variant="outline"
                className="h-11 w-full justify-center border-primary/30 text-primary shadow-none"
              >
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Student / staff portal
                </Link>
              </Button>
              <Button
                asChild
                className="h-11 w-full justify-center bg-primary text-white shadow-none hover:bg-primary-dark"
              >
                <Link href="/apply" onClick={() => setIsMobileMenuOpen(false)}>
                  Apply now
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero — brand + one pitch + CTAs on full-bleed campus image */}
      <section className="relative min-h-[100svh] overflow-hidden bg-[#0a1f1a]">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt=""
            aria-hidden
            className={`school-hero-media h-full w-full object-cover object-[58%_30%] ${
              heroReady ? '' : 'opacity-0'
            }`}
          />
          <div className="absolute inset-0 bg-[#0a1f1a]/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f1a]/90 via-[#0a1f1a]/60 to-[#0a1f1a]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f2923] via-[#0a1f1a]/25 to-[#0a1f1a]/50" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-16 pt-[calc(var(--school-nav-h)+2rem)] sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <div className="max-w-2xl lg:max-w-3xl">
            <p
              className={`school-hero-copy mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--school-accent)] sm:text-xs ${
                heroReady ? '' : 'opacity-0'
              }`}
            >
              {tagline}
            </p>
            <h1
              className={`school-hero-copy school-hero-copy-delay font-display text-[3.25rem] leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-[4.5rem] ${
                heroReady ? '' : 'opacity-0'
              }`}
            >
              {resolvedSchoolName}
            </h1>
            <div
              className={`school-accent-line mt-6 h-0.5 w-20 bg-[var(--school-accent)] ${
                heroReady ? '' : 'opacity-0'
              }`}
            />
            <p
              className={`school-hero-copy school-hero-copy-delay-2 mt-6 max-w-lg text-base leading-relaxed text-white/95 sm:text-lg ${
                heroReady ? '' : 'opacity-0'
              }`}
            >
              {description}
            </p>
            <div
              className={`school-hero-copy school-hero-copy-delay-2 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center ${
                heroReady ? '' : 'opacity-0'
              }`}
            >
              <Button
                asChild
                size="lg"
                className="h-12 rounded-none bg-primary px-8 text-base font-semibold text-white shadow-none hover:bg-primary-dark"
              >
                <Link href="/apply">
                  Apply now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-none border-white/50 bg-white/10 px-8 text-base font-semibold text-white shadow-none backdrop-blur-sm hover:bg-white hover:text-[var(--school-ink)]"
              >
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Parent &amp; student login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — one horizontal composition, not a card grid */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-black/10 lg:grid-cols-4 lg:divide-y-0">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 70}>
              <div className="px-6 py-10 text-center sm:px-8 sm:py-12">
                <p className="font-display text-4xl tracking-tight text-primary sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What we offer */}
      <section className="relative overflow-hidden py-20 sm:py-24">
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
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Life at {resolvedSchoolName}
              </p>
              <h2 className="mt-3 font-display text-4xl tracking-tight text-[var(--school-ink)] sm:text-5xl">
                What we offer
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                Academics, enrichment, and care — the essentials of a complete education, kept
                clear and close.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-px bg-black/10 sm:grid-cols-3">
            {offerings.map((item, index) => {
              const Icon = item.icon
              return (
                <Reveal key={item.title} delay={index * 80}>
                  <div className="group flex h-full flex-col bg-[var(--school-paper)] p-8 transition-colors duration-300 hover:bg-white sm:p-10">
                    <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                    <h3 className="mt-6 font-display text-2xl tracking-tight text-[var(--school-ink)]">
                      {item.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                      {item.body}
                    </p>
                    <Link
                      href={item.href}
                      className="mt-8 inline-flex items-center text-sm font-semibold text-primary transition-colors group-hover:text-primary-dark"
                    >
                      {item.cta}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <SchoolHomepageFeeDownloads
        subdomain={subdomain}
        schoolName={resolvedSchoolName}
      />

      {/* Programs */}
      <section className="border-y border-black/10 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Pathways
                </p>
                <h2 className="mt-3 font-display text-4xl tracking-tight text-[var(--school-ink)] sm:text-5xl">
                  Educational programs
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                  Structured levels and subjects that meet students where they are — and take them
                  further.
                </p>
              </div>
              <Button
                asChild
                className="h-11 w-fit rounded-none bg-primary px-6 text-sm font-semibold text-white shadow-none hover:bg-primary-dark"
              >
                <Link href="/programs">
                  View all programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>

          {config?.selectedLevels?.length ? (
            <div className="mt-12 space-y-4">
              {config.selectedLevels.map((level, index) => (
                <Reveal key={level.id} delay={index * 60}>
                  <div className="border border-black/10 bg-[var(--school-paper)] p-6 transition-colors hover:bg-white sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-3">
                          <span className="font-ui text-xs font-semibold tabular-nums text-primary">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h3 className="font-display text-2xl tracking-tight text-[var(--school-ink)] sm:text-3xl">
                            {level.name}
                          </h3>
                        </div>
                        {level.description && (
                          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
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
                      <div className="lg:max-w-md lg:text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Subjects · {level.subjects.length}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {level.subjects
                            .slice(0, 6)
                            .map((s) => s.name)
                            .join(' · ')}
                          {level.subjects.length > 6
                            ? ` · +${level.subjects.length - 6} more`
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="mt-12 border border-dashed border-black/15 bg-[var(--school-paper)] px-6 py-14 text-center">
                <Users className="mx-auto h-8 w-8 text-primary/70" strokeWidth={1.5} />
                <p className="mt-4 font-display text-2xl text-[var(--school-ink)]">
                  Programs coming soon
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                  {totalGrades > 0
                    ? `${totalGrades} grade levels configured and ready.`
                    : 'Ask admissions about our current pathways and intake.'}
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden bg-primary py-20 sm:py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          aria-hidden
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-4xl tracking-tight text-white sm:text-5xl">
              Ready to join our community?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Start an application, or visit campus and see how {resolvedSchoolName} feels in person.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-none bg-white px-8 text-base font-semibold text-primary shadow-none hover:bg-[var(--school-accent)] hover:text-[var(--school-ink)]"
              >
                <Link href="/apply">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Apply for admission
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-none border-white/40 bg-transparent px-8 text-base font-semibold text-white shadow-none hover:bg-white/10"
              >
                <Link href="/visit">
                  <MapPin className="mr-2 h-4 w-4" />
                  Schedule a visit
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a1f1a] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-primary">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-display text-xl leading-none tracking-tight">
                    {resolvedSchoolName}
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">
                    {tagline}
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
                {description}
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Quick links
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  { href: '/about', label: 'About us' },
                  { href: '/admissions', label: 'Admissions' },
                  { href: '/programs', label: 'Programs' },
                  { href: '/#fee-structure', label: 'Fee structure' },
                  { href: '/news', label: 'News & events' },
                ].map((link) => (
                  <li key={link.href}>
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
                    {isPlaceholderCopy(branding?.contact?.email)
                      ? `info@${subdomain}.edu`
                      : branding?.contact?.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneCall className="h-4 w-4 shrink-0 text-primary-light" />
                  <span>
                    {isPlaceholderCopy(branding?.contact?.phone)
                      ? '+254 700 000 000'
                      : branding?.contact?.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/40">
            © {new Date().getFullYear()} {resolvedSchoolName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

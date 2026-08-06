'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import type { HomepageConfig } from '@/lib/types/homepage-config'
import { cn } from '@/lib/utils'
import {
  HomepageShellStyles,
  shellClass,
  themeStyle,
} from './shared'

export function SchoolAuthShell({
  config,
  schoolName,
  logoUrl,
  tagline,
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  config: HomepageConfig
  schoolName: string
  logoUrl?: string
  tagline?: string
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  const isAssembly = config.templateId === 'assembly-hall'
  const initials = schoolName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  const soft = config.theme.radiusMode === 'soft'

  return (
    <div
      className={shellClass(
        config,
        cn(
          'flex min-h-screen flex-col',
          isAssembly && 'assembly-hall-shell',
        ),
      )}
      style={themeStyle(config.theme)}
    >
      <HomepageShellStyles assembly={isAssembly} />

      <header
        className={cn(
          'sticky top-0 z-40 border-b-2',
          isAssembly
            ? 'border-[var(--school-ink)] bg-[var(--ah-cream,#FBF6E9)]'
            : 'border-black/10 bg-white/95 backdrop-blur-md',
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
                  isAssembly &&
                    'rounded-full border-2 border-[var(--school-accent)]',
                )}
              />
            ) : (
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11',
                  isAssembly
                    ? 'rounded-full border-2 border-[var(--school-accent)] bg-[var(--school-ink)] font-display text-sm font-extrabold text-[var(--ah-cream,#FBF6E9)]'
                    : 'bg-primary text-white',
                )}
              >
                {isAssembly ? initials : <Building2 className="h-5 w-5" />}
              </div>
            )}
            <div className="min-w-0">
              <span
                className={cn(
                  'block truncate font-display text-lg leading-none tracking-tight sm:text-xl',
                  isAssembly && 'font-extrabold uppercase tracking-wide',
                )}
              >
                {schoolName}
              </span>
              <span
                className={cn(
                  'mt-1 block truncate text-[10px] font-medium sm:text-[11px]',
                  isAssembly
                    ? 'ah-hand normal-case tracking-normal text-[var(--ah-muted,#4A4235)]'
                    : 'uppercase tracking-[0.16em] text-primary',
                )}
              >
                {tagline || 'Inspiring excellence every day'}
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className={cn(
              'inline-flex h-10 items-center gap-2 border-2 px-4 text-sm font-semibold transition-colors',
              soft || isAssembly ? 'rounded-lg' : 'rounded-none',
              isAssembly
                ? 'border-[var(--school-ink)] bg-transparent text-[var(--school-ink)] hover:bg-[var(--school-ink)] hover:text-[var(--ah-cream,#FBF6E9)]'
                : 'border-primary/30 text-primary hover:bg-primary hover:text-white',
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to home</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>
      </header>

      <main
        className={cn(
          'relative flex flex-1 flex-col',
          isAssembly && 'ah-ruled',
        )}
      >
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-8 text-center sm:mb-10 sm:text-left">
            {eyebrow && (
              <p
                className={cn(
                  'mb-3',
                  isAssembly
                    ? 'ah-margin-note'
                    : 'text-[11px] font-semibold uppercase tracking-[0.18em] text-primary',
                )}
              >
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight text-[var(--school-ink)]">
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  'mt-3 text-base leading-relaxed',
                  isAssembly
                    ? 'ah-prose mx-auto sm:mx-0'
                    : 'text-[var(--school-ink)]/70',
                )}
              >
                {description}
              </p>
            )}
          </div>

          <div
            className={cn(
              'border-2 border-[var(--school-ink)] bg-white p-6 sm:p-8',
              isAssembly
                ? 'ah-stat-card rounded-md bg-[var(--ah-cream,#FBF6E9)]'
                : soft
                  ? 'rounded-xl shadow-lg'
                  : 'rounded-none shadow-[6px_6px_0_rgba(0,0,0,0.12)]',
            )}
          >
            {children}
          </div>

          {footer && <div className="mt-8 text-center">{footer}</div>}
        </div>
        {isAssembly && <div className="ah-tear mt-auto" aria-hidden />}
      </main>
    </div>
  )
}

/** Shared input/button classes that follow the active homepage look. */
export function authFieldClass(config: HomepageConfig) {
  const isAssembly = config.templateId === 'assembly-hall'
  const soft = config.theme.radiusMode === 'soft' || isAssembly
  return cn(
    'h-12 border-2 bg-white text-[var(--school-ink)] placeholder:text-[var(--school-ink)]/40 focus-visible:ring-2 focus-visible:ring-primary/25',
    soft ? 'rounded-lg' : 'rounded-none',
    isAssembly
      ? 'border-[var(--school-ink)]/25 focus-visible:border-primary'
      : 'border-black/15 focus-visible:border-primary',
  )
}

export function authPrimaryButtonClass(config: HomepageConfig) {
  const isAssembly = config.templateId === 'assembly-hall'
  const soft = config.theme.radiusMode === 'soft' || isAssembly
  return cn(
    'h-12 w-full border-2 border-[var(--school-ink)] bg-[var(--school-ink)] font-display text-sm font-bold text-[var(--ah-cream,#FBF6E9)] shadow-none transition-[background-color,border-color,transform] hover:border-primary hover:bg-primary active:scale-[0.98] disabled:opacity-50',
    soft ? 'rounded-lg' : 'rounded-none',
    !isAssembly &&
      'border-primary bg-primary text-white hover:border-primary-dark hover:bg-primary-dark',
  )
}

export function authLabelClass(config: HomepageConfig) {
  const isAssembly = config.templateId === 'assembly-hall'
  return cn(
    'text-sm font-semibold text-[var(--school-ink)]',
    isAssembly && 'font-display tracking-wide',
  )
}

'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { SqulWordmark } from '@/components/brand/SqulMark'

type HeaderProps = {
  variant?: 'default' | 'hero'
}

const NAV = [
  { label: 'Platform', href: '/#platform' },
  { label: 'Schools', href: '/schools' },
  { label: 'Domains', href: '/custom-domains' },
  { label: 'Guides', href: '/blog' },
] as const

export function Header({ variant = 'default' }: HeaderProps) {
  const isHero = variant === 'hero'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  const opaque = isHero ? scrolled || mobileOpen : true

  return (
    <>
    <header
      className={[
        'z-50 w-full transition-[background-color,border-color] duration-200',
        isHero ? 'fixed inset-x-0 top-0' : 'sticky top-0',
        isHero
          ? scrolled || mobileOpen
            ? 'border-b border-[#14201b]/10 bg-[#f7f4ec]'
            : 'border-b border-white/10 bg-transparent'
          : scrolled
            ? 'border-b border-[#14201b]/10 bg-[#f7f4ec]'
            : 'border-b border-transparent bg-[#f7f4ec]',
      ].join(' ')}
    >
      <div className="mk-container">
        <div className="flex h-20 items-center justify-between gap-8">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center transition-opacity duration-200 hover:opacity-70"
            aria-label="SQUL home"
          >
            <SqulWordmark tone={opaque ? 'dark' : 'light'} markSize={30} />
          </Link>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'group relative py-2 text-[0.8125rem] font-medium tracking-[0.01em] transition-colors duration-200',
                  opaque
                    ? 'text-[#4d574f] hover:text-[#14201b]'
                    : 'text-white/70 hover:text-white',
                ].join(' ')}
              >
                {item.label}
                <span
                  className={[
                    'absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100',
                    opaque ? 'bg-[#14201b]/60' : 'bg-white/70',
                  ].join(' ')}
                  aria-hidden
                />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/login"
              className={[
                'text-[0.8125rem] font-medium transition-colors duration-200',
                opaque ? 'text-[#4d574f] hover:text-[#14201b]' : 'text-white/70 hover:text-white',
              ].join(' ')}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className={[
                'group inline-flex items-center gap-2 border-b pb-1 text-[0.8125rem] font-medium transition-colors duration-200',
                opaque
                  ? 'border-[#14201b]/35 text-[#14201b] hover:border-[#14201b]'
                  : 'border-white/35 text-white hover:border-white',
              ].join(' ')}
            >
              Start free term
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className={[
              'flex h-10 w-10 items-center justify-center transition-colors duration-200 md:hidden',
              opaque || mobileOpen ? 'text-[#14201b]' : 'text-white',
            ].join(' ')}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto border-t border-[#14201b]/10 bg-[#f7f4ec] px-6 pb-12 pt-8 md:hidden"
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-baseline justify-between border-b border-[#14201b]/10 py-5"
              >
                <span className="font-display text-[1.85rem] leading-none text-[#14201b]">
                  {item.label}
                </span>
                <span className="font-mono text-[0.625rem] tabular-nums text-[#14201b]/30">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </Link>
            ))}
          </nav>
          <div className="mt-10 flex flex-col gap-3">
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="mk-btn mk-btn--ink w-full"
            >
              Start your free term
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mk-btn mk-btn--outline w-full"
            >
              Sign in
            </Link>
          </div>
          <p className="mt-8 text-[0.6875rem] uppercase tracking-[0.18em] text-[#14201b]/40">
            90-day free term · No credit card
          </p>
        </div>
      )}
    </>
  )
}

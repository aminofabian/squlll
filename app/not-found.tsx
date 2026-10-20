'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { SqulWordmark } from '@/components/brand/SqulMark'

const QUICK_LINKS = [
  { label: 'The platform', href: '/#platform' },
  { label: 'Schools on SQUL', href: '/schools' },
  { label: 'Custom domains', href: '/custom-domains' },
  { label: 'Guides', href: '/blog' },
  { label: 'Start a free term', href: '/register' },
]

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="squl-marketing flex min-h-screen flex-col bg-[#f7f4ec] text-[#14201b]">
      <header className="border-b border-[#14201b]/10">
        <div className="mk-container flex h-[4.5rem] items-center justify-between gap-6">
          <Link href="/" aria-label="SQUL home" className="transition-opacity hover:opacity-70">
            <SqulWordmark markSize={28} />
          </Link>
          <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-[#7c857d]">
            Error 404
          </p>
        </div>
      </header>

      <main className="mk-container flex flex-1 flex-col justify-center py-16 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p className="mk-eyebrow">Page not found</p>
            <p className="mt-10 font-display text-[clamp(5.5rem,12vw,10rem)] leading-[0.78] tracking-[-0.05em] text-[#14201b]">
              404
            </p>
            <h1 className="mt-10 max-w-xl font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.04] tracking-[-0.02em] text-[#14201b]">
              This page has left
              <span className="block italic text-[#1c3d32]">the staff room.</span>
            </h1>
            <p className="mt-5 max-w-md text-[1rem] leading-[1.7] text-[#4d574f]">
              The page may have moved, or the link is out of date. Let&apos;s get
              you back to the work that matters.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/" className="mk-btn mk-btn--ink">
                Back to home
                <ArrowRight className="mk-arrow h-3.5 w-3.5" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => router.back()}
                className="mk-link text-[0.8125rem]"
              >
                Go back a step
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <p className="mk-caption">Try instead</p>
            <ul className="mt-4 border-t border-[#14201b]/10">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-4 border-b border-[#14201b]/8 py-3.5 text-[0.8125rem] text-[#4d574f] transition-colors duration-200 hover:text-[#14201b]"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-[#14201b]/25 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#1c3d32]"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-[0.6875rem] leading-relaxed text-[#7c857d]">
              If this keeps happening, write to{' '}
              <a
                href="mailto:support@squl.co.ke"
                className="text-[#14201b] underline decoration-[#14201b]/25 underline-offset-4 hover:decoration-[#14201b]"
              >
                support@squl.co.ke
              </a>
              .
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#14201b]/10">
        <div className="mk-container flex flex-wrap items-center justify-between gap-4 py-6">
          <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-[#7c857d]">
            © {new Date().getFullYear()} SQUL · Nairobi, Kenya
          </p>
          <div className="flex gap-6 text-[0.625rem] text-[#7c857d]">
            <Link href="/privacy" className="transition-colors hover:text-[#14201b]">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[#14201b]">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

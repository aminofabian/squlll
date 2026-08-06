'use client'

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  BookOpen,
  Building2,
  GraduationCap,
  Heart,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { HomepageConfig, HomepageTheme } from '@/lib/types/homepage-config'
import { cn } from '@/lib/utils'

export function Reveal({
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
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  GraduationCap,
  Heart,
  Users,
  Star,
  Building2,
}

export function SectionIcon({
  name,
  className,
}: {
  name?: string
  className?: string
}) {
  const Icon = ICONS[name || 'BookOpen'] || BookOpen
  return <Icon className={className} strokeWidth={1.5} />
}

export function themeStyle(theme: HomepageTheme): CSSProperties {
  return {
    '--primary': theme.primary,
    '--primary-dark': theme.primaryDark,
    '--primary-light': theme.primaryLight,
    '--school-ink': theme.ink,
    '--school-paper': theme.paper,
    '--school-accent': theme.accent,
    '--school-nav-h': '4.5rem',
  } as CSSProperties
}

export function shellClass(config: HomepageConfig, extra?: string) {
  return cn(
    'school-home min-h-screen bg-[var(--school-paper)] text-[var(--school-ink)]',
    config.theme.radiusMode === 'sharp' && 'school-home-sharp',
    extra,
  )
}

export function HomepageShellStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        .school-home-sharp, .school-home-sharp * { border-radius: 0 !important; }
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
      `,
      }}
    />
  )
}

export type HomepageRuntime = {
  schoolName: string
  subdomain: string
  logoUrl?: string
  tagline?: string
}

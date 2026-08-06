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

export function HomepageShellStyles({ assembly = false }: { assembly?: boolean }) {
  return (
    <>
      {assembly && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Kalam:wght@400;700&family=Literata:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </>
      )}
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
        @keyframes school-ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
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

        /* ---- Assembly Hall / ruled-notebook shell ---- */
        .assembly-hall-shell {
          --ah-cream: #FBF6E9;
          --ah-rule: #AFCBDD;
          --ah-muted: #5B5241;
          --ah-cork: #8B5E3C;
          --ah-shadow: rgba(28,43,69,0.18);
          --font-display: 'Space Grotesk', sans-serif;
          font-family: 'Literata', Georgia, serif;
          color: var(--school-ink);
        }
        .assembly-hall-shell .font-display,
        .assembly-hall-shell h1,
        .assembly-hall-shell h2,
        .assembly-hall-shell h3 {
          font-family: 'Space Grotesk', sans-serif;
        }
        .assembly-hall-shell .ah-hand { font-family: 'Kalam', cursive; }
        .assembly-hall-shell .ah-mono { font-family: 'IBM Plex Mono', monospace; }
        .assembly-hall-shell .ah-ruled {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0px, transparent 37px,
            var(--ah-rule) 37px, var(--ah-rule) 38px
          );
          background-position: 0 90px;
          position: relative;
        }
        .assembly-hall-shell .ah-ruled::before {
          content: "";
          position: absolute;
          top: 0; bottom: 0; left: 40px;
          width: 2px;
          background: var(--primary);
          opacity: 0.55;
          pointer-events: none;
        }
        @media (min-width: 640px) {
          .assembly-hall-shell .ah-ruled::before { left: 64px; }
        }
        .assembly-hall-shell .ah-tear {
          height: 26px;
          width: 100%;
          background: var(--school-paper);
          clip-path: polygon(0% 100%, 2% 30%, 4% 90%, 7% 20%, 10% 80%, 13% 10%, 16% 70%, 19% 25%, 22% 95%, 25% 15%, 28% 65%, 31% 5%, 34% 85%, 37% 30%, 40% 100%, 43% 20%, 46% 75%, 49% 10%, 52% 90%, 55% 25%, 58% 70%, 61% 5%, 64% 85%, 67% 15%, 70% 95%, 73% 30%, 76% 80%, 79% 10%, 82% 65%, 85% 20%, 88% 90%, 91% 5%, 94% 75%, 97% 25%, 100% 100%, 100% 100%, 0% 100%);
        }
        .assembly-hall-shell .ah-scribble {
          clip-path: polygon(3% 8%, 20% 2%, 45% 6%, 70% 1%, 95% 7%, 99% 22%, 96% 40%, 100% 58%, 94% 78%, 99% 92%, 80% 99%, 55% 95%, 30% 100%, 8% 94%, 1% 75%, 6% 55%, 0% 33%, 5% 15%);
        }
        .assembly-hall-shell .ah-ticker-track {
          animation: school-ticker 32s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .school-hero-copy, .school-hero-media, .school-accent-line { animation: none !important; }
          .assembly-hall-shell .ah-ticker-track { animation: none !important; }
        }
      `,
        }}
      />
    </>
  )
}

export type HomepageRuntime = {
  schoolName: string
  subdomain: string
  logoUrl?: string
  tagline?: string
  /** Studio preview: keep nav inside the preview frame (not viewport-fixed) */
  preview?: boolean
}

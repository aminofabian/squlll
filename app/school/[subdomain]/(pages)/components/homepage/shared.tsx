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
            href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;600;700;800&family=Kalam:wght@400;700&family=Literata:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </>
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .school-home-sharp, .school-home-sharp * { border-radius: 0 !important; }
        @keyframes school-hero-rise {
          from { opacity: 0; transform: translateY(14px); }
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
        @keyframes ah-stamp-press {
          0% { opacity: 0; transform: rotate(-22deg) scale(1.35); filter: blur(2px); }
          55% { opacity: 1; transform: rotate(-9deg) scale(0.96); filter: blur(0); }
          100% { opacity: 1; transform: rotate(-11deg) scale(1); }
        }
        @keyframes ah-margin-ink {
          from { transform: scaleY(0); opacity: 0; }
          to { transform: scaleY(1); opacity: 0.55; }
        }
        @keyframes ah-card-settle {
          from { opacity: 0; transform: translateY(28px) rotate(1.5deg); }
          to { opacity: 1; transform: translateY(0) rotate(0deg); }
        }
        @keyframes ah-chalk-dust {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.55; }
        }
        .school-hero-copy {
          animation: school-hero-rise 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .school-hero-copy-delay { animation-delay: 0.1s; }
        .school-hero-copy-delay-2 { animation-delay: 0.2s; }
        .school-hero-media { animation: school-hero-ken 8s ease-out both; }
        .school-accent-line {
          transform-origin: left;
          animation: school-line-draw 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }

        /* ---- Assembly Hall / ruled-notebook shell ---- */
        .assembly-hall-shell {
          --ah-cream: #FBF6E9;
          --ah-paper-2: #E3D5AC;
          --ah-rule: #AFCBDD;
          --ah-muted: #4A4235;
          --ah-cork: #8B5E3C;
          --ah-shadow: rgba(28, 43, 69, 0.16);
          --ah-shadow-deep: rgba(28, 43, 69, 0.28);
          --ah-ease: cubic-bezier(0.16, 1, 0.3, 1);
          --font-display: 'Bricolage Grotesque', 'Avenir Next', sans-serif;
          font-family: 'Literata', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
          color: var(--school-ink);
          font-size: 1.0625rem;
          line-height: 1.7;
          background-color: var(--school-paper);
          background-image:
            radial-gradient(ellipse 120% 80% at 8% -8%, rgba(251, 246, 233, 0.85), transparent 55%),
            radial-gradient(ellipse 70% 45% at 100% 0%, rgba(174, 58, 43, 0.06), transparent 50%),
            linear-gradient(180deg, var(--school-paper) 0%, var(--ah-paper-2) 100%);
        }
        .assembly-hall-shell .font-display,
        .assembly-hall-shell h1,
        .assembly-hall-shell h2,
        .assembly-hall-shell h3 {
          font-family: 'Bricolage Grotesque', 'Avenir Next', sans-serif;
          letter-spacing: -0.025em;
          text-wrap: balance;
        }
        .assembly-hall-shell h1 { letter-spacing: -0.03em; }
        .assembly-hall-shell .ah-hand { font-family: 'Kalam', 'Segoe Print', cursive; letter-spacing: 0; }
        .assembly-hall-shell .ah-mono {
          font-family: 'IBM Plex Mono', ui-monospace, monospace;
          letter-spacing: 0.04em;
          font-variant-numeric: tabular-nums;
        }
        .assembly-hall-shell .ah-prose {
          max-width: 38rem;
          line-height: 1.75;
          color: var(--ah-muted);
        }
        .assembly-hall-shell .ah-mark {
          background: linear-gradient(transparent 62%, rgba(174, 58, 43, 0.22) 62%);
          box-decoration-break: clone;
        }
        .assembly-hall-shell .ah-margin-note {
          font-family: 'Kalam', cursive;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: 0;
          text-transform: none;
          display: inline-block;
          transform: rotate(-1.5deg);
        }
        .assembly-hall-shell a:focus-visible,
        .assembly-hall-shell button:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 3px;
        }
        .assembly-hall-shell .ah-ruled {
          background-color: transparent;
          background-image:
            repeating-linear-gradient(
              to bottom,
              transparent 0px, transparent 37px,
              var(--ah-rule) 37px, var(--ah-rule) 38px
            );
          background-position: 0 72px;
          position: relative;
        }
        .assembly-hall-shell .ah-ruled::before {
          content: "";
          position: absolute;
          top: 0; bottom: 0; left: 40px;
          width: 2px;
          background: var(--primary);
          opacity: 0.55;
          transform-origin: top;
          animation: ah-margin-ink 1.1s var(--ah-ease) 0.25s both;
          pointer-events: none;
          z-index: 0;
        }
        @media (min-width: 640px) {
          .assembly-hall-shell .ah-ruled::before { left: 64px; }
        }
        .assembly-hall-shell .ah-tear {
          height: 28px;
          width: 100%;
          background: var(--school-paper);
          clip-path: polygon(0% 100%, 2% 30%, 4% 90%, 7% 20%, 10% 80%, 13% 10%, 16% 70%, 19% 25%, 22% 95%, 25% 15%, 28% 65%, 31% 5%, 34% 85%, 37% 30%, 40% 100%, 43% 20%, 46% 75%, 49% 10%, 52% 90%, 55% 25%, 58% 70%, 61% 5%, 64% 85%, 67% 15%, 70% 95%, 73% 30%, 76% 80%, 79% 10%, 82% 65%, 85% 20%, 88% 90%, 91% 5%, 94% 75%, 97% 25%, 100% 100%, 100% 100%, 0% 100%);
          margin-top: -1px;
        }
        .assembly-hall-shell .ah-scribble {
          clip-path: polygon(3% 8%, 20% 2%, 45% 6%, 70% 1%, 95% 7%, 99% 22%, 96% 40%, 100% 58%, 94% 78%, 99% 92%, 80% 99%, 55% 95%, 30% 100%, 8% 94%, 1% 75%, 6% 55%, 0% 33%, 5% 15%);
        }
        .assembly-hall-shell .ah-ticker-track {
          animation: school-ticker 36s linear infinite;
        }
        .assembly-hall-shell .ah-stamp {
          animation: ah-stamp-press 0.9s var(--ah-ease) 0.45s both;
        }
        .assembly-hall-shell .ah-stat-card {
          animation: ah-card-settle 0.95s var(--ah-ease) 0.15s both;
          box-shadow:
            8px 10px 0 var(--ah-shadow),
            14px 18px 32px var(--ah-shadow-deep);
        }
        .assembly-hall-shell .ah-period {
          transition: transform 0.35s var(--ah-ease), box-shadow 0.35s var(--ah-ease);
          box-shadow: 3px 3px 0 transparent;
        }
        .assembly-hall-shell .ah-period:hover {
          transform: translateY(-5px) rotate(-0.4deg);
          box-shadow:
            5px 8px 0 var(--ah-shadow),
            10px 16px 28px var(--ah-shadow-deep);
        }
        .assembly-hall-shell .ah-sticky {
          transition: transform 0.4s var(--ah-ease), box-shadow 0.4s var(--ah-ease);
        }
        .assembly-hall-shell .ah-sticky:hover {
          transform: rotate(0deg) translateY(-6px) scale(1.02);
          box-shadow: 6px 14px 22px rgba(0, 0, 0, 0.32);
          z-index: 2;
        }
        .assembly-hall-shell .ah-chalk-surface {
          background-image:
            radial-gradient(circle at 18% 22%, rgba(255,255,255,0.07), transparent 42%),
            radial-gradient(circle at 82% 68%, rgba(255,255,255,0.045), transparent 48%),
            linear-gradient(160deg, rgba(255,255,255,0.03), transparent 40%);
        }
        .assembly-hall-shell .ah-chalk-num {
          text-shadow: 0 0 1px rgba(255,255,255,0.35);
          animation: ah-chalk-dust 5s ease-in-out infinite;
        }
        .assembly-hall-shell footer {
          background:
            radial-gradient(ellipse 70% 60% at 20% 0%, rgba(206, 154, 34, 0.12), transparent 50%),
            var(--school-ink);
        }
        .assembly-hall-shell footer h3 {
          color: var(--school-accent) !important;
          letter-spacing: 0.12em !important;
        }
        .assembly-hall-shell section.border-y {
          border-color: rgba(28, 43, 69, 0.12) !important;
          background: var(--ah-cream) !important;
        }
        .assembly-hall-shell section.border-y .border {
          border-color: var(--school-ink) !important;
          background: var(--ah-cream) !important;
          box-shadow: 4px 5px 0 var(--ah-shadow);
        }
        @media (prefers-reduced-motion: reduce) {
          .school-hero-copy, .school-hero-media, .school-accent-line { animation: none !important; }
          .assembly-hall-shell .ah-ticker-track,
          .assembly-hall-shell .ah-stamp,
          .assembly-hall-shell .ah-stat-card,
          .assembly-hall-shell .ah-ruled::before,
          .assembly-hall-shell .ah-chalk-num { animation: none !important; }
          .assembly-hall-shell .ah-period:hover,
          .assembly-hall-shell .ah-sticky:hover { transform: none; }
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

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

export function HomepageShellStyles({
  assembly = false,
  playfield = false,
  garden = false,
  story = false,
  horizon = false,
  folio = false,
  night = false,
}: {
  assembly?: boolean
  playfield?: boolean
  garden?: boolean
  story?: boolean
  horizon?: boolean
  folio?: boolean
  night?: boolean
}) {
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
      {playfield && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Space+Mono:wght@400;700&family=Special+Elite&family=Work+Sans:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </>
      )}
      {garden && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Karla:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
            rel="stylesheet"
          />
        </>
      )}
      {story && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Courier+Prime:wght@400;700&family=Mulish:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </>
      )}
      {horizon && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap"
            rel="stylesheet"
          />
        </>
      )}
      {folio && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Serif+Display:ital@0;1&family=Space+Mono:wght@400;700&display=swap"
            rel="stylesheet"
          />
        </>
      )}
      {night && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Red+Hat+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&family=Unbounded:wght@400;500;600;700;800&display=swap"
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
        @keyframes pf-flipflap {
          0% { transform: rotateX(0deg); opacity: 1; }
          45% { transform: rotateX(90deg); opacity: 0.3; }
          100% { transform: rotateX(0deg); opacity: 1; }
        }
        @keyframes pf-pass-settle {
          from { opacity: 0; transform: translateY(28px) rotate(-1deg); }
          to { opacity: 1; transform: translateY(0) rotate(0); }
        }
        @keyframes hb-spin {
          to { transform: rotate(360deg); }
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
        .school-program-card {
          box-shadow: 0 1px 0 rgba(0,0,0,0.03);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .school-program-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(0,0,0,0.07);
        }
        .school-program-grade {
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }
        .school-program-grade:hover {
          background-color: color-mix(in srgb, var(--primary) 14%, white);
          border-color: color-mix(in srgb, var(--primary) 45%, transparent);
        }
        .school-program-subject {
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .school-program-subject:hover {
          border-color: color-mix(in srgb, var(--school-ink) 22%, transparent);
          color: var(--school-ink);
        }
        @media (prefers-reduced-motion: reduce) {
          .school-program-card,
          .school-program-card:hover { transition: none; transform: none; }
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
        /* ---- Folio / arts-magazine shell (Studio Day) ---- */
        .folio-shell {
          --fo-cream: #F6F1E7;
          --fo-cream-2: #EDE4D2;
          --fo-ink: #191512;
          --fo-ink-soft: #4A4238;
          --fo-rule: rgba(25, 21, 18, 0.16);
          --fo-vermilion: #C8442F;
          --fo-ease: cubic-bezier(0.16, 1, 0.3, 1);
          --font-display: 'DM Serif Display', 'Playfair Display', Georgia, serif;
          font-family: 'Archivo', 'Avenir Next', system-ui, sans-serif;
          background-color: var(--fo-cream);
          background-image:
            radial-gradient(ellipse 90% 60% at 100% 0%, rgba(200, 68, 47, 0.05), transparent 55%),
            linear-gradient(180deg, var(--fo-cream) 0%, var(--fo-cream-2) 100%);
          color: var(--fo-ink);
        }
        .folio-shell .font-display,
        .folio-shell h1,
        .folio-shell h2,
        .folio-shell h3 {
          font-family: 'DM Serif Display', 'Playfair Display', Georgia, serif;
          letter-spacing: -0.01em;
        }
        .folio-shell .fo-mono {
          font-family: 'Space Mono', ui-monospace, monospace;
          font-variant-numeric: tabular-nums;
        }
        .folio-shell .fo-italic { font-style: italic; }
        .folio-shell .fo-frame {
          box-shadow: 12px 14px 0 var(--fo-ink);
        }
        .folio-shell .fo-crop {
          background:
            linear-gradient(to top, var(--fo-vermilion) 0 2px, transparent 2px) 0 100%/14px 2px,
            linear-gradient(to top, var(--fo-vermilion) 0 2px, transparent 2px) 100% 100%/14px 2px,
            linear-gradient(to right, var(--fo-vermilion) 0 2px, transparent 2px) 0 100%/2px 14px,
            linear-gradient(to right, var(--fo-vermilion) 0 2px, transparent 2px) 100% 100%/2px 14px,
            linear-gradient(to bottom, var(--fo-vermilion) 0 2px, transparent 2px) 0 0/14px 2px,
            linear-gradient(to bottom, var(--fo-vermilion) 0 2px, transparent 2px) 100% 0/14px 2px,
            linear-gradient(to right, var(--fo-vermilion) 0 2px, transparent 2px) 0 0/2px 14px,
            linear-gradient(to right, var(--fo-vermilion) 0 2px, transparent 2px) 100% 0/2px 14px;
          background-repeat: no-repeat;
        }
        .folio-shell .fo-rule-y {
          border-left: 1px solid var(--fo-rule);
        }
        .folio-shell .fo-rule-x {
          border-top: 1px solid var(--fo-rule);
        }
        .folio-shell footer {
          background: var(--fo-ink);
          color: var(--fo-cream);
        }
        .folio-shell footer h3 {
          color: var(--fo-cream) !important;
          letter-spacing: 0.16em !important;
          font-family: 'Space Mono', ui-monospace, monospace !important;
        }
        .folio-shell section.border-y {
          border-color: var(--fo-rule) !important;
        }

        /* ---- Night Lights / evening-marquee shell ---- */
        .night-lights-shell {
          --nl-ink: #060A0E;
          --nl-ink-2: #0C141B;
          --nl-slate: #9FB4C4;
          --nl-muted: #64788A;
          --nl-neon: #4FE3C9;
          --nl-gold: #FFC857;
          --font-display: 'Unbounded', 'Avenir Next', sans-serif;
          font-family: 'Space Grotesk', 'Avenir Next', system-ui, sans-serif;
          background-color: var(--nl-ink);
          color: #EAF2F6;
        }
        .night-lights-shell .font-display,
        .night-lights-shell h1,
        .night-lights-shell h2,
        .night-lights-shell h3 {
          font-family: 'Unbounded', 'Avenir Next', sans-serif;
          letter-spacing: -0.01em;
        }
        .night-lights-shell .nl-mono {
          font-family: 'Red Hat Mono', ui-monospace, monospace;
          font-variant-numeric: tabular-nums;
        }
        .night-lights-shell .nl-glow {
          background: linear-gradient(100deg, #FFFFFF 10%, var(--nl-neon) 90%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .night-lights-shell .nl-stars {
          background-image:
            radial-gradient(1.5px 1.5px at 18% 26%, rgba(255,255,255,0.85), transparent 100%),
            radial-gradient(1px 1px at 34% 12%, rgba(255,255,255,0.6), transparent 100%),
            radial-gradient(1.5px 1.5px at 58% 34%, rgba(255,255,255,0.5), transparent 100%),
            radial-gradient(1px 1px at 72% 18%, rgba(255,255,255,0.75), transparent 100%),
            radial-gradient(1px 1px at 86% 30%, rgba(255,255,255,0.45), transparent 100%),
            radial-gradient(1.5px 1.5px at 92% 60%, rgba(255,255,255,0.6), transparent 100%),
            radial-gradient(1px 1px at 8% 70%, rgba(255,255,255,0.5), transparent 100%),
            radial-gradient(1px 1px at 44% 82%, rgba(255,255,255,0.4), transparent 100%),
            radial-gradient(1px 1px at 66% 74%, rgba(255,255,255,0.55), transparent 100%);
          background-size: 260px 260px;
        }
        .night-lights-shell .nl-beams {
          background: conic-gradient(
            from 205deg at 50% -12%,
            transparent 0deg,
            rgba(79, 227, 201, 0.16) 14deg,
            transparent 30deg,
            rgba(255, 200, 87, 0.09) 46deg,
            transparent 66deg,
            rgba(79, 227, 201, 0.1) 84deg,
            transparent 100deg
          );
          filter: blur(2px);
        }
        .night-lights-shell .nl-frame {
          box-shadow:
            0 0 0 1px rgba(79, 227, 201, 0.32),
            0 30px 80px rgba(0, 0, 0, 0.6),
            0 0 70px rgba(79, 227, 201, 0.16);
        }
        .night-lights-shell .nl-sprockets {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0 13px,
            rgba(255, 255, 255, 0.16) 13px 16px
          );
        }
        .night-lights-shell .nl-sign {
          animation: nl-flicker 3.6s ease-in-out infinite;
        }
        @keyframes nl-flicker {
          0%, 100% { opacity: 1; }
          91% { opacity: 1; }
          92% { opacity: 0.55; }
          93% { opacity: 1; }
          96% { opacity: 0.7; }
          97% { opacity: 1; }
        }
        .night-lights-shell footer {
          background: var(--nl-ink-2);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .night-lights-shell footer h3 {
          color: var(--nl-neon) !important;
          letter-spacing: 0.2em !important;
        }
        .night-lights-shell section.border-y {
          border-color: rgba(255, 255, 255, 0.1) !important;
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

        /* ---- Playfield / terminal campus shell ---- */
        .playfield-shell {
          --pf-navy: #0E2E33;
          --pf-navy-2: #153E44;
          --pf-navy-3: #0A2226;
          --pf-brass: var(--primary);
          --pf-brass-dim: var(--primary-dark);
          --pf-ivory: var(--school-paper);
          --pf-ivory-2: #E8DCC0;
          --pf-stub: var(--school-accent);
          --pf-teal: #3E7D78;
          --pf-muted: #5B564A;
          --pf-shadow: rgba(10, 34, 38, 0.28);
          --pf-ease: cubic-bezier(0.16, 1, 0.3, 1);
          --font-display: 'Fraunces', Georgia, serif;
          font-family: 'Work Sans', system-ui, sans-serif;
          color: #1C1A15;
          background: var(--pf-ivory);
          font-size: 1.02rem;
          line-height: 1.65;
        }
        .playfield-shell .font-display,
        .playfield-shell h1,
        .playfield-shell h2,
        .playfield-shell h3 {
          font-family: 'Fraunces', Georgia, serif;
          letter-spacing: -0.02em;
          text-wrap: balance;
          font-weight: 600;
        }
        .playfield-shell .pf-mono {
          font-family: 'Space Mono', ui-monospace, monospace;
          letter-spacing: 0.06em;
          font-variant-numeric: tabular-nums;
        }
        .playfield-shell .pf-stamp {
          font-family: 'Special Elite', 'Courier New', monospace;
          letter-spacing: 0.04em;
        }
        .playfield-shell .pf-tag {
          font-family: 'Space Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--pf-brass);
        }
        .playfield-shell a:focus-visible,
        .playfield-shell button:focus-visible {
          outline: 2px solid var(--pf-brass);
          outline-offset: 3px;
        }
        .playfield-shell .pf-hero {
          background-color: var(--pf-navy);
          background-image: radial-gradient(circle, rgba(199,154,61,0.16) 1.5px, transparent 1.6px);
          background-size: 26px 26px;
        }
        .playfield-shell .pf-hero-dots {
          background-image: radial-gradient(circle, rgba(199,154,61,0.22) 1.4px, transparent 1.5px);
          background-size: 26px 26px;
          mask-image: linear-gradient(105deg, rgba(0,0,0,0.55), transparent 70%);
        }
        .playfield-shell .pf-pass {
          animation: pf-pass-settle 0.95s var(--pf-ease) 0.18s both;
          box-shadow:
            12px 16px 0 rgba(0,0,0,0.22),
            18px 24px 40px rgba(0,0,0,0.35);
        }
        .playfield-shell .pf-pass:hover {
          transform: translateY(-3px);
          transition: transform 0.4s var(--pf-ease);
        }
        .playfield-shell .pf-barcode {
          height: 34px;
          background: repeating-linear-gradient(
            to right,
            #1C1A15 0 2px,
            transparent 2px 5px,
            #1C1A15 5px 6px,
            transparent 6px 10px
          );
        }
        .playfield-shell .pf-board {
          background: #08181A;
          border: 1px solid rgba(199,154,61,0.3);
          border-radius: 6px;
          overflow: hidden;
        }
        .playfield-shell .pf-flap.flip {
          animation: pf-flipflap 0.28s ease;
        }
        .playfield-shell .pf-stamp-card {
          border: 3px double var(--pf-navy-2);
          border-radius: 50% / 38%;
          background: var(--pf-ivory);
          aspect-ratio: 1 / 0.85;
        }
        .playfield-shell .pf-stamp-card:nth-child(1) { transform: rotate(-4deg); }
        .playfield-shell .pf-stamp-card:nth-child(2) { transform: rotate(3deg); }
        .playfield-shell .pf-stamp-card:nth-child(3) { transform: rotate(-2deg); }
        .playfield-shell .pf-stamp-card:nth-child(4) { transform: rotate(4deg); }
        .playfield-shell .pf-ticket {
          box-shadow: 6px 8px 0 var(--pf-shadow);
          transition: transform 0.35s var(--pf-ease), box-shadow 0.35s var(--pf-ease);
        }
        .playfield-shell .pf-ticket:hover {
          transform: translateY(-4px);
          box-shadow: 8px 14px 0 var(--pf-shadow);
        }
        .playfield-shell .pf-luggage {
          box-shadow: 8px 10px 0 rgba(0,0,0,0.3);
        }
        .playfield-shell .pf-luggage::before {
          content: "";
          position: absolute;
          top: -14px;
          left: 24px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 3px solid var(--pf-navy-2);
          background: var(--pf-navy);
        }
        .playfield-shell footer {
          background: var(--pf-navy-3) !important;
        }
        .playfield-shell footer h3 {
          color: var(--pf-brass) !important;
          font-family: 'Space Mono', monospace !important;
          letter-spacing: 0.12em !important;
          text-transform: uppercase;
          font-size: 0.78rem !important;
        }
        .playfield-shell section.border-y {
          background: var(--pf-ivory) !important;
          border-color: rgba(14, 46, 51, 0.12) !important;
        }

        /* ---- Garden Court / walled conservatory shell ---- */
        .garden-court-shell {
          --gc-linen: #F4EFE4;
          --gc-linen-2: #EAE3D4;
          --gc-moss: #5F7D5A;
          --gc-clay: #C17A4A;
          --gc-stone: #8B8578;
          --gc-shade: rgba(36, 48, 40, 0.14);
          --gc-ease: cubic-bezier(0.16, 1, 0.3, 1);
          --font-display: 'Cormorant Garamond', 'Palatino Linotype', Georgia, serif;
          font-family: 'Karla', system-ui, sans-serif;
          color: var(--school-ink);
          background:
            radial-gradient(ellipse 90% 60% at 100% 0%, rgba(95,125,90,0.08), transparent 50%),
            radial-gradient(ellipse 70% 50% at 0% 100%, rgba(193,122,74,0.07), transparent 45%),
            var(--school-paper);
          font-size: 1.05rem;
          line-height: 1.65;
        }
        .garden-court-shell .font-display,
        .garden-court-shell h1,
        .garden-court-shell h2,
        .garden-court-shell h3 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          letter-spacing: -0.02em;
          font-weight: 600;
          text-wrap: balance;
        }
        .garden-court-shell .gc-label {
          font-family: 'Karla', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--gc-clay);
        }
        .garden-court-shell .gc-italic {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-weight: 500;
        }
        .garden-court-shell a:focus-visible,
        .garden-court-shell button:focus-visible {
          outline: 2px solid var(--gc-moss);
          outline-offset: 3px;
        }
        .garden-court-shell .gc-panes {
          background-image:
            linear-gradient(to right, rgba(244,239,228,0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(244,239,228,0.12) 1px, transparent 1px);
          background-size: 20% 33.33%;
        }
        .garden-court-shell .gc-arch {
          border-radius: 999px 999px 12px 12px / 60% 60% 12px 12px;
        }
        .garden-court-shell .gc-label-card {
          animation: pf-pass-settle 0.9s var(--gc-ease) 0.15s both;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.5) inset,
            8px 12px 0 var(--gc-shade),
            14px 20px 36px rgba(36,48,40,0.12);
          background:
            linear-gradient(180deg, #FBF8F1 0%, var(--gc-linen) 100%);
          border: 1px solid rgba(36,48,40,0.14);
        }
        .garden-court-shell .gc-pin {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, #E8C4A8, var(--gc-clay) 60%, #8A4E2E);
          box-shadow: 0 1px 2px rgba(0,0,0,0.35);
        }
        .garden-court-shell .gc-planter {
          background: linear-gradient(165deg, #D4895C 0%, var(--gc-clay) 45%, #A35F38 100%);
          border-radius: 10px 10px 42% 42% / 10px 10px 28% 28%;
          box-shadow:
            inset 0 8px 16px rgba(255,255,255,0.18),
            inset 0 -10px 18px rgba(0,0,0,0.18),
            6px 10px 24px var(--gc-shade);
          transition: transform 0.4s var(--gc-ease);
        }
        .garden-court-shell .gc-planter:hover {
          transform: translateY(-6px);
        }
        .garden-court-shell .gc-specimen {
          background: #FBF8F1;
          border: 1px solid rgba(36,48,40,0.12);
          box-shadow: 4px 6px 0 var(--gc-shade);
          transition: transform 0.35s var(--gc-ease), box-shadow 0.35s var(--gc-ease);
        }
        .garden-court-shell .gc-specimen:hover {
          transform: translateY(-4px) rotate(-0.4deg);
          box-shadow: 6px 12px 0 var(--gc-shade);
        }
        .garden-court-shell .gc-greenhouse-frame {
          background: linear-gradient(180deg, #E8E2D4, #D9D1C0);
          padding: 8px;
          box-shadow:
            inset 0 0 0 1px rgba(36,48,40,0.15),
            6px 10px 28px var(--gc-shade);
        }
        .garden-court-shell .gc-greenhouse-frame img {
          outline: 1px solid rgba(36,48,40,0.1);
        }
        .garden-court-shell .gc-bench {
          background: linear-gradient(180deg, #EFE8DA, #E2DAC8);
          border: 1px solid rgba(36,48,40,0.12);
          box-shadow: 0 8px 28px var(--gc-shade);
        }
        .garden-court-shell footer {
          background:
            radial-gradient(ellipse 60% 50% at 80% 0%, rgba(95,125,90,0.2), transparent 50%),
            var(--school-ink) !important;
        }
        .garden-court-shell footer h3 {
          color: #B8CDB4 !important;
          font-family: 'Karla', sans-serif !important;
          letter-spacing: 0.14em !important;
          text-transform: uppercase;
          font-size: 0.72rem !important;
        }
        .garden-court-shell section.border-y {
          background: var(--gc-linen) !important;
          border-color: rgba(36,48,40,0.1) !important;
        }

        /* ---- Story Scroll / greenhouse journal shell ---- */
        .story-scroll-shell {
          --ss-sage: #EEF0E2;
          --ss-sage-2: #E3E7D3;
          --ss-moss: #2F4A34;
          --ss-moss-2: #3E6247;
          --ss-moss-3: #1F3226;
          --ss-terra: #C1652E;
          --ss-gold: #E3A73F;
          --ss-soil: #4A3728;
          --ss-shadow: rgba(38,48,31,0.2);
          --ss-ease: cubic-bezier(0.16, 1, 0.3, 1);
          --font-display: 'Cormorant Garamond', Georgia, serif;
          font-family: 'Mulish', system-ui, sans-serif;
          color: var(--school-ink);
          background: var(--ss-sage);
          font-size: 1.05rem;
          line-height: 1.65;
          overflow-x: hidden;
        }
        .story-scroll-shell .font-display,
        .story-scroll-shell h1,
        .story-scroll-shell h2,
        .story-scroll-shell h3 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 600;
          letter-spacing: -0.01em;
          text-wrap: balance;
        }
        .story-scroll-shell .ss-mono {
          font-family: 'Courier Prime', 'Courier New', monospace;
        }
        .story-scroll-shell .ss-tag {
          font-family: 'Courier Prime', monospace;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ss-terra);
        }
        .story-scroll-shell .ss-italic {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-weight: 500;
        }
        .story-scroll-shell a:focus-visible,
        .story-scroll-shell button:focus-visible {
          outline: 2px solid var(--ss-terra);
          outline-offset: 3px;
        }
        .story-scroll-shell .ss-vine-track {
          position: fixed;
          top: 0;
          left: 32px;
          width: 4px;
          height: 100%;
          z-index: 90;
          background: rgba(47,74,52,0.15);
          border-radius: 4px;
          pointer-events: none;
        }
        .story-scroll-shell .ss-vine-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 0%;
          background: linear-gradient(to bottom, var(--ss-gold), var(--ss-moss-2));
          border-radius: 4px;
          transition: height 0.08s linear;
        }
        @media (max-width: 980px) {
          .story-scroll-shell .ss-vine-track { left: 14px; }
        }
        @media (max-width: 560px) {
          .story-scroll-shell .ss-vine-track { left: 10px; width: 3px; }
        }
        .story-scroll-shell .ss-pane {
          position: relative;
          background: var(--ss-sage);
          border: 2px solid var(--ss-moss-3);
          border-radius: 6px;
          clip-path: polygon(6% 0, 94% 0, 100% 9%, 100% 100%, 0 100%, 0 9%);
          box-shadow: 0 10px 0 rgba(0,0,0,0.06);
          animation: pf-pass-settle 0.9s var(--ss-ease) 0.12s both;
        }
        .story-scroll-shell .ss-pane-back {
          position: absolute;
          inset: 16px -16px -16px 16px;
          background: var(--ss-moss-3);
          border-radius: 8px;
          clip-path: polygon(8% 0, 92% 0, 100% 10%, 100% 100%, 0 100%, 0 10%);
        }
        .story-scroll-shell .ss-journal {
          border-left: 4px solid var(--ss-terra);
          background: #fff;
          box-shadow: 8px 8px 0 var(--ss-shadow);
          border-radius: 0 6px 6px 0;
        }
        .story-scroll-shell .ss-season {
          background: #fff;
          border: 1.5px solid var(--ss-moss);
          border-radius: 10px;
          transition: transform 0.35s var(--ss-ease), box-shadow 0.35s var(--ss-ease);
        }
        .story-scroll-shell .ss-season:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px var(--ss-shadow);
        }
        .story-scroll-shell .ss-plant-tag {
          background: var(--ss-gold);
          color: var(--ss-moss-3);
          font-family: 'Courier Prime', monospace;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 8px 6px;
          border-radius: 4px 4px 2px 2px;
          text-align: center;
          line-height: 1.3;
        }
        .story-scroll-shell .ss-crate {
          background: #3A5940;
          border: 1px solid rgba(227,167,63,0.35);
          border-radius: 6px;
        }
        .story-scroll-shell .ss-almanac {
          background: #fff;
          border: 1.5px solid var(--ss-moss);
          border-radius: 8px;
          overflow: hidden;
        }
        .story-scroll-shell .ss-bloom {
          background: var(--ss-sage-2);
          border-radius: 8px;
        }
        .story-scroll-shell footer {
          background: var(--ss-moss-3) !important;
        }
        .story-scroll-shell footer h3 {
          color: var(--ss-gold) !important;
          font-family: 'Courier Prime', monospace !important;
          letter-spacing: 0.14em !important;
          text-transform: uppercase;
          font-size: 0.78rem !important;
        }
        .story-scroll-shell section.border-y {
          background: #fff !important;
          border-color: rgba(47,74,52,0.12) !important;
        }

        /* ---- Horizon Board / vinyl conservatory shell ---- */
        .horizon-board-shell {
          --hb-cream: #F4ECD8;
          --hb-cream-2: #EBE0C4;
          --hb-burgundy: #6E2430;
          --hb-burgundy-2: #8C3140;
          --hb-burgundy-3: #4A1620;
          --hb-gold: #C9A227;
          --hb-gold-dim: #8E7420;
          --hb-charcoal: #332720;
          --hb-shadow: rgba(27,21,18,0.22);
          --hb-ease: cubic-bezier(0.16, 1, 0.3, 1);
          --font-display: 'Playfair Display', Georgia, serif;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: var(--school-ink);
          background:
            radial-gradient(ellipse 80% 50% at 100% 0%, rgba(110,36,48,0.07), transparent 50%),
            radial-gradient(ellipse 60% 40% at 0% 100%, rgba(201,162,39,0.06), transparent 45%),
            var(--hb-cream);
          font-size: 1.05rem;
          line-height: 1.65;
          overflow-x: hidden;
        }
        .horizon-board-shell .font-display,
        .horizon-board-shell h1,
        .horizon-board-shell h2,
        .horizon-board-shell h3 {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          letter-spacing: -0.02em;
          text-wrap: balance;
        }
        .horizon-board-shell .hb-mono {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
        }
        .horizon-board-shell .hb-hand {
          font-family: 'Caveat', cursive;
        }
        .horizon-board-shell .hb-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--hb-burgundy);
        }
        .horizon-board-shell .hb-italic {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 600;
        }
        .horizon-board-shell a:focus-visible,
        .horizon-board-shell button:focus-visible {
          outline: 2px solid var(--hb-gold);
          outline-offset: 3px;
        }
        .horizon-board-shell .hb-vinyl-widget {
          position: fixed;
          right: 26px;
          bottom: 26px;
          width: 96px;
          height: 96px;
          z-index: 90;
          filter: drop-shadow(0 10px 18px rgba(0,0,0,0.4));
          pointer-events: none;
        }
        .horizon-board-shell .hb-vinyl-disc {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid var(--hb-gold-dim);
          background: repeating-radial-gradient(circle at center, #1B1512 0 3px, #262019 3px 6px);
          animation: hb-spin 6s linear infinite;
          position: relative;
        }
        .horizon-board-shell .hb-vinyl-disc::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 30%;
          height: 30%;
          border-radius: 50%;
          background: var(--hb-burgundy);
          transform: translate(-50%, -50%);
          border: 2px solid var(--hb-gold);
        }
        .horizon-board-shell .hb-tonearm {
          position: absolute;
          top: -10px;
          right: -14px;
          width: 52px;
          height: 52px;
          transform-origin: 88% 12%;
          transform: rotate(-24deg);
          transition: transform 0.1s linear;
        }
        .horizon-board-shell .hb-tonearm svg { width: 100%; height: 100%; }
        @media (max-width: 980px) {
          .horizon-board-shell .hb-vinyl-widget {
            width: 64px;
            height: 64px;
            right: 14px;
            bottom: 14px;
          }
        }
        .horizon-board-shell .hb-staff {
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0 42px,
            rgba(244,236,216,0.35) 42px 43px,
            transparent 43px 85px
          );
        }
        .horizon-board-shell .hb-label-settle {
          animation: pf-pass-settle 0.95s var(--hb-ease) 0.14s both;
        }
        .horizon-board-shell .hb-label-disc {
          width: min(340px, 86vw);
          aspect-ratio: 1;
          border-radius: 50%;
          position: relative;
          background: var(--school-ink);
          box-shadow:
            10px 18px 0 rgba(27,21,18,0.18),
            0 28px 48px rgba(27,21,18,0.35),
            0 0 0 10px rgba(244,236,216,0.92),
            0 0 0 12px var(--school-ink);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.45s var(--hb-ease);
        }
        .horizon-board-shell .hb-label-disc:hover {
          transform: translateY(-4px) rotate(-1.5deg);
        }
        .horizon-board-shell .hb-label-photo {
          filter: saturate(0.92) contrast(1.05);
        }
        .horizon-board-shell .hb-label-grooves {
          background:
            repeating-radial-gradient(
              circle at center,
              transparent 0 5px,
              rgba(27,21,18,0.45) 5px 6px,
              transparent 6px 11px
            );
          box-shadow: inset 0 0 40px rgba(0,0,0,0.35);
        }
        .horizon-board-shell .hb-label-center {
          width: 58%;
          height: 58%;
          border-radius: 50%;
          background:
            radial-gradient(circle at 30% 28%, rgba(140,49,64,0.95), var(--hb-burgundy) 55%, var(--hb-burgundy-3));
          border: 3px solid var(--hb-gold);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 16px 14px;
          color: var(--hb-cream);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.12),
            0 8px 20px rgba(0,0,0,0.28);
        }
        .horizon-board-shell .hb-notes {
          border: 1px solid rgba(27,21,18,0.12);
          border-top: 3px solid var(--hb-gold);
          background: #fff;
          box-shadow:
            8px 10px 0 rgba(27,21,18,0.12),
            0 16px 32px rgba(27,21,18,0.1);
        }
        .horizon-board-shell .hb-movement {
          border: 1.5px solid var(--school-ink);
          border-radius: 4px;
          background: #fff;
          transition: transform 0.35s var(--hb-ease), box-shadow 0.35s var(--hb-ease);
        }
        .horizon-board-shell .hb-movement:hover {
          transform: translateY(-4px);
          box-shadow:
            6px 10px 0 rgba(27,21,18,0.1),
            0 18px 36px rgba(27,21,18,0.12);
        }
        .horizon-board-shell .hb-score-card {
          border: 1px solid rgba(201,162,39,0.4);
          border-radius: 6px;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,162,39,0.08), transparent 55%),
            #241D17;
          transition: transform 0.35s var(--hb-ease), border-color 0.35s var(--hb-ease);
        }
        .horizon-board-shell .hb-score-card:hover {
          transform: translateY(-3px);
          border-color: rgba(201,162,39,0.7);
        }
        .horizon-board-shell .hb-programme {
          background: #fff;
          border: 1.5px solid var(--school-ink);
          border-radius: 4px;
          overflow: hidden;
          box-shadow:
            6px 8px 0 rgba(27,21,18,0.1),
            0 14px 28px rgba(27,21,18,0.08);
        }
        .horizon-board-shell .hb-programme .group:hover h4 {
          color: var(--hb-burgundy);
        }
        .horizon-board-shell .hb-liner {
          background:
            radial-gradient(ellipse 70% 50% at 100% 0%, rgba(201,162,39,0.18), transparent 50%),
            var(--hb-burgundy);
          color: var(--hb-cream);
          border-radius: 6px;
          box-shadow:
            6px 8px 0 rgba(27,21,18,0.16),
            0 16px 32px rgba(27,21,18,0.14);
          transition: transform 0.35s var(--hb-ease);
        }
        .horizon-board-shell .hb-liner:hover {
          transform: translateY(-3px);
        }
        .horizon-board-shell footer {
          background:
            radial-gradient(ellipse 50% 40% at 80% 0%, rgba(201,162,39,0.12), transparent 50%),
            var(--hb-burgundy-3) !important;
        }
        .horizon-board-shell footer h3 {
          color: var(--hb-gold) !important;
          font-family: 'JetBrains Mono', monospace !important;
          letter-spacing: 0.14em !important;
          text-transform: uppercase;
          font-size: 0.78rem !important;
        }
        .horizon-board-shell section.border-y {
          background: #fff !important;
          border-color: rgba(27,21,18,0.12) !important;
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
          .playfield-shell .pf-pass,
          .playfield-shell .pf-flap.flip { animation: none !important; }
          .playfield-shell .pf-ticket:hover,
          .playfield-shell .pf-pass:hover { transform: none; }
          .garden-court-shell .gc-label-card { animation: none !important; }
          .garden-court-shell .gc-planter:hover,
          .garden-court-shell .gc-specimen:hover { transform: none; }
          .story-scroll-shell .ss-pane { animation: none !important; }
          .story-scroll-shell .ss-season:hover { transform: none; }
          .story-scroll-shell .ss-vine-fill { transition: none; }
          .horizon-board-shell .hb-vinyl-disc { animation: none !important; }
          .horizon-board-shell .hb-label-settle { animation: none !important; }
          .horizon-board-shell .hb-label-disc:hover,
          .horizon-board-shell .hb-movement:hover,
          .horizon-board-shell .hb-score-card:hover,
          .horizon-board-shell .hb-liner:hover { transform: none; }
        }
      `,
        }}
      />
    </>
  )
}

/** Fixed growing-vine scroll progress for Story Scroll. */
export function StoryScrollVine() {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const el = fillRef.current
      if (!el) return
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0
      el.style.height = `${Math.min(100, Math.max(0, pct))}%`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="ss-vine-track" aria-hidden>
      <div ref={fillRef} className="ss-vine-fill" />
    </div>
  )
}

/** Fixed vinyl + tonearm that tracks scroll for Horizon Board. */
export function HorizonVinyl() {
  const armRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const el = armRef.current
      if (!el) return
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const pct = max > 0 ? h.scrollTop / max : 0
      const angle = -24 + Math.min(1, Math.max(0, pct)) * 40
      el.style.transform = `rotate(${angle}deg)`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="hb-vinyl-widget" aria-hidden>
      <div className="hb-vinyl-disc" />
      <div ref={armRef} className="hb-tonearm">
        <svg viewBox="0 0 52 52">
          <line
            x1="46"
            y1="6"
            x2="10"
            y2="40"
            stroke="#C9A227"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="46" cy="6" r="5" fill="#C9A227" />
          <circle cx="10" cy="40" r="3" fill="#1B1512" />
        </svg>
      </div>
    </div>
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

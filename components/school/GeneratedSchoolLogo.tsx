'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'
import { getSchoolColor, getSchoolInitials } from '@/lib/schoolLogo'

type GeneratedSchoolLogoProps = {
  /** Use the same key as sidebar: `getLayoutSchoolName(subdomain)` */
  schoolKey: string
  className?: string
}

/**
 * Academic shield mark — book, torch, monogram initials.
 * Shared by dashboard sidebar, fee letters, and portals.
 */
export function GeneratedSchoolLogo({
  schoolKey,
  className = 'w-12 h-12',
}: GeneratedSchoolLogoProps) {
  const initials = getSchoolInitials(schoolKey)
  const { from, to } = getSchoolColor(schoolKey)
  const uid = useId().replace(/:/g, '')
  const gradId = `shield-${uid}`
  const goldId = `gold-${uid}`

  return (
    <div
      className={cn('relative shrink-0', className)}
      role="img"
      aria-label={`${schoolKey.replace(/-/g, ' ')} school crest`}
    >
      <svg
        viewBox="0 0 88 96"
        className="h-full w-full drop-shadow-md"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <linearGradient id={goldId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FAF0DC" />
            <stop offset="100%" stopColor="#C9A227" />
          </linearGradient>
        </defs>

        {/* Shield */}
        <path
          d="M44 3 L73 13.5 L77.5 43 C77.5 63 61.5 79.5 44 88 C26.5 79.5 10.5 63 10.5 43 L15 13.5 Z"
          fill={`url(#${gradId})`}
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M44 11 L67 19.5 L70.5 43 C70.5 59 57.5 72 44 78.5 C30.5 72 17.5 59 17.5 43 L21 19.5 Z"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
        />

        {/* Laurel hints */}
        <path
          d="M22 38 C18 32 16 26 18 20"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M66 38 C70 32 72 26 70 20"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Torch */}
        <path
          d="M44 16 C39 23 37.5 27.5 44 33.5 C50.5 27.5 49 23 44 16 Z"
          fill="#FCD34D"
          stroke="#F59E0B"
          strokeWidth="0.5"
        />
        <rect
          x="41.5"
          y="32"
          width="5"
          height="9"
          rx="1"
          fill={`url(#${goldId})`}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.4"
        />

        {/* Monogram */}
        <text
          x="44"
          y="56"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize={initials.length > 2 ? '16' : '22'}
          fontWeight="700"
          fontFamily="Figtree, sans-serif"
          letterSpacing="0.06em"
        >
          {initials}
        </text>

        {/* Open book */}
        <path
          d="M30 70.5 C34 67.5 39 66 44 65 C49 66 54 67.5 58 70.5 L58 76.5 C54 79 49 80.5 44 81 C39 80.5 34 79 30 76.5 Z"
          fill="rgba(255,255,255,0.92)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="0.6"
        />
        <path
          d="M44 65 L44 81"
          stroke={to}
          strokeWidth="0.9"
          opacity="0.55"
        />
        <path
          d="M34 72 L44 68.5 L54 72"
          fill="none"
          stroke={to}
          strokeWidth="0.6"
          opacity="0.4"
        />
        <path
          d="M35 74.5 L44 71.5 L53 74.5"
          fill="none"
          stroke={to}
          strokeWidth="0.5"
          opacity="0.35"
        />
      </svg>
    </div>
  )
}

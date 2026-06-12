'use client'

import { GeneratedSchoolLogo } from '@/components/school/GeneratedSchoolLogo'
import { getLayoutSchoolName, getSchoolColor } from '@/lib/schoolLogo'

interface DynamicLogoProps {
  subdomain: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  /** Passed to `GeneratedSchoolLogo` when multiple marks appear on one page. */
  logoInstance?: string
}

const sizeClasses = {
  sm: 'w-9 aspect-[88/96]',
  md: 'w-14 aspect-[88/96]',
  lg: 'w-20 aspect-[88/96]',
}

export const DynamicLogo = ({
  subdomain,
  size = 'md',
  showText = true,
  className = '',
  logoInstance,
}: DynamicLogoProps) => {
  const schoolKey = getLayoutSchoolName(subdomain)
  const { from: fromColor, to: toColor } = getSchoolColor(schoolKey)

  return (
    <div className={`flex items-center gap-3 group relative ${className}`}>
      <div className="relative transform transition-all duration-300 ease-out group-hover:scale-105 group-hover:rotate-2">
        <GeneratedSchoolLogo
          schoolKey={schoolKey}
          className={sizeClasses[size]}
          instance={logoInstance}
        />
        <div
          className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${fromColor}, ${toColor})`,
          }}
        />
      </div>

      {showText ? (
        <div className="relative py-0.5">
          <span className="font-bold text-sm tracking-wide text-slate-900 dark:text-slate-100 relative group-hover:translate-x-1 transition-all duration-300">
            {getLayoutSchoolName(subdomain)}
            <div
              className="absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
              style={{
                background: `linear-gradient(to right, ${fromColor}, ${toColor})`,
              }}
            />
          </span>
        </div>
      ) : null}
    </div>
  )
}

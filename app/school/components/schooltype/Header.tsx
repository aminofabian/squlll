'use client'

import React from 'react'
import Link from 'next/link'
import { SqulWordmark } from '@/components/brand/SqulMark'

interface HeaderProps {
  subdomain: string
  currentStep: number
  totalSteps: number
  badgeLabel?: string
}

export const Header: React.FC<HeaderProps> = ({
  subdomain,
  currentStep,
  totalSteps,
  badgeLabel = 'School setup',
}) => {
  const label = subdomain
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return (
    <header className="border-b border-[#14201b]/10">
      <div className="mx-auto flex max-w-[84rem] items-center justify-between gap-6 px-6 py-5 lg:px-10">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/" aria-label="SQUL home" className="transition-opacity hover:opacity-70">
            <SqulWordmark markSize={28} />
          </Link>
          <span className="h-4 w-px shrink-0 bg-[#14201b]/15" aria-hidden />
          <div className="min-w-0">
            <p className="truncate text-[0.8125rem] font-medium leading-none text-[#14201b]">
              {label}
            </p>
            <p className="mt-1.5 text-[0.5625rem] uppercase tracking-[0.18em] text-[#7c857d]">
              {badgeLabel}
            </p>
          </div>
        </div>
        <p className="shrink-0 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-[#7c857d]">
          Step {currentStep} <span className="text-[#14201b]/25">/ {totalSteps}</span>
        </p>
      </div>
    </header>
  )
}

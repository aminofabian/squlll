import React from 'react'
import type { LucideIcon } from 'lucide-react'

export function HeroChip({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ring-white/20 backdrop-blur-sm print:bg-transparent print:ring-border">
      <Icon className="size-3 opacity-80" />
      {children}
    </span>
  )
}

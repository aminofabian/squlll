'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FEES_BRAND } from '../../lib/fees-ui'

interface WizardProgressProps {
    currentStep: number
    steps: { number: number; title: string }[]
    /** Step number auto-completed when user skips it (e.g. guided setup skips Amounts) */
    skippedStep?: number
}

export const WizardProgress = ({
    currentStep,
    steps,
    skippedStep,
}: WizardProgressProps) => (
    <ol className="flex items-center justify-between gap-1 rounded-xl border border-slate-200 bg-white p-2">
        {steps.map((step) => {
            const done =
                step.number < currentStep ||
                (skippedStep != null &&
                    step.number === skippedStep &&
                    currentStep > skippedStep)
            const current = step.number === currentStep
            return (
                <li
                    key={step.number}
                    className={cn(
                        'flex flex-1 min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-2 transition-colors',
                        current && 'bg-emerald-50',
                        !current && !done && 'opacity-60',
                    )}
                >
                    <span
                        className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                            done && 'bg-emerald-600 text-white',
                            current && 'text-white',
                            !done && !current && 'bg-slate-100 text-slate-500',
                        )}
                        style={
                            current
                                ? { backgroundColor: FEES_BRAND.primary }
                                : undefined
                        }
                    >
                        {done ? <Check className="h-3.5 w-3.5" /> : step.number}
                    </span>
                    <span
                        className={cn(
                            'hidden truncate text-xs font-medium sm:inline',
                            current ? 'text-emerald-900' : 'text-slate-600',
                        )}
                    >
                        {step.title}
                    </span>
                </li>
            )
        })}
    </ol>
)

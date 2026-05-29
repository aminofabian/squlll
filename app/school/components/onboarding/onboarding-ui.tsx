'use client'

import { useId, useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  buildDisabledMatchers,
  CalendarPopoverHeader,
  OnboardingCalendar,
  parseIsoDate,
  toIsoDate,
} from './onboarding-calendar'

export const ONBOARDING_BRAND = {
  primary: '#246a59',
  primaryDark: '#1a4d42',
  primaryLight: '#e8f2ef',
}

export function OnboardingShell({
  subdomain,
  currentStep,
  totalSteps,
  steps,
  children,
  onBack,
  onSkip,
  skipLabel = 'Skip',
  onContinue,
  continueLabel = 'Continue',
  showSkip = true,
  isContinueDisabled = false,
  isLoading = false,
}: {
  subdomain: string
  currentStep: number
  totalSteps: number
  steps: { id: number; name: string; description: string }[]
  children: React.ReactNode
  onBack: () => void
  onSkip?: () => void
  skipLabel?: string
  onContinue: () => void
  continueLabel?: string
  showSkip?: boolean
  isContinueDisabled?: boolean
  isLoading?: boolean
}) {
  const schoolLabel = subdomain
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const progress = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f6] dark:bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:bg-slate-900/90 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-[#246a59] to-[#1a4d42] flex items-center justify-center shadow-sm">
              <span className="text-sm font-bold text-white">
                {subdomain.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {schoolLabel}
              </p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wide">Getting started</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Step {currentStep} of {totalSteps}
            </span>
            <div className="h-2 w-16 sm:w-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#246a59] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
        <OnboardingStepper steps={steps} currentStep={currentStep} />
        <div className="mt-6 sm:mt-8 rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none overflow-hidden">
          {children}
        </div>
      </main>

      <footer className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200/80 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={currentStep === 1}
            className="text-slate-600"
          >
            <ChevronLeft className="h-4 w-4 mr-0.5" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {showSkip && onSkip && (
              <Button type="button" variant="ghost" size="sm" onClick={onSkip} className="text-slate-500">
                {skipLabel}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={onContinue}
              disabled={isContinueDisabled || isLoading}
              className="min-w-[120px] max-w-[min(100%,14rem)] rounded-lg bg-[#246a59] hover:bg-[#1a4d42] text-white shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span className="truncate">{continueLabel}</span>
                </>
              ) : (
                <>
                  {continueLabel}
                  <ChevronRight className="h-4 w-4 ml-1 shrink-0" />
                </>
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function OnboardingStepper({
  steps,
  currentStep,
}: {
  steps: { id: number; name: string; description: string }[]
  currentStep: number
}) {
  return (
    <nav aria-label="Setup progress" className="overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      <ol className="flex gap-1 min-w-max sm:min-w-0 sm:justify-between">
        {steps.map((step) => {
          const isActive = step.id === currentStep
          const isDone = step.id < currentStep
          return (
            <li
              key={step.id}
              className={cn(
                'flex flex-col items-center flex-1 min-w-[72px] sm:min-w-0 px-1',
                !isActive && !isDone && 'opacity-50',
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isDone && 'bg-[#246a59] text-white',
                  isActive && 'bg-[#246a59] text-white ring-4 ring-[#246a59]/20',
                  !isActive && !isDone && 'bg-slate-100 text-slate-500 dark:bg-slate-800',
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={cn(
                  'mt-2 text-[11px] font-medium text-center leading-tight',
                  isActive ? 'text-[#246a59]' : 'text-slate-600 dark:text-slate-400',
                )}
              >
                {step.name}
              </span>
              <span className="text-[10px] text-slate-400 text-center hidden sm:block mt-0.5 max-w-[88px] leading-snug">
                {step.description}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function StepIntro({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-[#f8fbfb] to-white dark:from-slate-900 dark:to-slate-900">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#246a59]/10 text-[#246a59]">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}

export function StepBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 sm:px-8 py-6 sm:py-7', className)}>{children}</div>
}

export function PresetOption({
  selected,
  onClick,
  title,
  subtitle,
  icon: Icon,
  badge,
}: {
  selected?: boolean
  onClick: () => void
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-start text-left w-full rounded-xl border-2 p-4 transition-all',
        'hover:border-[#246a59]/40 hover:bg-[#246a59]/[0.03]',
        selected
          ? 'border-[#246a59] bg-[#246a59]/5 ring-1 ring-[#246a59]/20'
          : 'border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30',
      )}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-[10px] font-medium uppercase tracking-wide text-[#246a59] bg-[#246a59]/10 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-600 mb-3">
        <Icon className="h-4 w-4 text-[#246a59]" />
      </div>
      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{subtitle}</span>
    </button>
  )
}

export function FieldGroup({
  label,
  htmlFor,
  hint,
  children,
}: {
  label?: string
  htmlFor?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export const onboardingInputClass =
  'h-11 rounded-lg border-slate-200 bg-white focus-visible:ring-[#246a59]/30 dark:border-slate-700 dark:bg-slate-900'

function formatDateHint(iso: string) {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return null
  }
}

export type DateFieldProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  compact?: boolean
  showHint?: boolean
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export function DateField({
  id: idProp,
  value,
  onChange,
  min,
  max,
  compact = false,
  showHint = true,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}: DateFieldProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const [open, setOpen] = useState(false)
  const selected = parseIsoDate(value)
  const hint = value && showHint ? formatDateHint(value) : null
  const disabledMatchers = buildDisabledMatchers(min, max)
  const displayLabel = selected
    ? format(selected, compact ? 'dd MMM yyyy' : 'EEE, d MMM yyyy')
    : compact
      ? 'Date'
      : 'Select date'

  const handleSelect = (date: Date | undefined) => {
    onChange(toIsoDate(date))
    if (date) setOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-label={ariaLabel ?? 'Choose date'}
            aria-expanded={open}
            className={cn(
              'relative flex w-full items-center rounded-lg border bg-white text-left transition-all',
              'dark:bg-slate-900',
              disabled && 'opacity-50 pointer-events-none',
              value
                ? 'border-[#246a59]/35 ring-1 ring-[#246a59]/10'
                : 'border-slate-200 dark:border-slate-700',
              'hover:border-slate-300 dark:hover:border-slate-600',
              open && 'border-[#246a59]/50 ring-2 ring-[#246a59]/20',
              compact ? 'h-10 pl-10 pr-2' : 'h-11 pl-12 pr-3',
            )}
          >
            <span
              className={cn(
                'pointer-events-none absolute flex items-center justify-center rounded-md',
                'bg-[#246a59]/8 text-[#246a59]',
                compact ? 'left-1.5 h-7 w-7' : 'left-2 h-8 w-8',
              )}
              aria-hidden
            >
              <CalendarIcon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            </span>
            <span
              className={cn(
                'truncate text-sm font-medium',
                value ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400',
              )}
            >
              {displayLabel}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-auto p-0 rounded-xl border border-slate-200/90 shadow-xl shadow-slate-200/60 dark:border-slate-700 overflow-hidden"
        >
          {!compact && <CalendarPopoverHeader label="Select date" value={selected} />}
          <OnboardingCalendar
            selected={selected}
            onSelect={handleSelect}
            disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
            defaultMonth={selected ?? (min ? parseIsoDate(min) : undefined) ?? new Date()}
          />
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 px-3 py-2 bg-slate-50/80 dark:bg-slate-800/50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-slate-500 hover:text-slate-800"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-[#246a59] hover:text-[#1a4d42] hover:bg-[#246a59]/10"
              onClick={() => {
                const today = new Date()
                today.setHours(12, 0, 0, 0)
                const iso = toIsoDate(today)
                if (min && iso < min) return
                if (max && iso > max) return
                onChange(iso)
                setOpen(false)
              }}
            >
              Today
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {hint && (
        <p className="mt-1 pl-1 text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>
      )}
    </div>
  )
}

export function OnboardingStep({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <>
      <StepIntro icon={icon} title={title} description={description} />
      <StepBody>{children}</StepBody>
    </>
  )
}

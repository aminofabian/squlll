'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SqulWordmark } from '@/components/brand/SqulMark'
import { cn } from '@/lib/utils'
import {
  buildDisabledMatchers,
  CalendarPopoverHeader,
  OnboardingCalendar,
  parseIsoDate,
  toIsoDate,
} from './onboarding-calendar'

export const ONBOARDING_BRAND = {
  primary: '#1c3d32',
  primaryDark: '#0d201a',
  primaryLight: '#efeadd',
  ink: '#14201b',
  paper: '#f7f4ec',
}

function formatSchoolLabel(subdomain: string) {
  return subdomain
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
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
  const schoolLabel = formatSchoolLabel(subdomain)
  const progress = ((currentStep - 1) / (totalSteps - 1 || 1)) * 100
  const activeStep = steps.find((s) => s.id === currentStep)
  const canSkip = Boolean(showSkip && onSkip)

  return (
    <div className="onboarding-flow relative flex min-h-screen flex-col bg-[#f7f4ec] font-sans text-[#14201b]">
      {/* Warm paper wash — keeps the canvas from feeling flat. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(72rem_46rem_at_88%_-12%,rgba(216,201,171,0.22),transparent_62%)]"
      />

      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">
        {/* ── Left rail: orientation ───────────────────────────────── */}
        <aside className="relative hidden shrink-0 flex-col bg-[#0d201a] text-[#f7f4ec] lg:flex lg:w-[21rem] xl:w-[23rem]">
          <div className="flex flex-col px-9 pt-9 xl:px-11">
            <Link href="/" aria-label="SQUL home" className="w-fit transition-opacity hover:opacity-70">
              <SqulWordmark tone="light" markSize={28} />
            </Link>

            <div className="mt-9 border-t border-white/10 pt-6">
              <p className="text-[0.5625rem] uppercase tracking-[0.24em] text-white/40">
                Setting up
              </p>
              <p className="mt-2.5 truncate font-display text-[1.75rem] leading-none tracking-[-0.02em] text-white">
                {schoolLabel}
              </p>
              <p className="mt-2 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-white/30">
                {subdomain}.squl.co.ke
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[0.5625rem] uppercase tracking-[0.2em] text-white/40">
                  Step {currentStep} of {totalSteps}
                </p>
                <p className="font-mono text-[0.5625rem] tabular-nums text-white/40">
                  {Math.round(progress)}%
                </p>
              </div>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#d8c9ab] transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.max(progress, 3)}%` }}
                />
              </div>
            </div>

            <nav aria-label="Setup progress" className="mt-7">
              <ol className="space-y-1">
                {steps.map((step) => {
                  const isActive = step.id === currentStep
                  const isDone = step.id < currentStep
                  return (
                    <li key={step.id}>
                      <div
                        className={cn(
                          'flex items-start gap-3.5 rounded-lg px-2.5 py-2.5 transition-colors',
                          isActive && 'bg-white/[0.06]',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[0.5625rem] tabular-nums transition-colors',
                            isDone
                              ? 'border-[#d8c9ab]/45 bg-[#d8c9ab]/10 text-[#d8c9ab]'
                              : isActive
                                ? 'border-[#d8c9ab] bg-[#d8c9ab] text-[#0d201a]'
                                : 'border-white/15 text-white/30',
                          )}
                        >
                          {isDone ? (
                            <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                          ) : (
                            String(step.id).padStart(2, '0')
                          )}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              'text-[0.8125rem] leading-tight transition-colors',
                              isActive
                                ? 'font-medium text-white'
                                : isDone
                                  ? 'text-white/60'
                                  : 'text-white/35',
                            )}
                          >
                            {step.name}
                          </p>
                          <p
                            className={cn(
                              'mt-1 text-[0.6875rem] leading-snug',
                              isActive ? 'text-[#d8c9ab]/80' : 'text-white/25',
                            )}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </nav>
          </div>

          <div className="mt-auto border-t border-white/10 px-9 py-7 text-[0.6875rem] leading-relaxed text-white/35">
            Set your calendar once — fees, timetables, and reports all depend on it.
          </div>
        </aside>

        {/* ── Main column ──────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile header */}
          <header className="sticky top-0 z-30 border-b border-[#14201b]/10 bg-[#f7f4ec]/95 backdrop-blur-md lg:hidden">
            <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
              <SqulWordmark markSize={24} />
              <span className="h-4 w-px bg-[#14201b]/15" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8125rem] font-medium text-[#14201b]">
                  {schoolLabel}
                </p>
                <p className="mt-0.5 truncate text-[0.625rem] uppercase tracking-[0.14em] text-[#7c857d]">
                  Step {currentStep} of {totalSteps}
                  {activeStep ? ` · ${activeStep.name}` : ''}
                </p>
              </div>
            </div>
            <div className="h-1 w-full bg-[#14201b]/10">
              <div
                className="h-full bg-[#1c3d32] transition-[width] duration-500 ease-out"
                style={{ width: `${Math.max(progress, 4)}%` }}
              />
            </div>
          </header>

          <main className="w-full flex-1 px-4 pb-40 pt-5 sm:px-6 lg:px-12 lg:pt-10">
            <div className="mx-auto w-full max-w-[44rem]">
              {/* Step meta + the single secondary escape hatch (skip). */}
              <div className="mb-4 flex min-h-9 items-center justify-between gap-3">
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[#1c3d32]/70">
                  Step {String(currentStep).padStart(2, '0')}
                  <span className="ml-2 font-normal tracking-normal text-[#14201b]/30">
                    / {String(totalSteps).padStart(2, '0')}
                  </span>
                  {activeStep ? (
                    <span className="ml-3 hidden font-normal normal-case tracking-normal text-[#14201b]/50 sm:inline">
                      {activeStep.name}
                    </span>
                  ) : null}
                </p>

                {canSkip ? (
                  <button
                    type="button"
                    onClick={onSkip}
                    className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md px-1.5 text-[0.75rem] font-medium text-[#4d574f] transition-colors hover:text-[#14201b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c3d32]/25"
                  >
                    {skipLabel}
                    <ChevronRight className="h-3 w-3" aria-hidden />
                  </button>
                ) : null}
              </div>

              <div
                key={currentStep}
                className="overflow-hidden rounded-2xl border border-[#14201b]/12 bg-[#fffdf7] shadow-[0_24px_60px_-40px_rgba(20,32,27,0.45)] animate-in fade-in slide-in-from-bottom-1 duration-300"
              >
                {children}
              </div>

              <p className="mt-4 text-center text-[0.625rem] leading-relaxed text-[#14201b]/35 lg:text-left">
                Nothing here is permanent — you can change it later from your dashboard.
              </p>
            </div>
          </main>

          {/* ── Footer: one primary action only ────────────────────── */}
          <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-[#14201b]/10 bg-[#f7f4ec]/95 backdrop-blur-md lg:left-[21rem] xl:left-[23rem]">
            <div className="mx-auto flex w-full max-w-[44rem] items-center gap-2 px-4 py-3 sm:px-6 lg:px-12">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onBack}
                disabled={currentStep === 1}
                className="h-12 shrink-0 rounded-lg px-3 text-[0.8125rem] font-medium text-[#4d574f] hover:bg-[#14201b]/[0.05] hover:text-[#14201b] disabled:opacity-30 sm:px-4"
              >
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
                Back
              </Button>

              <div className="ml-auto flex flex-1 items-center justify-end gap-4 sm:flex-none">
                <p
                  className="hidden font-mono text-[0.625rem] uppercase tabular-nums tracking-[0.14em] text-[#14201b]/35 sm:block"
                  aria-live="polite"
                >
                  {currentStep} / {totalSteps}
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={onContinue}
                  disabled={isContinueDisabled || isLoading}
                  className="h-12 w-full rounded-lg bg-[#14201b] px-6 text-[0.875rem] font-semibold text-[#f7f4ec] shadow-[0_10px_24px_-14px_rgba(20,32,27,0.8)] transition-colors hover:bg-[#1c3d32] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c3d32]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f4ec] disabled:bg-[#14201b]/15 disabled:text-[#14201b]/40 disabled:shadow-none sm:w-auto sm:min-w-[11.5rem]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                      <span className="truncate">{continueLabel}</span>
                    </>
                  ) : (
                    <>
                      <span className="truncate">{continueLabel}</span>
                      <ChevronRight className="ml-1 h-4 w-4 shrink-0" aria-hidden />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact horizontal stepper — kept for the deprecated `OnboardingStepper`
 * export and any external consumers.
 */
function OnboardingStepperMobile({
  steps,
  currentStep,
}: {
  steps: { id: number; name: string; description: string }[]
  currentStep: number
}) {
  return (
    <nav aria-label="Setup progress">
      <ol className="flex min-w-max items-center gap-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isDone = step.id < currentStep
          return (
            <li key={step.id} className="flex items-center gap-2">
              {index > 0 && (
                <span
                  className={cn(
                    'h-px w-4',
                    isDone || isActive ? 'bg-[#1c3d32]/30' : 'bg-[#14201b]/10',
                  )}
                  aria-hidden
                />
              )}
              <div
                className={cn(
                  'flex items-center gap-1.5 py-1 text-[0.625rem] font-medium transition-colors',
                  isActive && 'text-[#14201b]',
                  isDone && 'text-[#4d574f]',
                  !isActive && !isDone && 'text-[#14201b]/30',
                )}
              >
                <span className="font-mono tabular-nums">
                  {String(step.id).padStart(2, '0')}
                </span>
                <span className={cn(!isActive && 'hidden sm:inline')}>{step.name}</span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** @deprecated Prefer the vertical rail inside `OnboardingShell` */
export function OnboardingStepper({
  steps,
  currentStep,
}: {
  steps: { id: number; name: string; description: string }[]
  currentStep: number
}) {
  return <OnboardingStepperMobile steps={steps} currentStep={currentStep} />
}

export function StepIntro({
  icon: Icon,
  title,
  description,
  compact = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  description?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'border-b border-[#14201b]/10 bg-[#fcfaf4]',
        compact ? 'px-6 pb-4 pt-5' : 'px-6 pb-6 pt-7 sm:px-9 sm:pb-7 sm:pt-8',
      )}
    >
      <div className={cn('flex items-start', compact ? 'gap-3' : 'gap-4')}>
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-xl border border-[#1c3d32]/15 bg-[#1c3d32]/[0.05] text-[#1c3d32]',
            compact ? 'h-8 w-8' : 'h-11 w-11',
          )}
        >
          <Icon
            className={compact ? 'h-4 w-4' : 'h-5 w-5'}
            strokeWidth={1.75}
          />
        </span>
        <div className="min-w-0 pt-0.5">
          <h2
            className={cn(
              'font-display tracking-[-0.02em] text-[#14201b]',
              compact
                ? 'text-lg leading-tight'
                : 'text-[1.7rem] leading-[1.1] sm:text-[1.9rem]',
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                'max-w-[58ch] leading-relaxed text-[#4d574f]',
                compact ? 'mt-1 text-xs' : 'mt-2 text-sm',
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function StepBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-6 py-7 sm:px-9 sm:py-8', className)}>{children}</div>
  )
}

export function PresetOption({
  selected,
  onClick,
  title,
  subtitle,
  icon: Icon,
  visual,
  badge,
}: {
  selected?: boolean
  onClick: () => void
  title: string
  subtitle: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
  visual?: React.ReactNode
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group relative flex min-h-[4.75rem] w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c3d32]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffdf7]',
        selected
          ? 'border-[#1c3d32] bg-[#1c3d32]/[0.055] shadow-[inset_0_0_0_1px_rgba(28,61,50,0.35)]'
          : 'border-[#14201b]/12 bg-white/70 hover:border-[#14201b]/25 hover:bg-white',
      )}
    >
      {visual ? (
        visual
      ) : Icon ? (
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors',
            selected
              ? 'border-[#1c3d32] bg-[#1c3d32] text-[#f7f4ec]'
              : 'border-[#14201b]/10 bg-[#f7f4ec] text-[#1c3d32]',
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-[#14201b]">{title}</span>
          {badge ? (
            <span className="rounded-full bg-[#efeadd] px-2 py-0.5 text-[0.5rem] font-semibold uppercase tracking-[0.14em] text-[#7c857d]">
              {badge}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-xs leading-snug text-[#4d574f]">
          {subtitle}
        </span>
      </span>

      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
          selected ? 'border-[#1c3d32] bg-[#1c3d32] text-white' : 'border-[#14201b]/20',
        )}
        aria-hidden
      >
        {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
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
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#4d574f]"
        >
          {label}
        </label>
      )}
      {children}
      {hint && (
        <p className="text-xs leading-relaxed text-[#7c857d]">{hint}</p>
      )}
    </div>
  )
}

export const onboardingInputClass =
  'h-12 rounded-lg border-[#14201b]/15 bg-white/80 text-[0.9375rem] text-[#14201b] shadow-none placeholder:text-[#14201b]/30 focus-visible:border-[#1c3d32] focus-visible:ring-2 focus-visible:ring-[#1c3d32]/15 dark:border-white/15 dark:bg-[#071411]'

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
      ? 'Pick date'
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
              'relative flex w-full items-center rounded-lg border bg-white/80 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c3d32]/20',
              disabled && 'pointer-events-none opacity-50',
              value ? 'border-[#1c3d32]/35' : 'border-[#14201b]/15',
              'hover:border-[#14201b]/35',
              open && 'border-[#1c3d32] ring-2 ring-[#1c3d32]/10',
              compact ? 'h-11 pl-10 pr-3' : 'h-12 pl-11 pr-3',
            )}
          >
            <span
              className={cn(
                'pointer-events-none absolute left-0 flex items-center justify-center border-r border-[#14201b]/10 text-[#1c3d32]',
                compact ? 'h-10 w-9' : 'h-11 w-10',
              )}
              aria-hidden
            >
              <CalendarIcon
                className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}
                strokeWidth={1.5}
              />
            </span>
            <span
              className={cn(
                'truncate text-[0.875rem]',
                value ? 'text-[#14201b]' : 'text-[#14201b]/35',
              )}
            >
              {displayLabel}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-auto overflow-hidden rounded-xl border border-[#14201b]/15 p-0 shadow-[0_24px_60px_-30px_rgba(20,32,27,0.4)]"
        >
          {!compact && <CalendarPopoverHeader label="Select date" value={selected} />}
          <OnboardingCalendar
            selected={selected}
            onSelect={handleSelect}
            disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
            defaultMonth={selected ?? (min ? parseIsoDate(min) : undefined) ?? new Date()}
          />
          <div className="flex items-center justify-between gap-2 border-t border-[#14201b]/10 bg-[#efeadd] px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 rounded-lg px-3 text-xs text-[#4d574f] hover:bg-transparent hover:text-[#14201b]"
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
              className="h-9 rounded-lg px-3 text-xs text-[#1c3d32] hover:bg-[#1c3d32]/8 hover:text-[#14201b]"
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
        <p className="mt-1.5 pl-0.5 text-[0.6875rem] uppercase tracking-[0.08em] text-[#7c857d]">
          {hint}
        </p>
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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
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

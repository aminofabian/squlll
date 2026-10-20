'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
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

  return (
    <div className="onboarding-flow relative flex min-h-screen flex-col bg-[#f7f4ec] font-sans text-[#14201b]">
      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">
        {/* Left index — desktop */}
        <aside className="hidden shrink-0 flex-col justify-between bg-[#0d201a] text-[#f7f4ec] lg:flex lg:w-[21rem] xl:w-[23rem]">
          <div className="flex flex-col px-9 pt-10 xl:px-11">
            <Link href="/" aria-label="SQUL home" className="w-fit transition-opacity hover:opacity-70">
              <SqulWordmark tone="light" markSize={28} />
            </Link>

            <div className="mt-10 border-t border-white/10 pt-7">
              <p className="text-[0.5625rem] uppercase tracking-[0.22em] text-white/35">
                School setup
              </p>
              <p className="mt-3 truncate font-display text-[1.9rem] leading-none tracking-[-0.02em] text-white">
                {schoolLabel}
              </p>
              <p className="mt-2.5 font-mono text-[0.5625rem] uppercase tracking-[0.1em] text-white/30">
                {subdomain}.squl.co.ke
              </p>
            </div>

            <div className="mt-10">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[0.5625rem] uppercase tracking-[0.2em] text-white/35">
                  Progress
                </p>
                <p className="font-mono text-[0.5625rem] tabular-nums text-white/40">
                  {String(currentStep).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
                </p>
              </div>
              <div className="mt-3 h-px w-full bg-white/15">
                <div
                  className="h-px bg-[#d8c9ab] transition-[width] duration-300 ease-out"
                  style={{ width: `${Math.max(progress, 2)}%` }}
                />
              </div>
            </div>

            <nav aria-label="Setup progress" className="mt-9">
              <ol>
                {steps.map((step) => {
                  const isActive = step.id === currentStep
                  const isDone = step.id < currentStep
                  return (
                    <li
                      key={step.id}
                      className={cn(
                        'relative flex gap-4 border-b border-white/8 py-4 transition-colors duration-200',
                        isActive && 'border-white/15',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 w-5 shrink-0 font-mono text-[0.5625rem] tabular-nums transition-colors',
                          isActive ? 'text-[#d8c9ab]' : isDone ? 'text-[#d8c9ab]/60' : 'text-white/25',
                        )}
                      >
                        {String(step.id).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            'flex items-center gap-2 text-[0.8125rem] leading-none transition-colors',
                            isActive ? 'text-white' : isDone ? 'text-white/70' : 'text-white/35',
                          )}
                        >
                          {step.name}
                          {isDone ? (
                            <Check className="h-3 w-3 text-[#d8c9ab]/70" strokeWidth={2} aria-hidden />
                          ) : null}
                        </p>
                        <p
                          className={cn(
                            'mt-2 text-[0.6875rem] leading-snug transition-colors',
                            isActive ? 'text-[#d8c9ab]/75' : 'text-white/25',
                          )}
                        >
                          {step.description}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </nav>
          </div>

          <div className="border-t border-white/10 px-9 pb-24 pt-7 text-[0.6875rem] leading-relaxed text-white/35">
            Set your calendar once — fees, timetables, and reports all depend on it.
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile header */}
          <header className="sticky top-0 z-20 border-b border-[#14201b]/10 bg-[#f7f4ec]/95 backdrop-blur-md lg:hidden">
            <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
              <SqulWordmark markSize={26} />
              <span className="h-3.5 w-px bg-[#14201b]/15" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8125rem] font-medium text-[#14201b]">
                  {schoolLabel}
                </p>
                <p className="mt-0.5 text-[0.5625rem] uppercase tracking-[0.16em] text-[#7c857d]">
                  Setup · {currentStep} of {totalSteps}
                </p>
              </div>
            </div>
            <div className="h-px w-full bg-[#14201b]/10">
              <div
                className="h-px bg-[#1c3d32] transition-[width] duration-300 ease-out"
                style={{ width: `${Math.max(progress, 4)}%` }}
              />
            </div>
            <div className="scrollbar-none overflow-x-auto px-5 py-3 sm:px-6">
              <OnboardingStepperMobile steps={steps} currentStep={currentStep} />
            </div>
          </header>

          <main className="w-full flex-1 px-5 pb-36 pt-7 sm:px-8 lg:px-14 lg:pt-14">
            <div className="mx-auto w-full max-w-[46rem]">
              <div className="mb-6 hidden items-baseline justify-between gap-6 lg:flex">
                <p className="text-[0.5625rem] uppercase tracking-[0.22em] text-[#1c3d32]">
                  Step {String(currentStep).padStart(2, '0')}
                  {activeStep ? (
                    <span className="ml-3 text-[#14201b]/30">— {activeStep.name}</span>
                  ) : null}
                </p>
                <p className="font-mono text-[0.5625rem] tabular-nums text-[#14201b]/30">
                  {String(currentStep).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
                </p>
              </div>

              <div
                key={currentStep}
                className="border border-[#14201b]/10 bg-[#fcfaf4] shadow-[0_1px_0_rgba(20,32,27,0.02)] animate-in fade-in slide-in-from-bottom-1 duration-300"
              >
                {children}
              </div>
            </div>
          </main>

          <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-[#14201b]/10 bg-[#f7f4ec]/95 backdrop-blur-md lg:left-[21rem] xl:left-[23rem]">
            <div className="mx-auto flex max-w-[46rem] items-center justify-between gap-3 px-5 py-3.5 sm:px-8 lg:px-14">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onBack}
                disabled={currentStep === 1}
                className="h-10 shrink-0 px-0 text-[0.8125rem] font-medium text-[#4d574f] hover:bg-transparent hover:text-[#14201b] disabled:opacity-30"
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Back
              </Button>

              <p
                className="hidden font-mono text-[0.5625rem] uppercase tabular-nums tracking-[0.14em] text-[#14201b]/30 sm:block"
                aria-live="polite"
              >
                {currentStep} of {totalSteps}
              </p>

              <div className="flex shrink-0 items-center gap-5">
                {showSkip && onSkip && (
                  <button
                    type="button"
                    onClick={onSkip}
                    className="text-[0.8125rem] font-medium text-[#4d574f] transition-colors duration-200 hover:text-[#14201b]"
                  >
                    {skipLabel}
                  </button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={onContinue}
                  disabled={isContinueDisabled || isLoading}
                  className="h-11 min-w-[8.5rem] max-w-[min(100%,15rem)] rounded-[2px] bg-[#14201b] px-5 text-[0.8125rem] font-medium text-[#f7f4ec] shadow-none transition-colors duration-200 hover:bg-[#1c3d32] disabled:bg-[#14201b]/20 disabled:text-[#14201b]/40"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      <span className="truncate">{continueLabel}</span>
                    </>
                  ) : (
                    <>
                      <span className="truncate">{continueLabel}</span>
                      <ChevronRight className="ml-1 h-3.5 w-3.5 shrink-0" />
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
                <span className="font-mono tabular-nums">{String(step.id).padStart(2, '0')}</span>
                <span className={cn(!isActive && 'hidden sm:inline')}>{step.name}</span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** @deprecated Prefer vertical rail; kept for any external imports */
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
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'relative border-b border-[#14201b]/10',
        compact ? 'px-6 pb-4 pt-5' : 'px-6 pb-6 pt-7 sm:px-9 sm:pb-7 sm:pt-9',
      )}
    >
      <div className={cn('flex items-start', compact ? 'gap-3' : 'gap-4')}>
        <span
          className={cn(
            'flex shrink-0 items-center justify-center border border-[#1c3d32]/18 text-[#1c3d32]',
            compact ? 'mt-0.5 h-7 w-7' : 'mt-1 h-9 w-9',
          )}
        >
          <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </span>
        <div className="min-w-0">
          <h2
            className={cn(
              'font-display text-[#14201b] tracking-[-0.02em]',
              compact ? 'text-xl leading-tight' : 'text-[clamp(1.6rem,2.4vw,2.1rem)] leading-[1.05]',
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                'max-w-[54ch] leading-relaxed text-[#4d574f]',
                compact ? 'mt-1 text-xs' : 'mt-2.5 text-[0.8125rem]',
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
  return <div className={cn('px-6 py-7 sm:px-9 sm:py-8', className)}>{children}</div>
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
  icon?: React.ComponentType<{ className?: string }>
  visual?: React.ReactNode
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-full flex-col items-start rounded-[2px] border p-5 text-left transition-colors duration-200',
        selected
          ? 'border-[#1c3d32] bg-[#1c3d32]/[0.035]'
          : 'border-[#14201b]/12 bg-transparent hover:border-[#14201b]/25 hover:bg-[#14201b]/[0.02]',
      )}
    >
      <span
        className={cn(
          'absolute inset-y-0 left-0 w-[2px] transition-colors duration-200',
          selected ? 'bg-[#a98a55]' : 'bg-transparent',
        )}
        aria-hidden
      />
      {badge && (
        <span className="absolute right-4 top-4 text-[0.5rem] font-medium uppercase tracking-[0.16em] text-[#7c857d]">
          {badge}
        </span>
      )}
      {visual ? (
        visual
      ) : Icon ? (
        <span className="mb-4 flex h-8 w-8 items-center justify-center border border-[#14201b]/12 bg-[#f7f4ec] text-[#1c3d32]">
          <Icon className="h-3.5 w-3.5" />
        </span>
      ) : null}
      <span className="text-[0.8125rem] font-medium text-[#14201b]">{title}</span>
      <span className="mt-1 text-[0.6875rem] leading-snug text-[#4d574f]">{subtitle}</span>
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
          className="block text-[0.625rem] font-medium uppercase tracking-[0.14em] text-[#4d574f]"
        >
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-[0.6875rem] leading-relaxed text-[#7c857d]">{hint}</p>}
    </div>
  )
}

export const onboardingInputClass =
  'h-11 rounded-[2px] border-[#14201b]/15 bg-[#fcfaf4] text-[#14201b] shadow-none placeholder:text-[#14201b]/30 focus-visible:border-[#1c3d32] focus-visible:ring-2 focus-visible:ring-[#1c3d32]/10 dark:border-white/15 dark:bg-[#071411]'

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
              'relative flex w-full items-center rounded-[2px] border bg-[#fcfaf4] text-left transition-colors duration-200',
              disabled && 'pointer-events-none opacity-50',
              value ? 'border-[#1c3d32]/35' : 'border-[#14201b]/15',
              'hover:border-[#14201b]/35',
              open && 'border-[#1c3d32] ring-2 ring-[#1c3d32]/10',
              compact ? 'h-10 pl-9 pr-2' : 'h-11 pl-10 pr-3',
            )}
          >
            <span
              className={cn(
                'pointer-events-none absolute left-0 flex items-center justify-center border-r border-[#14201b]/10 text-[#1c3d32]',
                compact ? 'h-9 w-8' : 'h-10 w-9',
              )}
              aria-hidden
            >
              <CalendarIcon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={1.5} />
            </span>
            <span
              className={cn(
                'truncate text-[0.8125rem]',
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
          className="w-auto overflow-hidden rounded-[2px] border border-[#14201b]/15 p-0 shadow-[0_24px_60px_-30px_rgba(20,32,27,0.4)]"
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
              className="h-8 rounded-[2px] text-xs text-[#4d574f] hover:bg-transparent hover:text-[#14201b]"
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
              className="h-8 rounded-[2px] text-xs text-[#1c3d32] hover:bg-[#1c3d32]/8 hover:text-[#14201b]"
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
        <p className="mt-1.5 pl-0.5 text-[0.625rem] uppercase tracking-[0.1em] text-[#7c857d]">
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

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
  ink: '#0a1f1a',
  paper: '#f3f7f5',
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
    <div className="relative min-h-screen flex flex-col bg-[#f3f7f5] dark:bg-[#071411] font-sans">
      {/* Atmospheric field */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(36,106,89,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(36,106,89,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -top-32 -right-24 h-[28rem] w-[28rem] bg-[#246a59]/10 blur-3xl dark:bg-[#246a59]/20" />
        <div className="absolute bottom-0 left-0 h-64 w-64 bg-[#1a4d42]/8 blur-3xl dark:bg-[#1a4d42]/25" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col lg:flex-row">
        {/* Left index — desktop */}
        <aside className="hidden lg:flex lg:w-[22rem] xl:w-[24rem] shrink-0 flex-col justify-between border-r border-[#1a4d42]/15 bg-[#0a1f1a] text-white dark:border-white/10">
          <div className="p-8 xl:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center border border-white/20 bg-[#246a59]">
                <span className="text-sm font-bold tracking-wide">{subdomain.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="font-display text-xl tracking-tight truncate">{schoolLabel}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-emerald-200/70">
                  School setup
                </p>
              </div>
            </div>

            <div className="mt-14">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Progress
              </p>
              <div className="mt-4 h-1 w-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 font-display text-4xl tabular-nums text-white">
                {String(currentStep).padStart(2, '0')}
                <span className="text-white/35 text-2xl"> / {String(totalSteps).padStart(2, '0')}</span>
              </p>
            </div>

            <nav aria-label="Setup progress" className="mt-12">
              <ol className="space-y-0">
                {steps.map((step) => {
                  const isActive = step.id === currentStep
                  const isDone = step.id < currentStep
                  return (
                    <li
                      key={step.id}
                      className={cn(
                        'group relative flex gap-4 border-l-2 py-3.5 pl-5 transition-colors duration-300',
                        isActive && 'border-emerald-400',
                        isDone && 'border-emerald-400/50',
                        !isActive && !isDone && 'border-white/15',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-[11px] font-semibold tabular-nums transition-colors duration-300',
                          isDone && 'bg-emerald-400 text-[#0a1f1a]',
                          isActive && 'bg-white text-[#0a1f1a]',
                          !isActive && !isDone && 'border border-white/25 text-white/45',
                        )}
                      >
                        {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : String(step.id).padStart(2, '0')}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p
                          className={cn(
                            'text-sm font-medium transition-colors',
                            isActive ? 'text-white' : isDone ? 'text-white/80' : 'text-white/40',
                          )}
                        >
                          {step.name}
                        </p>
                        <p
                          className={cn(
                            'mt-0.5 text-xs leading-snug transition-colors',
                            isActive ? 'text-emerald-200/80' : 'text-white/30',
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

          <div className="border-t border-white/10 px-8 py-6 xl:px-10">
            <p className="text-xs leading-relaxed text-white/45">
              Set your calendar once — fees, timetables, and reports all depend on it.
            </p>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile / tablet header */}
          <header className="sticky top-0 z-20 border-b border-[#1a4d42]/12 bg-[#f3f7f5]/95 backdrop-blur-md dark:border-white/10 dark:bg-[#071411]/95 lg:hidden">
            <div className="px-4 sm:px-6 py-3.5 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#0a1f1a] text-white">
                <span className="text-sm font-bold">{subdomain.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white truncate">
                  {schoolLabel}
                </p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#246a59]">
                  Getting started · {currentStep}/{totalSteps}
                </p>
              </div>
            </div>
            <div className="h-0.5 w-full bg-[#1a4d42]/10">
              <div
                className="h-full bg-[#246a59] transition-[width] duration-500 ease-out"
                style={{ width: `${Math.max(progress, 4)}%` }}
              />
            </div>
            <div className="px-4 sm:px-6 py-3 overflow-x-auto scrollbar-none">
              <OnboardingStepperMobile steps={steps} currentStep={currentStep} />
            </div>
          </header>

          <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-6 sm:py-8 lg:py-10 pb-36">
            <div className="mx-auto max-w-2xl">
              {/* Desktop step eyebrow */}
              <div className="mb-6 hidden lg:block animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#246a59]">
                  Step {String(currentStep).padStart(2, '0')}
                  {activeStep ? ` · ${activeStep.name}` : ''}
                </p>
              </div>

              <div
                key={currentStep}
                className="border border-[#1a4d42]/12 bg-white shadow-[6px_6px_0_0_rgba(10,31,26,0.06)] dark:bg-[#0c1a17] dark:border-white/10 dark:shadow-[6px_6px_0_0_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-3 duration-500"
              >
                {children}
              </div>
            </div>
          </main>

          <footer className="fixed bottom-0 inset-x-0 z-20 border-t border-[#1a4d42]/12 bg-white/95 backdrop-blur-md dark:bg-[#0a1f1a]/95 dark:border-white/10 lg:left-[22rem] xl:left-[24rem]">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-10 xl:px-14 py-3.5 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onBack}
                disabled={currentStep === 1}
                className="rounded-none text-[#1a4d42]/70 hover:text-[#0a1f1a] hover:bg-[#246a59]/8 shrink-0 dark:text-white/60"
              >
                <ChevronLeft className="h-4 w-4 mr-0.5" />
                Back
              </Button>
              <p
                className="hidden sm:block text-[11px] font-medium uppercase tracking-[0.14em] text-[#1a4d42]/45 tabular-nums dark:text-white/40"
                aria-live="polite"
              >
                {currentStep} of {totalSteps}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {showSkip && onSkip && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onSkip}
                    className="rounded-none text-[#1a4d42]/55 hover:text-[#0a1f1a] dark:text-white/50"
                  >
                    {skipLabel}
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={onContinue}
                  disabled={isContinueDisabled || isLoading}
                  className="min-w-[128px] max-w-[min(100%,14rem)] rounded-none h-10 bg-[#0a1f1a] hover:bg-[#246a59] text-white shadow-none dark:bg-emerald-400 dark:text-[#0a1f1a] dark:hover:bg-emerald-300 transition-colors"
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
      <ol className="flex min-w-max items-center gap-1">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isDone = step.id < currentStep
          return (
            <li key={step.id} className="flex items-center gap-1">
              {index > 0 && (
                <span
                  className={cn(
                    'mx-0.5 h-px w-4 sm:w-6',
                    isDone || isActive ? 'bg-[#246a59]' : 'bg-[#1a4d42]/15',
                  )}
                  aria-hidden
                />
              )}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium transition-colors',
                  isActive && 'bg-[#0a1f1a] text-white',
                  isDone && 'bg-[#246a59]/12 text-[#1a4d42]',
                  !isActive && !isDone && 'text-[#1a4d42]/40',
                )}
              >
                <span className="tabular-nums">{String(step.id).padStart(2, '0')}</span>
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
        'relative border-b border-[#1a4d42]/10 overflow-hidden dark:border-white/10',
        'bg-[linear-gradient(135deg,#f8fbfa_0%,#ffffff_55%,#eef5f2_100%)] dark:bg-[linear-gradient(135deg,#0c1a17_0%,#0a1f1a_100%)]',
        compact ? 'px-5 sm:px-7 pt-4 pb-3' : 'px-5 sm:px-8 pt-6 sm:pt-8 pb-5',
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 border border-[#246a59]/10 rotate-12"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-8 top-4 h-16 w-16 border border-[#246a59]/8 -rotate-6"
        aria-hidden
      />
      <div className={cn('relative flex items-start', compact ? 'gap-3' : 'gap-4')}>
        <div
          className={cn(
            'flex shrink-0 items-center justify-center border border-[#246a59]/25 bg-[#246a59]/8 text-[#246a59]',
            compact ? 'h-9 w-9' : 'h-11 w-11',
          )}
        >
          <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </div>
        <div className="min-w-0 pt-0.5">
          <h2
            className={cn(
              'font-display text-[#0a1f1a] dark:text-white tracking-tight',
              compact ? 'text-xl' : 'text-2xl sm:text-[1.75rem]',
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                'text-[#1a4d42]/70 dark:text-white/55 leading-relaxed max-w-prose',
                compact ? 'text-xs mt-0.5' : 'text-sm mt-1.5',
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

export function StepBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-5 sm:px-8 py-6 sm:py-7', className)}>{children}</div>
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
        'relative flex flex-col items-start text-left w-full border-2 p-4 transition-all duration-200',
        'hover:border-[#246a59]/50 hover:bg-[#246a59]/[0.04]',
        selected
          ? 'border-[#246a59] bg-[#246a59]/[0.06] shadow-[3px_3px_0_0_rgba(36,106,89,0.25)]'
          : 'border-[#1a4d42]/12 bg-[#f8fbfa] dark:border-white/10 dark:bg-white/5',
      )}
    >
      {badge && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#246a59] bg-[#246a59]/10 px-2 py-0.5">
          {badge}
        </span>
      )}
      <span
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 transition-colors',
          selected ? 'bg-[#246a59]' : 'bg-transparent',
        )}
        aria-hidden
      />
      {visual ? (
        visual
      ) : Icon ? (
        <div className="flex h-9 w-9 items-center justify-center border border-[#1a4d42]/12 bg-white dark:bg-[#0a1f1a] dark:border-white/15 mb-3">
          <Icon className="h-4 w-4 text-[#246a59]" />
        </div>
      ) : null}
      <span className="text-sm font-semibold text-[#0a1f1a] dark:text-white">{title}</span>
      <span className="text-xs text-[#1a4d42]/65 dark:text-white/50 mt-1 leading-snug">{subtitle}</span>
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
        <label htmlFor={htmlFor} className="text-sm font-medium text-[#1a4d42] dark:text-white/80">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-[#1a4d42]/50 dark:text-white/40">{hint}</p>}
    </div>
  )
}

export const onboardingInputClass =
  'h-11 rounded-none border-[#1a4d42]/15 bg-white focus-visible:ring-[#246a59]/30 dark:border-white/15 dark:bg-[#071411]'

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
              'relative flex w-full items-center border bg-white text-left transition-all rounded-none',
              'dark:bg-[#071411]',
              disabled && 'opacity-50 pointer-events-none',
              value
                ? 'border-[#246a59]/40'
                : 'border-[#1a4d42]/15 dark:border-white/15',
              'hover:border-[#246a59]/50',
              open && 'border-[#246a59] ring-2 ring-[#246a59]/20',
              compact ? 'h-10 pl-10 pr-2' : 'h-11 pl-12 pr-3',
            )}
          >
            <span
              className={cn(
                'pointer-events-none absolute flex items-center justify-center',
                'bg-[#246a59]/10 text-[#246a59]',
                compact ? 'left-1.5 h-7 w-7' : 'left-2 h-8 w-8',
              )}
              aria-hidden
            >
              <CalendarIcon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            </span>
            <span
              className={cn(
                'truncate text-sm font-medium',
                value ? 'text-[#0a1f1a] dark:text-white' : 'text-[#1a4d42]/40',
              )}
            >
              {displayLabel}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-auto p-0 rounded-none border border-[#1a4d42]/15 shadow-lg dark:border-white/15 overflow-hidden"
        >
          {!compact && <CalendarPopoverHeader label="Select date" value={selected} />}
          <OnboardingCalendar
            selected={selected}
            onSelect={handleSelect}
            disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
            defaultMonth={selected ?? (min ? parseIsoDate(min) : undefined) ?? new Date()}
          />
          <div className="flex items-center justify-between gap-2 border-t border-[#1a4d42]/10 dark:border-white/10 px-3 py-2 bg-[#f3f7f5] dark:bg-white/5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 rounded-none text-xs text-[#1a4d42]/60 hover:text-[#0a1f1a]"
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
              className="h-8 rounded-none text-xs text-[#246a59] hover:text-[#1a4d42] hover:bg-[#246a59]/10"
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
        <p className="mt-1 pl-1 text-[11px] text-[#1a4d42]/45 dark:text-white/40">{hint}</p>
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

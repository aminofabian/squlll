'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { HomepageConfig } from '@/lib/types/homepage-config'
import {
  HomepageShellStyles,
  shellClass,
  themeStyle,
} from '../(pages)/components/homepage/shared'
import {
  authFieldClass,
  authLabelClass,
  authPrimaryButtonClass,
} from '../(pages)/components/homepage/SchoolAuthShell'

type StepId = 'student' | 'pathway' | 'guardian' | 'story' | 'review'

const STEPS: { id: StepId; label: string; prompt: string; hint: string }[] = [
  {
    id: 'student',
    label: 'Learner',
    prompt: 'Who’s joining us?',
    hint: 'A few facts so we can place them well.',
  },
  {
    id: 'pathway',
    label: 'Pathway',
    prompt: 'Where are they headed?',
    hint: 'Choose the programme and when you’d like to begin.',
  },
  {
    id: 'guardian',
    label: 'Family',
    prompt: 'Who walks with them?',
    hint: 'Admissions will write to this person.',
  },
  {
    id: 'story',
    label: 'Story',
    prompt: 'What lights them up?',
    hint: 'Optional, but it helps us know them.',
  },
  {
    id: 'review',
    label: 'Send',
    prompt: 'Does this look right?',
    hint: 'One last glance before it reaches admissions.',
  },
]

const PROGRAMMES = [
  {
    id: 'early-years',
    title: 'Early Years',
    blurb: 'Play, wonder, and first friendships',
  },
  {
    id: 'primary',
    title: 'Primary',
    blurb: 'Foundations with room to explore',
  },
  {
    id: 'junior-secondary',
    title: 'Junior Secondary',
    blurb: 'Curiosity meeting real challenge',
  },
  {
    id: 'senior-secondary',
    title: 'Senior Secondary',
    blurb: 'Depth, direction, and exams with heart',
  },
]

const START_TERMS = [
  { id: 'sep-2026', label: 'September 2026' },
  { id: 'jan-2027', label: 'January 2027' },
  { id: 'apr-2027', label: 'April 2027' },
  { id: 'sep-2027', label: 'September 2027' },
]

const RELATIONSHIPS = ['Mother', 'Father', 'Guardian', 'Grandparent', 'Other']

const INTERESTS = [
  { id: 'science', label: 'Science' },
  { id: 'arts', label: 'Arts' },
  { id: 'music', label: 'Music' },
  { id: 'sport', label: 'Sport' },
  { id: 'reading', label: 'Reading' },
  { id: 'writing', label: 'Writing' },
  { id: 'service', label: 'Service' },
  { id: 'leadership', label: 'Leadership' },
]

type FormState = {
  studentFirstName: string
  studentLastName: string
  dateOfBirth: string
  gender: '' | 'female' | 'male' | 'prefer-not' | 'other'
  programme: string
  startTerm: string
  currentSchool: string
  guardianName: string
  relationship: string
  guardianEmail: string
  guardianPhone: string
  interests: string[]
  whyUs: string
  notes: string
}

const emptyForm: FormState = {
  studentFirstName: '',
  studentLastName: '',
  dateOfBirth: '',
  gender: '',
  programme: '',
  startTerm: '',
  currentSchool: '',
  guardianName: '',
  relationship: '',
  guardianEmail: '',
  guardianPhone: '',
  interests: [],
  whyUs: '',
  notes: '',
}

const easeOut = [0.16, 1, 0.3, 1] as const

function useTemplateFlags(config: HomepageConfig) {
  const id = config.templateId
  return {
    isAssembly: id === 'assembly-hall',
    isPlayfield: id === 'playfield',
    isGarden: id === 'garden-court',
    isStory: id === 'story-scroll',
    isHorizon: id === 'horizon-board',
    soft:
      config.theme.radiusMode === 'soft' ||
      [
        'assembly-hall',
        'playfield',
        'garden-court',
        'story-scroll',
        'horizon-board',
      ].includes(id),
  }
}

function Chip({
  selected,
  onClick,
  children,
  soft,
}: {
  selected: boolean
  onClick: () => void
  children: ReactNode
  soft: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'min-h-11 border px-3.5 text-sm font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98]',
        soft ? 'rounded-full' : 'rounded-sm',
        selected
          ? 'border-primary bg-primary text-white'
          : 'border-[var(--school-ink)]/18 bg-transparent text-[var(--school-ink)]/75 hover:border-primary/45 hover:text-[var(--school-ink)]',
      )}
    >
      {children}
    </button>
  )
}

function SelectRow({
  selected,
  onClick,
  title,
  blurb,
  soft,
}: {
  selected: boolean
  onClick: () => void
  title: string
  blurb?: string
  soft: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group flex w-full items-start gap-4 border-b border-[var(--school-ink)]/10 px-1 py-4 text-left transition-colors last:border-b-0',
        selected ? 'bg-primary/[0.04]' : 'hover:bg-[var(--school-ink)]/[0.02]',
        soft && selected && 'rounded-lg',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors',
          soft ? 'rounded-full' : 'rounded-[3px]',
          selected
            ? 'border-primary bg-primary text-white'
            : 'border-[var(--school-ink)]/25 text-transparent group-hover:border-primary/50',
        )}
      >
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[1.05rem] font-bold tracking-[-0.02em] text-[var(--school-ink)]">
          {title}
        </span>
        {blurb && (
          <span className="mt-0.5 block text-sm leading-snug text-[var(--school-ink)]/55">
            {blurb}
          </span>
        )}
      </span>
    </button>
  )
}

function JourneyRail({
  stepIndex,
  soft,
  reduceMotion,
}: {
  stepIndex: number
  soft: boolean
  reduceMotion: boolean | null
}) {
  const progress = stepIndex / (STEPS.length - 1)

  return (
    <nav aria-label="Application steps" className="hidden lg:block">
      <ol className="relative space-y-0">
        <div
          className="absolute bottom-3 left-[11px] top-3 w-px bg-[var(--school-ink)]/12"
          aria-hidden
        />
        <motion.div
          className="absolute left-[11px] top-3 w-px origin-top bg-primary"
          aria-hidden
          style={{ height: 'calc(100% - 1.5rem)' }}
          initial={false}
          animate={{ scaleY: progress }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.45, ease: easeOut }
          }
        />
        {STEPS.map((step, i) => {
          const done = i < stepIndex
          const current = i === stepIndex
          return (
            <li key={step.id} className="relative flex gap-4 py-3 first:pt-0 last:pb-0">
              <span
                className={cn(
                  'relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center border text-[10px] font-bold transition-colors',
                  soft ? 'rounded-full' : 'rounded-sm',
                  done && 'border-primary bg-primary text-white',
                  current &&
                    'border-primary bg-primary text-white ring-4 ring-primary/18',
                  !done &&
                    !current &&
                    'border-[var(--school-ink)]/20 bg-[var(--school-paper)] text-[var(--school-ink)]/35',
                )}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={2.5} /> : i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={cn(
                    'text-[13px] font-semibold tracking-[-0.01em]',
                    current
                      ? 'text-[var(--school-ink)]'
                      : done
                        ? 'text-[var(--school-ink)]/55'
                        : 'text-[var(--school-ink)]/35',
                  )}
                >
                  {step.label}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function MobileProgress({
  stepIndex,
  soft,
  reduceMotion,
}: {
  stepIndex: number
  soft: boolean
  reduceMotion: boolean | null
}) {
  return (
    <div className="lg:hidden" aria-label="Progress">
      <div className="mb-2 flex items-center justify-between gap-3 text-[12px]">
        <span className="font-semibold text-[var(--school-ink)]">
          {STEPS[stepIndex].label}
        </span>
        <span className="tabular-nums text-[var(--school-ink)]/45">
          {stepIndex + 1} / {STEPS.length}
        </span>
      </div>
      <div
        className={cn(
          'h-1 overflow-hidden bg-[var(--school-ink)]/10',
          soft ? 'rounded-full' : 'rounded-none',
        )}
      >
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.4, ease: easeOut }
          }
        />
      </div>
    </div>
  )
}

function ApplyShell({
  config,
  schoolName,
  logoUrl,
  tagline,
  stepIndex,
  title,
  description,
  children,
  footer,
  success = false,
}: {
  config: HomepageConfig
  schoolName: string
  logoUrl?: string
  tagline?: string
  stepIndex: number
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  success?: boolean
}) {
  const reduceMotion = useReducedMotion()
  const {
    isAssembly,
    isPlayfield,
    isGarden,
    isStory,
    isHorizon,
    soft,
  } = useTemplateFlags(config)
  const themed = isAssembly || isPlayfield || isGarden || isStory || isHorizon
  const initials = schoolName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={shellClass(
        config,
        cn(
          'flex min-h-screen flex-col',
          isAssembly && 'assembly-hall-shell',
          isPlayfield && 'playfield-shell',
          isGarden && 'garden-court-shell',
          isStory && 'story-scroll-shell',
          isHorizon && 'horizon-board-shell',
        ),
      )}
      style={themeStyle(config.theme)}
    >
      <HomepageShellStyles
        assembly={isAssembly}
        playfield={isPlayfield}
        garden={isGarden}
        story={isStory}
        horizon={isHorizon}
      />

      <header
        className={cn(
          'sticky top-0 z-40 border-b',
          isAssembly &&
            'border-[var(--school-ink)]/15 bg-[var(--ah-cream,#FBF6E9)]/95 backdrop-blur-md',
          isPlayfield &&
            'border-[var(--primary-dark)] bg-[var(--school-ink)]',
          isGarden &&
            'border-[var(--school-ink)]/10 bg-[var(--gc-linen,#F4EFE4)]/95 backdrop-blur-md',
          isStory &&
            'border-primary/20 bg-[var(--ss-sage,#EEF0E2)]/95 backdrop-blur-md',
          isHorizon &&
            'border-[var(--school-ink)]/12 bg-[var(--hb-cream,#F4ECD8)]/95 backdrop-blur-md',
          !themed &&
            'border-[var(--school-ink)]/8 bg-[var(--school-paper)]/90 backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-[var(--school-nav-h)] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-10 w-10 object-contain sm:h-11 sm:w-11"
              />
            ) : (
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center sm:h-11 sm:w-11',
                  soft ? 'rounded-xl' : 'rounded-none',
                  isPlayfield
                    ? 'border border-primary bg-transparent text-primary'
                    : 'bg-primary text-white',
                )}
              >
                {isPlayfield ? (
                  <span className="text-[11px] font-bold tracking-wide">
                    {initials}
                  </span>
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </div>
            )}
            <div className="min-w-0">
              <span
                className={cn(
                  'block truncate font-display text-lg leading-none tracking-[-0.02em] sm:text-xl',
                  isPlayfield && 'text-[var(--school-paper)]',
                )}
              >
                {schoolName}
              </span>
              <span
                className={cn(
                  'mt-1 block truncate text-[11px]',
                  isPlayfield
                    ? 'text-[#9FB3B0]'
                    : 'text-[var(--school-ink)]/45',
                )}
              >
                {tagline || 'Application for admission'}
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className={cn(
              'inline-flex h-10 items-center gap-2 border px-3.5 text-sm font-semibold transition-colors',
              soft ? 'rounded-lg' : 'rounded-sm',
              isPlayfield
                ? 'border-primary/40 text-[var(--school-paper)] hover:bg-primary hover:text-[var(--school-ink)]'
                : 'border-[var(--school-ink)]/15 text-[var(--school-ink)]/80 hover:border-primary hover:text-primary',
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>

      <main
        className={cn(
          'relative flex flex-1',
          isAssembly && 'ah-ruled',
          isPlayfield && 'pf-hero',
        )}
      >
        <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] lg:gap-14 lg:px-8 lg:py-12">
          <aside className="flex flex-col justify-between gap-8 lg:sticky lg:top-[calc(var(--school-nav-h)+1.5rem)] lg:max-h-[calc(100vh-var(--school-nav-h)-3rem)] lg:self-start">
            <div>
              {!success && (
                <MobileProgress
                  stepIndex={stepIndex}
                  soft={soft}
                  reduceMotion={reduceMotion}
                />
              )}
              <h1
                className={cn(
                  'mt-5 font-display text-[clamp(1.75rem,4vw,2.55rem)] font-extrabold leading-[1.08] tracking-[-0.03em] lg:mt-0',
                  isPlayfield
                    ? 'font-semibold text-[var(--school-paper)]'
                    : 'text-[var(--school-ink)]',
                  isStory && 'ss-italic',
                  isHorizon && 'hb-italic',
                )}
              >
                {title}
              </h1>
              {description && (
                <p
                  className={cn(
                    'mt-3 max-w-[36ch] text-base leading-relaxed',
                    isPlayfield
                      ? 'text-[#B9CBC8]'
                      : 'text-[var(--school-ink)]/60',
                  )}
                >
                  {description}
                </p>
              )}
              {!success && (
                <div className="mt-8">
                  <JourneyRail
                    stepIndex={stepIndex}
                    soft={soft}
                    reduceMotion={reduceMotion}
                  />
                </div>
              )}
            </div>
            {footer && (
              <div
                className={cn(
                  'mt-auto hidden text-sm lg:block',
                  isPlayfield
                    ? 'text-[#9FB3B0]'
                    : 'text-[var(--school-ink)]/45',
                )}
              >
                {footer}
              </div>
            )}
          </aside>

          <section
            className={cn(
              'flex min-h-0 min-w-0 flex-col border bg-[color-mix(in_srgb,var(--school-paper)_88%,white)]',
              soft ? 'rounded-2xl' : 'rounded-none',
              isAssembly &&
                'border-[var(--school-ink)]/20 bg-[var(--ah-cream,#FBF6E9)]',
              isPlayfield &&
                'rounded-md border-transparent bg-[var(--school-paper)]',
              isGarden && 'border-[var(--school-ink)]/12',
              isStory &&
                'border-[var(--ss-moss-3,#1F3226)]/20 bg-[var(--ss-sage,#EEF0E2)]',
              isHorizon && 'border-[var(--school-ink)]/12 bg-white',
              !themed &&
                'border-[var(--school-ink)]/10 shadow-[0_18px_50px_-28px_rgba(10,31,26,0.35)]',
            )}
          >
            <div className="flex flex-1 flex-col p-5 sm:p-7 lg:p-8">{children}</div>
          </section>

          {footer && (
            <div
              className={cn(
                'text-center text-sm lg:hidden',
                isPlayfield
                  ? 'text-[#9FB3B0]'
                  : 'text-[var(--school-ink)]/45',
              )}
            >
              {footer}
            </div>
          )}
        </div>
        {isAssembly && <div className="ah-tear mt-auto" aria-hidden />}
      </main>
    </div>
  )
}

export default function ApplyContent({
  config,
  schoolName,
  subdomain,
  logoUrl,
  tagline,
}: {
  config: HomepageConfig
  schoolName: string
  subdomain: string
  logoUrl?: string
  tagline?: string
}) {
  const reduceMotion = useReducedMotion()
  const { soft } = useTemplateFlags(config)
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [fieldError, setFieldError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [reference, setReference] = useState<string | null>(null)

  const step = STEPS[stepIndex]
  const field = authFieldClass(config)
  const label = authLabelClass(config)
  const primaryBtn = authPrimaryButtonClass(config)

  const programmeLabel = useMemo(
    () =>
      PROGRAMMES.find((p) => p.id === form.programme)?.title ?? form.programme,
    [form.programme],
  )
  const termLabel = useMemo(
    () =>
      START_TERMS.find((t) => t.id === form.startTerm)?.label ?? form.startTerm,
    [form.startTerm],
  )

  const set =
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value }))

  const toggleInterest = (id: string) => {
    setForm((prev) => {
      const has = prev.interests.includes(id)
      if (has) {
        return { ...prev, interests: prev.interests.filter((x) => x !== id) }
      }
      if (prev.interests.length >= 5) return prev
      return { ...prev, interests: [...prev.interests, id] }
    })
  }

  const validateStep = (): boolean => {
    setFieldError('')
    if (step.id === 'student') {
      if (!form.studentFirstName.trim() || !form.studentLastName.trim()) {
        setFieldError('Add the learner’s first and last name to continue.')
        return false
      }
      if (!form.dateOfBirth) {
        setFieldError('Date of birth helps us place them in the right year.')
        return false
      }
    }
    if (step.id === 'pathway') {
      if (!form.programme) {
        setFieldError('Choose a programme pathway to continue.')
        return false
      }
      if (!form.startTerm) {
        setFieldError('Pick a preferred start term.')
        return false
      }
    }
    if (step.id === 'guardian') {
      if (!form.guardianName.trim()) {
        setFieldError('Add a parent or guardian name.')
        return false
      }
      if (!form.relationship) {
        setFieldError('Tell us how you’re related to the learner.')
        return false
      }
      if (
        !form.guardianEmail.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guardianEmail)
      ) {
        setFieldError('Use a valid email — admissions will reply there.')
        return false
      }
      if (!form.guardianPhone.trim() || form.guardianPhone.trim().length < 7) {
        setFieldError('Add a phone number we can reach you on.')
        return false
      }
    }
    return true
  }

  const next = () => {
    if (!validateStep()) return
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  }

  const back = () => {
    setFieldError('')
    setSubmitError('')
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  const submit = async () => {
    if (!validateStep()) return
    setIsLoading(true)
    setSubmitError('')
    try {
      const response = await fetch('/api/school/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          studentFirstName: form.studentFirstName.trim(),
          studentLastName: form.studentLastName.trim(),
          dateOfBirth: form.dateOfBirth,
          gender: form.gender || undefined,
          programme: form.programme,
          startTerm: form.startTerm,
          currentSchool: form.currentSchool.trim() || undefined,
          guardianName: form.guardianName.trim(),
          relationship: form.relationship,
          guardianEmail: form.guardianEmail.trim(),
          guardianPhone: form.guardianPhone.trim(),
          interests: form.interests,
          whyUs: form.whyUs.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Could not submit application')
      }
      setReference(data.reference)
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Try again in a moment.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (reference) {
    return (
      <ApplyShell
        config={config}
        schoolName={schoolName}
        logoUrl={logoUrl}
        tagline={tagline}
        stepIndex={STEPS.length - 1}
        title="You’re on the list"
        description={`We’ve received ${form.studentFirstName || 'your learner'}’s application for ${schoolName}. Keep this reference — admissions will use it when they write back.`}
        success
        footer={
          <Link href="/" className="font-semibold text-primary hover:underline">
            ← Back to home
          </Link>
        }
      >
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="space-y-8"
        >
          <div
            className={cn(
              'relative overflow-hidden border border-primary/25 bg-primary/[0.06] px-6 py-8 text-center sm:px-8',
              soft ? 'rounded-2xl' : 'rounded-none',
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Your reference
            </p>
            <p className="mt-3 font-display text-[clamp(1.75rem,5vw,2.35rem)] font-extrabold tracking-[-0.03em] text-[var(--school-ink)]">
              {reference}
            </p>
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rotate-12 rounded-full border-2 border-primary/20"
              aria-hidden
            />
          </div>

          <p className="text-[0.95rem] leading-relaxed text-[var(--school-ink)]/65">
            Expect a note at <span className="font-semibold text-[var(--school-ink)]">{form.guardianEmail}</span> within a few school days — visit details, documents, or a short conversation.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild className={cn(primaryBtn, 'sm:max-w-[220px]')}>
              <Link href="/">
                Return home
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-12 font-semibold text-[var(--school-ink)]/65"
              onClick={() => {
                setReference(null)
                setForm(emptyForm)
                setStepIndex(0)
              }}
            >
              Apply for another learner
            </Button>
          </div>
        </motion.div>
      </ApplyShell>
    )
  }

  return (
    <ApplyShell
      config={config}
      schoolName={schoolName}
      logoUrl={logoUrl}
      tagline={tagline}
      stepIndex={stepIndex}
      title={step.prompt}
      description={step.hint}
      footer={
        <p>
          Already enrolled?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={reduceMotion ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
          transition={{ duration: 0.28, ease: easeOut }}
          className="flex flex-col space-y-5"
        >
          {(fieldError || submitError) && (
            <div
              role="alert"
              className={cn(
                'border px-4 py-3 text-sm font-medium',
                soft ? 'rounded-xl' : 'rounded-sm',
                submitError
                  ? 'border-red-500/25 bg-red-50 text-red-900'
                  : 'border-amber-500/30 bg-amber-50 text-amber-950',
              )}
            >
              {submitError || fieldError}
            </div>
          )}

          <div className="flex-1 space-y-5">
          {step.id === 'student' && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className={label}>
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    className={field}
                    value={form.studentFirstName}
                    onChange={(e) => set('studentFirstName', e.target.value)}
                    placeholder="Amina"
                    autoComplete="given-name"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className={label}>
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    className={field}
                    value={form.studentLastName}
                    onChange={(e) => set('studentLastName', e.target.value)}
                    placeholder="Okello"
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob" className={label}>
                  Date of birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  className={cn(field, 'max-w-xs')}
                  value={form.dateOfBirth}
                  onChange={(e) => set('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <p className={label}>
                  Gender{' '}
                  <span className="font-normal text-[var(--school-ink)]/40">
                    optional
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ['female', 'Girl'],
                      ['male', 'Boy'],
                      ['other', 'Other'],
                      ['prefer-not', 'Prefer not to say'],
                    ] as const
                  ).map(([value, text]) => (
                    <Chip
                      key={value}
                      selected={form.gender === value}
                      onClick={() => set('gender', value)}
                      soft={soft}
                    >
                      {text}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step.id === 'pathway' && (
            <div className="space-y-7">
              <div>
                <p className={cn(label, 'mb-1')}>Programme</p>
                <div className="divide-y-0">
                  {PROGRAMMES.map((p) => (
                    <SelectRow
                      key={p.id}
                      title={p.title}
                      blurb={p.blurb}
                      selected={form.programme === p.id}
                      onClick={() => set('programme', p.id)}
                      soft={soft}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className={cn(label, 'mb-3')}>Preferred start</p>
                <div className="flex flex-wrap gap-2">
                  {START_TERMS.map((t) => (
                    <Chip
                      key={t.id}
                      selected={form.startTerm === t.id}
                      onClick={() => set('startTerm', t.id)}
                      soft={soft}
                    >
                      {t.label}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentSchool" className={label}>
                  Current school{' '}
                  <span className="font-normal text-[var(--school-ink)]/40">
                    optional
                  </span>
                </Label>
                <Input
                  id="currentSchool"
                  className={field}
                  value={form.currentSchool}
                  onChange={(e) => set('currentSchool', e.target.value)}
                  placeholder="Where are they learning now?"
                />
              </div>
            </div>
          )}

          {step.id === 'guardian' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="guardianName" className={label}>
                  Parent / guardian name
                </Label>
                <Input
                  id="guardianName"
                  className={field}
                  value={form.guardianName}
                  onChange={(e) => set('guardianName', e.target.value)}
                  placeholder="Full name"
                  autoComplete="name"
                  autoFocus
                />
              </div>
              <div className="space-y-3">
                <p className={label}>Relationship</p>
                <div className="flex flex-wrap gap-2">
                  {RELATIONSHIPS.map((r) => (
                    <Chip
                      key={r}
                      selected={form.relationship === r}
                      onClick={() => set('relationship', r)}
                      soft={soft}
                    >
                      {r}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className={label}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className={field}
                    value={form.guardianEmail}
                    onChange={(e) => set('guardianEmail', e.target.value)}
                    placeholder="you@email.com"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className={label}>
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    className={field}
                    value={form.guardianPhone}
                    onChange={(e) => set('guardianPhone', e.target.value)}
                    placeholder="+254 …"
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>
          )}

          {step.id === 'story' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <p className={label}>
                  Interests{' '}
                  <span className="font-normal text-[var(--school-ink)]/40">
                    up to 5
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(({ id, label: interestLabel }) => (
                    <Chip
                      key={id}
                      selected={form.interests.includes(id)}
                      onClick={() => toggleInterest(id)}
                      soft={soft}
                    >
                      {interestLabel}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whyUs" className={label}>
                  Why {schoolName}?
                </Label>
                <Textarea
                  id="whyUs"
                  className={cn(field, 'min-h-[100px] py-3 leading-relaxed')}
                  value={form.whyUs}
                  onChange={(e) => set('whyUs', e.target.value)}
                  placeholder="A sentence or two is plenty — what drew you here?"
                  maxLength={1200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className={label}>
                  Anything else?{' '}
                  <span className="font-normal text-[var(--school-ink)]/40">
                    optional
                  </span>
                </Label>
                <Textarea
                  id="notes"
                  className={cn(field, 'min-h-[80px] py-3 leading-relaxed')}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Learning support, siblings already here, questions…"
                  maxLength={1200}
                />
              </div>
            </div>
          )}

          {step.id === 'review' && (
            <div className="space-y-5">
              <dl className="space-y-0">
                {(
                  [
                    [
                      'Learner',
                      `${form.studentFirstName} ${form.studentLastName}`.trim(),
                    ],
                    ['Born', form.dateOfBirth || '—'],
                    ['Pathway', programmeLabel],
                    ['Start', termLabel],
                    [
                      'Family',
                      `${form.guardianName}${form.relationship ? ` · ${form.relationship}` : ''}`,
                    ],
                    ['Email', form.guardianEmail],
                    ['Phone', form.guardianPhone],
                    form.interests.length
                      ? [
                          'Interests',
                          form.interests
                            .map(
                              (id) =>
                                INTERESTS.find((i) => i.id === id)?.label ?? id,
                            )
                            .join(', '),
                        ]
                      : null,
                  ] as Array<[string, string] | null>
                )
                  .filter(Boolean)
                  .map((row) => {
                    const [k, v] = row as [string, string]
                    return (
                      <div
                        key={k}
                        className="flex items-baseline justify-between gap-6 border-b border-[var(--school-ink)]/8 py-3"
                      >
                        <dt className="shrink-0 text-[13px] text-[var(--school-ink)]/45">
                          {k}
                        </dt>
                        <dd className="text-right text-[0.95rem] font-semibold tracking-[-0.01em] text-[var(--school-ink)]">
                          {v}
                        </dd>
                      </div>
                    )
                  })}
              </dl>
              <p className="text-sm leading-relaxed text-[var(--school-ink)]/55">
                Submitting sends this to admissions. You’ll get a reference
                number — no payment is taken here.
              </p>
            </div>
          )}
          </div>

          <div className="mt-auto flex flex-col-reverse gap-3 border-t border-[var(--school-ink)]/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
            {stepIndex > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={back}
                className="h-11 justify-start px-2 font-semibold text-[var(--school-ink)]/55 hover:text-[var(--school-ink)]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <span className="hidden sm:block" />
            )}

            {step.id === 'review' ? (
              <Button
                type="button"
                disabled={isLoading}
                onClick={submit}
                className={cn(primaryBtn, 'sm:w-auto sm:min-w-[200px] sm:px-8')}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Submit application
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={next}
                className={cn(primaryBtn, 'sm:w-auto sm:min-w-[160px] sm:px-8')}
              >
                <span className="flex items-center gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </ApplyShell>
  )
}

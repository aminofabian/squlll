'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Feather,
  Heart,
  Music,
  Palette,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { HomepageConfig } from '@/lib/types/homepage-config'
import {
  SchoolAuthShell,
  authFieldClass,
  authLabelClass,
  authPrimaryButtonClass,
} from '../(pages)/components/homepage/SchoolAuthShell'

type StepId = 'student' | 'pathway' | 'guardian' | 'story' | 'review'

const STEPS: { id: StepId; label: string; prompt: string }[] = [
  { id: 'student', label: 'Learner', prompt: 'Who’s joining us?' },
  { id: 'pathway', label: 'Pathway', prompt: 'Where are they headed?' },
  { id: 'guardian', label: 'Family', prompt: 'Who walks with them?' },
  { id: 'story', label: 'Story', prompt: 'What lights them up?' },
  { id: 'review', label: 'Review', prompt: 'Ready to send?' },
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
  { id: 'jan-2027', label: 'January 2027' },
  { id: 'apr-2027', label: 'April 2027' },
  { id: 'sep-2026', label: 'September 2026' },
  { id: 'sep-2027', label: 'September 2027' },
]

const RELATIONSHIPS = [
  'Mother',
  'Father',
  'Guardian',
  'Grandparent',
  'Other',
]

const INTERESTS = [
  { id: 'science', label: 'Science', icon: Compass },
  { id: 'arts', label: 'Arts', icon: Palette },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'sport', label: 'Sport', icon: Trophy },
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'writing', label: 'Writing', icon: Feather },
  { id: 'service', label: 'Service', icon: Heart },
  { id: 'leadership', label: 'Leadership', icon: Users },
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

function StepRail({
  stepIndex,
  config,
}: {
  stepIndex: number
  config: HomepageConfig
}) {
  const soft = config.theme.radiusMode === 'soft'
  return (
    <ol className="mt-8 flex items-center gap-1 sm:gap-2" aria-label="Progress">
      {STEPS.map((step, i) => {
        const done = i < stepIndex
        const current = i === stepIndex
        return (
          <li key={step.id} className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center border-2 text-[11px] font-bold transition-colors sm:h-8 sm:w-8 sm:text-xs',
                  soft ? 'rounded-full' : 'rounded-none',
                  done &&
                    'border-primary bg-primary text-white',
                  current &&
                    'border-primary bg-primary/10 text-primary',
                  !done &&
                    !current &&
                    'border-[var(--school-ink)]/15 text-[var(--school-ink)]/40',
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    'h-0.5 flex-1',
                    i < stepIndex ? 'bg-primary' : 'bg-[var(--school-ink)]/10',
                  )}
                  aria-hidden
                />
              )}
            </div>
            <span
              className={cn(
                'hidden truncate text-[10px] font-semibold uppercase tracking-[0.12em] sm:block',
                current
                  ? 'text-primary'
                  : done
                    ? 'text-[var(--school-ink)]/55'
                    : 'text-[var(--school-ink)]/30',
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function ChoiceCard({
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
      className={cn(
        'border-2 p-4 text-left transition-[border-color,background-color,transform] active:scale-[0.99]',
        soft ? 'rounded-xl' : 'rounded-none',
        selected
          ? 'border-primary bg-primary/8 shadow-[3px_3px_0_rgba(0,0,0,0.06)]'
          : 'border-[var(--school-ink)]/12 bg-white/60 hover:border-primary/40',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-bold text-[var(--school-ink)]">
            {title}
          </p>
          {blurb && (
            <p className="mt-1 text-sm leading-snug text-[var(--school-ink)]/55">
              {blurb}
            </p>
          )}
        </div>
        <span
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2',
            soft ? 'rounded-full' : 'rounded-none',
            selected
              ? 'border-primary bg-primary text-white'
              : 'border-[var(--school-ink)]/20',
          )}
        >
          {selected && <Check className="h-3 w-3" />}
        </span>
      </div>
    </button>
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
  const soft =
    config.theme.radiusMode === 'soft' ||
    [
      'assembly-hall',
      'playfield',
      'garden-court',
      'story-scroll',
      'horizon-board',
    ].includes(config.templateId)

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
    () => PROGRAMMES.find((p) => p.id === form.programme)?.title ?? form.programme,
    [form.programme],
  )
  const termLabel = useMemo(
    () => START_TERMS.find((t) => t.id === form.startTerm)?.label ?? form.startTerm,
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
        setFieldError('Please share the learner’s first and last name.')
        return false
      }
      if (!form.dateOfBirth) {
        setFieldError('Date of birth helps us place them in the right year.')
        return false
      }
    }
    if (step.id === 'pathway') {
      if (!form.programme) {
        setFieldError('Pick a pathway to continue.')
        return false
      }
      if (!form.startTerm) {
        setFieldError('When would you like them to start?')
        return false
      }
    }
    if (step.id === 'guardian') {
      if (!form.guardianName.trim()) {
        setFieldError('We need a parent or guardian name.')
        return false
      }
      if (!form.relationship) {
        setFieldError('How are you related to the learner?')
        return false
      }
      if (!form.guardianEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guardianEmail)) {
        setFieldError('A valid email is how admissions will reach you.')
        return false
      }
      if (!form.guardianPhone.trim() || form.guardianPhone.trim().length < 7) {
        setFieldError('Please add a phone number we can call.')
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
        err instanceof Error ? err.message : 'Something went wrong. Try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (reference) {
    return (
      <SchoolAuthShell
        config={config}
        schoolName={schoolName}
        logoUrl={logoUrl}
        tagline={tagline}
        eyebrow="Application received"
        title="You’re on the list"
        description={`We’ve logged ${form.studentFirstName || 'your learner'}’s application for ${schoolName}. Keep your reference handy.`}
        wide
        footer={
          <Link
            href="/"
            className="text-sm font-semibold text-primary hover:underline"
          >
            ← Back to home
          </Link>
        }
      >
        <div className="space-y-6 text-center sm:text-left">
          <div
            className={cn(
              'mx-auto flex h-14 w-14 items-center justify-center border-2 border-primary bg-primary/10 text-primary sm:mx-0',
              soft ? 'rounded-2xl' : 'rounded-none',
            )}
          >
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Reference
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-[var(--school-ink)]">
              {reference}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-[var(--school-ink)]/65">
            Admissions will email <strong>{form.guardianEmail}</strong> within a
            few school days with next steps — campus visit, documents, or a
            short conversation.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className={primaryBtn}>
              <Link href="/">
                Return home
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'h-12 border-2 font-semibold',
                soft ? 'rounded-lg' : 'rounded-none',
              )}
              onClick={() => {
                setReference(null)
                setForm(emptyForm)
                setStepIndex(0)
              }}
            >
              Start another application
            </Button>
          </div>
        </div>
      </SchoolAuthShell>
    )
  }

  return (
    <SchoolAuthShell
      config={config}
      schoolName={schoolName}
      logoUrl={logoUrl}
      tagline={tagline}
      eyebrow="Admissions"
      title={step.prompt}
      description={`A short application for ${schoolName} — five gentle steps, no account needed.`}
      wide
      headerExtra={<StepRail stepIndex={stepIndex} config={config} />}
      footer={
        <p className="text-xs text-[var(--school-ink)]/50">
          Already enrolled?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in to the portal
          </Link>
        </p>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="space-y-5"
        >
          {fieldError && (
            <div className="border-2 border-amber-500/35 bg-amber-50 p-3.5 text-sm font-medium text-amber-950">
              {fieldError}
            </div>
          )}
          {submitError && (
            <div className="border-2 border-red-500/30 bg-red-50 p-3.5 text-sm font-medium text-red-800">
              {submitError}
            </div>
          )}

          {step.id === 'student' && (
            <>
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
                  className={field}
                  value={form.dateOfBirth}
                  onChange={(e) => set('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <p className={label}>Gender (optional)</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ['female', 'Girl'],
                      ['male', 'Boy'],
                      ['other', 'Other'],
                      ['prefer-not', 'Prefer not to say'],
                    ] as const
                  ).map(([value, text]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('gender', value)}
                      className={cn(
                        'border-2 px-3.5 py-2 text-sm font-semibold transition-colors',
                        soft ? 'rounded-full' : 'rounded-none',
                        form.gender === value
                          ? 'border-primary bg-primary text-white'
                          : 'border-[var(--school-ink)]/15 text-[var(--school-ink)]/70 hover:border-primary/40',
                      )}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step.id === 'pathway' && (
            <>
              <div className="space-y-2">
                <p className={label}>Programme</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PROGRAMMES.map((p) => (
                    <ChoiceCard
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
              <div className="space-y-2">
                <p className={label}>Preferred start</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {START_TERMS.map((t) => (
                    <ChoiceCard
                      key={t.id}
                      title={t.label}
                      selected={form.startTerm === t.id}
                      onClick={() => set('startTerm', t.id)}
                      soft={soft}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentSchool" className={label}>
                  Current school <span className="font-normal opacity-50">(optional)</span>
                </Label>
                <Input
                  id="currentSchool"
                  className={field}
                  value={form.currentSchool}
                  onChange={(e) => set('currentSchool', e.target.value)}
                  placeholder="Where are they learning now?"
                />
              </div>
            </>
          )}

          {step.id === 'guardian' && (
            <>
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
              <div className="space-y-2">
                <p className={label}>Relationship</p>
                <div className="flex flex-wrap gap-2">
                  {RELATIONSHIPS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => set('relationship', r)}
                      className={cn(
                        'border-2 px-3.5 py-2 text-sm font-semibold transition-colors',
                        soft ? 'rounded-full' : 'rounded-none',
                        form.relationship === r
                          ? 'border-primary bg-primary text-white'
                          : 'border-[var(--school-ink)]/15 text-[var(--school-ink)]/70 hover:border-primary/40',
                      )}
                    >
                      {r}
                    </button>
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
            </>
          )}

          {step.id === 'story' && (
            <>
              <div className="space-y-2">
                <p className={label}>
                  Interests <span className="font-normal opacity-50">(up to 5)</span>
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {INTERESTS.map(({ id, label: interestLabel, icon: Icon }) => {
                    const on = form.interests.includes(id)
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleInterest(id)}
                        className={cn(
                          'flex flex-col items-center gap-2 border-2 px-2 py-3 text-center transition-colors',
                          soft ? 'rounded-xl' : 'rounded-none',
                          on
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-[var(--school-ink)]/12 text-[var(--school-ink)]/65 hover:border-primary/35',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-semibold">{interestLabel}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="whyUs" className={label}>
                  Why {schoolName}?
                </Label>
                <Textarea
                  id="whyUs"
                  className={cn(field, 'min-h-[100px] py-3')}
                  value={form.whyUs}
                  onChange={(e) => set('whyUs', e.target.value)}
                  placeholder="A sentence or two is plenty — what drew you here?"
                  maxLength={1200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className={label}>
                  Anything else?{' '}
                  <span className="font-normal opacity-50">(optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  className={cn(field, 'min-h-[80px] py-3')}
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Learning support, siblings already here, questions…"
                  maxLength={1200}
                />
              </div>
            </>
          )}

          {step.id === 'review' && (
            <div className="space-y-4">
              <div
                className={cn(
                  'border-2 border-[var(--school-ink)]/10 bg-[var(--school-paper,#f3f7f5)]/80 p-4',
                  soft ? 'rounded-xl' : 'rounded-none',
                )}
              >
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Snapshot
                </p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 border-b border-[var(--school-ink)]/8 pb-2">
                    <dt className="text-[var(--school-ink)]/50">Learner</dt>
                    <dd className="font-semibold text-[var(--school-ink)]">
                      {form.studentFirstName} {form.studentLastName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[var(--school-ink)]/8 pb-2">
                    <dt className="text-[var(--school-ink)]/50">Born</dt>
                    <dd className="font-semibold text-[var(--school-ink)]">
                      {form.dateOfBirth || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[var(--school-ink)]/8 pb-2">
                    <dt className="text-[var(--school-ink)]/50">Pathway</dt>
                    <dd className="text-right font-semibold text-[var(--school-ink)]">
                      {programmeLabel}
                      <span className="mt-0.5 block text-xs font-normal text-[var(--school-ink)]/50">
                        {termLabel}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-[var(--school-ink)]/8 pb-2">
                    <dt className="text-[var(--school-ink)]/50">Family</dt>
                    <dd className="text-right font-semibold text-[var(--school-ink)]">
                      {form.guardianName}
                      <span className="mt-0.5 block text-xs font-normal text-[var(--school-ink)]/50">
                        {form.relationship} · {form.guardianEmail}
                      </span>
                    </dd>
                  </div>
                  {form.interests.length > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--school-ink)]/50">Interests</dt>
                      <dd className="text-right font-semibold text-[var(--school-ink)]">
                        {form.interests
                          .map(
                            (id) =>
                              INTERESTS.find((i) => i.id === id)?.label ?? id,
                          )
                          .join(', ')}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
              <p className="text-sm leading-relaxed text-[var(--school-ink)]/60">
                Submitting sends this to admissions. You’ll get a reference
                number to keep — no payment is taken here.
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            {stepIndex > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={back}
                className="h-11 font-semibold text-[var(--school-ink)]/70"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <span />
            )}

            {step.id === 'review' ? (
              <Button
                type="button"
                disabled={isLoading}
                onClick={submit}
                className={cn(primaryBtn, 'sm:max-w-xs')}
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
                className={cn(primaryBtn, 'sm:max-w-xs')}
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
    </SchoolAuthShell>
  )
}

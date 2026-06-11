'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Plus,
  Loader2,
  GraduationCap,
  BookOpen,
  Settings2,
  ChevronRight,
  ChevronLeft,
  School,
  LayoutGrid,
  Users,
  Search,
  Check,
  Sparkles,
  CalendarDays,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAcademicYears } from '@/lib/hooks/useAcademicYears'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { useTenantSubjects } from '@/lib/hooks/useTenantSubjects'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import {
  createExamSession,
  MAX_ASSESSMENTS_BATCH_SIZE,
  MAX_EXAM_SESSION_PAPERS,
  type ExamSessionTemplate,
} from '@/lib/exams/examSessions'
import {
  buildExamPaperSpecs,
  subjectsForGrade,
  subjectsForGrades,
} from '@/lib/exams/examPaperPairs'
import {
  defaultPaperSelectionsForSubject,
  type PaperComponentSelection,
} from '@/lib/exams/examPaperComponents'
import { SubjectPaperConfigurator } from './SubjectPaperConfigurator'
import { ExamDaysSelector } from './ExamDaysSelector'
import { DEFAULT_EXAM_DAYS_OF_WEEK } from '@/lib/exams/examDaysOfWeek'
import {
  fetchGradingScales,
  SESSION_TEMPLATE_LABELS,
} from '@/lib/exams/gradingScales'
import type { AssessType } from '@/lib/hooks/useTeacherActivity'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import {
  abbreviateGradeShort,
  formatGradeDisplayName,
} from '@/lib/utils/grade-display'

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  sessionTemplate: z
    .enum(['END_OF_TERM', 'MID_TERM', 'MOCK_EXAM', 'KCSE_TRIAL'])
    .optional(),
  gradingSchemeId: z.string().optional(),
  examType: z.enum(['CA', 'EXAM']),
  academicYear: z.string().min(1, 'Select academic year'),
  term: z.string().min(1, 'Select term'),
  gradeIds: z.array(z.string()).min(1, 'Select at least one grade'),
  streamIds: z.array(z.string()).optional(),
  subjectIds: z.array(z.string()).min(1, 'Select at least one subject'),
  startDate: z.string().min(1, 'Select exam start date'),
  endDate: z.string().min(1, 'Select exam end date'),
  dailyStartTime: z.string().min(1, 'Set daily start time'),
  dailyEndTime: z.string().min(1, 'Set daily end time'),
  examDaysOfWeek: z.array(z.number()).min(1, 'Select at least one exam day'),
  totalMarks: z.coerce.number().min(1).default(100),
  passingMarks: z.coerce.number().min(1).default(40),
  instructions: z.string().optional(),
}).refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
}).refine((data) => data.dailyEndTime > data.dailyStartTime, {
  message: 'Daily end time must be after start time',
  path: ['dailyEndTime'],
})

type FormValues = z.infer<typeof schema>

const STEPS = [
  { id: 1, label: 'Details', icon: Sparkles },
  { id: 2, label: 'Classes', icon: GraduationCap },
  { id: 3, label: 'Papers', icon: BookOpen },
] as const

const TEMPLATE_HINTS: Record<string, string> = {
  END_OF_TERM: 'Full term assessment for report cards',
  MID_TERM: 'Half-term progress check',
  MOCK_EXAM: 'Practice run before national exams',
  KCSE_TRIAL: 'KCSE-style trial for Form 4',
}

interface CreateExamSessionDrawerProps {
  onCreated?: () => void
  trigger?: React.ReactNode
  initialGradeId?: string
}

export function CreateExamSessionDrawer({
  onCreated,
  trigger,
  initialGradeId,
}: CreateExamSessionDrawerProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [subjectSearch, setSubjectSearch] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [subjectPaperConfigs, setSubjectPaperConfigs] = useState<
    Record<string, PaperComponentSelection[]>
  >({})
  const params = useParams()
  const subdomain = params.subdomain as string
  const queryClient = useQueryClient()

  const { academicYears, getActiveAcademicYear } = useAcademicYears()
  useSchoolConfig(open)
  const { data: tenantSubjects = [] } = useTenantSubjects(open)
  const {
    config,
    getAllGradeLevels,
    getGradeById,
    getSubjectsByLevelId,
    getStreamsByGradeId,
  } = useSchoolConfigStore()

  const gradingScalesQuery = useQuery({
    queryKey: ['gradingScales', subdomain],
    queryFn: () => fetchGradingScales(subdomain),
    enabled: open && Boolean(subdomain),
  })

  const gradeLevels = useMemo(() => getAllGradeLevels(), [config, getAllGradeLevels])

  const allGradeIds = useMemo(
    () => gradeLevels.flatMap((level) => level.grades.map((g) => g.id)),
    [gradeLevels],
  )

  const allStreamIds = useMemo(() => {
    const ids: string[] = []
    for (const gradeId of allGradeIds) {
      for (const stream of getStreamsByGradeId(gradeId)) {
        ids.push(stream.id)
      }
    }
    return ids
  }, [allGradeIds, getStreamsByGradeId])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      examType: 'EXAM',
      academicYear: '',
      term: '',
      gradeIds: [],
      streamIds: [],
      subjectIds: [],
      startDate: '',
      endDate: '',
      dailyStartTime: '08:00',
      dailyEndTime: '16:00',
      examDaysOfWeek: [...DEFAULT_EXAM_DAYS_OF_WEEK],
      totalMarks: 100,
      passingMarks: 40,
      instructions: '',
      sessionTemplate: 'END_OF_TERM',
      gradingSchemeId: '_default',
    },
  })

  const selectedYear = form.watch('academicYear')
  const selectedGradeIds = form.watch('gradeIds')
  const selectedStreamIds = form.watch('streamIds') ?? []
  const selectedSubjectIds = form.watch('subjectIds')
  const sessionTemplate = form.watch('sessionTemplate')

  const eligibleSubjects = useMemo(
    () =>
      subjectsForGrades({
        gradeIds: selectedGradeIds,
        tenantSubjects,
        getGradeById,
        getSubjectsByLevelId,
      }),
    [selectedGradeIds, tenantSubjects, getGradeById, getSubjectsByLevelId],
  )

  const paperSpecs = useMemo(
    () =>
      buildExamPaperSpecs({
        selectedGradeIds,
        selectedSubjectIds,
        subjectPaperConfigs,
        tenantSubjects,
        getGradeById,
        getSubjectsByLevelId,
      }),
    [
      selectedGradeIds,
      selectedSubjectIds,
      subjectPaperConfigs,
      tenantSubjects,
      getGradeById,
      getSubjectsByLevelId,
    ],
  )

  const paperCount = paperSpecs.length

  const paperCountOverLimit = paperCount > MAX_EXAM_SESSION_PAPERS
  const paperCountIsLarge = paperCount > MAX_ASSESSMENTS_BATCH_SIZE

  const subjectSectionsByGrade = useMemo(() => {
    const q = subjectSearch.trim().toLowerCase()

    return selectedGradeIds
      .map((gradeId) => {
        const gradeInfo = getGradeById(gradeId)
        if (!gradeInfo) return null

        const allForGrade = subjectsForGrade({
          gradeId,
          tenantSubjects,
          getGradeById,
          getSubjectsByLevelId,
        })
        const subjects = q
          ? allForGrade.filter((s) => s.name.toLowerCase().includes(q))
          : allForGrade
        const selectedCount = allForGrade.filter((s) =>
          selectedSubjectIds.includes(s.id),
        ).length

        return {
          gradeId,
          gradeName: formatGradeDisplayName(gradeInfo.grade.name),
          levelName: gradeInfo.levelName,
          subjects,
          selectedCount,
          totalSubjects: allForGrade.length,
        }
      })
      .filter((section): section is NonNullable<typeof section> => section !== null)
  }, [
    selectedGradeIds,
    selectedSubjectIds,
    subjectSearch,
    tenantSubjects,
    getGradeById,
    getSubjectsByLevelId,
  ])

  const availableStreams = useMemo(() => {
    const map = new Map<string, { id: string; name: string; gradeId: string }>()
    for (const gradeId of selectedGradeIds) {
      for (const stream of getStreamsByGradeId(gradeId)) {
        map.set(stream.id, { id: stream.id, name: stream.name, gradeId })
      }
    }
    return Array.from(map.values())
  }, [selectedGradeIds, getStreamsByGradeId])

  const availableTerms = useMemo(() => {
    return academicYears.find((y) => y.name === selectedYear)?.terms ?? []
  }, [academicYears, selectedYear])

  const scopeSummary = useMemo(() => {
    const gradeCount = selectedGradeIds.length
    const streamCount = selectedStreamIds.length
    const totalGrades = allGradeIds.length
    if (gradeCount === 0) return 'No classes selected'
    if (gradeCount === totalGrades && streamCount === 0) {
      return 'Whole school · all streams'
    }
    if (gradeCount === totalGrades && streamCount === allStreamIds.length) {
      return 'Every class (all grades & streams)'
    }
    if (streamCount > 0) {
      return `${gradeCount} grade${gradeCount === 1 ? '' : 's'} · ${streamCount} stream${streamCount === 1 ? '' : 's'}`
    }
    return `${gradeCount} grade${gradeCount === 1 ? '' : 's'} · all streams`
  }, [
    selectedGradeIds.length,
    selectedStreamIds.length,
    allGradeIds.length,
    allStreamIds.length,
  ])

  useEffect(() => {
    const active = getActiveAcademicYear()
    if (active && !form.getValues('academicYear')) {
      form.setValue('academicYear', active.name)
      if (active.terms[0]) form.setValue('term', active.terms[0].id)
    }
  }, [academicYears, form, getActiveAcademicYear])

  useEffect(() => {
    if (!open) {
      setStep(1)
      setSubjectSearch('')
      setShowAdvanced(false)
      setSubjectPaperConfigs({})
      return
    }
    if (initialGradeId) {
      form.setValue('gradeIds', [initialGradeId], { shouldValidate: true })
    }
  }, [open, initialGradeId, form])

  useEffect(() => {
    const eligible = new Set(eligibleSubjects.map((s) => s.id))
    const current = form.getValues('subjectIds')
    const pruned = current.filter((id) => eligible.has(id))
    if (pruned.length !== current.length) {
      form.setValue('subjectIds', pruned, { shouldValidate: true })
    }
  }, [eligibleSubjects, form])

  const ensureSubjectPaperConfig = (subjectId: string) => {
    const subject = eligibleSubjects.find((s) => s.id === subjectId)
    if (!subject) return
    setSubjectPaperConfigs((prev) => {
      if (prev[subjectId]?.length) return prev
      return {
        ...prev,
        [subjectId]: defaultPaperSelectionsForSubject(subject.name, subject.code),
      }
    })
  }

  const toggleId = (field: 'gradeIds' | 'subjectIds' | 'streamIds', id: string) => {
    const current = form.getValues(field) ?? []
    const adding = !current.includes(id)
    form.setValue(
      field,
      adding ? [...current, id] : current.filter((x) => x !== id),
      { shouldValidate: true },
    )
    if (field === 'subjectIds' && adding) {
      ensureSubjectPaperConfig(id)
    }
  }

  const selectAllGrades = () => {
    form.setValue('gradeIds', allGradeIds, { shouldValidate: true })
    form.setValue('streamIds', [], { shouldValidate: true })
  }

  const selectAllClasses = () => {
    form.setValue('gradeIds', allGradeIds, { shouldValidate: true })
    form.setValue('streamIds', allStreamIds, { shouldValidate: true })
  }

  const selectLevelGrades = (levelId: string) => {
    const level = gradeLevels.find((l) => l.levelId === levelId)
    if (!level) return
    const levelGradeIds = level.grades.map((g) => g.id)
    const merged = Array.from(new Set([...form.getValues('gradeIds'), ...levelGradeIds]))
    form.setValue('gradeIds', merged, { shouldValidate: true })
  }

  const clearScope = () => {
    form.setValue('gradeIds', initialGradeId ? [initialGradeId] : [], {
      shouldValidate: true,
    })
    form.setValue('streamIds', [], { shouldValidate: true })
  }

  const selectAllSubjects = () => {
    const ids = eligibleSubjects.map((s) => s.id)
    form.setValue('subjectIds', ids, { shouldValidate: true })
    setSubjectPaperConfigs((prev) => {
      const next = { ...prev }
      for (const subject of eligibleSubjects) {
        if (!next[subject.id]?.length) {
          next[subject.id] = defaultPaperSelectionsForSubject(
            subject.name,
            subject.code,
          )
        }
      }
      return next
    })
  }

  const clearSubjects = () => {
    form.setValue('subjectIds', [], { shouldValidate: true })
  }

  const validateStep = async (currentStep: number) => {
    if (currentStep === 1) {
      return form.trigger([
        'name',
        'academicYear',
        'term',
        'examType',
        'startDate',
        'endDate',
        'dailyStartTime',
        'dailyEndTime',
      ])
    }
    if (currentStep === 2) {
      return form.trigger(['gradeIds'])
    }
    if (currentStep === 3) {
      const ok = await form.trigger(['subjectIds'])
      if (!ok) return false
      if (paperCount === 0) {
        toast.error('No exam papers selected', {
          description:
            'Select subjects and enable at least one paper per subject (e.g. Paper 1, Composition, Practical).',
        })
        return false
      }
      if (paperCount > MAX_EXAM_SESSION_PAPERS) {
        toast.error('Too many exam papers', {
          description: `Maximum is ${MAX_EXAM_SESSION_PAPERS} papers per session.`,
        })
        return false
      }
      return true
    }
    return true
  }

  const goNext = async () => {
    const ok = await validateStep(step)
    if (!ok) return
    setStep((s) => Math.min(s + 1, 3))
  }

  const goBack = () => setStep((s) => Math.max(s - 1, 1))

  const onSubmit = async (data: FormValues) => {
    const specs = buildExamPaperSpecs({
      selectedGradeIds: data.gradeIds,
      selectedSubjectIds: data.subjectIds,
      subjectPaperConfigs,
      tenantSubjects,
      getGradeById,
      getSubjectsByLevelId,
    })
    const papers = specs.length

    if (papers === 0) {
      toast.error('No valid exam papers', {
        description:
          'Selected subjects are not taught in the chosen grades. Adjust your selection.',
      })
      return
    }

    if (papers > MAX_EXAM_SESSION_PAPERS) {
      toast.error('Too many exam papers', {
        description: `Selected ${papers} papers (max ${MAX_EXAM_SESSION_PAPERS}). Reduce grades or subjects.`,
      })
      return
    }

    setLoading(true)
    try {
      const termIndex = availableTerms.findIndex((t) => t.id === data.term)
      const termNumber = termIndex >= 0 ? termIndex + 1 : 1

      await createExamSession(
        subdomain,
        {
          name: data.name,
          description: data.description,
          type: data.examType as AssessType,
          academicYear: data.academicYear,
          term: termNumber,
          tenantGradeLevelIds: data.gradeIds,
          tenantSubjectIds: data.subjectIds,
          streamIds: data.streamIds?.length ? data.streamIds : undefined,
          defaultMaxScore: data.totalMarks,
          defaultPassMark: data.passingMarks,
          instructions: data.instructions,
          sessionTemplate: data.sessionTemplate as ExamSessionTemplate | undefined,
          gradingSchemeId:
            data.gradingSchemeId && data.gradingSchemeId !== '_default'
              ? data.gradingSchemeId
              : undefined,
          startDate: data.startDate,
          endDate: data.endDate,
          dailyStartTime: data.dailyStartTime.slice(0, 5),
          dailyEndTime: data.dailyEndTime.slice(0, 5),
          examDaysOfWeek: data.examDaysOfWeek,
          paperSpecs: specs.map((spec) => ({
            tenantGradeLevelId: spec.tenantGradeLevelId,
            tenantSubjectId: spec.tenantSubjectId,
            paperComponent: spec.paperComponent,
            paperLabel: spec.paperLabel,
            durationMinutes: spec.durationMinutes,
          })),
        },
        { paperCount: papers },
      )

      toast.success('Exam session created', {
        description: `${data.name} — ${papers} paper${papers === 1 ? '' : 's'} ready. Open Timetable to place them on the grid.`,
      })

      await queryClient.invalidateQueries({ queryKey: ['examSessions', subdomain] })
      form.reset()
      setOpen(false)
      onCreated?.()
    } catch (error) {
      toast.error('Failed to create exam session', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const isAllGradesSelected =
    allGradeIds.length > 0 &&
    selectedGradeIds.length === allGradeIds.length &&
    selectedStreamIds.length === 0

  const isAllClassesSelected =
    allGradeIds.length > 0 &&
    selectedGradeIds.length === allGradeIds.length &&
    (allStreamIds.length === 0 || selectedStreamIds.length === allStreamIds.length)

  const isAllSubjectsSelected =
    eligibleSubjects.length > 0 &&
    eligibleSubjects.every((s) => selectedSubjectIds.includes(s.id))

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create exam
          </Button>
        )}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl lg:max-w-2xl"
      >
        <SheetHeader className="shrink-0 space-y-4 border-b border-slate-200/80 px-6 py-5 pr-14 dark:border-slate-800">
          <div>
            <SheetTitle className="text-lg font-semibold tracking-tight">
              New exam session
            </SheetTitle>
            <SheetDescription className="text-xs leading-relaxed">
              Set up a named exam — candidates, timetable, marks and results all
              live under one session.
            </SheetDescription>
          </div>

          <div className="flex items-center gap-1">
            {STEPS.map(({ id, label, icon: Icon }, index) => {
              const active = step === id
              const done = step > id
              return (
                <div key={id} className="flex min-w-0 flex-1 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (id < step) setStep(id)
                    }}
                    disabled={id > step}
                    className={cn(
                      'flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors',
                      active && 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
                      done && !active && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
                      !active && !done && 'text-slate-400',
                      id < step && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                        active && 'bg-white/15',
                        done && !active && 'bg-white dark:bg-slate-900',
                        !active && !done && 'bg-slate-100 dark:bg-slate-800',
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                    </span>
                    <span className="truncate text-xs font-semibold">{label}</span>
                  </button>
                  {index < STEPS.length - 1 ? (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  ) : null}
                </div>
              )
            })}
          </div>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-6 px-6 py-5">
                {step === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Exam name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Term 3 End-of-Year Examination 2026"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sessionTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Quick start template
                          </FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(SESSION_TEMPLATE_LABELS).map(
                              ([value, label]) => {
                                const selected = field.value === value
                                return (
                                  <button
                                    key={value}
                                    type="button"
                                    onClick={() => field.onChange(value)}
                                    className={cn(
                                      'rounded-xl border px-3 py-3 text-left transition-all',
                                      selected
                                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
                                    )}
                                  >
                                    <span className="block text-sm font-semibold">{label}</span>
                                    <span
                                      className={cn(
                                        'mt-0.5 block text-[11px] leading-snug',
                                        selected
                                          ? 'text-white/70 dark:text-slate-600'
                                          : 'text-slate-500',
                                      )}
                                    >
                                      {TEMPLATE_HINTS[value]}
                                    </span>
                                  </button>
                                )
                              },
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="examType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Type
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="EXAM">End-of-term exam</SelectItem>
                                <SelectItem value="CA">Continuous assessment</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gradingSchemeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Grading
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Default scale" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="_default">Default scale</SelectItem>
                                {(gradingScalesQuery.data ?? []).map((scale) => (
                                  <SelectItem key={scale.id} value={scale.id}>
                                    {scale.name}
                                    {scale.isDefault ? ' (default)' : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="academicYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Academic year
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {academicYears.map((y) => (
                                  <SelectItem key={y.id} value={y.name}>
                                    {y.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="term"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Term
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Term" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableTerms.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                      <div className="mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Exam period
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Dates and daily session window apply to the whole exam — not
                            per subject. Individual paper durations are set in step 3.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Start date</FormLabel>
                              <FormControl>
                                <Input type="date" className="h-9" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">End date</FormLabel>
                              <FormControl>
                                <Input type="date" className="h-9" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dailyStartTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Daily start time</FormLabel>
                              <FormControl>
                                <Input type="time" className="h-9" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dailyEndTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Daily end time</FormLabel>
                              <FormControl>
                                <Input type="time" className="h-9" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                        <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Which days have exams?
                        </p>
                        <p className="mb-3 text-[11px] text-slate-500">
                          Weekdays only by default. Include Saturday or Sunday only if
                          your school runs exams then.
                        </p>
                        <ExamDaysSelector
                          value={form.watch('examDaysOfWeek')}
                          onChange={(days) =>
                            form.setValue('examDaysOfWeek', days, {
                              shouldValidate: true,
                            })
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Who sits this exam?
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Pick whole-school shortcuts or drill into grades and streams.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <ScopeShortcut
                        icon={School}
                        title="All grades"
                        description="Every grade level, all streams"
                        selected={isAllGradesSelected}
                        onClick={selectAllGrades}
                      />
                      <ScopeShortcut
                        icon={LayoutGrid}
                        title="All classes"
                        description="Every grade & stream combo"
                        selected={isAllClassesSelected}
                        onClick={selectAllClasses}
                        disabled={allStreamIds.length === 0}
                        hint={
                          allStreamIds.length === 0
                            ? 'No streams configured'
                            : undefined
                        }
                      />
                      <ScopeShortcut
                        icon={Users}
                        title="Clear"
                        description="Start selection over"
                        selected={selectedGradeIds.length === 0}
                        onClick={clearScope}
                        variant="muted"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/50">
                      <span className="text-xs font-medium text-slate-500">Current scope</span>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {scopeSummary}
                      </Badge>
                      {selectedSubjectIds.length > 0 ? (
                        <Badge
                          variant={paperCountOverLimit ? 'destructive' : 'outline'}
                          className="text-xs font-normal"
                        >
                          {paperCount} paper{paperCount === 1 ? '' : 's'}
                        </Badge>
                      ) : null}
                    </div>

                    {selectedSubjectIds.length > 0 ? (
                      <PaperCountNotice
                        paperCount={paperCount}
                        gradeCount={selectedGradeIds.length}
                        subjectCount={selectedSubjectIds.length}
                      />
                    ) : null}

                    <FormField
                      control={form.control}
                      name="gradeIds"
                      render={() => (
                        <FormItem className="space-y-4">
                          {gradeLevels.map((level) => (
                            <div key={level.levelId} className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  {level.levelName}
                                </p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[11px] text-primary"
                                  onClick={() => selectLevelGrades(level.levelId)}
                                >
                                  Select all in level
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {level.grades.map((grade) => {
                                  const selected = selectedGradeIds.includes(grade.id)
                                  return (
                                    <button
                                      key={grade.id}
                                      type="button"
                                      onClick={() => toggleId('gradeIds', grade.id)}
                                      className={cn(
                                        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all',
                                        selected
                                          ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
                                      )}
                                    >
                                      <span className="rounded bg-white/20 px-1 py-0.5 text-[10px] font-bold">
                                        {abbreviateGradeShort(grade.name)}
                                      </span>
                                      {formatGradeDisplayName(grade.name)}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {availableStreams.length > 0 && (
                      <FormField
                        control={form.control}
                        name="streamIds"
                        render={() => (
                          <FormItem className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Streams (optional)
                                </FormLabel>
                                <p className="text-[11px] text-slate-500">
                                  Leave empty to include all streams in selected grades.
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  form.setValue('streamIds', [], { shouldValidate: true })
                                }
                              >
                                All streams
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {availableStreams.map((stream) => {
                                const selected = selectedStreamIds.includes(stream.id)
                                return (
                                  <button
                                    key={stream.id}
                                    type="button"
                                    onClick={() => toggleId('streamIds', stream.id)}
                                    className={cn(
                                      'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                                      selected
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700',
                                    )}
                                  >
                                    {stream.name}
                                  </button>
                                )
                              })}
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Subjects &amp; papers
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {selectedSubjectIds.length} subject
                          {selectedSubjectIds.length === 1 ? '' : 's'} · {paperCount}{' '}
                          exam paper{paperCount === 1 ? '' : 's'} across{' '}
                          {selectedGradeIds.length} grade
                          {selectedGradeIds.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          type="button"
                          variant={isAllSubjectsSelected ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 text-xs"
                          onClick={selectAllSubjects}
                        >
                          All subjects
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={clearSubjects}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <PaperCountNotice
                      paperCount={paperCount}
                      gradeCount={selectedGradeIds.length}
                      subjectCount={selectedSubjectIds.length}
                    />

                    <div className="relative">
                      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search subjects…"
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                        className="h-10 pl-9"
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subjectIds"
                      render={() => (
                        <FormItem className="space-y-4">
                          {subjectSectionsByGrade.length === 0 ? (
                            <p className="py-6 text-center text-xs text-slate-400">
                              Select grades first to see their subjects
                            </p>
                          ) : (
                            subjectSectionsByGrade.map((section) => (
                              <div
                                key={section.gradeId}
                                className="rounded-xl border border-slate-200 dark:border-slate-700"
                              >
                                <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                      {section.gradeName}
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      {section.levelName} · {section.selectedCount}/
                                      {section.totalSubjects} subjects
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-[11px]"
                                    onClick={() => {
                                      const allForGrade = subjectsForGrade({
                                        gradeId: section.gradeId,
                                        tenantSubjects,
                                        getGradeById,
                                        getSubjectsByLevelId,
                                      })
                                      const ids = new Set(form.getValues('subjectIds'))
                                      for (const subject of allForGrade) {
                                        ids.add(subject.id)
                                      }
                                      form.setValue('subjectIds', Array.from(ids), {
                                        shouldValidate: true,
                                      })
                                      setSubjectPaperConfigs((prev) => {
                                        const next = { ...prev }
                                        for (const subject of allForGrade) {
                                          if (!next[subject.id]?.length) {
                                            next[subject.id] =
                                              defaultPaperSelectionsForSubject(
                                                subject.name,
                                                subject.code,
                                              )
                                          }
                                        }
                                        return next
                                      })
                                    }}
                                  >
                                    All in grade
                                  </Button>
                                </div>
                                <div className="space-y-2 p-3">
                                  {section.subjects.map((subject) => {
                                    const selected = selectedSubjectIds.includes(
                                      subject.id,
                                    )
                                    return (
                                      <div key={`${section.gradeId}-${subject.id}`}>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleId('subjectIds', subject.id)
                                          }
                                          className={cn(
                                            'flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-all',
                                            selected
                                              ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
                                          )}
                                        >
                                          <span
                                            className={cn(
                                              'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                              selected
                                                ? 'border-white/40 bg-white/20'
                                                : 'border-slate-300',
                                            )}
                                          >
                                            {selected ? (
                                              <Check className="h-2.5 w-2.5" />
                                            ) : null}
                                          </span>
                                          <span className="line-clamp-2">
                                            {subject.name}
                                          </span>
                                        </button>
                                        {selected && subjectPaperConfigs[subject.id] ? (
                                          <SubjectPaperConfigurator
                                            subjectId={subject.id}
                                            subjectName={subject.name}
                                            subjectCode={subject.code}
                                            components={subjectPaperConfigs[subject.id]}
                                            onChange={(id, components) =>
                                              setSubjectPaperConfigs((prev) => ({
                                                ...prev,
                                                [id]: components,
                                              }))
                                            }
                                          />
                                        ) : null}
                                      </div>
                                    )
                                  })}
                                </div>
                                {section.subjects.length === 0 ? (
                                  <p className="px-3 pb-3 text-center text-xs text-slate-400">
                                    No subjects match your search for this grade
                                  </p>
                                ) : null}
                              </div>
                            ))
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setShowAdvanced((v) => !v)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                      >
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                          <Settings2 className="h-4 w-4" />
                          Marking defaults
                        </span>
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 text-slate-400 transition-transform',
                            showAdvanced && 'rotate-90',
                          )}
                        />
                      </button>
                      {showAdvanced ? (
                        <div className="space-y-4 border-t border-slate-200 px-4 py-4 dark:border-slate-700">
                          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                            Exact day and time for each paper is placed on the Timetable
                            grid after creation, within the exam period you set in step 1.
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="totalMarks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Total marks</FormLabel>
                                  <FormControl>
                                    <Input type="number" className="h-9" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="passingMarks"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Pass mark</FormLabel>
                                  <FormControl>
                                    <Input type="number" className="h-9" {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Notes (optional)</FormLabel>
                                <FormControl>
                                  <Textarea rows={2} className="resize-none" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-slate-200/80 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
              {step < 3 ? (
                <div className="flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={goBack}
                    disabled={step === 1}
                    className="h-9"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back
                  </Button>
                  <div className="hidden text-xs text-slate-500 sm:block">
                    {step === 1 && sessionTemplate
                      ? SESSION_TEMPLATE_LABELS[sessionTemplate]
                      : step === 2
                        ? scopeSummary
                        : null}
                  </div>
                  <Button type="button" size="sm" onClick={goNext} className="h-9">
                    Continue
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <PaperCountNotice
                    paperCount={paperCount}
                    gradeCount={selectedGradeIds.length}
                    subjectCount={selectedSubjectIds.length}
                    compact
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Badge variant="outline" className="gap-1 font-normal">
                      <GraduationCap className="h-3 w-3" />
                      {scopeSummary}
                    </Badge>
                    <Badge variant="outline" className="gap-1 font-normal">
                      <BookOpen className="h-3 w-3" />
                      {selectedSubjectIds.length} subject
                      {selectedSubjectIds.length === 1 ? '' : 's'}
                    </Badge>
                    {form.watch('startDate') && form.watch('endDate') ? (
                      <Badge variant="outline" className="gap-1 font-normal">
                        <CalendarDays className="h-3 w-3" />
                        {form.watch('startDate')} → {form.watch('endDate')}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={goBack}
                      className="h-9"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || paperCountOverLimit || paperCount === 0}
                      className="h-9 min-w-[140px]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {paperCountIsLarge ? 'Creating papers…' : 'Creating…'}
                        </>
                      ) : (
                        'Create exam session'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

function PaperCountNotice({
  paperCount,
  gradeCount,
  subjectCount,
  compact = false,
}: {
  paperCount: number
  gradeCount: number
  subjectCount: number
  compact?: boolean
}) {
  if (gradeCount === 0 || subjectCount === 0) return null

  const overLimit = paperCount > MAX_EXAM_SESSION_PAPERS
  const isLarge = paperCount > MAX_ASSESSMENTS_BATCH_SIZE

  if (!overLimit && !isLarge && compact) return null

  return (
    <div
      className={cn(
        'flex gap-2 rounded-xl border px-3 py-2.5 text-xs',
        overLimit
          ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200'
          : isLarge
            ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
            : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400',
      )}
    >
      {overLimit || isLarge ? (
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      ) : null}
      <div>
        <p className="font-semibold">
          {paperCount} exam paper{paperCount === 1 ? '' : 's'} across {gradeCount}{' '}
          grade{gradeCount === 1 ? '' : 's'}
        </p>
        {overLimit ? (
          <p className="mt-0.5">
            Exceeds the {MAX_EXAM_SESSION_PAPERS} paper limit. Deselect some grades or
            subjects to continue.
          </p>
        ) : isLarge ? (
          <p className="mt-0.5">
            Large session — creation runs in batches and may take up to a minute.
            Timetable setup is done on the session page afterwards.
          </p>
        ) : (
          <p className="mt-0.5">
            Each subject can include multiple papers (e.g. Paper 1, Paper 2,
            Composition, Practical) with different durations.
          </p>
        )}
      </div>
    </div>
  )
}

function ScopeShortcut({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
  disabled,
  hint,
  variant = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
  hint?: string
  variant?: 'default' | 'muted'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-xl border px-3 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-50',
        selected && variant === 'default'
          ? 'border-slate-900 bg-slate-900 text-white shadow-sm dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
          : selected && variant === 'muted'
            ? 'border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800'
            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
      )}
    >
      <Icon
        className={cn(
          'mb-2 h-4 w-4',
          selected && variant === 'default' ? 'text-white dark:text-slate-900' : 'text-slate-500',
        )}
      />
      <span className="block text-sm font-semibold">{title}</span>
      <span
        className={cn(
          'mt-0.5 block text-[11px] leading-snug',
          selected && variant === 'default'
            ? 'text-white/70 dark:text-slate-600'
            : 'text-slate-500',
        )}
      >
        {hint ?? description}
      </span>
    </button>
  )
}

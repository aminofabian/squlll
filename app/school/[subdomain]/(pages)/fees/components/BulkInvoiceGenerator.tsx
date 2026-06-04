'use client'

import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import {
  Send,
  FileText,
  CheckCircle,
  Loader2,
  Receipt,
  Check,
  GraduationCap,
  CalendarDays,
  Coins,
  Users,
} from 'lucide-react'
import {
  FeeStructure,
  Grade,
  BulkInvoiceGeneration,
  TermFeeStructure,
  FeeBucket,
  FeeComponent,
} from '../types'
import { useGraphQLFeeStructures } from '../hooks/useGraphQLFeeStructures'
import { useGradeData } from '../hooks/useGradeData'
import { FEES_BRAND, FEES_DETAIL } from '../lib/fees-ui'
import type { LinkedClassEntry } from '../lib/feePlanLinkage'
import { cn } from '@/lib/utils'

interface BulkInvoiceGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (generation: BulkInvoiceGeneration) => void
  preselectedStructureId?: string
  preselectedTerm?: string
  getLinkedClassCount?: (feeStructureId: string) => number
  /** Classes linked via fee assignments (source of truth — not grade.feeStructureId). */
  getLinkedClasses?: (feeStructureId: string) => LinkedClassEntry[]
  onNeedClassAssignment?: (feeStructureId: string) => void
}

const FLOW_STEPS = [
  { id: 'plan', label: 'Structure' },
  { id: 'classes', label: 'Classes' },
  { id: 'fees', label: 'Fees' },
  { id: 'dates', label: 'Dates' },
] as const

type FlowStepId = (typeof FLOW_STEPS)[number]['id']

function FlowProgressBar({
  currentStep,
  completed,
}: {
  currentStep: FlowStepId
  completed: Record<FlowStepId, boolean>
}) {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.id === currentStep)

  return (
    <nav
      aria-label="Invoice generation steps"
      className="flex items-center gap-0.5 rounded-lg border border-slate-200/80 bg-white p-1"
    >
      {FLOW_STEPS.map((step, index) => {
        const done = completed[step.id]
        const isCurrent = step.id === currentStep
        const isPast = index < currentIndex

        return (
          <div key={step.id} className="flex min-w-0 flex-1 items-center">
            <div
              className={cn(
                'flex w-full min-w-0 flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-center transition-colors',
                isCurrent && 'bg-primary/10',
                done && !isCurrent && 'opacity-90',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                  done
                    ? 'bg-primary text-white'
                    : isCurrent
                      ? 'border-2 border-primary text-primary'
                      : 'border border-slate-300 text-slate-400',
                )}
              >
                {done ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span
                className={cn(
                  'w-full truncate text-[10px] font-medium leading-tight',
                  isCurrent ? 'text-primary' : done || isPast ? 'text-slate-700' : 'text-slate-400',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < FLOW_STEPS.length - 1 ? (
              <div
                className={cn(
                  'mx-0.5 h-px w-2 shrink-0 sm:w-4',
                  done ? 'bg-primary/40' : 'bg-slate-200',
                )}
              />
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}

function DrawerSection({
  step,
  title,
  hint,
  action,
  children,
  locked,
  lockedMessage,
}: {
  step: number
  title: string
  hint?: string
  action?: ReactNode
  children: ReactNode
  locked?: boolean
  lockedMessage?: string
}) {
  if (locked) {
    return (
      <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-3 py-4">
        <div className="flex items-start gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-500">
            {step}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {lockedMessage ?? 'Complete the step above first.'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ backgroundColor: FEES_BRAND.primary }}
            >
              {step}
            </span>
            <h3
              className="text-sm font-semibold"
              style={{ color: FEES_BRAND.primaryDark }}
            >
              {title}
            </h3>
          </div>
          {hint ? (
            <p className="mt-1 pl-8 text-xs leading-relaxed text-slate-500">
              {hint}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-3">{children}</div>
    </section>
  )
}

function ContextStrip({
  planName,
  term,
  linkedCount,
  selectedClassCount,
  totalStudents,
}: {
  planName?: string
  term?: string
  linkedCount: number
  selectedClassCount: number
  totalStudents: number
}) {
  if (!planName) return null

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3 py-2 text-xs"
      style={{
        borderColor: FEES_BRAND.primaryMuted,
        backgroundColor: FEES_BRAND.primaryLight,
        color: FEES_BRAND.primaryDark,
      }}
    >
      <span className="font-semibold text-slate-900">{planName}</span>
      {term ? <span className="text-slate-600">{term}</span> : null}
      <span className="text-slate-500">·</span>
      <span>
        <span className="font-semibold tabular-nums">{linkedCount}</span> linked
      </span>
      {selectedClassCount > 0 ? (
        <>
          <span className="text-slate-500">·</span>
          <span>
            <span className="font-semibold tabular-nums">{selectedClassCount}</span>{' '}
            selected
            {totalStudents > 0 ? (
              <>
                {' '}
                (<span className="font-semibold tabular-nums">{totalStudents}</span>{' '}
                students)
              </>
            ) : null}
          </span>
        </>
      ) : null}
    </div>
  )
}

function formatClassLabel(grade: Grade): string {
  const base = grade.name?.trim() || 'Class'
  const section = grade.section?.trim()
  return section ? `${base} · ${section}` : base
}

function SelectableRow({
  id,
  checked,
  onToggle,
  title,
  subtitle,
  trailing,
}: {
  id: string
  checked: boolean
  onToggle: () => void
  title: string
  subtitle?: string
  trailing?: ReactNode
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
        checked
          ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/15'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80',
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-slate-900">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0 text-right">{trailing}</div> : null}
    </label>
  )
}

function getBlockingMessage(
  flow: {
    hasPlan: boolean
    hasClasses: boolean
    hasLineItems: boolean
    hasBuckets: boolean
    hasDueDate: boolean
    classesAvailable: boolean
  },
): string | null {
  if (!flow.hasPlan) return 'Choose a fee structure and term to continue'
  if (!flow.classesAvailable) return 'Link classes to this structure before billing'
  if (!flow.hasClasses) return 'Select at least one class to bill'
  if (!flow.hasBuckets) return 'This term has no fee items on the structure'
  if (!flow.hasLineItems) return 'Select at least one fee line item'
  if (!flow.hasDueDate) return 'Set a payment due date'
  return null
}

export const BulkInvoiceGenerator = ({
  isOpen,
  onClose,
  onGenerate,
  preselectedStructureId,
  preselectedTerm,
  getLinkedClassCount,
  getLinkedClasses,
  onNeedClassAssignment,
}: BulkInvoiceGeneratorProps) => {
  const {
    structures: graphQLFeeStructures,
    isLoading: isLoadingStructures,
    fetchFeeStructures,
  } = useGraphQLFeeStructures()
  const { grades: graphQLGrades, isLoading: isLoadingGrades, fetchGradeData } =
    useGradeData()

  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationComplete, setGenerationComplete] = useState(false)
  const autoSelectedForPlanRef = useRef<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchData = async () => {
      try {
        if (graphQLFeeStructures.length === 0) await fetchFeeStructures()
        await fetchGradeData()
      } catch (error) {
        if (!signal.aborted) console.error('Error fetching data:', error)
      }
    }

    fetchData()
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isOpen) return
    fetchGradeData()
    if (graphQLFeeStructures.length === 0) fetchFeeStructures()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (graphQLFeeStructures.length > 0) {
      const transformedStructures: FeeStructure[] = graphQLFeeStructures.map(
        (gqlStructure) => {
          const terms = gqlStructure.terms || []
          const termStructures: TermFeeStructure[] = terms.map((term) => {
            const termItems = gqlStructure.items || []
            const bucketMap = new Map<string, FeeBucket>()

            termItems.forEach((item) => {
              const bucketId = item.feeBucket.id
              if (!bucketMap.has(bucketId)) {
                bucketMap.set(bucketId, {
                  id: bucketId,
                  type: 'tuition',
                  name: item.feeBucket.name,
                  description: '',
                  amount: 0,
                  isOptional: !item.isMandatory,
                  components: [],
                })
              }
              const bucket = bucketMap.get(bucketId)!
              bucket.amount += item.amount
              const component: FeeComponent = {
                id: item.id,
                name: item.feeBucket.name,
                description: '',
                amount: item.amount,
                category: 'general',
              }
              bucket.components.push(component)
            })

            const buckets = Array.from(bucketMap.values())
            const totalAmount = buckets.reduce((sum, b) => sum + b.amount, 0)

            return {
              id: term.id,
              term: term.name as 'Term 1' | 'Term 2' | 'Term 3',
              buckets,
              totalAmount,
              dueDate: new Date().toISOString().split('T')[0],
              latePaymentFee: 0,
            }
          })

          return {
            id: gqlStructure.id,
            name: gqlStructure.name,
            grade: gqlStructure.gradeLevels
              .map((gl) => gl.gradeLevel?.name || gl.shortName || '')
              .join(', '),
            boardingType: 'both' as 'day' | 'boarding' | 'both',
            academicYear:
              gqlStructure.academicYear?.name ||
              new Date().getFullYear().toString(),
            isActive: gqlStructure.isActive,
            createdDate: gqlStructure.createdAt,
            lastModified: gqlStructure.updatedAt,
            termStructures,
          }
        },
      )
      setFeeStructures(transformedStructures)
    }
  }, [graphQLFeeStructures])

  useEffect(() => {
    if (graphQLGrades.length > 0) {
      setGrades(graphQLGrades)
    }
  }, [graphQLGrades])

  const [formData, setFormData] = useState<BulkInvoiceGeneration>({
    feeStructureId: preselectedStructureId || '',
    term: (preselectedTerm as 'Term 1' | 'Term 2' | 'Term 3') || 'Term 1',
    gradeIds: [],
    studentIds: [],
    generateDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    includeOptionalFees: false,
    selectedBuckets: [],
    customMessage: '',
  })

  useEffect(() => {
    if (!isOpen) {
      autoSelectedForPlanRef.current = null
      return
    }
    setGenerationComplete(false)
    setGenerationProgress(0)
    setIsGenerating(false)
    if (preselectedStructureId || preselectedTerm) {
      setFormData((prev) => ({
        ...prev,
        feeStructureId: preselectedStructureId || prev.feeStructureId,
        term:
          (preselectedTerm as 'Term 1' | 'Term 2' | 'Term 3') || prev.term,
      }))
    }
  }, [isOpen, preselectedStructureId, preselectedTerm])

  const selectedStructure = feeStructures.find(
    (fs) => fs.id === formData.feeStructureId,
  )
  const selectedTermStructure = selectedStructure?.termStructures.find(
    (ts) => ts.term === formData.term,
  )
  const linkedClassCount = formData.feeStructureId
    ? getLinkedClassCount?.(formData.feeStructureId) ?? 0
    : 0

  const availableGrades = useMemo(() => {
    if (!formData.feeStructureId) return []

    const linked = getLinkedClasses?.(formData.feeStructureId) ?? []
    if (linked.length > 0) {
      const linkedIds = new Set(linked.map((c) => c.id))
      const fromSchoolGrades = grades.filter(
        (g) =>
          linkedIds.has(g.tenantGradeLevelId) ||
          linkedIds.has(g.id) ||
          (g.id.includes('::') && linkedIds.has(g.id.split('::')[0])),
      )
      if (fromSchoolGrades.length > 0) return fromSchoolGrades

      return linked.map((lc) => ({
        id: lc.id,
        tenantGradeLevelId: lc.id,
        name: lc.name,
        level: 0,
        section: '',
        boardingType: 'day' as const,
        studentCount: 0,
        isActive: true,
      }))
    }

    return grades.filter((g) => g.feeStructureId === formData.feeStructureId)
  }, [
    formData.feeStructureId,
    grades,
    getLinkedClasses,
    linkedClassCount,
  ])

  const selectedGrades = availableGrades.filter((grade) =>
    formData.gradeIds.includes(grade.id),
  )
  const totalStudents = selectedGrades.reduce(
    (sum, grade) => sum + grade.studentCount,
    0,
  )

  const hasPlan = Boolean(formData.feeStructureId && formData.term)
  const classesAvailable = linkedClassCount > 0 || availableGrades.length > 0
  const hasClasses = formData.gradeIds.length > 0
  const hasBuckets =
    !!selectedTermStructure && selectedTermStructure.buckets.length > 0
  const hasLineItems = formData.selectedBuckets.length > 0
  const hasDueDate = Boolean(formData.dueDate)

  const flowCompleted = useMemo(
    (): Record<FlowStepId, boolean> => ({
      plan: hasPlan,
      classes: hasPlan && classesAvailable && hasClasses,
      fees: hasPlan && hasClasses && hasBuckets && hasLineItems,
      dates: hasPlan && hasClasses && hasLineItems && hasDueDate,
    }),
    [hasPlan, classesAvailable, hasClasses, hasBuckets, hasLineItems, hasDueDate],
  )

  const currentFlowStep = useMemo((): FlowStepId => {
    if (!flowCompleted.plan) return 'plan'
    if (!flowCompleted.classes) return 'classes'
    if (!flowCompleted.fees) return 'fees'
    return 'dates'
  }, [flowCompleted])

  const showClassesStep = hasPlan
  const showFeesStep = hasPlan && classesAvailable && hasClasses
  const showDatesStep = hasPlan && hasClasses && hasLineItems && hasBuckets

  const perStudentAmount = useMemo(() => {
    if (!selectedTermStructure) return 0
    return selectedTermStructure.buckets
      .filter((bucket) => formData.selectedBuckets.includes(bucket.id))
      .reduce((sum, bucket) => sum + bucket.amount, 0)
  }, [selectedTermStructure, formData.selectedBuckets])

  const totalInvoiceAmount = perStudentAmount * totalStudents

  const allGradesSelected =
    availableGrades.length > 0 &&
    formData.gradeIds.length === availableGrades.length
  const allBucketsSelected =
    !!selectedTermStructure &&
    selectedTermStructure.buckets.length > 0 &&
    formData.selectedBuckets.length === selectedTermStructure.buckets.length

  const canGenerate =
    hasPlan && hasClasses && hasLineItems && hasDueDate && hasBuckets

  const blockingMessage = getBlockingMessage({
    hasPlan,
    hasClasses,
    hasLineItems,
    hasBuckets,
    hasDueDate,
    classesAvailable,
  })

  // Default fee line items when user reaches the fees step
  useEffect(() => {
    if (!showFeesStep || !selectedTermStructure) return
    if (formData.selectedBuckets.length > 0) return

    const mandatory = selectedTermStructure.buckets
      .filter((b) => !b.isOptional)
      .map((b) => b.id)
    const defaults =
      mandatory.length > 0
        ? mandatory
        : selectedTermStructure.buckets.map((b) => b.id)

    if (defaults.length > 0) {
      setFormData((prev) => ({ ...prev, selectedBuckets: defaults }))
    }
  }, [showFeesStep, selectedTermStructure, formData.selectedBuckets.length])

  // Pre-select all linked classes once per structure (user can still clear or adjust)
  useEffect(() => {
    if (!isOpen || !hasPlan || !classesAvailable || isLoadingGrades) return
    if (availableGrades.length === 0) return
    const planId = formData.feeStructureId
    if (autoSelectedForPlanRef.current === planId) return
    autoSelectedForPlanRef.current = planId
    setFormData((prev) => ({
      ...prev,
      gradeIds: availableGrades.map((g) => g.id),
    }))
  }, [
    isOpen,
    hasPlan,
    classesAvailable,
    isLoadingGrades,
    availableGrades,
    formData.feeStructureId,
  ])

  const onStructureChange = (value: string) => {
    const structure = feeStructures.find((fs) => fs.id === value)
    const firstTerm =
      (structure?.termStructures[0]?.term as BulkInvoiceGeneration['term']) ||
      'Term 1'
    autoSelectedForPlanRef.current = null
    setFormData((prev) => ({
      ...prev,
      feeStructureId: value,
      term: firstTerm,
      gradeIds: [],
      selectedBuckets: [],
    }))
  }

  const onTermChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      term: value as BulkInvoiceGeneration['term'],
      selectedBuckets: [],
    }))
  }

  const toggleGrade = (gradeId: string) => {
    setFormData((prev) => ({
      ...prev,
      gradeIds: prev.gradeIds.includes(gradeId)
        ? prev.gradeIds.filter((id) => id !== gradeId)
        : [...prev.gradeIds, gradeId],
    }))
  }

  const toggleBucket = (bucketId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedBuckets: prev.selectedBuckets.includes(bucketId)
        ? prev.selectedBuckets.filter((id) => id !== bucketId)
        : [...prev.selectedBuckets, bucketId],
    }))
  }

  const toggleAllGrades = () => {
    setFormData((prev) => ({
      ...prev,
      gradeIds: allGradesSelected
        ? []
        : availableGrades.map((grade) => grade.id),
    }))
  }

  const toggleAllBuckets = () => {
    if (!selectedTermStructure) return
    setFormData((prev) => ({
      ...prev,
      selectedBuckets: allBucketsSelected
        ? []
        : selectedTermStructure.buckets.map((bucket) => bucket.id),
    }))
  }

  const handleGenerate = async () => {
    if (!canGenerate) return

    const linked = getLinkedClassCount?.(formData.feeStructureId) ?? -1
    if (linked === 0) {
      onNeedClassAssignment?.(formData.feeStructureId)
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          setGenerationComplete(true)
          return 100
        }
        return prev + 10
      })
    }, 200)

    onGenerate(formData)
  }

  const handleReset = () => {
    setGenerationComplete(false)
    setGenerationProgress(0)
    setFormData({
      feeStructureId: preselectedStructureId || '',
      term: (preselectedTerm as 'Term 1' | 'Term 2' | 'Term 3') || 'Term 1',
      gradeIds: [],
      studentIds: [],
      generateDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      includeOptionalFees: false,
      selectedBuckets: [],
      customMessage: '',
    })
  }

  const sectionAction = (label: string, onClick: () => void) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 shrink-0 px-2 text-xs font-medium text-primary hover:bg-primary/10"
      onClick={onClick}
    >
      {label}
    </Button>
  )

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction="right"
    >
      <DrawerContent className="flex h-full max-h-[100dvh] w-full max-w-xl flex-col">
        <DrawerHeader className="shrink-0 space-y-3 border-b border-slate-200/60 bg-gradient-to-br from-white via-slate-50/40 to-white px-4 pb-3 pt-4 text-left">
          <DrawerTitle className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${FEES_BRAND.primary} 0%, ${FEES_BRAND.primaryDark} 100%)`,
              }}
            >
              <Receipt className="h-4 w-4" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-base font-semibold text-slate-900">
                Generate term invoices
              </span>
              <span className="truncate text-xs text-slate-500">
                {selectedStructure && hasPlan
                  ? `${selectedStructure.name} · ${formData.term}`
                  : 'Work through each step — one invoice per student'}
              </span>
            </span>
          </DrawerTitle>

          {!generationComplete && !isGenerating ? (
            <>
              <FlowProgressBar
                currentStep={currentFlowStep}
                completed={flowCompleted}
              />
              {hasPlan && selectedStructure ? (
                <ContextStrip
                  planName={selectedStructure.name}
                  term={formData.term}
                  linkedCount={linkedClassCount || availableGrades.length}
                  selectedClassCount={formData.gradeIds.length}
                  totalStudents={totalStudents}
                />
              ) : null}
            </>
          ) : null}
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#f4f7f5]/50 px-4 py-4 pb-6">
          {generationComplete ? (
            <div className="space-y-5 py-6 text-center">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: FEES_BRAND.primaryLight }}
              >
                <CheckCircle
                  className="h-8 w-8"
                  style={{ color: FEES_BRAND.primary }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Invoices queued
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {totalStudents} invoice{totalStudents !== 1 ? 's' : ''} for{' '}
                  {formData.term} — ready to share with families.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={cn('rounded-xl border px-3 py-4', FEES_DETAIL.cardRadius)}
                  style={{
                    borderColor: FEES_BRAND.primaryMuted,
                    backgroundColor: FEES_BRAND.primaryLight,
                  }}
                >
                  <p
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: FEES_BRAND.primaryDark }}
                  >
                    {totalStudents}
                  </p>
                  <p className="text-xs text-slate-600">Students billed</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-4">
                  <p className="text-lg font-bold tabular-nums text-slate-900">
                    KES {totalInvoiceAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600">Total amount</p>
                </div>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="space-y-5 py-8 text-center">
              <FileText
                className="mx-auto h-12 w-12 animate-pulse"
                style={{ color: FEES_BRAND.primary }}
              />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Creating invoices…
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {totalStudents} students · {formData.term}
                </p>
              </div>
              <div className="mx-auto max-w-xs">
                <Progress value={generationProgress} className="h-2" />
                <p className="mt-2 text-xs tabular-nums text-slate-500">
                  {generationProgress}% complete
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <DrawerSection
                step={1}
                title="Structure & term"
                hint="Pick what you're billing and which term the invoice covers."
              >
                {isLoadingStructures ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-600">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    Loading fee structures…
                  </div>
                ) : feeStructures.length === 0 ? (
                  <p className="py-4 text-sm text-slate-500">
                    Create a fee structure first, then return here to bill students.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">
                          Fee structure
                        </Label>
                        <Select
                          value={formData.feeStructureId || undefined}
                          onValueChange={onStructureChange}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Choose structure…" />
                          </SelectTrigger>
                          <SelectContent>
                            {feeStructures.map((structure) => (
                              <SelectItem
                                key={structure.id}
                                value={structure.id}
                              >
                                {structure.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">
                          Term
                        </Label>
                        <Select
                          value={formData.term}
                          onValueChange={onTermChange}
                          disabled={!selectedStructure}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Choose term…" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedStructure?.termStructures.map((term) => (
                              <SelectItem key={term.id} value={term.term}>
                                {term.term}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {selectedStructure && hasPlan ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                            Year
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-slate-800">
                            {selectedStructure.academicYear}
                          </p>
                        </div>
                        {selectedTermStructure ? (
                          <div
                            className="rounded-lg border px-2.5 py-2"
                            style={{
                              borderColor: FEES_BRAND.primaryMuted,
                              backgroundColor: FEES_BRAND.surface,
                            }}
                          >
                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                              Full term / student
                            </p>
                            <p
                              className="mt-0.5 text-xs font-bold tabular-nums"
                              style={{ color: FEES_BRAND.primaryDark }}
                            >
                              KES{' '}
                              {selectedTermStructure.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )}
              </DrawerSection>

              {showClassesStep ? (
                <DrawerSection
                  step={2}
                  title="Classes to bill"
                  hint={
                    linkedClassCount > 0
                      ? `${linkedClassCount} class${linkedClassCount !== 1 ? 'es' : ''} linked to this structure — choose who gets an invoice.`
                      : 'Select classes linked to this structure.'
                  }
                  action={
                    classesAvailable && !isLoadingGrades
                      ? sectionAction(
                          allGradesSelected ? 'Clear all' : 'Select all',
                          toggleAllGrades,
                        )
                      : undefined
                  }
                >
                  {isLoadingGrades ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-600">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      Loading linked classes…
                    </div>
                  ) : !classesAvailable ? (
                    <div className="space-y-3 rounded-lg border border-amber-200/70 bg-amber-50/60 p-3">
                      <div className="flex gap-2">
                        <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                        <div>
                          <p className="text-sm font-medium text-amber-950">
                            No classes linked yet
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
                            Link grades to this structure first, then return here to
                            generate invoices.
                          </p>
                        </div>
                      </div>
                      {onNeedClassAssignment ? (
                        <Button
                          type="button"
                          size="sm"
                          className="w-full text-white"
                          style={{ backgroundColor: FEES_BRAND.primary }}
                          onClick={() =>
                            onNeedClassAssignment(formData.feeStructureId)
                          }
                        >
                          <GraduationCap className="mr-2 h-4 w-4" />
                          Link structure to grades
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="max-h-56 space-y-1.5 overflow-y-auto pr-0.5">
                        {availableGrades.map((grade) => (
                          <SelectableRow
                            key={grade.id}
                            id={`grade-${grade.id}`}
                            checked={formData.gradeIds.includes(grade.id)}
                            onToggle={() => toggleGrade(grade.id)}
                            title={formatClassLabel(grade)}
                            subtitle={
                              grade.studentCount > 0
                                ? `${grade.studentCount} student${grade.studentCount !== 1 ? 's' : ''}`
                                : 'Enrolled students'
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </DrawerSection>
              ) : null}

              {showFeesStep && selectedTermStructure ? (
                <DrawerSection
                  step={3}
                  title="Fee line items"
                  hint={`Charges for ${formData.term}. Required items are pre-selected.`}
                  action={sectionAction(
                    allBucketsSelected ? 'Clear all' : 'Select all',
                    toggleAllBuckets,
                  )}
                >
                  <div className="space-y-2">
                    <div className="space-y-2">
                      {selectedTermStructure.buckets.map((bucket) => (
                        <SelectableRow
                          key={bucket.id}
                          id={`bucket-${bucket.id}`}
                          checked={formData.selectedBuckets.includes(bucket.id)}
                          onToggle={() => toggleBucket(bucket.id)}
                          title={bucket.name}
                          subtitle={
                            bucket.isOptional ? 'Optional' : 'Included by default'
                          }
                          trailing={
                            <span className="text-xs font-semibold tabular-nums text-slate-800">
                              KES {bucket.amount.toLocaleString()}
                            </span>
                          }
                        />
                      ))}
                    </div>
                    {hasLineItems ? (
                      <div
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                        style={{
                          backgroundColor: FEES_BRAND.primaryLight,
                          color: FEES_BRAND.primaryDark,
                        }}
                      >
                        <span>
                          Per student × {totalStudents} student
                          {totalStudents !== 1 ? 's' : ''}
                        </span>
                        <span className="font-bold tabular-nums">
                          KES {totalInvoiceAmount.toLocaleString()}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </DrawerSection>
              ) : hasPlan && hasClasses && !hasBuckets ? (
                <div className="flex gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-3 text-sm text-amber-900">
                  <Coins className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">No fees for {formData.term}</p>
                    <p className="mt-1 text-xs">
                      Add line items on the structure schedule, then try again.
                    </p>
                  </div>
                </div>
              ) : null}

              {showDatesStep ? (
                <DrawerSection
                  step={4}
                  title="Dates & note"
                  hint="Due date is required. Parents see the note on the invoice."
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="generate-date"
                          className="text-xs font-medium text-slate-700"
                        >
                          Issue date
                        </Label>
                        <Input
                          id="generate-date"
                          type="date"
                          className="h-9"
                          value={formData.generateDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              generateDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="due-date"
                          className="text-xs font-medium text-slate-700"
                        >
                          Due date
                          <span className="text-rose-600"> *</span>
                        </Label>
                        <Input
                          id="due-date"
                          type="date"
                          className={cn(
                            'h-9',
                            !formData.dueDate && 'border-amber-300',
                          )}
                          value={formData.dueDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              dueDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="custom-message"
                        className="text-xs font-medium text-slate-700"
                      >
                        Note for parents{' '}
                        <span className="font-normal text-slate-400">
                          (optional)
                        </span>
                      </Label>
                      <Textarea
                        id="custom-message"
                        rows={3}
                        className="resize-none text-sm"
                        value={formData.customMessage}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            customMessage: e.target.value,
                          }))
                        }
                        placeholder="Bank details, paybill, or a short payment reminder…"
                      />
                    </div>
                  </div>
                </DrawerSection>
              ) : null}
            </div>
          )}
        </div>

        {!generationComplete && !isGenerating ? (
          <DrawerFooter className="shrink-0 gap-2 border-t border-slate-200/80 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {canGenerate ? (
              <div className="grid w-full grid-cols-3 gap-2 text-center text-[10px]">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2">
                  <Users className="mx-auto mb-0.5 h-3.5 w-3.5 text-slate-500" />
                  <p className="font-bold tabular-nums text-slate-900">
                    {totalStudents || formData.gradeIds.length}
                  </p>
                  <p className="text-slate-500">Invoices</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2">
                  <CalendarDays className="mx-auto mb-0.5 h-3.5 w-3.5 text-slate-500" />
                  <p className="font-semibold text-slate-800">{formData.term}</p>
                  <p className="text-slate-500">Term</p>
                </div>
                <div
                  className="rounded-lg border px-2 py-2"
                  style={{
                    borderColor: FEES_BRAND.primaryMuted,
                    backgroundColor: FEES_BRAND.primaryLight,
                  }}
                >
                  <Coins
                    className="mx-auto mb-0.5 h-3.5 w-3.5"
                    style={{ color: FEES_BRAND.primary }}
                  />
                  <p
                    className="truncate text-[10px] font-bold tabular-nums leading-tight"
                    style={{ color: FEES_BRAND.primaryDark }}
                    title={`KES ${totalInvoiceAmount.toLocaleString()}`}
                  >
                    {totalInvoiceAmount.toLocaleString()}
                  </p>
                  <p className="text-slate-600">KES total</p>
                </div>
              </div>
            ) : blockingMessage ? (
              <p className="w-full rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">
                {blockingMessage}
              </p>
            ) : null}
            <div className="flex w-full gap-2">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                className="flex-1 text-white disabled:opacity-50"
                style={{ backgroundColor: FEES_BRAND.primary }}
                onClick={handleGenerate}
                disabled={!canGenerate}
              >
                <Send className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {canGenerate && totalStudents > 0
                    ? `Generate ${totalStudents}`
                    : 'Generate'}
                </span>
              </Button>
            </div>
          </DrawerFooter>
        ) : generationComplete ? (
          <DrawerFooter className="shrink-0 gap-2 border-t border-slate-200/80 bg-white px-4 pb-4 pt-3">
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={handleReset}>
                Bill another batch
              </Button>
              <DrawerClose asChild>
                <Button
                  className="flex-1 text-white"
                  style={{ backgroundColor: FEES_BRAND.primary }}
                >
                  Done
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

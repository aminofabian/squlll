'use client'

import { useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  GraduationCap,
  Link2,
  Loader2,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { Grade } from '../types'
import { useGradeLevels } from '../hooks/useGradeLevels'
import {
  tenantGradeLevelsToGrades,
  resolveTenantGradeLevelIds,
} from '../lib/gradeLevelsDisplay'
import { FEES_BRAND } from '../lib/fees-ui'

interface FeeStructure {
  id: string
  name: string
  academicYear?: string
  academicYearId?: string
  termId?: string
  isActive?: boolean
  /** Grades already linked to this plan (tenant grade-level ids). */
  linkedGrades?: Array<{ id: string; name: string }>
}

interface AssignFeeStructureModalProps {
  isOpen: boolean
  onClose: () => void
  feeStructure: FeeStructure | null
  availableGrades: Grade[]
  onSuccess?: (response: unknown) => void
}

const FLOW_STEPS = [
  { id: 'note', label: 'Note' },
  { id: 'grades', label: 'Grades' },
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
      aria-label="Link structure steps"
      className="flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white p-1"
    >
      {FLOW_STEPS.map((step, index) => {
        const done = completed[step.id]
        const isCurrent = step.id === currentStep

        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div
              className={cn(
                'flex w-full flex-col items-center gap-0.5 rounded-md px-2 py-1.5',
                isCurrent && 'bg-primary/10',
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
                  'text-[10px] font-medium',
                  isCurrent ? 'text-primary' : done ? 'text-slate-700' : 'text-slate-400',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < FLOW_STEPS.length - 1 ? (
              <div
                className={cn(
                  'mx-1 h-px w-6 shrink-0',
                  completed.note ? 'bg-primary/40' : 'bg-slate-200',
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
}: {
  step: number
  title: string
  hint?: string
  action?: ReactNode
  children: ReactNode
}) {
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

function GradeSelectRow({
  id,
  checked,
  onToggle,
  title,
  subtitle,
  badge,
}: {
  id: string
  checked: boolean
  onToggle: () => void
  title: string
  subtitle?: string
  badge?: string
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
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          {badge ? (
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
              {badge}
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>
    </label>
  )
}

function abbreviateGradeName(name: string): string {
  const normalized = name.toLowerCase().trim()

  if (normalized.includes('playgroup')) return 'PG'
  if (normalized.includes('pp1') || normalized === 'pre-primary 1') return 'PP1'
  if (normalized.includes('pp2') || normalized === 'pre-primary 2') return 'PP2'

  const gradeMatch = normalized.match(/grade\s*(\d+)/i)
  if (gradeMatch) {
    const gradeNum = parseInt(gradeMatch[1], 10)
    if (gradeNum >= 1 && gradeNum <= 6) return `G${gradeNum}`
    if (gradeNum >= 7 && gradeNum <= 12) return `F${gradeNum - 6}`
  }

  const formMatch = normalized.match(/form\s*(\d+)/i)
  if (formMatch) {
    const formNum = parseInt(formMatch[1], 10)
    if (formNum >= 1 && formNum <= 6) return `F${formNum}`
  }

  return name
}

function getGradeSortOrder(name: string): number {
  const normalized = name.toLowerCase().trim()

  if (normalized.includes('playgroup')) return 1
  if (normalized.includes('pp1') || normalized === 'pre-primary 1') return 2
  if (normalized.includes('pp2') || normalized === 'pre-primary 2') return 3

  const gradeMatch = normalized.match(/grade\s*(\d+)/i)
  if (gradeMatch) {
    const gradeNum = parseInt(gradeMatch[1], 10)
    if (gradeNum >= 1 && gradeNum <= 6) return 3 + gradeNum
    if (gradeNum >= 7 && gradeNum <= 12) return 9 + gradeNum
  }

  const formMatch = normalized.match(/form\s*(\d+)/i)
  if (formMatch) {
    const formNum = parseInt(formMatch[1], 10)
    if (formNum >= 1 && formNum <= 6) return 9 + formNum
  }

  return 999
}

export const AssignFeeStructureModal = ({
  isOpen,
  onClose,
  feeStructure,
  availableGrades,
  onSuccess,
}: AssignFeeStructureModalProps) => {
  const [description, setDescription] = useState('')
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filteredGradeLevels, setFilteredGradeLevels] = useState<string[]>([])
  const [isLoadingFilteredStructure, setIsLoadingFilteredStructure] =
    useState(false)
  const [eligibleStudentCount, setEligibleStudentCount] = useState<
    number | null
  >(null)
  const [eligibilityLoading, setEligibilityLoading] = useState(false)
  const { toast } = useToast()

  const { gradeLevels, isLoading: isLoadingGradeLevels } = useGradeLevels()

  const gradeLevelsAsGrades = tenantGradeLevelsToGrades(gradeLevels)

  const allAvailableGrades =
    gradeLevelsAsGrades.length > 0 ? gradeLevelsAsGrades : availableGrades
  const filteredGrades =
    filteredGradeLevels.length > 0
      ? allAvailableGrades.filter(
          (grade) =>
            filteredGradeLevels.includes(grade.tenantGradeLevelId) ||
            filteredGradeLevels.includes(grade.id),
        )
      : allAvailableGrades

  const displayItems = useMemo(
    () =>
      filteredGrades
        .map((item) => ({
          ...item,
          abbreviatedName: abbreviateGradeName(item.name),
          sortOrder: getGradeSortOrder(item.name),
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [filteredGrades],
  )

  const isLoading =
    (availableGrades.length === 0 && isLoadingGradeLevels) ||
    isLoadingFilteredStructure
  // Fee assignments are always grade-level links; keep the language
  // consistent even when the caller supplies class/stream cards.
  const gradeLabel = 'grade'
  const gradeLabelPlural = 'grades'

  const linkedKeySet = useMemo(() => {
    const keys = new Set<string>()
    for (const grade of feeStructure?.linkedGrades ?? []) {
      if (grade.id) keys.add(grade.id)
    }
    return keys
  }, [feeStructure])

  const isLinkedGrade = useCallback(
    (grade: (typeof displayItems)[number]) =>
      !!feeStructure &&
      (linkedKeySet.has(grade.tenantGradeLevelId) ||
        linkedKeySet.has(grade.id) ||
        grade.feeStructureId === feeStructure.id),
    [feeStructure, linkedKeySet],
  )

  /** Only grades that are not already on this plan can be selected. */
  const selectableItems = useMemo(
    () => displayItems.filter((grade) => !isLinkedGrade(grade)),
    [displayItems, isLinkedGrade],
  )

  /** Already-linked grades, including names that are not in the current filter. */
  const linkedItems = useMemo(() => {
    const byKey = new Map<
      string,
      { key: string; name: string; studentCount?: number; section?: string }
    >()

    for (const grade of feeStructure?.linkedGrades ?? []) {
      if (!grade?.id || !grade?.name) continue
      byKey.set(grade.id, { key: grade.id, name: grade.name })
    }

    for (const grade of displayItems) {
      if (!isLinkedGrade(grade)) continue
      const key = grade.tenantGradeLevelId || grade.id
      const existing = byKey.get(key)
      if (existing) {
        if (existing.studentCount == null) {
          existing.studentCount = grade.studentCount
        }
        if (!existing.section && grade.section) {
          existing.section = grade.section
        }
      } else {
        byKey.set(key, {
          key,
          name: grade.name,
          studentCount: grade.studentCount,
          section: grade.section,
        })
      }
    }

    return [...byKey.values()].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    )
  }, [feeStructure, displayItems, isLinkedGrade])

  const hasExistingLinks = linkedItems.length > 0

  const allSelected =
    selectableItems.length > 0 &&
    selectableItems.every((g) => selectedGradeIds.includes(g.id))

  const hasNote = description.trim().length > 0
  const hasGrades = selectedGradeIds.length > 0

  const flowCompleted = useMemo(
    (): Record<FlowStepId, boolean> => ({
      note: hasNote,
      grades: hasGrades || hasExistingLinks,
    }),
    [hasNote, hasGrades, hasExistingLinks],
  )

  const currentFlowStep: FlowStepId =
    hasGrades || hasExistingLinks ? 'grades' : 'note'

  const selectedPreview = useMemo(
    () =>
      selectedGradeIds
        .map((id) => displayItems.find((g) => g.id === id))
        .filter(Boolean) as (typeof displayItems)[number][],
    [selectedGradeIds, displayItems],
  )

  const selectedOnOtherPlan = useMemo(
    () =>
      selectedPreview.filter(
        (grade) =>
          !!grade.feeStructureId &&
          grade.feeStructureId !== feeStructure?.id,
      ),
    [selectedPreview, feeStructure?.id],
  )

  useEffect(() => {
    const fetchFilteredFeeStructure = async () => {
      if (!isOpen || !feeStructure?.termId || !feeStructure?.academicYearId) {
        setFilteredGradeLevels([])
        return
      }

      setIsLoadingFilteredStructure(true)
      setError(null)

      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetFeeStructureByGradeAndTerm($termId: String!, $academicYearId: String!) {
                feeStructureByGradeAndTerm(
                  termId: $termId
                  academicYearId: $academicYearId
                ) {
                  id
                  name
                  gradeLevels { id name }
                }
              }
            `,
            variables: {
              termId: feeStructure.termId,
              academicYearId: feeStructure.academicYearId,
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (result.errors?.length) {
          throw new Error(
            result.errors[0]?.message || 'Failed to fetch fee plan',
          )
        }

        if (result.data?.feeStructureByGradeAndTerm?.gradeLevels) {
          const gradeLevelIds =
            result.data.feeStructureByGradeAndTerm.gradeLevels.map(
              (gl: { id: string }) => gl.id,
            )
          setFilteredGradeLevels(gradeLevelIds)
        } else {
          setFilteredGradeLevels([])
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load grade filter'
        setError(errorMessage)
        setFilteredGradeLevels([])
      } finally {
        setIsLoadingFilteredStructure(false)
      }
    }

    fetchFilteredFeeStructure()
  }, [isOpen, feeStructure])

  useEffect(() => {
    if (!isOpen) return

    const currentDate = new Date()
    const quarter = Math.floor(currentDate.getMonth() / 3) + 1
    const year = currentDate.getFullYear()
    setDescription(
      `Q${quarter} ${year} Fee Assignment${feeStructure ? ` — ${feeStructure.name}` : ''}`,
    )
    setSelectedGradeIds([])
    setError(null)
    setEligibleStudentCount(null)
  }, [isOpen, feeStructure])

  useEffect(() => {
    if (!isOpen || !feeStructure || selectedGradeIds.length === 0) {
      setEligibleStudentCount(null)
      return
    }

    const tenantGradeLevelIds = resolveTenantGradeLevelIds(
      selectedGradeIds,
      displayItems,
    )

    if (tenantGradeLevelIds.length === 0) {
      setEligibleStudentCount(null)
      return
    }

    let cancelled = false
    setEligibilityLoading(true)

    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query FeePlanGradeEligibilityPreview(
            $feeStructureId: ID!
            $tenantGradeLevelIds: [ID!]!
          ) {
            feePlanGradeEligibilityPreview(
              feeStructureId: $feeStructureId
              tenantGradeLevelIds: $tenantGradeLevelIds
            ) {
              eligibleStudentCount
            }
          }
        `,
        variables: {
          feeStructureId: feeStructure.id,
          tenantGradeLevelIds,
        },
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return
        setEligibleStudentCount(
          result.data?.feePlanGradeEligibilityPreview?.eligibleStudentCount ??
            null,
        )
      })
      .catch(() => {
        if (!cancelled) setEligibleStudentCount(null)
      })
      .finally(() => {
        if (!cancelled) setEligibilityLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, feeStructure, selectedGradeIds, displayItems])

  const handleGradeToggle = (gradeId: string) => {
    setSelectedGradeIds((prev) =>
      prev.includes(gradeId)
        ? prev.filter((id) => id !== gradeId)
        : [...prev, gradeId],
    )
  }

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedGradeIds([])
    } else {
      setSelectedGradeIds(selectableItems.map((item) => item.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!feeStructure) {
      setError('No fee plan selected')
      return
    }

    if (selectedGradeIds.length === 0) {
      setError(`Select at least one ${gradeLabel} to continue`)
      return
    }

    const tenantGradeLevelIds = resolveTenantGradeLevelIds(
      selectedGradeIds,
      displayItems,
    )

    if (tenantGradeLevelIds.length === 0) {
      setError('Could not resolve grade levels. Refresh and try again.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateFeeAssignment($input: CreateFeeAssignmentInput!) {
              createFeeAssignment(createFeeAssignmentInput: $input) {
                id
                studentsAssignedCount
                feeStructure { id name }
              }
            }
          `,
          variables: {
            input: {
              feeStructureId: feeStructure.id,
              tenantGradeLevelIds,
              description,
            },
          },
        }),
      })

      const result = await response.json()

      if (result.errors?.length) {
        throw new Error(
          result.errors[0]?.message || 'Failed to link structure to grades',
        )
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const assignmentResult = result.data.createFeeAssignment
      const studentsAssigned = assignmentResult?.studentsAssignedCount ?? 0

      toast({
        title: 'Fee plan linked',
        description:
          studentsAssigned > 0
            ? `Linked ${tenantGradeLevelIds.length} ${gradeLabelPlural} — ${studentsAssigned} student${studentsAssigned !== 1 ? 's' : ''} assigned now.`
            : `Linked ${tenantGradeLevelIds.length} ${gradeLabelPlural}. Students inherit as they enroll.`,
      })

      onSuccess?.(assignmentResult)
      onClose()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      toast({
        title: 'Could not link structure',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const sectionAction = (label: string, onClick: () => void, disabled?: boolean) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled}
      className="h-7 shrink-0 px-2 text-xs font-medium text-primary hover:bg-primary/10"
      onClick={onClick}
    >
      {label}
    </Button>
  )

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
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
              <Link2 className="h-4 w-4" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-base font-semibold text-slate-900">
                Link grades to this plan
              </span>
              {feeStructure ? (
                <span className="truncate text-xs text-slate-500">
                  {feeStructure.name}
                  {feeStructure.academicYear
                    ? ` · ${feeStructure.academicYear}`
                    : ''}
                  {hasExistingLinks
                    ? ` · ${linkedItems.length} already linked`
                    : ''}
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Choose which grades receive this fee plan
                </span>
              )}
            </span>
          </DrawerTitle>

          {feeStructure ? (
            <FlowProgressBar
              currentStep={currentFlowStep}
              completed={flowCompleted}
            />
          ) : null}
        </DrawerHeader>

        {feeStructure ? (
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto bg-[#f4f7f5]/50 px-4 py-4">
              <div className="space-y-3">
                <p className="rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs leading-relaxed text-slate-600">
                  Students in selected grades get{' '}
                  <span className="font-semibold text-slate-900">
                    {feeStructure.name}
                  </span>
                  . New enrollments inherit automatically; past balances stay
                  unchanged.
                </p>

                <DrawerSection
                  step={1}
                  title="Label this assignment"
                  hint="Optional — helps you find it later in assignment history."
                >
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="description"
                      className="text-xs font-medium text-slate-700"
                    >
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Term 1 2026 — all day grades"
                      className="h-9"
                    />
                  </div>
                </DrawerSection>

                <DrawerSection
                  step={2}
                  title={`Which ${gradeLabelPlural} should get this fee plan?`}
                  hint={
                    hasExistingLinks
                      ? `${linkedItems.length} already linked. Select any other ${gradeLabel} below to add it.`
                      : `Tap to select. Applies to every student currently in that ${gradeLabel}.`
                  }
                  action={
                    selectableItems.length > 0 && !isLoading
                      ? sectionAction(
                          allSelected
                            ? 'Clear selection'
                            : hasExistingLinks
                              ? 'Select all unlinked'
                              : 'Select all',
                          handleSelectAll,
                        )
                      : undefined
                  }
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-600">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      Loading {gradeLabelPlural}…
                    </div>
                  ) : displayItems.length === 0 && !hasExistingLinks ? (
                    <div className="py-6 text-center">
                      <GraduationCap className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-sm text-slate-600">
                        No {gradeLabelPlural} available for this structure.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {hasExistingLinks ? (
                        <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-2.5">
                          <div className="flex items-start gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-emerald-950">
                                Already linked
                              </p>
                              <p className="mt-0.5 text-[10px] leading-relaxed text-emerald-800/80">
                                These grades stay linked. Only new selections
                                below are added.
                              </p>
                            </div>
                            <span className="rounded-full border border-emerald-200 bg-white/80 px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-emerald-800">
                              {linkedItems.length}
                            </span>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {linkedItems.map((grade) => (
                              <li
                                key={grade.key}
                                className="flex min-w-0 items-center gap-2 rounded-md border border-emerald-100 bg-white/80 px-2 py-1.5"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                <span className="min-w-0 truncate text-xs font-medium text-slate-800">
                                  {grade.name}
                                </span>
                                {grade.section ? (
                                  <span className="shrink-0 text-[10px] text-slate-500">
                                    {grade.section}
                                  </span>
                                ) : null}
                                {grade.studentCount != null ? (
                                  <span className="shrink-0 text-[10px] tabular-nums text-slate-500">
                                    {grade.studentCount} student
                                    {grade.studentCount === 1 ? '' : 's'}
                                  </span>
                                ) : null}
                                <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-emerald-800">
                                  Linked
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {selectableItems.length === 0 ? (
                        <div className="py-5 text-center">
                          <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-emerald-500" />
                          <p className="text-sm font-medium text-slate-700">
                            Every available {gradeLabel} is already linked
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Nothing else to add for this plan.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="h-px flex-1 bg-slate-200" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {hasExistingLinks
                                ? 'Add more grades'
                                : 'Available grades'}
                            </span>
                            <span className="h-px flex-1 bg-slate-200" />
                          </div>
                          <p className="text-xs text-slate-500">
                            {selectedGradeIds.length === 0 ? (
                              `Select one or more ${gradeLabelPlural} below.`
                            ) : (
                              <>
                                <span className="font-semibold tabular-nums text-slate-800">
                                  {selectedGradeIds.length}
                                </span>{' '}
                                {gradeLabel}
                                {selectedGradeIds.length !== 1 ? 's' : ''}{' '}
                                selected
                              </>
                            )}
                          </p>
                          <div className="max-h-[min(22rem,50vh)] space-y-2 overflow-y-auto pr-0.5">
                            {selectableItems.map((grade) => {
                              const isSelected = selectedGradeIds.includes(
                                grade.id,
                              )
                              const displayTitle =
                                grade.abbreviatedName +
                                (grade.section ? ` · ${grade.section}` : '')

                              return (
                                <GradeSelectRow
                                  key={grade.id}
                                  id={`link-grade-${grade.id}`}
                                  checked={isSelected}
                                  onToggle={() => handleGradeToggle(grade.id)}
                                  title={displayTitle}
                                  subtitle={
                                    grade.studentCount !== undefined
                                      ? `${grade.studentCount} student${grade.studentCount !== 1 ? 's' : ''} enrolled`
                                      : undefined
                                  }
                                  badge={
                                    grade.feeStructureId
                                      ? 'On another plan'
                                      : undefined
                                  }
                                />
                              )
                            })}
                          </div>

                          {selectedOnOtherPlan.length > 0 ? (
                            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-900">
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <span>
                                {selectedOnOtherPlan.length} selected{' '}
                                {gradeLabel}
                                {selectedOnOtherPlan.length !== 1 ? 's are' : ' is'}{' '}
                                also on another plan for this year. Linking
                                may create a duplicate link for the same term.
                              </span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  )}
                </DrawerSection>

                {error ? (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
                    {error}
                  </div>
                ) : null}
              </div>
            </div>

            <DrawerFooter className="shrink-0 gap-2 border-t border-slate-200/80 bg-white px-4 pb-4 pt-3">
              {hasGrades ? (
                <div className="w-full space-y-2">
                  <div
                    className="rounded-lg border px-3 py-2 text-xs"
                    style={{
                      borderColor: FEES_BRAND.primaryMuted,
                      backgroundColor: FEES_BRAND.primaryLight,
                      color: FEES_BRAND.primaryDark,
                    }}
                  >
                    {eligibilityLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Counting students who will receive this structure…
                      </span>
                    ) : eligibleStudentCount != null ? (
                      <span>
                        <span className="font-bold tabular-nums">
                          {eligibleStudentCount.toLocaleString()}
                        </span>{' '}
                        student
                        {eligibleStudentCount !== 1 ? 's' : ''} will be
                        assigned now (excluding exemptions).
                      </span>
                    ) : (
                      <span>
                        {selectedGradeIds.length}{' '}
                        {gradeLabel}
                        {selectedGradeIds.length !== 1 ? 's' : ''} selected
                      </span>
                    )}
                  </div>

                  {selectedPreview.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPreview.slice(0, 6).map((grade) => (
                        <span
                          key={grade.id}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                        >
                          {grade.abbreviatedName}
                          {grade.section ? ` · ${grade.section}` : ''}
                          <button
                            type="button"
                            className="rounded p-0.5 hover:bg-slate-200"
                            aria-label={`Remove ${grade.name}`}
                            onClick={() => handleGradeToggle(grade.id)}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                      {selectedPreview.length > 6 ? (
                        <span className="rounded-md border border-dashed border-slate-200 px-2 py-0.5 text-[10px] text-slate-500">
                          +{selectedPreview.length - 6} more
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="w-full text-center text-xs text-slate-500">
                  {hasExistingLinks
                    ? selectableItems.length === 0
                      ? `All ${linkedItems.length} ${gradeLabel}${
                          linkedItems.length === 1 ? '' : 's'
                        } are already linked to this plan.`
                      : `${linkedItems.length} ${gradeLabel}${
                          linkedItems.length === 1 ? '' : 's'
                        } already linked. Select another to add it.`
                    : `Select at least one ${gradeLabel} to link this structure`}
                </p>
              )}

              <div className="flex w-full gap-2">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-white disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                  disabled={isSubmitting || !hasGrades}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Linking…
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4 shrink-0" />
                      {selectedGradeIds.length > 0
                        ? `Link ${selectedGradeIds.length} ${
                            selectedGradeIds.length === 1
                              ? gradeLabel
                              : gradeLabelPlural
                          }`
                        : hasExistingLinks
                          ? 'Select grades to add'
                          : 'Link grades'}
                    </>
                  )}
                </Button>
              </div>
            </DrawerFooter>
          </form>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-slate-500">
            Select a fee structure first.
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}

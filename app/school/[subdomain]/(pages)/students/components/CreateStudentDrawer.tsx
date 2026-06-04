"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  SelectValue
} from "@/components/ui/select"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  UserPlus,
  Verified,
  Loader2,
  Users,
  Hash,
  Phone,
  GraduationCap,
  Mail,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { StudentSuccessModal } from './StudentSuccessModal'
import { StudentsEnrollTrigger, type EnrollTriggerVariant } from './StudentsEnrollTrigger'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { useGradeLevelsForSchoolType } from '@/lib/hooks/useGradeLevelsForSchoolType'
import { studentsPanel } from './students-ui'

const phoneSchema = z.string().refine(
  (value) => /^\+254[0-9]{9}$|^\+2540[0-9]{9}$/.test(value),
  { message: 'Enter a valid number: +254XXXXXXXXX' },
)

const studentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  admission_number: z.string().min(1, "Admission number is required"),
  gender: z.enum(["male", "female"]),
  grade: z.string().min(1, "Grade is required"),
  stream: z.string().optional(),
  phone: phoneSchema,
  student_email: z.string().email().optional().or(z.literal("")),
})

type StudentFormData = z.infer<typeof studentFormSchema>

interface CreateStudentDrawerProps {
  onStudentCreated: (studentName?: string) => void
  onStudentCreatedWithId?: (studentId: string, studentName?: string) => void
  defaultOpen?: boolean
  triggerVariant?: EnrollTriggerVariant
}

function formatPhoneNumber(value: string): string {
  if (value === '' || value === '+' || value === '+2' || value === '+25') {
    return '+254'
  }

  let cleaned = value.replace(/[^\d+]/g, '')

  if (cleaned.startsWith('0')) {
    cleaned = '+254' + cleaned.substring(1)
  } else if (cleaned && /^\d/.test(cleaned) && !cleaned.startsWith('+')) {
    cleaned = '+254' + cleaned
  } else if (cleaned.startsWith('+2540')) {
    cleaned = '+254' + cleaned.substring(5)
  } else if (!cleaned || cleaned === '+') {
    cleaned = '+254'
  }

  if (cleaned.startsWith('+2540')) {
    if (cleaned.length > 14) cleaned = cleaned.substring(0, 14)
  } else if (cleaned.startsWith('+254')) {
    if (cleaned.length > 13) cleaned = cleaned.substring(0, 13)
  }

  return cleaned
}

function emailFromName(name: string): string {
  const cleanName = name.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, '')
  return cleanName ? `${cleanName}@squl.ac.ke` : 'studentname@squl.ac.ke'
}

function getGradeNumber(gradeName: string): number {
  const gradeMatch = gradeName.match(/Grade\s+(\d+)/i)
  if (gradeMatch) return parseInt(gradeMatch[1])

  const formMatch = gradeName.match(/Form\s+(\d+)/i)
  if (formMatch) return parseInt(formMatch[1]) + 6

  const ppMatch = gradeName.match(/PP(\d+)/i)
  if (ppMatch) return parseInt(ppMatch[1]) - 3

  const specialGrades: Record<string, number> = {
    'Baby Class': -4,
    'Nursery': -3,
    'Reception': -2,
  }

  return specialGrades[gradeName] ?? 999
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const fieldShell =
  "h-11 rounded-xl border-0 bg-slate-100/80 pl-10 text-sm shadow-none ring-1 ring-inset ring-slate-200/70 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/40 dark:bg-slate-800/60 dark:ring-slate-700/60 dark:placeholder:text-slate-500"

const selectShell =
  "h-11 rounded-xl border-0 bg-slate-100/80 text-sm shadow-none ring-1 ring-inset ring-slate-200/70 focus:ring-2 focus:ring-primary/40 dark:bg-slate-800/60 dark:ring-slate-700/60"

function SectionCard({
  step,
  title,
  subtitle,
  icon,
  children,
  complete,
}: {
  step: string
  title: string
  subtitle: string
  icon: React.ReactNode
  children: React.ReactNode
  complete?: boolean
}) {
  return (
    <section className={cn(studentsPanel, "relative overflow-hidden p-0")}>
      <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800/80">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
            complete
              ? "bg-primary/15 text-primary ring-1 ring-primary/25"
              : "bg-primary/10 text-primary/70 ring-1 ring-primary/10",
          )}
        >
          {complete ? <CheckCircle2 className="h-4 w-4" /> : icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {step}
            </span>
            {complete && (
              <Badge className="h-4 rounded-full bg-primary/10 px-1.5 text-[9px] font-semibold text-primary hover:bg-primary/10">
                Done
              </Badge>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  )
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      {children}
    </span>
  )
}

function GenderPills({
  value,
  onChange,
}: {
  value: "male" | "female"
  onChange: (v: "male" | "female") => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {([
        { id: "male" as const, label: "Male", emoji: "👦" },
        { id: "female" as const, label: "Female", emoji: "👧" },
      ]).map((option) => {
        const active = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary text-white shadow-md shadow-primary/25 ring-2 ring-primary/30"
                : "bg-slate-100/80 text-slate-600 ring-1 ring-inset ring-slate-200/70 hover:bg-slate-200/60 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700/60 dark:hover:bg-slate-800",
            )}
          >
            <span aria-hidden>{option.emoji}</span>
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function CreateStudentDrawer({
  onStudentCreated,
  defaultOpen = false,
  triggerVariant = 'header',
}: CreateStudentDrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(defaultOpen)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showCustomEmail, setShowCustomEmail] = useState(false)
  const [successData, setSuccessData] = useState<{
    user: { id: string; email: string; name: string }
    student: { id: string; admission_number: string; grade: { id: string }; gender: string; phone: string; gradeName: string }
    generatedPassword: string
  } | null>(null)
  const { data: schoolConfig } = useSchoolConfig()
  const { data: gradeLevelsForSchoolType, isLoading: gradesLoading } = useGradeLevelsForSchoolType()
  const queryClient = useQueryClient()
  const schoolSubdomain = schoolConfig?.tenant?.subdomain || 'school'

  useEffect(() => {
    if (defaultOpen) setIsDrawerOpen(true)
  }, [defaultOpen])

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      admission_number: "",
      gender: "male",
      grade: "",
      stream: "",
      phone: "+254",
      student_email: "",
    },
  })

  const tenantGradeLevels = gradeLevelsForSchoolType || []

  const sortedTenantGrades = [...tenantGradeLevels].sort((a, b) => {
    return getGradeNumber(a.gradeLevel.name) - getGradeNumber(b.gradeLevel.name)
  })

  const watchedGrade = form.watch('grade')
  const watchedStream = form.watch('stream')
  const watchedName = form.watch('name')
  const watchedAdmission = form.watch('admission_number')
  const watchedPhone = form.watch('phone')
  const watchedGender = form.watch('gender')

  const selectedGradeData = sortedTenantGrades.find((tg) => tg.id === watchedGrade)
  const selectedGradeName = selectedGradeData?.gradeLevel.name

  const availableStreams = useMemo(
    () =>
      selectedGradeData?.tenantStreams
        .map((ts) => ts.stream)
        .filter((stream): stream is { id: string; name: string } => Boolean(stream)) ?? [],
    [selectedGradeData],
  )
  const selectedStreamName = availableStreams.find((s) => s.id === watchedStream)?.name
  const requiresStream = availableStreams.length > 0

  useEffect(() => {
    if (!watchedGrade) {
      form.setValue('stream', '')
      return
    }
    if (availableStreams.length === 1) {
      form.setValue('stream', availableStreams[0].id)
      return
    }
    form.setValue('stream', '')
  }, [watchedGrade, availableStreams, form])

  const identityComplete = watchedName.trim().length >= 2 && watchedAdmission.trim().length >= 1
  const placementComplete = Boolean(watchedGrade) && (!requiresStream || Boolean(watchedStream))
  const contactComplete = phoneSchema.safeParse(watchedPhone).success

  const progressSteps = [identityComplete, placementComplete, contactComplete]
  const progressCount = progressSteps.filter(Boolean).length
  const progressPct = Math.round((progressCount / progressSteps.length) * 100)

  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const studentEmail = data.student_email?.trim() || emailFromName(data.name)

      const response = await fetch('/api/school/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          admission_number: data.admission_number,
          gender: data.gender,
          grade: data.grade,
          stream: data.stream,
          phone: data.phone,
          student_email: studentEmail,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create student')
      }

      return result.createStudent
    },
    onSuccess: (studentData) => {
      queryClient.setQueryData(['students'], (oldData: { students?: unknown[] } | undefined) => {
        if (!oldData?.students) return oldData
        return {
          ...oldData,
          students: [...oldData.students, studentData.student],
        }
      })

      queryClient.invalidateQueries({ queryKey: ['students'] })

      const selectedGrade = tenantGradeLevels.find((tg) => tg.id === studentData.student.grade.id)
      const gradeName = selectedGrade?.gradeLevel.name || studentData.student.grade.id

      setSuccessData({
        ...studentData,
        student: {
          ...studentData.student,
          gradeName,
        },
      })
      setShowSuccessModal(true)

      toast.success("Student enrolled", {
        description: `${studentData.user.name} · ${studentData.student.admission_number}`,
      })

      form.reset()
      setShowCustomEmail(false)
      setIsDrawerOpen(false)
      onStudentCreated(studentData.user.name)
    },
    onError: (error) => {
      toast.error("Enrollment failed", {
        description: error instanceof Error ? error.message : "Something went wrong",
      })
    },
  })

  const onSubmit = (data: StudentFormData) => {
    if (requiresStream && !data.stream) {
      form.setError('stream', { message: 'Select a stream for this grade' })
      return
    }
    createStudentMutation.mutate(data)
  }

  const previewEmail = emailFromName(watchedName)
  const displayName = watchedName.trim() || "New student"
  const classLabel = selectedGradeName
    ? selectedStreamName
      ? `${selectedGradeName} · ${selectedStreamName}`
      : selectedGradeName
    : "Grade not selected"

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <StudentsEnrollTrigger
            variant={triggerVariant}
            loading={createStudentMutation.isPending || gradesLoading}
            loadingLabel={gradesLoading ? 'Loading…' : 'Creating…'}
          />
        </DrawerTrigger>
        <DrawerContent
          className="ml-auto flex h-[100dvh] max-h-[100dvh] w-full flex-col border-l border-slate-200/80 bg-[#f5f6f8] dark:border-slate-800 dark:bg-slate-950 sm:max-w-[440px]"
          data-vaul-drawer-direction="right"
        >
          {/* ── Header ── */}
          <DrawerHeader className="relative shrink-0 overflow-hidden border-0 px-0 pb-0 pt-0">
            <div className="relative border-b border-primary/10 bg-gradient-to-br from-primary/[0.08] via-white to-primary/[0.04] px-5 pb-5 pt-5 dark:border-primary/20 dark:from-primary/15 dark:via-slate-900 dark:to-primary/5">
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/15 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-6 left-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl"
                aria-hidden
              />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                    <UserPlus className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <DrawerTitle className="text-left text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      Enroll a student
                    </DrawerTitle>
                    <DrawerDescription className="mt-0.5 text-left text-sm text-slate-500 dark:text-slate-400">
                      Quick register — about 30 seconds
                    </DrawerDescription>
                  </div>
                </div>
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </DrawerClose>
              </div>

              {/* Progress bar */}
              <div className="relative mt-4">
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {progressCount} of 3 sections complete
                  </span>
                  <span className="font-semibold tabular-nums text-primary">{progressPct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </DrawerHeader>

          {/* ── Body ── */}
          <div className="relative flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <Form {...form}>
              <form id="enroll-student-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {createStudentMutation.isPending && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#f5f6f8]/80 backdrop-blur-[2px] dark:bg-slate-950/80">
                    <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
                      <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Creating student…</p>
                      <p className="mt-1 text-xs text-slate-500">Setting up portal access</p>
                    </div>
                  </div>
                )}

                {/* Live ID preview */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-slate-800 to-primary/80 p-[1px] shadow-lg shadow-primary/10">
                  <div className="relative overflow-hidden rounded-[15px] bg-gradient-to-br from-primary-dark to-slate-800 px-4 py-4">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.07]"
                      style={{
                        backgroundImage: `repeating-linear-gradient(
                          -45deg,
                          transparent,
                          transparent 8px,
                          white 8px,
                          white 9px
                        )`,
                      }}
                      aria-hidden
                    />
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold text-white ring-1 ring-white/20 backdrop-blur-sm">
                        {initialsFromName(watchedName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-white">{displayName}</p>
                        <p className="mt-0.5 truncate font-mono text-xs text-white/60">
                          {watchedAdmission.trim() || "ADM-0000"}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Badge className="h-5 rounded-md border-0 bg-white/10 px-2 text-[10px] font-medium text-white/90 hover:bg-white/10">
                            {classLabel}
                          </Badge>
                          <Badge className="h-5 rounded-md border-0 bg-white/10 px-2 text-[10px] font-medium capitalize text-white/90 hover:bg-white/10">
                            {watchedGender}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
                      <Sparkles className="h-3.5 w-3.5 text-primary-light" />
                      <p className="truncate font-mono text-[11px] text-white/50">
                        {previewEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 01 Identity */}
                <SectionCard
                  step="01"
                  title="Who is enrolling?"
                  subtitle="Name and admission number"
                  icon={<UserPlus className="h-4 w-4" />}
                  complete={identityComplete}
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Full name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon><UserPlus className="h-4 w-4" /></FieldIcon>
                            <Input placeholder="e.g. Jane Wanjiku" {...field} className={fieldShell} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admission_number"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Admission number
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon><Hash className="h-4 w-4" /></FieldIcon>
                            <Input placeholder="e.g. KPS/2026/001" {...field} className={fieldShell} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </SectionCard>

                {/* 02 Placement */}
                <SectionCard
                  step="02"
                  title="Class placement"
                  subtitle="Grade, stream, and gender"
                  icon={<GraduationCap className="h-4 w-4" />}
                  complete={placementComplete}
                >
                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Grade
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            form.setValue('stream', '')
                          }}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className={selectShell}>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sortedTenantGrades.map((tenantGrade) => {
                              const streamCount = tenantGrade.tenantStreams.length
                              return (
                                <SelectItem key={tenantGrade.id} value={tenantGrade.id}>
                                  <span className="flex items-center gap-2">
                                    {tenantGrade.gradeLevel.name}
                                    {streamCount > 0 && (
                                      <Badge variant="secondary" className="text-[10px]">
                                        {streamCount} stream{streamCount !== 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </span>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {requiresStream && (
                    <FormField
                      control={form.control}
                      name="stream"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Stream
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || watchedStream || undefined}
                          >
                            <FormControl>
                              <SelectTrigger className={selectShell}>
                                <SelectValue placeholder="Select stream" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableStreams.map((stream) => (
                                <SelectItem key={stream.id} value={stream.id}>
                                  {stream.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-[11px] text-slate-400">
                            {availableStreams.length > 1
                              ? 'This grade has multiple streams.'
                              : 'Auto-assigned for this grade.'}
                          </p>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Gender
                        </FormLabel>
                        <FormControl>
                          <GenderPills value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </SectionCard>

                {/* 03 Contact */}
                <SectionCard
                  step="03"
                  title="Contact"
                  subtitle="For SMS and fee reminders"
                  icon={<Phone className="h-4 w-4" />}
                  complete={contactComplete}
                >
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Phone number
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon><Phone className="h-4 w-4" /></FieldIcon>
                            <Input
                              placeholder="+254700000000"
                              value={field.value}
                              onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                              className={fieldShell}
                            />
                          </div>
                        </FormControl>
                        <p className="text-[11px] text-slate-400">Kenya format: +254 followed by 9 digits</p>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-xl bg-slate-50/80 p-3 ring-1 ring-inset ring-slate-200/60 dark:bg-slate-800/40 dark:ring-slate-700/50">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Portal login email</p>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">{previewEmail}</p>
                        {!showCustomEmail ? (
                          <button
                            type="button"
                            onClick={() => setShowCustomEmail(true)}
                            className="mt-1.5 text-[11px] font-medium text-primary hover:underline"
                          >
                            Use a custom email instead
                          </button>
                        ) : (
                          <FormField
                            control={form.control}
                            name="student_email"
                            render={({ field }) => (
                              <FormItem className="mt-2 space-y-1">
                                <FormControl>
                                  <Input placeholder="custom@example.com" {...field} className="h-9 rounded-lg text-sm" />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* What happens next */}
                <div className={cn(studentsPanel, "p-4")}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    What happens next
                  </p>
                  <ol className="space-y-3">
                    {[
                      {
                        title: "Student portal login created",
                        desc: "Copy password from the confirmation screen",
                        icon: Verified,
                        active: true,
                      },
                      {
                        title: "Share credentials",
                        desc: `${schoolSubdomain}.squl.co.ke/student`,
                        icon: Sparkles,
                        active: false,
                      },
                      {
                        title: "Link a parent (optional)",
                        desc: "Parents page for fee & grade access",
                        icon: Users,
                        active: false,
                        link: "/parents",
                      },
                    ].map((item, i) => (
                      <li key={item.title} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                              item.active
                                ? "bg-primary/10 text-primary"
                                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
                            )}
                          >
                            <item.icon className="h-3.5 w-3.5" />
                          </div>
                          {i < 2 && (
                            <div className="my-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" />
                          )}
                        </div>
                        <div className="min-w-0 pb-1 pt-0.5">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.title}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            {'link' in item && item.link ? (
                              <>
                                Open the{' '}
                                <Link href={item.link} className="font-medium text-primary hover:underline">
                                  Parents
                                </Link>
                                {' '}page to link a guardian
                              </>
                            ) : (
                              item.desc
                            )}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </form>
            </Form>
          </div>

          {/* ── Sticky footer ── */}
          <DrawerFooter className="shrink-0 border-t border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-5">
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                form="enroll-student-form"
                disabled={createStudentMutation.isPending || progressCount < 3}
                className="h-11 flex-1 gap-2 rounded-full bg-primary text-white shadow-md shadow-primary/25 transition-all hover:bg-primary-dark disabled:opacity-50"
              >
                {createStudentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enrolling…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Complete enrollment
                    <ArrowRight className="ml-auto h-4 w-4 opacity-70 sm:ml-0" />
                  </>
                )}
              </Button>
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={createStudentMutation.isPending}
                  className="h-11 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 sm:flex-none sm:px-5"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </div>
            {progressCount < 3 && (
              <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
                <Circle className="h-2.5 w-2.5" />
                Fill all three sections to enroll
              </p>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {successData && showSuccessModal && (
        <StudentSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          studentData={successData}
          schoolSubdomain={schoolSubdomain}
        />
      )}
    </>
  )
}

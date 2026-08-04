"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Loader2, X } from "lucide-react"
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { StudentSuccessModal } from './StudentSuccessModal'
import { StudentsEnrollTrigger, type EnrollTriggerVariant } from './StudentsEnrollTrigger'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { useGradeLevelsForSchoolType } from '@/lib/hooks/useGradeLevelsForSchoolType'

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

const fieldShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-1 focus-visible:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#0c1a17] dark:placeholder:text-white/40"

const selectShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none focus:ring-1 focus:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#0c1a17]"

const labelClass = "text-xs font-medium text-[#0a1f1a] dark:text-white/80"

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
        { id: "male" as const, label: "Male" },
        { id: "female" as const, label: "Female" },
      ]).map((option) => {
        const active = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "h-10 rounded-none px-3 text-sm font-medium transition-colors",
              active
                ? "bg-[#0a1f1a] text-white"
                : "border border-[#1a4d42]/15 bg-white text-[#1a4d42]/70 hover:border-[#246a59]/35 dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/55",
            )}
          >
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

  const selectedGradeData = sortedTenantGrades.find((tg) => tg.id === watchedGrade)

  const availableStreams = useMemo(
    () =>
      selectedGradeData?.tenantStreams
        .map((ts) => ts.stream)
        .filter((stream): stream is { id: string; name: string } => Boolean(stream)) ?? [],
    [selectedGradeData],
  )
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
  const canSubmit = identityComplete && placementComplete && contactComplete

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
          className="ml-auto flex h-[100dvh] max-h-[100dvh] w-full flex-col border-l border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#071411] sm:max-w-[400px]"
          data-vaul-drawer-direction="right"
        >
          <DrawerHeader className="shrink-0 border-b border-[#1a4d42]/12 px-5 py-4 dark:border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DrawerTitle className="font-display text-left text-lg tracking-tight text-[#0a1f1a] dark:text-white">
                  Add student
                </DrawerTitle>
                <DrawerDescription className="mt-0.5 text-left text-sm text-[#1a4d42]/55 dark:text-white/45">
                  Enroll a learner on the register
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-[#1a4d42]/40 hover:bg-[#f3f7f5] hover:text-[#0a1f1a] dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="relative flex-1 overflow-y-auto px-5 py-5">
            <Form {...form}>
              <form id="enroll-student-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {createStudentMutation.isPending && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#071411]/80">
                    <div className="flex items-center gap-2 text-sm text-[#0a1f1a] dark:text-white">
                      <Loader2 className="h-4 w-4 animate-spin text-[#246a59]" />
                      Creating student…
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={labelClass}>Full name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Jane Wanjiku" {...field} className={fieldShell} />
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
                      <FormLabel className={labelClass}>Admission number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. KPS/2026/001" {...field} className={fieldShell} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={labelClass}>Grade</FormLabel>
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
                          {sortedTenantGrades.map((tenantGrade) => (
                            <SelectItem key={tenantGrade.id} value={tenantGrade.id}>
                              {tenantGrade.gradeLevel.name}
                            </SelectItem>
                          ))}
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
                        <FormLabel className={labelClass}>Stream</FormLabel>
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
                      <FormLabel className={labelClass}>Gender</FormLabel>
                      <FormControl>
                        <GenderPills value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={labelClass}>Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+254700000000"
                          value={field.value}
                          onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                          className={fieldShell}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="space-y-1.5">
                  <p className={labelClass}>Portal email</p>
                  <p className="font-mono text-xs text-[#1a4d42]/55 dark:text-white/45">
                    {previewEmail}
                  </p>
                  {!showCustomEmail ? (
                    <button
                      type="button"
                      onClick={() => setShowCustomEmail(true)}
                      className="text-[11px] font-medium text-[#246a59] hover:underline"
                    >
                      Use a custom email
                    </button>
                  ) : (
                    <FormField
                      control={form.control}
                      name="student_email"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormControl>
                            <Input
                              placeholder="custom@example.com"
                              {...field}
                              className={fieldShell}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </form>
            </Form>
          </div>

          <DrawerFooter className="shrink-0 border-t border-[#1a4d42]/12 px-5 py-4 dark:border-white/10">
            <div className="flex w-full gap-2">
              <Button
                type="submit"
                form="enroll-student-form"
                disabled={createStudentMutation.isPending || !canSubmit}
                className="h-10 flex-1 gap-2 rounded-none bg-[#0a1f1a] text-white shadow-none hover:bg-[#246a59] disabled:opacity-50"
              >
                {createStudentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enrolling…
                  </>
                ) : (
                  "Enroll student"
                )}
              </Button>
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={createStudentMutation.isPending}
                  className="h-10 rounded-none px-4 text-[#1a4d42]/70 hover:bg-[#f3f7f5] dark:text-white/55 dark:hover:bg-white/10"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </div>
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

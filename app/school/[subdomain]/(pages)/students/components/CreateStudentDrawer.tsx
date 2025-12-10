"use client"

import React, { useState } from 'react'
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
  User, 
  Users, 
  Info, 
  CalendarDays, 
  Clock, 
  Calendar, 
  GraduationCap,
  Verified,
  Loader2,
  Mail,
  CheckCircle,
  Wand2,
} from "lucide-react"
import { toast } from 'sonner'
import { StudentSuccessModal } from './StudentSuccessModal'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { useGradeLevelsForSchoolType } from '@/lib/hooks/useGradeLevelsForSchoolType'

// Form validation schema
const studentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  admission_number: z.string().min(1, "Admission number is required"),
  gender: z.enum(["male", "female"]),
  grade: z.string().min(1, "Grade is required"),
  date_of_birth: z.string().min(1, "Date of birth is required").refine((dateString) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    // Calculate exact age
    const exactAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
    
    return exactAge <= 25; // Students should be 25 or younger
  }, { message: 'Student must be 25 years old or younger' }),
  age: z.coerce.number().min(1, "Age must be at least 1").max(25, "Age must be at most 25"),
  admission_date: z.string().min(1, "Admission date is required"),
  student_email: z.string().email().optional().or(z.literal("")),
  guardian_name: z.string().min(2, "Guardian name must be at least 2 characters"),
  guardian_phone: z.string()
    .refine((value) => {
      // Must be exactly +254 followed by 9 digits OR +2540 followed by 9 digits
      // Pattern 1: +254712675412 (13 characters total)
      // Pattern 2: +2540712675412 (14 characters total)
      const phoneRegex = /^\+254[0-9]{9}$|^\+2540[0-9]{9}$/;
      return phoneRegex.test(value);
    }, { message: 'Phone number must be exactly +254XXXXXXXXX (9 digits) or +2540XXXXXXXXX (9 digits after 0)' }),
  guardian_email: z.string().email().optional().or(z.literal("")),
  home_address: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentFormSchema>

interface CreateStudentDrawerProps {
  onStudentCreated: (studentName?: string) => void
  onStudentCreatedWithId?: (studentId: string, studentName?: string) => void
}

export function CreateStudentDrawer({ onStudentCreated }: CreateStudentDrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<{
    user: { id: string; email: string; name: string }
    student: { id: string; admission_number: string; grade: { id: string }; gender: string; phone: string; gradeName: string }
    generatedPassword: string
  } | null>(null)
  const { data: schoolConfig } = useSchoolConfig()
  const { data: gradeLevelsForSchoolType, isLoading: gradesLoading } = useGradeLevelsForSchoolType()
  const queryClient = useQueryClient()
  
  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      // Auto-generate email if not provided
      let studentEmail = data.student_email
      if (!studentEmail || studentEmail.trim() === '') {
        const cleanName = data.name.toLowerCase()
          .replace(/[^a-z\s]/g, '')
          .replace(/\s+/g, '')
        studentEmail = `${cleanName}@squl.ac.ke`
      }

      const submissionData = {
        ...data,
        student_email: studentEmail
      }

      const response = await fetch('/api/school/create-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create student')
      }

      return result.createStudent
    },
    onSuccess: (studentData) => {
      // Optimistically update the cache
      queryClient.setQueryData(['students'], (oldData: any) => {
        if (!oldData?.students) return oldData
        return {
          ...oldData,
          students: [...oldData.students, studentData.student]
        }
      })
      
      // Invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['students'] })
      
      // Find the grade name from available grade levels
      const selectedGrade = tenantGradeLevels.find(tg => tg.id === studentData.student.grade.id)
      const gradeName = selectedGrade?.gradeLevel.name || studentData.student.grade.id
      
      // Store success data for display with grade name
      setSuccessData({
        ...studentData,
        student: {
          ...studentData.student,
          gradeName: gradeName
        }
      })
      setShowSuccessModal(true)
      
      // Show success toast
      toast.success("Student Created Successfully!", {
        description: `${studentData.user.name} has been registered with admission number ${studentData.student.admission_number}`
      })
      
      // Reset form and close drawer
      form.reset()
      setIsDrawerOpen(false)
      onStudentCreated(studentData.user.name)
    },
    onError: (error) => {
      console.error('Error creating student:', error)
      toast.error("Registration Failed", {
        description: error instanceof Error ? error.message : "An error occurred while creating the student"
      })
    }
  })
  
  // Phone number formatting utility
  const formatPhoneNumber = (value: string): string => {
    // If user is trying to clear the field, allow empty or just +254
    if (value === '' || value === '+' || value === '+2' || value === '+25') {
      return '+254';
    }
    
    // Remove all non-digit characters except + at the start
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If it starts with 0, replace with +254
    if (cleaned.startsWith('0')) {
      cleaned = '+254' + cleaned.substring(1);
    }
    // If it's just digits without +, prepend +254
    else if (cleaned && /^\d/.test(cleaned) && !cleaned.startsWith('+')) {
      cleaned = '+254' + cleaned;
    }
    // If it starts with +254, ensure it's properly formatted and remove any 0 after +254
    else if (cleaned.startsWith('+254')) {
      // Remove 0 immediately after +254 (e.g., +2540712345678 -> +254712345678)
      if (cleaned.startsWith('+2540')) {
        cleaned = '+254' + cleaned.substring(5);
      }
    }
    // If it starts with + but not +254, keep as is (for other country codes)
    else if (cleaned.startsWith('+') && !cleaned.startsWith('+254')) {
      // Keep as is for international numbers
    }
    // If empty or just +, default to +254
    else if (!cleaned || cleaned === '+') {
      cleaned = '+254';
    }
    
    // Enforce exact length: +254XXXXXXXXX (13 chars) or +2540XXXXXXXXX (14 chars)
    if (cleaned.startsWith('+2540')) {
      // Limit to 14 characters total (+2540 + 9 digits)
      if (cleaned.length > 14) {
        cleaned = cleaned.substring(0, 14);
      }
    } else if (cleaned.startsWith('+254')) {
      // Limit to 13 characters total (+254 + 9 digits)
      if (cleaned.length > 13) {
        cleaned = cleaned.substring(0, 13);
      }
    }
    
    return cleaned;
  };
  
  // Form handling
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      admission_number: "",
      gender: "male",
      grade: "",
      date_of_birth: "",
      age: 0,
      admission_date: "",
      student_email: "",
      guardian_name: "",
      guardian_phone: "+254",
      guardian_email: "",
      home_address: "",
    },
  })
    
  // Use tenant-specific grade levels instead of school config
  const tenantGradeLevels = gradeLevelsForSchoolType || []
  
  // Sort tenant grade levels by grade name
  const sortedTenantGrades = [...tenantGradeLevels].sort((a, b) => {
    // Helper function to extract grade number
    const getGradeNumber = (gradeName: string): number => {
      // Handle "Grade X" format
      const gradeMatch = gradeName.match(/Grade\s+(\d+)/i)
      if (gradeMatch) {
        return parseInt(gradeMatch[1])
      }
      
      // Handle "Form X" format
      const formMatch = gradeName.match(/Form\s+(\d+)/i)
      if (formMatch) {
        return parseInt(formMatch[1]) + 6 // Form 1 = Grade 7, Form 2 = Grade 8, etc.
      }
      
      // Handle "PPX" format
      const ppMatch = gradeName.match(/PP(\d+)/i)
      if (ppMatch) {
        return parseInt(ppMatch[1]) - 3 // PP1 = -2, PP2 = -1, PP3 = 0
      }
      
      // Handle "Baby Class", "Nursery", "Reception"
      const specialGrades: { [key: string]: number } = {
        'Baby Class': -4,
        'Nursery': -3,
        'Reception': -2
      }
      
      if (specialGrades[gradeName]) {
        return specialGrades[gradeName]
      }
      
      // For any other grades, use a high number to put them at the end
      return 999
    }
    
    const aNumber = getGradeNumber(a.gradeLevel.name)
    const bNumber = getGradeNumber(b.gradeLevel.name)
    
    return aNumber - bNumber
  })

  // Debug logging for grade levels
  console.log('CreateStudentDrawer - Tenant grade levels:', tenantGradeLevels)
  console.log('CreateStudentDrawer - Grades loading:', gradesLoading)
  console.log('CreateStudentDrawer - Sorted tenant grades:', sortedTenantGrades)
  
  // Watch form values for dynamic updates
  const watchedGrade = form.watch('grade')

  // Function to generate email from name
  const generateEmailFromName = () => {
    const name = form.getValues('name')
    if (!name || name.trim() === '') {
      toast.error('Please enter a name first to generate email')
      return
    }
    
    // Generate email from name: "Kelvin Mwangi" -> "kelvinmwangi@squl.ac.ke"
    const cleanName = name.toLowerCase()
      .replace(/[^a-z\s]/g, '') // Remove non-alphabetic characters except spaces
      .replace(/\s+/g, '') // Remove all spaces
    const generatedEmail = `${cleanName}@squl.ac.ke`
    
    form.setValue('student_email', generatedEmail)
    toast.success('Email generated!', {
      description: `Generated: ${generatedEmail}`
    })
  }


  // Watch the name field for dynamic email preview
  const watchedName = form.watch('name')

  // Generate preview email from current name
  const getPreviewEmail = () => {
    if (!watchedName || watchedName.trim() === '') {
      return 'studentname@squl.ac.ke'
    }
    const cleanName = watchedName.toLowerCase()
      .replace(/[^a-z\s]/g, '') // Remove non-alphabetic characters except spaces
      .replace(/\s+/g, '') // Remove all spaces
    return `${cleanName}@squl.ac.ke`
  }


  // Submit handler
  const onSubmit = async (data: StudentFormData) => {
    console.log('CreateStudentDrawer - Form submission data:', {
      selectedGradeId: data.grade,
      allAvailableGrades: sortedTenantGrades.map(tg => ({ id: tg.id, name: tg.gradeLevel.name })),
      formData: data
    })
    createStudentMutation.mutate(data)
  }

  return (
    <>
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="default" 
          className="flex items-center gap-2 font-mono"
          disabled={createStudentMutation.isPending || gradesLoading}
        >
          <UserPlus className="h-4 w-4" />
          {gradesLoading ? 'Loading Grades...' : 'Add New Student'}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-full md:w-1/2 bg-white dark:bg-slate-900 flex flex-col" data-vaul-drawer-direction="right">
        <DrawerHeader className="border-b border-slate-200 dark:border-slate-700 pb-4 pt-5 px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <DrawerTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Add New Student
              </DrawerTitle>
              <DrawerDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Fill in the details below to register a student
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-6 py-5 relative">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Loading Overlay */}
              {createStudentMutation.isPending && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Creating student...</p>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                    Personal Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student Personal Information */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter student's full name" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admission_number"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Admission Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., KPS/2023/001" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="student_email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Student Email
                          <span className="text-slate-400 font-normal ml-1">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input placeholder="student@example.com" {...field} className="flex-1 h-10" />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={generateEmailFromName}
                              disabled={createStudentMutation.isPending}
                              className="shrink-0 h-10 w-10"
                              title="Generate email from name"
                            >
                              <Wand2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Or click the magic wand to auto-generate
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => {
                      // Calculate the maximum year (25 years old max for students)
                      const today = new Date();
                      const maxYear = today.getFullYear() - 3; // Allow 3+ years old
                      const minYear = today.getFullYear() - 25; // Max 25 years old
                      
                      // Parse current value
                      const currentValue = field.value || '';
                      const dateParts = currentValue.split('-');
                      const currentYear = dateParts[0] || '';
                      const currentMonth = dateParts[1] ? parseInt(dateParts[1]).toString() : '';
                      const currentDay = dateParts[2] ? parseInt(dateParts[2]).toString() : '';
                      
                      // Use state to track individual selections
                      const [selectedDay, setSelectedDay] = React.useState(currentDay);
                      const [selectedMonth, setSelectedMonth] = React.useState(currentMonth);
                      const [selectedYear, setSelectedYear] = React.useState(currentYear);
                      
                      // Calculate age when date of birth changes
                      React.useEffect(() => {
                        if (selectedDay && selectedMonth && selectedYear) {
                          const paddedDay = selectedDay.padStart(2, '0');
                          const paddedMonth = selectedMonth.padStart(2, '0');
                          const dateString = `${selectedYear}-${paddedMonth}-${paddedDay}`;
                          field.onChange(dateString);
                          
                          // Auto-calculate age
                          const birthDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, parseInt(selectedDay));
                          const today = new Date();
                          let years = today.getFullYear() - birthDate.getFullYear();
                          const monthDiff = today.getMonth() - birthDate.getMonth();
                          const dayDiff = today.getDate() - birthDate.getDate();
                          
                          // Adjust if the birthday hasn't occurred this year
                          if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                            years--;
                          }
                          
                          // Update age field
                          form.setValue('age', years);
                        }
                      }, [selectedDay, selectedMonth, selectedYear, field.onChange, form]);
                      
                      // Ensure empty strings are treated as undefined for Select components
                      const dayValue = selectedDay || undefined;
                      const monthValue = selectedMonth || undefined;
                      const yearValue = selectedYear || undefined;
                      
                      // Get days in month
                      const getDaysInMonth = (month: string, year: string) => {
                        if (!month || !year) return 31;
                        return new Date(parseInt(year), parseInt(month), 0).getDate();
                      };
                      
                      const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
                      
                      return (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth *</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-3 gap-2">
                              {/* Day */}
                              <Select 
                                value={dayValue} 
                                onValueChange={setSelectedDay}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Day" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                    <SelectItem key={day} value={day.toString()}>
                                      {day}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {/* Month */}
                              <Select 
                                value={monthValue} 
                                onValueChange={setSelectedMonth}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">January</SelectItem>
                                  <SelectItem value="2">February</SelectItem>
                                  <SelectItem value="3">March</SelectItem>
                                  <SelectItem value="4">April</SelectItem>
                                  <SelectItem value="5">May</SelectItem>
                                  <SelectItem value="6">June</SelectItem>
                                  <SelectItem value="7">July</SelectItem>
                                  <SelectItem value="8">August</SelectItem>
                                  <SelectItem value="9">September</SelectItem>
                                  <SelectItem value="10">October</SelectItem>
                                  <SelectItem value="11">November</SelectItem>
                                  <SelectItem value="12">December</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {/* Year */}
                              <Select 
                                value={yearValue} 
                                onValueChange={setSelectedYear}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                          {(selectedDay && selectedMonth && selectedYear) && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Age: {(() => {
                                const birthDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, parseInt(selectedDay));
                                const today = new Date();
                                let years = today.getFullYear() - birthDate.getFullYear();
                                const monthDiff = today.getMonth() - birthDate.getMonth();
                                const dayDiff = today.getDate() - birthDate.getDate();
                                if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                                  years--;
                                }
                                return `${years} years old`;
                              })()}
                            </p>
                          )}
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Age *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            className="h-10 bg-slate-50 dark:bg-slate-800" 
                            readOnly
                            disabled
                          />
                        </FormControl>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Automatically calculated from date of birth</p>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem className="space-y-2 md:col-span-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Grade *</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sortedTenantGrades.map(tenantGrade => {
                              const gradeStreams = tenantGrade.tenantStreams.map(ts => ts.stream)
                              return (
                                <SelectItem 
                                  key={tenantGrade.id} 
                                  value={tenantGrade.id}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{tenantGrade.gradeLevel.name}</span>
                                    {gradeStreams.length > 0 && (
                                      <Badge 
                                        variant="secondary" 
                                        className="ml-2 text-xs"
                                      >
                                        {gradeStreams.length} stream{gradeStreams.length !== 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="admission_date"
                    render={({ field }) => {
                      // Calculate reasonable year range for admission dates
                      const today = new Date();
                      const minYear = today.getFullYear() - 10; // Allow 10 years back
                      const maxYear = today.getFullYear() + 5; // Allow 5 years forward
                      
                      // Parse current value
                      const currentValue = field.value || '';
                      const dateParts = currentValue.split('-');
                      const currentYear = dateParts[0] || '';
                      const currentMonth = dateParts[1] ? parseInt(dateParts[1]).toString() : '';
                      const currentDay = dateParts[2] ? parseInt(dateParts[2]).toString() : '';
                      
                      // Use state to track individual selections
                      const [selectedDay, setSelectedDay] = React.useState(currentDay);
                      const [selectedMonth, setSelectedMonth] = React.useState(currentMonth);
                      const [selectedYear, setSelectedYear] = React.useState(currentYear);
                      
                      // Update form field whenever all three are selected
                      React.useEffect(() => {
                        if (selectedDay && selectedMonth && selectedYear) {
                          const paddedDay = selectedDay.padStart(2, '0');
                          const paddedMonth = selectedMonth.padStart(2, '0');
                          const dateString = `${selectedYear}-${paddedMonth}-${paddedDay}`;
                          field.onChange(dateString);
                        }
                      }, [selectedDay, selectedMonth, selectedYear, field]);
                      
                      // Ensure empty strings are treated as undefined for Select components
                      const dayValue = selectedDay || undefined;
                      const monthValue = selectedMonth || undefined;
                      const yearValue = selectedYear || undefined;
                      
                      // Get days in month
                      const getDaysInMonth = (month: string, year: string) => {
                        if (!month || !year) return 31;
                        return new Date(parseInt(year), parseInt(month), 0).getDate();
                      };
                      
                      const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
                      
                      return (
                        <FormItem className="space-y-2 md:col-span-2">
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Admission Date *</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-3 gap-2">
                              {/* Day */}
                              <Select 
                                value={dayValue} 
                                onValueChange={setSelectedDay}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Day" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                    <SelectItem key={day} value={day.toString()}>
                                      {day}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              {/* Month */}
                              <Select 
                                value={monthValue} 
                                onValueChange={setSelectedMonth}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">January</SelectItem>
                                  <SelectItem value="2">February</SelectItem>
                                  <SelectItem value="3">March</SelectItem>
                                  <SelectItem value="4">April</SelectItem>
                                  <SelectItem value="5">May</SelectItem>
                                  <SelectItem value="6">June</SelectItem>
                                  <SelectItem value="7">July</SelectItem>
                                  <SelectItem value="8">August</SelectItem>
                                  <SelectItem value="9">September</SelectItem>
                                  <SelectItem value="10">October</SelectItem>
                                  <SelectItem value="11">November</SelectItem>
                                  <SelectItem value="12">December</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {/* Year */}
                              <Select 
                                value={yearValue} 
                                onValueChange={setSelectedYear}
                              >
                                <SelectTrigger className="h-10">
                                  <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                  {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                      {year}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                    Guardian Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guardian_name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Guardian Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter guardian's full name" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardian_phone"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">Guardian Phone *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+254700000000" 
                            value={field.value}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                            className="h-10" 
                          />
                        </FormControl>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Format: +254XXXXXXXXX or +2540XXXXXXXXX
                        </p>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardian_email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Guardian Email
                          <span className="text-slate-400 font-normal ml-1">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="guardian@example.com" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="home_address"
                    render={({ field }) => (
                      <FormItem className="space-y-2 md:col-span-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Home Address
                          <span className="text-slate-400 font-normal ml-1">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter physical address" {...field} className="h-10" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Portal Access
                  </h3>
                  <Badge variant="secondary" className="text-xs">Auto-generated</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Login credentials will be automatically generated and sent to the guardian's email
                </p>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <Verified className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Student Portal</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    portal.kenyaschools.edu5
                  </span>
                </div>
              </div>

              <DrawerFooter className="border-t border-slate-200 dark:border-slate-700 pt-4 pb-4 px-6 flex-shrink-0 gap-3">
                <Button 
                  type="submit" 
                  disabled={createStudentMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white gap-2 h-10 transition-colors disabled:opacity-50 flex-1"
                >
                  {createStudentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Student...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Register Student
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDrawerOpen(false)}
                  disabled={createStudentMutation.isPending}
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </Button>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
    
    {/* Success Modal */}
    {successData && showSuccessModal && (
      <StudentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        studentData={successData}
        schoolSubdomain={schoolConfig?.tenant?.subdomain || "school"}
      />
    )}
  </>
  )
} 
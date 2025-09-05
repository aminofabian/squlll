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
    .min(10, { message: 'Guardian phone must be at least 10 characters' })
    .refine((value) => {
      // Allow Kenyan numbers (+254...) and international numbers
      const phoneRegex = /^\+254[0-9]{9}$|^\+[1-9][0-9]{1,14}$/;
      return phoneRegex.test(value);
    }, { message: 'Please enter a valid phone number (e.g., +254700000000)' }),
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
      <DrawerContent className="h-full w-full md:w-1/2 bg-slate-50 dark:bg-slate-900" data-vaul-drawer-direction="right">
        <DrawerHeader className="border-b-2 border-primary/20 pb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
              <span className="text-xs font-mono uppercase tracking-wide text-primary">
                Student Registration
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-3">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <DrawerTitle className="text-2xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                New Student
              </DrawerTitle>
            </div>
            <DrawerDescription className="text-center text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md">
              Complete the form below to register a new student in the school system
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <div className="px-6 py-4 overflow-y-auto relative">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
              
              {/* Loading Overlay */}
              {createStudentMutation.isPending && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Creating student...</p>
                  </div>
                </div>
              )}
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                    <User className="h-3 w-3 mr-2" />
                    Personal Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student Personal Information */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Student's full name" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admission_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Admission Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., KPS/2023/001" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="student_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          Student Email (Optional)
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input placeholder="student@example.com" {...field} className="font-mono flex-1" />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={generateEmailFromName}
                              disabled={createStudentMutation.isPending}
                              className="shrink-0 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
                              title="Generate email from name"
                            >
                              <Wand2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Click the <Wand2 className="inline h-3 w-3 mx-1" /> icon to generate: <span className="font-mono text-primary">{getPreviewEmail()}</span>
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Gender *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="font-mono">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Age *</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                                    <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Grade *</FormLabel>
                                                <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-slate-800 border-primary/20 shadow-lg">
                            {sortedTenantGrades.map(tenantGrade => {
                              const gradeStreams = tenantGrade.tenantStreams.map(ts => ts.stream)
                              return (
                                <SelectItem 
                                  key={tenantGrade.id} 
                                  value={tenantGrade.id}
                                  className="hover:bg-primary/5 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center justify-between w-full py-1">
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                                      <span className="font-medium text-slate-700 dark:text-slate-300">{tenantGrade.gradeLevel.name}</span>
                                    </div>
                                    {gradeStreams.length > 0 && (
                                      <Badge 
                                        variant="secondary" 
                                        className="ml-2 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
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
                        <FormMessage />
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
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-mono text-sm">
                            <CalendarDays className="h-3.5 w-3.5 text-primary" />
                            Date of Birth *
                            {(selectedDay && selectedMonth && selectedYear) && (
                              <div className="flex items-center gap-2 ml-auto">
                                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-mono text-primary flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                                  {`${selectedDay}/${selectedMonth.padStart(2, '0')}/${selectedYear}`}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  {(() => {
                                    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    return `${monthNames[parseInt(selectedMonth)]} ${selectedYear}`;
                                  })()}
                                </div>
                              </div>
                            )}
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-3 gap-2">
                              {/* Day */}
                              <div>
                                <Select 
                                  value={dayValue} 
                                  onValueChange={setSelectedDay}
                                >
                                  <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
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
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                                  Day
                                </div>
                              </div>
                              
                              {/* Month */}
                              <div>
                                <Select 
                                  value={monthValue} 
                                  onValueChange={setSelectedMonth}
                                >
                                  <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
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
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                                  Month
                                </div>
                              </div>
                              
                              {/* Year */}
                              <div>
                                <Select 
                                  value={yearValue} 
                                  onValueChange={setSelectedYear}
                                >
                                  <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
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
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                                  Year
                                </div>
                              </div>
                            </div>
                          </FormControl>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              💡 Students should be between 3 and 25 years old
                            </div>
                            {(selectedDay && selectedMonth && selectedYear) && (
                              <div className="flex items-center gap-2">
                                <div className="px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-xs font-medium text-green-700 dark:text-green-300">
                                  {(() => {
                                    const birthDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, parseInt(selectedDay));
                                    const today = new Date();
                                    
                                    // Calculate exact age in years, months, and days
                                    let years = today.getFullYear() - birthDate.getFullYear();
                                    let months = today.getMonth() - birthDate.getMonth();
                                    let days = today.getDate() - birthDate.getDate();
                                    
                                    // Adjust if the birthday hasn't occurred this year
                                    if (months < 0 || (months === 0 && days < 0)) {
                                      years--;
                                      months += 12;
                                    }
                                    
                                    // Adjust if the day hasn't occurred this month
                                    if (days < 0) {
                                      months--;
                                      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                                      days += lastMonth.getDate();
                                    }
                                    
                                    // Format the age display
                                    if (years > 0) {
                                      if (months > 0) {
                                        return `${years}y ${months}m old`;
                                      } else {
                                        return `${years} years old`;
                                      }
                                    } else if (months > 0) {
                                      return `${months} months old`;
                                    } else {
                                      return `${days} days old`;
                                    }
                                  })()}
                                </div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                  {(() => {
                                    const birthDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, parseInt(selectedDay));
                                    const today = new Date();
                                    
                                    // Calculate exact age for eligibility check
                                    let years = today.getFullYear() - birthDate.getFullYear();
                                    let months = today.getMonth() - birthDate.getMonth();
                                    let days = today.getDate() - birthDate.getDate();
                                    
                                    if (months < 0 || (months === 0 && days < 0)) {
                                      years--;
                                    }
                                    
                                    return (years >= 3 && years <= 25) ? '✅ Valid' : '❌ Invalid age';
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-mono text-sm">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            Admission Date *
                            {(selectedDay && selectedMonth && selectedYear) && (
                              <div className="flex items-center gap-2 ml-auto">
                                <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-mono text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                  {`${selectedDay}/${selectedMonth.padStart(2, '0')}/${selectedYear}`}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  {(() => {
                                    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                    return `${monthNames[parseInt(selectedMonth)]} ${selectedYear}`;
                                  })()}
                                </div>
                              </div>
                            )}
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-3 gap-2">
                              {/* Day */}
                              <div>
                                <Select 
                                  value={dayValue} 
                                  onValueChange={setSelectedDay}
                                >
                                  <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
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
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                                  Day
                                </div>
                              </div>
                              
                              {/* Month */}
                              <div>
                                <Select 
                                  value={monthValue} 
                                  onValueChange={setSelectedMonth}
                                >
                                  <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
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
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                                  Month
                                </div>
                              </div>
                              
                              {/* Year */}
                              <div>
                                <Select 
                                  value={yearValue} 
                                  onValueChange={setSelectedYear}
                                >
                                  <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
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
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                                  Year
                                </div>
                              </div>
                            </div>
                          </FormControl>
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              📅 Select the date when the student was admitted to the school
                            </div>
                            {(selectedDay && selectedMonth && selectedYear) && (
                              <div className="flex items-center gap-2">
                                <div className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-xs font-medium text-blue-700 dark:text-blue-300">
                                  {(() => {
                                    const admissionDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, parseInt(selectedDay));
                                    const today = new Date();
                                    
                                    if (admissionDate > today) {
                                      return "Future admission";
                                    } else {
                                      const diffTime = Math.abs(today.getTime() - admissionDate.getTime());
                                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                      
                                      if (diffDays < 30) {
                                        return `${diffDays} days ago`;
                                      } else if (diffDays < 365) {
                                        const months = Math.floor(diffDays / 30);
                                        return `${months} month${months > 1 ? 's' : ''} ago`;
                                      } else {
                                        const years = Math.floor(diffDays / 365);
                                        return `${years} year${years > 1 ? 's' : ''} ago`;
                                      }
                                    }
                                  })()}
                                </div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                  {(() => {
                                    const admissionDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, parseInt(selectedDay));
                                    const today = new Date();
                                    
                                    if (admissionDate > today) {
                                      return '📋 Planned';
                                    } else {
                                      return '✅ Admitted';
                                    }
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>
              
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                    <Users className="h-3 w-3 mr-2" />
                    Guardian Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="guardian_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Guardian Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Primary guardian's name" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardian_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Guardian Phone *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+254700000000" 
                            value={field.value}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                            className="font-mono" 
                          />
                        </FormControl>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Kenya numbers start with +254. If you enter 0, it will be automatically converted.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardian_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Guardian Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="guardian@example.com" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="home_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Home Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Physical address" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="border-2 border-primary/20 bg-primary/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                      <Info className="h-3 w-3 mr-2" />
                      Portal Access
                    </h3>
                  </div>
                  <Badge className="bg-primary/20 text-primary border border-primary/30 font-mono text-xs">Auto-Generated</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-4 leading-relaxed">
                  Login credentials will be automatically generated and sent to the guardian's email once the student is registered.
                </p>
                <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Verified className="h-4 w-4 text-primary" />
                    <span className="text-sm font-mono text-slate-700 dark:text-slate-300">Student Portal</span>
                  </div>
                  <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 rounded border border-primary/30">
          portal.kenyaschools.edu5
                  </span>
                </div>
              </div>

              <DrawerFooter className="border-t-2 border-primary/20 pt-6 space-y-3">
                <Button 
                  type="submit" 
                  disabled={createStudentMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white gap-2 font-mono transition-colors disabled:opacity-50"
                >
                  {createStudentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Student...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Register New Student
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDrawerOpen(false)}
                  disabled={createStudentMutation.isPending}
                  className="border-primary/20 text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:border-primary/40 font-mono transition-colors disabled:opacity-50"
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
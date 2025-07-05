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

// Form validation schema
const studentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  admission_number: z.string().min(1, "Admission number is required"),
  gender: z.enum(["male", "female"]),
  grade: z.string().min(1, "Grade is required"),
  class: z.string().min(1, "Class is required"),
  stream: z.string().optional(),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  age: z.coerce.number().min(1, "Age must be at least 1").max(25, "Age must be at most 25"),
  admission_date: z.string().min(1, "Admission date is required"),
  student_email: z.string().email().optional().or(z.literal("")),
  guardian_name: z.string().min(2, "Guardian name must be at least 2 characters"),
  guardian_phone: z.string().min(1, "Guardian phone is required"),
  guardian_email: z.string().email().optional().or(z.literal("")),
  home_address: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentFormSchema>

// Creative class name generation function
const generateClassName = (gradeName: string, streamName?: string): string => {
  if (!streamName) {
    return gradeName
  }
  
  // Simple and clean combination: Grade + Stream
  return `${gradeName} ${streamName}`
}

interface CreateStudentDrawerProps {
  onStudentCreated: (studentName?: string) => void
}

export function CreateStudentDrawer({ onStudentCreated }: CreateStudentDrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<{
    user: { id: string; email: string; name: string }
    student: { id: string; admission_number: string; grade: string; gender: string; phone: string }
    generatedPassword: string
  } | null>(null)
  const { data: schoolConfig } = useSchoolConfig()
  const { getAllGradeLevels, getStreamsByGradeId, getGradeById } = useSchoolConfigStore()
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
      
      // Store success data for display
      setSuccessData(studentData)
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
  
  // Form handling
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      admission_number: '',
      gender: 'male',
      grade: '',
      class: '',
      stream: '',
      date_of_birth: new Date(Date.now() - (10 * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // Default to 10 years ago
      age: 0,
      admission_date: new Date().toISOString().split('T')[0],
      student_email: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
      home_address: '',
    },
  })
    
  // Get all available grades from school config
  const allGradeLevels = getAllGradeLevels()
  
  // Watch form values for dynamic updates
  const watchedGrade = form.watch('grade')
  const watchedStream = form.watch('stream')
  
  // Get streams for selected grade
  const availableStreams = watchedGrade ? getStreamsByGradeId(watchedGrade) : []
  
  // Get grade info for display
  const selectedGradeInfo = watchedGrade ? getGradeById(watchedGrade) : null
  
  // Flatten all grades for easier access and sort them properly
  const allGrades = allGradeLevels.flatMap(level => 
    level.grades.map(grade => ({
      ...grade,
      levelName: level.levelName,
      levelId: level.levelId
    }))
  ).sort((a, b) => {
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
    
    const aNumber = getGradeNumber(a.name)
    const bNumber = getGradeNumber(b.name)
    
    return aNumber - bNumber
  })

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

  // Function to auto-generate class name when grade or stream changes
  const autoGenerateClassName = () => {
    const gradeId = form.getValues('grade')
    const streamId = form.getValues('stream')
    
    if (gradeId) {
      const gradeInfo = getGradeById(gradeId)
      if (gradeInfo) {
        const gradeName = gradeInfo.grade.name
        let streamName: string | undefined
        
        if (streamId) {
          const stream = availableStreams.find(s => s.id === streamId)
          streamName = stream?.name
        }
        
        const className = generateClassName(gradeName, streamName)
        form.setValue('class', className)
      }
    }
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

  // Auto-generate class name when grade or stream changes
  React.useEffect(() => {
    autoGenerateClassName()
  }, [watchedGrade, watchedStream])

  // Submit handler
  const onSubmit = async (data: StudentFormData) => {
    createStudentMutation.mutate(data)
  }

  return (
    <>
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="default" 
          className="flex items-center gap-2 font-mono"
          disabled={createStudentMutation.isPending}
        >
          <UserPlus className="h-4 w-4" />
          Add New Student
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
                            {allGrades.map(grade => {
                              const gradeStreams = getStreamsByGradeId(grade.id)
                              return (
                                <SelectItem 
                                  key={grade.id} 
                                  value={grade.id}
                                  className="hover:bg-primary/5 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center justify-between w-full py-1">
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                                      <span className="font-medium text-slate-700 dark:text-slate-300">{grade.name}</span>
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
                        {selectedGradeInfo && availableStreams.length > 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {availableStreams.length} stream{availableStreams.length !== 1 ? 's' : ''} available for {selectedGradeInfo.grade.name}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Wand2 className="h-3.5 w-3.5 text-primary" />
                          Class (Auto-Generated) *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Will be generated from grade and stream" 
                            {...field} 
                            className="font-mono bg-primary/5 border-primary/20" 
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                        {watchedGrade && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Class name is automatically generated from your grade and stream selection
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stream"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Stream (Optional)</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!watchedGrade || availableStreams.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                              <SelectValue placeholder={
                                !watchedGrade 
                                  ? "Select a grade first" 
                                  : availableStreams.length === 0 
                                    ? "No streams available" 
                                    : "Select stream"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-slate-800 border-primary/20 shadow-lg">
                            {availableStreams.map(stream => (
                              <SelectItem 
                                key={stream.id} 
                                value={stream.id}
                                className="hover:bg-primary/5 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-3 py-1">
                                  <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">{stream.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {watchedGrade && availableStreams.length === 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            No streams configured for this grade
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <CalendarDays className="h-3.5 w-3.5 text-primary" />
                          Date of Birth *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="date" 
                              {...field} 
                              className="pl-3 pr-10 cursor-pointer bg-primary/5 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono" 
                            />
                            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-primary pointer-events-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="admission_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          Admission Date *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="date" 
                              {...field} 
                              className="pl-3 pr-10 cursor-pointer bg-primary/5 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono" 
                            />
                            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-primary pointer-events-none" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
                          <Input placeholder="+254700000000" {...field} className="font-mono" />
                        </FormControl>
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
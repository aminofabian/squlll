"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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

// Mock grades data - you might want to import this from a shared location
const mockGrades = [
  // Preschool grades
  {
    id: 'baby-class',
    name: 'Baby',
    displayName: 'Baby Class',
    level: 'preschool',
    ageGroup: '3 years',
    students: 42,
    classes: 2
  },
  {
    id: 'pp1',
    name: 'PP1',
    displayName: 'PP1',
    level: 'preschool',
    ageGroup: '4 years',
    students: 56,
    classes: 3
  },
  {
    id: 'pp2',
    name: 'PP2',
    displayName: 'PP2',
    level: 'preschool',
    ageGroup: '5 years',
    students: 48,
    classes: 2
  },
  
  // Primary grades
  {
    id: 'grade1',
    name: 'G1',
    displayName: 'Grade 1',
    level: 'primary',
    ageGroup: '6 years',
    students: 65,
    classes: 3
  },
  {
    id: 'grade2',
    name: 'G2',
    displayName: 'Grade 2',
    level: 'primary',
    ageGroup: '7 years',
    students: 62,
    classes: 3
  },
  {
    id: 'grade3',
    name: 'G3',
    displayName: 'Grade 3',
    level: 'primary',
    ageGroup: '8 years',
    students: 58,
    classes: 2
  },
  {
    id: 'grade4',
    name: 'G4',
    displayName: 'Grade 4',
    level: 'primary',
    ageGroup: '9 years',
    students: 60,
    classes: 2
  },
  {
    id: 'grade5',
    name: 'G5',
    displayName: 'Grade 5',
    level: 'primary',
    ageGroup: '10 years',
    students: 54,
    classes: 2
  },
  {
    id: 'grade6',
    name: 'G6',
    displayName: 'Grade 6',
    level: 'primary',
    ageGroup: '11 years',
    students: 52,
    classes: 2
  },
  
  // Junior Secondary grades
  {
    id: 'grade7',
    name: 'F1',
    displayName: 'Form 1',
    level: 'junior-secondary',
    ageGroup: '12 years',
    students: 86,
    classes: 3
  },
  {
    id: 'grade8',
    name: 'F2',
    displayName: 'Form 2',
    level: 'junior-secondary',
    ageGroup: '13 years',
    students: 78,
    classes: 3
  },
  {
    id: 'grade9',
    name: 'F3',
    displayName: 'Form 3',
    level: 'junior-secondary',
    ageGroup: '14 years',
    students: 72,
    classes: 2
  },
  
  // Senior Secondary grades
  {
    id: 'grade10',
    name: 'F4',
    displayName: 'Form 4',
    level: 'senior-secondary',
    ageGroup: '15 years',
    students: 68,
    classes: 3
  },
  {
    id: 'grade11',
    name: 'F5',
    displayName: 'Form 5',
    level: 'senior-secondary',
    ageGroup: '16 years',
    students: 54,
    classes: 2
  },
  {
    id: 'grade12',
    name: 'F6',
    displayName: 'Form 6',
    level: 'senior-secondary',
    ageGroup: '17 years',
    students: 48,
    classes: 2
  }
]

interface CreateStudentDrawerProps {
  onStudentCreated: () => void
}

export function CreateStudentDrawer({ onStudentCreated }: CreateStudentDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<{
    user: { id: string; email: string; name: string }
    student: { id: string; admission_number: string; grade: string; gender: string; phone: string }
    generatedPassword: string
  } | null>(null)
  const { data: schoolConfig } = useSchoolConfig()

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
    setIsLoading(true)

    try {
      // Auto-generate email if not provided
      let studentEmail = data.student_email
      if (!studentEmail || studentEmail.trim() === '') {
        // Generate email from name: "Kelvin Mwangi" -> "kelvinmwangi@squl.ac.ke"
        const cleanName = data.name.toLowerCase()
          .replace(/[^a-z\s]/g, '') // Remove non-alphabetic characters except spaces
          .replace(/\s+/g, '') // Remove all spaces
        studentEmail = `${cleanName}@squl.ac.ke`
      }

      // Prepare data with auto-generated email
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

      const studentData = result.createStudent
      
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
      onStudentCreated()
      
    } catch (error) {
      console.error('Error creating student:', error)
      toast.error("Registration Failed", {
        description: error instanceof Error ? error.message : "An error occurred while creating the student"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="default" 
          className="flex items-center gap-2 font-mono"
          disabled={isLoading}
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
              {isLoading && (
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
                              disabled={isLoading}
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
                            <SelectTrigger className="font-mono">
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockGrades.map(grade => (
                              <SelectItem key={grade.id} value={grade.id}>
                                {grade.displayName}
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
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Class *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Form 1 East" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stream"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Stream (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., East, West, Blue" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
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
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90 text-white gap-2 font-mono transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
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
                  disabled={isLoading}
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
"use client"

import React, { useState, useMemo } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { 
  UserPlus, 
  User, 
  Users, 
  Info, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  Shield,
  MessageSquare,
  Loader2,
  Wand2,
  GraduationCap,
  Search,
  CheckCircle,
  AlertCircle,
  Hash,
  UserCheck,
  X,
} from "lucide-react"
import { toast } from 'sonner'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { useQueryClient } from '@tanstack/react-query'

// Student schema for multiple students
const studentSchema = z.object({
  name: z.string().min(2, "Student name is required"),
  grade: z.string().min(1, "Student grade is required"),
  class: z.string().min(1, "Student class is required"),
  stream: z.string().optional().or(z.literal("")),
  admissionNumber: z.string().min(1, "Student admission number is required"),
  phone: z.string().optional().or(z.literal("")), // Add phone field for manual input
})

// Form validation schema
const parentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10, "Valid phone number is required"),
  relationship: z.enum(["father", "mother", "guardian", "other"]),
  occupation: z.string().optional().or(z.literal("")),
  workAddress: z.string().optional().or(z.literal("")),
  homeAddress: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  idNumber: z.string().optional().or(z.literal("")),
  students: z.array(studentSchema).min(1, "At least one student is required"),
  communicationSms: z.boolean(),
  communicationEmail: z.boolean(),
  communicationWhatsapp: z.boolean(),
})

type ParentFormData = z.infer<typeof parentFormSchema>

interface CreateParentDrawerProps {
  onParentCreated: () => void
}

export function CreateParentDrawer({ onParentCreated }: CreateParentDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSearchingStudent, setIsSearchingStudent] = useState(false)
  const [searchedStudent, setSearchedStudent] = useState<any>(null)
  const [searchedStudents, setSearchedStudents] = useState<any[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchType, setSearchType] = useState<'admissionNumber' | 'name'>('name')
  const [searchValue, setSearchValue] = useState('')
  const queryClient = useQueryClient()
  
  // Get data from school config store
  const { config, getAllGradeLevels, getStreamsByGradeId, getGradeById } = useSchoolConfigStore()
  
  // Generate grades and streams from store data with proper sorting
  const { allGrades } = useMemo(() => {
    if (!config) {
      return { allGrades: [] };
    }
    
    // Get all grade levels and flatten them
    const allGradeLevels = getAllGradeLevels();
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
    });
    
    return { allGrades };
  }, [config, getAllGradeLevels]);
  
  // Form handling
  const form = useForm<ParentFormData>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      relationship: 'father',
      occupation: '',
      workAddress: '',
      homeAddress: '',
      emergencyContact: '',
      idNumber: '',
      students: [],
      communicationSms: true,
      communicationEmail: false,
      communicationWhatsapp: true,
    },
  })

  // Watch form values for dynamic updates
  const watchedStudents = form.watch('students');
  
  // Add new student to the list
  const addNewStudent = () => {
    const currentStudents = form.getValues('students');
    
    // Check if there are any incomplete students
    const incompleteStudents = currentStudents.filter(student => 
      !student.name.trim() || !student.admissionNumber.trim() || !student.grade.trim()
    );
    
    if (incompleteStudents.length > 0) {
      toast.error('Please complete the current student information first', {
        description: 'Fill in all required fields (Name, Admission Number, Grade) before adding another student'
      });
      
      // Highlight the first incomplete student
      const firstIncompleteIndex = currentStudents.findIndex(student => 
        !student.name.trim() || !student.admissionNumber.trim() || !student.grade.trim()
      );
      
      // Scroll to the incomplete student
      setTimeout(() => {
        const studentElement = document.querySelector(`[data-student-index="${firstIncompleteIndex}"]`);
        if (studentElement) {
          studentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a temporary highlight effect
          studentElement.classList.add('ring-2', 'ring-red-500', 'ring-opacity-50');
          setTimeout(() => {
            studentElement.classList.remove('ring-2', 'ring-red-500', 'ring-opacity-50');
          }, 2000);
        }
      }, 100);
      
      return;
    }
    
    const newStudent = {
      name: '',
      grade: '',
      class: '',
      stream: '',
      admissionNumber: '',
    };
    form.setValue('students', [...currentStudents, newStudent]);
    
    toast.success('New student form added!', {
      description: 'Please fill in the student information'
    });
  };

  // Remove student from the list
  const removeStudent = (index: number) => {
    const currentStudents = form.getValues('students');
    const updatedStudents = currentStudents.filter((_, i) => i !== index);
    form.setValue('students', updatedStudents);
  };

  // Update student data
  const updateStudent = (index: number, field: keyof typeof studentSchema.shape, value: string) => {
    const currentStudents = form.getValues('students');
    const updatedStudents = [...currentStudents];
    updatedStudents[index] = { ...updatedStudents[index], [field]: value };
    form.setValue('students', updatedStudents);
  };

  // Auto-generate class name for a specific student
  const autoGenerateClassName = (index: number) => {
    const students = form.getValues('students');
    const student = students[index];
    
    if (!student.grade) {
      toast.error('Please select a grade first');
      return;
    }
    
    let className = student.grade;
    
    if (student.stream) {
      className = `${student.grade} ${student.stream}`;
    }
    
    updateStudent(index, 'class', className);
    toast.success('Class name generated!', {
      description: `Generated: ${className}`
    });
  };

  // Auto-generate class name when grade or stream changes for a specific student
  const handleStudentGradeChange = (index: number, gradeName: string) => {
    updateStudent(index, 'grade', gradeName);
    
    // Auto-generate class name
    const students = form.getValues('students');
    const student = students[index];
    let className = gradeName;
    
    if (student.stream) {
      className = `${gradeName} ${student.stream}`;
    }
    
    updateStudent(index, 'class', className);
  };

  const handleStudentStreamChange = (index: number, streamName: string) => {
    updateStudent(index, 'stream', streamName);
    
    // Auto-generate class name
    const students = form.getValues('students');
    const student = students[index];
    let className = student.grade;
    
    if (streamName) {
      className = `${student.grade} ${streamName}`;
    }
    
    updateStudent(index, 'class', className);
  };

  // Search student by admission number or name
  const searchStudent = async (value: string, type: 'admissionNumber' | 'name') => {
    if (!value.trim()) {
      toast.error('Please enter a search value');
      return;
    }

    setIsSearchingStudent(true);
    setSearchError(null);
    setSearchedStudent(null);
    setSearchedStudents([]);

    try {
      const requestBody = type === 'admissionNumber' 
        ? { admissionNumber: value, searchType: type }
        : { name: value, searchType: type };

      const response = await fetch('/api/parents/search-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search for student');
      }

      if (type === 'admissionNumber') {
        // Single student result for admission number search
        if (data.searchStudentByAdmission) {
          setSearchedStudent(data.searchStudentByAdmission);
          toast.success('Student found!', {
            description: `Found student: ${data.searchStudentByAdmission.name}`
          });
        } else {
          setSearchError('No student found with this admission number');
        }
      } else {
        // Multiple students result for name search
        if (data.searchStudentsByName && data.searchStudentsByName.length > 0) {
          setSearchedStudents(data.searchStudentsByName);
          toast.success(`${data.searchStudentsByName.length} student(s) found!`, {
            description: `Found ${data.searchStudentsByName.length} student(s) with name "${value}"`
          });
        } else {
          setSearchError(`No students found with name "${value}"`);
        }
      }
    } catch (error: any) {
      console.error('Error searching for student:', error);
      setSearchError(error.message || 'Failed to search for student');
      toast.error('Search failed', {
        description: error.message || 'Failed to search for student'
      });
    } finally {
      setIsSearchingStudent(false);
    }
  };

  // Auto-fill student information when student is found
  const useStudentData = (student: any) => {
    if (!student) return;

    // Convert grade ID to grade name
    let gradeName = '';
    if (student.grade) {
      // Try to find the grade by ID first
      const gradeById = allGrades.find(grade => grade.id === student.grade);
      if (gradeById) {
        gradeName = gradeById.name;
      } else {
        // If not found by ID, try to match by name (fallback)
        const matchingGrade = allGrades.find(grade => 
          grade.name.toLowerCase().includes(student.grade.toLowerCase()) ||
          student.grade.toLowerCase().includes(grade.name.toLowerCase())
        );
        if (matchingGrade) {
          gradeName = matchingGrade.name;
        } else {
          // If still not found, use the original value
          gradeName = student.grade;
        }
      }
    }

    // Convert stream ID to stream name if available
    let streamName = '';
    if (student.streamId && gradeName) {
      const gradeById = allGrades.find(grade => grade.id === student.grade);
      if (gradeById) {
        const streams = getStreamsByGradeId(gradeById.id);
        const streamById = streams.find(stream => stream.id === student.streamId);
        if (streamById) {
          streamName = streamById.name;
        }
      }
    }

    // Generate class name from grade and stream
    let className = gradeName;
    if (streamName) {
      className = `${gradeName} ${streamName}`;
    }

    // Add the found student to the students array
    const currentStudents = form.getValues('students');
    const newStudent = {
      name: student.name,
      admissionNumber: student.admissionNumber,
      grade: gradeName,
      class: className,
      stream: streamName,
      phone: student.phone || '', // Include phone field from search result
    };

    // Add to students array
    form.setValue('students', [...currentStudents, newStudent]);

    // Clear search results after using data
    setSearchedStudent(null);
    setSearchedStudents([]);
    setSearchValue('');

    toast.success('Student added!', {
      description: `${student.name} has been added to your student list`
    });
  };

  // Show loading state if no configuration is available
  if (!config) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button 
            variant="default" 
            className="flex items-center gap-2 font-mono"
            disabled={isLoading}
          >
            <UserPlus className="h-4 w-4" />
            Add New Parent
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-full w-full md:w-1/2 bg-slate-50 dark:bg-slate-900" data-vaul-drawer-direction="right">
          <DrawerHeader className="border-b-2 border-primary/20 pb-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                <span className="text-xs font-mono uppercase tracking-wide text-primary">
                  Parent Registration
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <DrawerTitle className="text-2xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                  New Parent/Guardian
                </DrawerTitle>
              </div>
              <DrawerDescription className="text-center text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md">
                Loading school configuration...
              </DrawerDescription>
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading school data...</span>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Submit handler
  const onSubmit = async (data: ParentFormData) => {
    setIsLoading(true);

    try {
      console.log('Creating parent invitation:', data);
      
      // Prepare parent data
      const parentData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        relationship: data.relationship,
        occupation: data.occupation,
        workAddress: data.workAddress,
        homeAddress: data.homeAddress,
        emergencyContact: data.emergencyContact,
        idNumber: data.idNumber,
        communicationSms: data.communicationSms,
        communicationEmail: data.communicationEmail,
        communicationWhatsapp: data.communicationWhatsapp,
      };

      // Prepare students data
      const studentsData = data.students.map(student => ({
        name: student.name,
        admissionNumber: student.admissionNumber.startsWith('ADM') ? student.admissionNumber : `ADM${student.admissionNumber}`,
        grade: student.grade,
        class: student.class,
        stream: student.stream,
        phone: student.phone || '', // Include phone field for manual input
      }));

      // Get the school's tenant ID from the config
      const schoolTenantId = config?.tenant?.id;
      
      console.log('School config:', config);
      console.log('School tenant ID:', schoolTenantId);
      
      if (!schoolTenantId) {
        toast.error("Configuration Error", {
          description: "School tenant ID not available. Please refresh and try again."
        });
        return;
      }

      // Make API call to invite parent
      const response = await fetch('/api/parents/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentData,
          students: studentsData,
          linkingMethod: 'MANUAL_INPUT', // Default to manual input since we're creating new students
          tenantId: schoolTenantId // Send the school's tenant ID, not the admin's
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to invite parent');
      }

      if (result.success) {
        // Show success message
        if (result.errors && result.errors.length > 0) {
          // Partial success
          toast.success("Parent Invitation Sent!", {
            description: `${result.message}. ${result.errors.length} student(s) had issues.`
          });
          
          // Log errors for debugging
          console.warn('Partial invitation errors:', result.errors);
        } else {
          // Complete success
          toast.success("Parent Invitation Sent Successfully!", {
            description: `${data.name} has been invited and linked to ${data.students.length} student${data.students.length !== 1 ? 's' : ''}`
          });
        }

        // Log successful invitations
        console.log('Successful invitations:', result.invitations);
        
        // Invalidate and refetch school configuration to show any updated data
        await queryClient.invalidateQueries({ queryKey: ['schoolConfig'] });
        
        // Reset form and close drawer
        form.reset();
        setIsDrawerOpen(false);
        onParentCreated();
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
      
    } catch (error: any) {
      console.error('Error creating parent invitation:', error);
      toast.error("Invitation Failed", {
        description: error.message || "An error occurred while sending the parent invitation. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="default" 
          className="flex items-center gap-2 font-mono"
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4" />
          Add New Parent
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-full md:w-1/2 bg-slate-50 dark:bg-slate-900" data-vaul-drawer-direction="right">
        <DrawerHeader className="border-b-2 border-primary/20 pb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
              <span className="text-xs font-mono uppercase tracking-wide text-primary">
                Parent Registration
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <DrawerTitle className="text-2xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                New Parent/Guardian
              </DrawerTitle>
            </div>
            <DrawerDescription className="text-center text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md">
              Register a new parent or guardian and link them to their student
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">Registering parent...</p>
                  </div>
                </div>
              )}

              {/* Parent Personal Information */}
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                    <User className="h-3 w-3 mr-2" />
                    Parent Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Parent/Guardian full name" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Relationship *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="font-mono">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="guardian">Guardian</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+254700000000" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          Email (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="parent@example.com" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Shield className="h-3.5 w-3.5 text-primary" />
                          ID Number (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="National ID Number" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Briefcase className="h-3.5 w-3.5 text-primary" />
                          Occupation (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Job title or profession" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homeAddress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          Home Address (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Physical home address" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Work Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Work location" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Emergency Contact (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+254700000000" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Student Information */}
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                    <Users className="h-3 w-3 mr-2" />
                    Student Information
                  </h3>
                </div>

                {/* Student Search Section */}
                <div className="mb-8 relative">
                  {/* Main Search Container */}
                  <div className="bg-gradient-to-br from-primary/5 via-primary/8 to-primary/3 border-2 border-primary/20 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                    {/* Header with Icon */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl flex items-center justify-center border border-primary/30">
                          <Search className="h-6 w-6 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary/80 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">?</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-mono text-lg font-bold text-slate-800 dark:text-slate-200">
                          Find Your Student
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          Quick search to auto-fill student information
                        </p>
                      </div>
                    </div>

                                      {/* Search Type Toggle */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                        Search by:
                      </span>
                      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSearchType('name');
                            setSearchValue('');
                            setSearchedStudent(null);
                            setSearchedStudents([]);
                            setSearchError(null);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            searchType === 'name'
                              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm border border-primary/20'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <UserCheck className="h-4 w-4" />
                          Student Name
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchType('admissionNumber');
                            setSearchValue('');
                            setSearchedStudent(null);
                            setSearchedStudents([]);
                            setSearchError(null);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            searchType === 'admissionNumber'
                              ? 'bg-white dark:bg-slate-700 text-primary shadow-sm border border-primary/20'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Hash className="h-4 w-4" />
                          Admission Number
                        </button>
                      </div>
                    </div>
                  </div>

                    {/* Search Input with Enhanced Design */}
                    <div className="relative mb-6">
                      <div className="relative">
                        <Input
                          placeholder={searchType === 'admissionNumber' ? "Enter admission number (e.g., ADM98769)" : "Enter student name (e.g., John Doe)"}
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          className="font-mono pl-12 pr-20 py-4 text-base bg-white dark:bg-slate-800 border-2 border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value) {
                                searchStudent(value, searchType);
                              }
                            }
                          }}
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          {searchType === 'admissionNumber' ? (
                            <Hash className="h-5 w-5 text-primary/60" />
                          ) : (
                            <UserCheck className="h-5 w-5 text-primary/60" />
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            const value = searchValue.trim();
                            if (value) {
                              searchStudent(value, searchType);
                            }
                          }}
                          disabled={isSearchingStudent || !searchValue.trim()}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSearchingStudent ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Search Tips */}
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Info className="h-3 w-3" />
                        <span>
                          {searchType === 'admissionNumber' 
                            ? "Enter the exact admission number for precise results"
                            : "Enter full name or partial name to find matching students"
                          }
                        </span>
                      </div>
                    </div>

                    {/* Search Results Container */}
                    <div className="space-y-4">
                      {/* Single Student Result */}
                      {searchedStudent && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h5 className="font-mono text-sm font-bold text-green-800 dark:text-green-200">
                                Perfect Match Found!
                              </h5>
                              <p className="text-xs text-green-600 dark:text-green-400">
                                Student details ready to use
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-green-600 dark:text-green-400" />
                              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                {searchedStudent.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Hash className="h-3 w-3 text-green-600 dark:text-green-400" />
                              <span className="text-xs text-green-700 dark:text-green-300">
                                {searchedStudent.admissionNumber}
                              </span>
                            </div>
                                                         <div className="flex items-center gap-2">
                               <GraduationCap className="h-3 w-3 text-green-600 dark:text-green-400" />
                               <span className="text-xs text-green-700 dark:text-green-300">
                                 {(() => {
                                   if (!searchedStudent.grade) return 'Not specified';
                                   const gradeById = allGrades.find(grade => grade.id === searchedStudent.grade);
                                   return gradeById ? gradeById.name : searchedStudent.grade;
                                 })()}
                               </span>
                             </div>
                            {searchedStudent.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-green-600 dark:text-green-400" />
                                <span className="text-xs text-green-700 dark:text-green-300">
                                  {searchedStudent.phone}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            type="button"
                            onClick={() => useStudentData(searchedStudent)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Use This Student's Information
                          </Button>
                        </div>
                      )}

                      {/* Multiple Students Results */}
                      {searchedStudents.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h5 className="font-mono text-sm font-bold text-blue-800 dark:text-blue-200">
                                {searchedStudents.length} Student{searchedStudents.length !== 1 ? 's' : ''} Found
                              </h5>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                Choose the correct student from the list below
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                            {searchedStudents.map((student, index) => (
                              <div 
                                key={student.id || index} 
                                className="p-4 bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-blue-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                                onClick={() => useStudentData(student)}
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:bg-blue-600 transition-colors"></div>
                                  <span className="font-mono text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                                    Option {index + 1}
                                  </span>
                                </div>
                                
                                <div className="space-y-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                      {student.name}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Hash className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                      {student.admissionNumber}
                                    </span>
                                  </div>
                                  
                                                                     <div className="flex items-center gap-2">
                                     <GraduationCap className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                     <span className="text-xs text-slate-600 dark:text-slate-400">
                                       {(() => {
                                         if (!student.grade) return 'Not specified';
                                         const gradeById = allGrades.find(grade => grade.id === student.grade);
                                         return gradeById ? gradeById.name : student.grade;
                                       })()}
                                     </span>
                                   </div>
                                  
                                  {student.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                      <span className="text-xs text-slate-600 dark:text-slate-400">
                                        {student.phone}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                  Click to select this student
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Error State */}
                      {searchError && (
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <h5 className="font-mono text-sm font-bold text-red-800 dark:text-red-200">
                                No Students Found
                              </h5>
                              <p className="text-xs text-red-600 dark:text-red-400">
                                {searchError}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Students List */}
                <div className="space-y-4">
                  {/* Add Student Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                        Students ({watchedStudents.length})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewStudent}
                      className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Add Student
                    </Button>
                  </div>

                  {/* Students List */}
                  {watchedStudents.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5">
                      <Users className="h-8 w-8 text-primary/50 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No students added yet. Use the search above or click "Add Student" to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {watchedStudents.map((student, index) => (
                        <div 
                          key={index} 
                          data-student-index={index}
                          className={`border-2 border-primary/20 bg-primary/5 rounded-xl p-4 transition-all duration-300 ${
                            (!student.name.trim() || !student.admissionNumber.trim() || !student.grade.trim()) 
                              ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' 
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                              <span className="font-mono text-sm font-medium text-primary">
                                Student {index + 1}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStudent(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Student Name */}
                            <div>
                              <label className={`font-mono text-xs font-medium mb-1 block ${
                                !student.name.trim() ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                              }`}>
                                Student Name *
                                {!student.name.trim() && <span className="ml-1 text-red-500">(Required)</span>}
                              </label>
                              <Input
                                placeholder="Student's full name"
                                value={student.name}
                                onChange={(e) => updateStudent(index, 'name', e.target.value)}
                                className={`font-mono text-sm ${
                                  !student.name.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                                }`}
                              />
                            </div>

                            {/* Admission Number */}
                            <div>
                              <label className={`font-mono text-xs font-medium mb-1 block ${
                                !student.admissionNumber.trim() ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                              }`}>
                                Admission Number *
                                {!student.admissionNumber.trim() && <span className="ml-1 text-red-500">(Required)</span>}
                              </label>
                              <Input
                                placeholder="e.g., KPS/2023/001"
                                value={student.admissionNumber}
                                onChange={(e) => updateStudent(index, 'admissionNumber', e.target.value)}
                                className={`font-mono text-sm ${
                                  !student.admissionNumber.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''
                                }`}
                              />
                            </div>

                            {/* Grade */}
                            <div>
                              <label className={`font-mono text-xs font-medium mb-1 block ${
                                !student.grade.trim() ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                              }`}>
                                Grade *
                                {!student.grade.trim() && <span className="ml-1 text-red-500">(Required)</span>}
                              </label>
                              <Select 
                                value={student.grade}
                                onValueChange={(value) => handleStudentGradeChange(index, value)}
                              >
                                <SelectTrigger className={`font-mono text-sm bg-white dark:bg-slate-800 ${
                                  !student.grade.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-primary/20'
                                }`}>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allGrades.map(grade => (
                                    <SelectItem key={grade.id} value={grade.name}>
                                      {grade.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Class */}
                            <div>
                              <label className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Class *
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Will be generated"
                                  value={student.class}
                                  onChange={(e) => updateStudent(index, 'class', e.target.value)}
                                  className="font-mono text-sm bg-primary/5 border-primary/20 flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => autoGenerateClassName(index)}
                                  disabled={!student.grade}
                                  className="shrink-0 border-primary/20 text-primary hover:bg-primary/5"
                                >
                                  <Wand2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Stream */}
                            <div className="md:col-span-2">
                              <label className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Stream (Optional)
                              </label>
                              <Select 
                                value={student.stream}
                                onValueChange={(value) => handleStudentStreamChange(index, value)}
                              >
                                <SelectTrigger className="font-mono text-sm bg-white dark:bg-slate-800 border-primary/20">
                                  <SelectValue placeholder="Select stream" />
                                </SelectTrigger>
                                <SelectContent>
                                  {student.grade && allGrades.find(g => g.name === student.grade) && 
                                    getStreamsByGradeId(allGrades.find(g => g.name === student.grade)!.id).map(stream => (
                                      <SelectItem key={stream.id} value={stream.name}>
                                        {stream.name}
                                      </SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Student Phone */}
                            <div className="md:col-span-2">
                              <label className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                                Student Phone (Optional)
                              </label>
                              <Input
                                placeholder="Student's phone number"
                                value={student.phone || ''}
                                onChange={(e) => updateStudent(index, 'phone', e.target.value)}
                                className="font-mono text-sm bg-white dark:bg-slate-800 border-primary/20"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Communication Preferences */}
              <div className="border-2 border-primary/20 bg-primary/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                      <MessageSquare className="h-3 w-3 mr-2" />
                      Communication Preferences
                    </h3>
                  </div>
                  <Badge className="bg-primary/20 text-primary border border-primary/30 font-mono text-xs">Optional</Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-4 leading-relaxed">
                  Select how you would like to receive school communications and updates.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="communicationSms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 p-4 bg-primary/5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-mono text-sm">
                            SMS Messages
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Receive text messages
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communicationEmail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 p-4 bg-primary/5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-mono text-sm">
                            Email Updates
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Receive email notifications
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communicationWhatsapp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-primary/20 p-4 bg-primary/5">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-mono text-sm">
                            WhatsApp
                          </FormLabel>
                          <p className="text-xs text-slate-500">
                            Receive WhatsApp messages
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DrawerFooter className="border-t-2 border-primary/20 pt-6 space-y-3">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white gap-2 font-mono transition-colors">
                  <UserPlus className="h-4 w-4" />
                  Register Parent/Guardian
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="border-primary/20 text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:border-primary/40 font-mono transition-colors">
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 
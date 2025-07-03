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
  GraduationCap
} from "lucide-react"
import { toast } from 'sonner'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { useQueryClient } from '@tanstack/react-query'

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
  studentName: z.string().min(2, "Student name is required"),
  studentGrade: z.string().min(1, "Student grade is required"),
  studentClass: z.string().min(1, "Student class is required"),
  studentStream: z.string().optional().or(z.literal("")),
  studentAdmissionNumber: z.string().min(1, "Student admission number is required"),
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
      studentName: '',
      studentGrade: '',
      studentClass: '',
      studentStream: '',
      studentAdmissionNumber: '',
      communicationSms: true,
      communicationEmail: false,
      communicationWhatsapp: true,
    },
  })

  // Watch form values for dynamic updates
  const watchedGrade = form.watch('studentGrade');
  const watchedStream = form.watch('studentStream');
  
  // Find the selected grade ID from the grade name
  const selectedGradeId = useMemo(() => {
    if (!watchedGrade || !allGrades) return null;
    const grade = allGrades.find(g => g.name === watchedGrade);
    return grade?.id || null;
  }, [watchedGrade, allGrades]);
  
  // Get streams for selected grade
  const availableStreams = selectedGradeId ? getStreamsByGradeId(selectedGradeId) : [];
  
  // Get grade info for display
  const selectedGradeInfo = selectedGradeId ? getGradeById(selectedGradeId) : null;

  // Auto-generate class name from grade and stream
  const autoGenerateClassName = () => {
    const gradeName = form.getValues('studentGrade');
    const streamName = form.getValues('studentStream');
    
    if (!gradeName) {
      toast.error('Please select a grade first');
      return;
    }
    
    let className = gradeName;
    
    if (streamName) {
      // Simple and clean combination: Grade + Stream
      className = `${gradeName} ${streamName}`;
    }
    
    form.setValue('studentClass', className);
    toast.success('Class name generated!', {
      description: `Generated: ${className}`
    });
  };

  // Auto-generate class name when grade or stream changes
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'studentGrade' || name === 'studentStream') {
        const gradeName = form.getValues('studentGrade');
        const streamName = form.getValues('studentStream');
        
        if (gradeName) {
          let className = gradeName;
          if (streamName) {
            className = `${gradeName} ${streamName}`;
          }
          form.setValue('studentClass', className);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make the actual API call
      console.log('Creating parent:', data);
      
      toast.success("Parent Registered Successfully!", {
        description: `${data.name} has been registered and linked to ${data.studentName}`
      });
      
      // Invalidate and refetch school configuration to show any updated data
      await queryClient.invalidateQueries({ queryKey: ['schoolConfig'] });
      
      // Reset form and close drawer
      form.reset();
      setIsDrawerOpen(false);
      onParentCreated();
      
    } catch (error) {
      console.error('Error creating parent:', error);
      toast.error("Registration Failed", {
        description: "An error occurred while registering the parent. Please try again."
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="studentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Student Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Student's full name" {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentAdmissionNumber"
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
                    name="studentGrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-mono text-sm">
                          <GraduationCap className="h-4 w-4" />
                          Grade *
                        </FormLabel>
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
                                  value={grade.name}
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
                    name="studentClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1 font-mono text-sm">
                          <Wand2 className="h-3.5 w-3.5 text-primary" />
                          Class (Auto-Generated) *
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Will be generated from grade and stream" 
                              {...field} 
                              className="font-mono bg-primary/5 border-primary/20 flex-1" 
                              readOnly
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={autoGenerateClassName}
                              disabled={isLoading || !watchedGrade}
                              className="shrink-0 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
                              title="Generate class name from grade and stream"
                            >
                              <Wand2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                    name="studentStream"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
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
                            {availableStreams.map((stream) => (
                              <SelectItem key={stream.id} value={stream.name}>
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
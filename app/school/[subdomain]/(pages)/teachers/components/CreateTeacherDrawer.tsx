"use client";

import React, { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { 
  UserPlus, 
  Info, 
  CalendarDays, 
  User, 
  Award,
  Calendar,
  Clock,
  GraduationCap,
  Phone,
  CheckCircle,
  Mail,
  MapPin,
  IdCard,
  Loader2,
} from "lucide-react";
import { toast } from 'sonner';
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig';
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore';
import { Checkbox } from '@/components/ui/checkbox';
import { InvitationSuccessModal } from './InvitationSuccessModal';

// Teacher form data schema
const teacherFormSchema = z.object({
  email: z.string().email({ message: 'Valid email is required' }),
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  gender: z.enum(['MALE', 'FEMALE'], { required_error: "Please select a gender" }),
  department: z.string().min(1, { message: 'Department is required' }),
  phoneNumber: z.string().min(10, { message: 'Valid phone number is required' }),
  address: z.string().optional().or(z.literal('')),
  employeeId: z.string().min(2, { message: 'Employee ID is required' }),
  dateOfBirth: z.string().min(1, { message: 'Date of birth is required' }),
  qualifications: z.string().min(1, { message: 'Qualifications are required' }),
  tenantSubjectIds: z.array(z.string()).min(1, { message: 'Please select at least one subject' }),
  tenantGradeLevelIds: z.array(z.string()).min(1, { message: 'Please select at least one grade level' }),
  tenantStreamIds: z.array(z.string()).optional().default([]),
  isClassTeacher: z.boolean().default(false),
  classTeacherTenantStreamId: z.string().optional(),
});

type TeacherFormData = z.infer<typeof teacherFormSchema>;

// Mock data for the departments
const departments = [
  'English',
  'Mathematics',
  'Science',
  'Social Studies',
  'Physical Education',
  'Arts & Music',
  'Languages',
  'Computer Science',
  'Special Education',
  'Administration'
];

interface CreateTeacherDrawerProps {
  onTeacherCreated: () => void;
}

export function CreateTeacherDrawer({ onTeacherCreated }: CreateTeacherDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<{
    email: string;
    fullName: string;
    status: string;
    createdAt: string;
  } | null>(null);
  const { data: schoolConfig } = useSchoolConfig();
  
  // Get school config data
  const getAllGradeLevels = useSchoolConfigStore(state => state.getAllGradeLevels);
  const getAllSubjects = useSchoolConfigStore(state => state.getAllSubjects);
  const gradeLevels = getAllGradeLevels();
  const allSubjects = getAllSubjects();
  
  // Flatten grades and streams for easier access
  const flatGrades = gradeLevels.flatMap(level =>
    (level.grades || []).map(grade => ({
      ...grade,
      levelName: level.levelName,
      levelId: level.levelId,
      streams: grade.streams || []
    }))
  );
  
  const allStreams = flatGrades.flatMap(grade => 
    grade.streams.map(stream => ({
      ...stream,
      gradeName: grade.name,
      gradeId: grade.id
    }))
  );
  
  // Clear error when drawer opens
  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open);
    if (open) {
      setError(null);
    }
  };
  
  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema) as any,
    defaultValues: {
      email: '',
      fullName: '',
      firstName: '',
      lastName: '',
      gender: 'MALE',
      department: '',
      phoneNumber: '',
      address: '',
      employeeId: '',
      dateOfBirth: '',
      qualifications: '',
      tenantSubjectIds: [],
      tenantGradeLevelIds: [],
      tenantStreamIds: [],
      isClassTeacher: false,
      classTeacherTenantStreamId: '',
    },
  });

  // Submit handler
  const onSubmit = async (data: TeacherFormData) => {
    if (!schoolConfig?.tenant?.id) {
      toast.error("Configuration Error", {
        description: "School configuration not available. Please refresh and try again."
      });
      return;
    }

    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      // Extract only the fields that are accepted by the API schema
      const createTeacherDto = {
        email: data.email,
        fullName: data.fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "TEACHER",
        gender: data.gender,
        department: data.department,
        phoneNumber: data.phoneNumber,
        address: data.address || "",
        employeeId: data.employeeId,
        dateOfBirth: data.dateOfBirth,
        qualifications: data.qualifications,
        tenantSubjectIds: data.tenantSubjectIds,
        tenantGradeLevelIds: data.tenantGradeLevelIds,
        tenantStreamIds: data.tenantStreamIds,
        ...(data.isClassTeacher && data.classTeacherTenantStreamId && {
          classTeacherTenantStreamId: data.classTeacherTenantStreamId
        })
      };

      const response = await fetch('/api/school/invite-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          createTeacherDto,
          tenantId: schoolConfig.tenant.id
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        // Handle API errors with detailed information
        if (result.error) {
          let userFriendlyMessage = '';
          
          // Transform technical errors into user-friendly messages
          if (result.error.includes('User already exists') || result.error.includes('already exists in this tenant')) {
            userFriendlyMessage = 'This teacher is already registered in your school.';
          } else if (result.error.includes('Error creating teacher record')) {
            userFriendlyMessage = 'We encountered an issue while creating the teacher account.';
          } else if (result.error.includes('Invalid') || result.error.includes('BADREQUESTEXCEPTION')) {
            userFriendlyMessage = 'The information provided is not valid.';
          } else if (result.error.includes('NOTFOUNDEXCEPTION')) {
            userFriendlyMessage = 'The requested resource was not found.';
          } else {
            userFriendlyMessage = result.error;
          }
          
          // Add error code if available
          if (result.code) {
            userFriendlyMessage += ` (${result.code})`;
          }
          
          // Add additional details if available
          if (result.details && Array.isArray(result.details)) {
            const detailMessages = result.details.map((detail: any) => detail.message).filter(Boolean);
            if (detailMessages.length > 0) {
              userFriendlyMessage += `\n\nDetails:\n${detailMessages.join('\n')}`;
            }
          }
          
          throw new Error(userFriendlyMessage);
        } else {
          throw new Error('We encountered an unexpected issue while creating the teacher account.');
        }
      }

      const inviteData = result.inviteTeacher;
      
      // Store invitation data and show success modal
      setInvitationData(inviteData);
      setShowSuccessModal(true);
      
      // Reset form and close drawer
      form.reset();
      setIsDrawerOpen(false);
      onTeacherCreated();
      
    } catch (error) {
      console.error('Error inviting teacher:', error);
      
      let errorMessage = "We couldn't send the teacher invitation. Please try again.";
      let errorTitle = "Invitation Not Sent";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle specific error types with better titles
        if (error.message.includes('already registered')) {
          errorTitle = "Teacher Already Exists";
        } else if (error.message.includes('BADREQUESTEXCEPTION')) {
          errorTitle = "Please Check Your Information";
        } else if (error.message.includes('NOTFOUNDEXCEPTION')) {
          errorTitle = "Resource Not Found";
        } else if (error.message.includes('unexpected issue')) {
          errorTitle = "Something Went Wrong";
        }
      }
      
      // Set error for UI display
      setError(errorMessage);
      
      // Also show toast notification
      toast.error(errorTitle, {
        description: errorMessage,
        duration: 8000, // Show longer for detailed errors
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={handleDrawerOpenChange}>
      <DrawerTrigger asChild>
        <Button 
          variant="default" 
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white"
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4" />
          Add New Teacher
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-full md:w-1/2 bg-background" data-vaul-drawer-direction="right">
        <DrawerHeader className="border-b border-border bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DrawerTitle className="text-xl font-mono font-bold text-foreground uppercase tracking-wide">
                Teacher Registration
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground font-medium">
                Send an invitation email to a new teacher
              </DrawerDescription>
            </div>
            <div className="px-3 py-1 bg-primary/10 border border-primary/30 text-xs font-mono text-primary uppercase tracking-wide">
              New Entry
            </div>
          </div>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto bg-background">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="p-6 space-y-8">
              
              {/* Error Display */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="h-3 w-3 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                        Unable to Create Teacher Account
                      </h4>
                      <div className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Helpful Guidance for Specific Errors */}
              {error && error.includes('already registered') && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Here's what you can do:
                      </h4>
                      <div className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        It looks like this teacher already has an account in your school. Don't worry, here are your options:
                      </div>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Check if they already have access to their account</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Try using a different email address</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>Ask them to reset their password if they can't access their account</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* General Helpful Message for Other Errors */}
              {error && !error.includes('already registered') && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                        Need help?
                      </h4>
                      <div className="text-sm text-amber-700 dark:text-amber-300">
                        If this issue persists, try refreshing the page or contact your system administrator for assistance.
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-50 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Sending invitation...</p>
                  </div>
                </div>
              )}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
                  <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Personal Information
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control as any}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Full Name *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter teacher's full name" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          First Name *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter first name" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Last Name *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter last name" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <IdCard className="h-3.5 w-3.5 text-primary" />
                          Employee ID *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., TCH/2024/001" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Gender *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  <FormField
                    control={form.control as any}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Department *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept.toLowerCase()}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 text-primary" />
                          Date of Birth *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
                  <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Qualifications & Experience
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <FormField
                    control={form.control as any}
                    name="qualifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Qualifications *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., BSc Mathematics, MSc Education" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Teaching Assignment Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
                  <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Teaching Assignment
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  
                  {/* Grade Levels */}
                  <FormField
                    control={form.control as any}
                    name="tenantGradeLevelIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Grade Levels *
                        </FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                          {flatGrades.map((grade) => (
                            <div key={grade.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`grade-${grade.id}`}
                                checked={field.value?.includes(grade.id) || false}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, grade.id]);
                                  } else {
                                    field.onChange(currentValues.filter((id: string) => id !== grade.id));
                                    // Clear subjects when grade is deselected
                                    const currentSubjects = form.getValues('tenantSubjectIds') || [];
                                    const remainingGrades = form.getValues('tenantGradeLevelIds')?.filter(id => id !== grade.id) || [];
                                    const filteredSubjects = currentSubjects.filter(subjectId => {
                                      // Keep subjects that are still valid for remaining selected grades
                                      return allSubjects.some(subject => 
                                        subject.id === subjectId && 
                                        flatGrades.some(g => remainingGrades.includes(g.id))
                                      );
                                    });
                                    form.setValue('tenantSubjectIds', filteredSubjects);
                                  }
                                }}
                              />
                              <label
                                htmlFor={`grade-${grade.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {grade.name}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subjects - Only show after grade levels are selected */}
                  {form.watch('tenantGradeLevelIds')?.length > 0 && (
                    <FormField
                      control={form.control as any}
                      name="tenantSubjectIds"
                      render={({ field }) => {
                        const selectedGradeLevels = form.watch('tenantGradeLevelIds') || [];
                        const selectedGrades = flatGrades.filter(grade => selectedGradeLevels.includes(grade.id));
                        
                        return (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Subjects * (organized by grade level)
                            </FormLabel>
                            <div className="space-y-6 mt-4">
                              {selectedGrades.map((grade) => (
                                <div key={grade.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    {grade.name} - {grade.levelName}
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {(() => {
                                      // Find the level that contains this grade
                                      const level = gradeLevels.find(level => 
                                        level.grades?.some(g => g.id === grade.id)
                                      );
                                      
                                      // Get subjects for this level from the school config
                                      // Each level in the school config has its own subjects array
                                      const levelSubjects = level ? 
                                        schoolConfig?.selectedLevels?.find((l: any) => l.id === level.levelId)?.subjects || [] 
                                        : [];
                                      
                                      // If no level-specific subjects, show all subjects as fallback
                                      const gradeSubjects = levelSubjects.length > 0 ? levelSubjects : allSubjects;
                                      
                                      return gradeSubjects.map((subject: any) => (
                                        <div key={`${grade.id}-${subject.id}`} className="flex items-center space-x-2">
                                          <Checkbox
                                            id={`subject-${grade.id}-${subject.id}`}
                                            checked={field.value?.includes(subject.id) || false}
                                            onCheckedChange={(checked) => {
                                              const currentValues = field.value || [];
                                              if (checked) {
                                                field.onChange([...currentValues, subject.id]);
                                              } else {
                                                field.onChange(currentValues.filter((id: string) => id !== subject.id));
                                              }
                                            }}
                                          />
                                          <label
                                            htmlFor={`subject-${grade.id}-${subject.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            {subject.name}
                                          </label>
                                        </div>
                                      ));
                                    })()}
                                  </div>
                                  {(() => {
                                    const level = gradeLevels.find(level => 
                                      level.grades?.some(g => g.id === grade.id)
                                    );
                                    const levelSubjects = level ? 
                                      schoolConfig?.selectedLevels?.find((l: any) => l.id === level.levelId)?.subjects || [] 
                                      : [];
                                    const gradeSubjects = levelSubjects.length > 0 ? levelSubjects : allSubjects;
                                    
                                    return gradeSubjects.length === 0 && (
                                      <div className="text-sm text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                                        No subjects configured for {grade.name}
                                      </div>
                                    );
                                  })()}
                                </div>
                              ))}
                              {selectedGrades.length === 0 && (
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                  Please select grade levels first to see available subjects.
                                </div>
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  )}

                  {/* Streams - Only show after grade levels are selected */}
                  {form.watch('tenantGradeLevelIds')?.length > 0 && (
                    <FormField
                      control={form.control as any}
                      name="tenantStreamIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Streams (optional)
                          </FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                            {(() => {
                              const selectedGradeLevels = form.watch('tenantGradeLevelIds') || [];
                              const availableStreams = allStreams.filter(stream => 
                                selectedGradeLevels.includes(stream.gradeId)
                              );
                              
                              if (availableStreams.length === 0) {
                                return (
                                  <div className="col-span-full text-sm text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                                    No streams configured for selected grade levels
                                  </div>
                                );
                              }
                              
                              return availableStreams.map((stream) => (
                                <div key={stream.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`stream-${stream.id}`}
                                    checked={field.value?.includes(stream.id) || false}
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentValues, stream.id]);
                                      } else {
                                        field.onChange(currentValues.filter((id: string) => id !== stream.id));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`stream-${stream.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {stream.name} ({stream.gradeName})
                                  </label>
                                </div>
                              ));
                            })()}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Class Teacher Assignment */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <FormField
                      control={form.control as any}
                      name="isClassTeacher"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Assign as Class Teacher
                            </FormLabel>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              This teacher will be responsible for a specific class/stream
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch('isClassTeacher') && (
                      <FormField
                        control={form.control as any}
                        name="classTeacherTenantStreamId"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Class Teacher Stream *
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
                                  <SelectValue placeholder="Select stream for class teacher assignment" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {allStreams
                                  .filter(stream => form.watch('tenantStreamIds')?.includes(stream.id))
                                  .map((stream) => (
                                    <SelectItem key={stream.id} value={stream.id}>
                                      {stream.name} ({stream.gradeName})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
                  <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    Contact Information
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control as any}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          Phone Number *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+254700000000" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="teacher@school.edu" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          Home Address
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter physical address (optional)" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-primary/5 border border-primary/20">
                <div className="border-b border-primary/20 p-4 bg-primary/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-mono font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      System Access Information
                    </h3>
                    <Badge variant="outline" className="border-primary/30 text-primary text-xs font-mono">
                      AUTO-GENERATED
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                        Invitation Process
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        An invitation email will be sent to the teacher with a secure signup link. They will create their own password to access the staff portal.
                      </p>
                      <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                          Access Portal:
                        </div>
                        <div className="text-xs font-mono text-primary font-medium">
                          {schoolConfig?.tenant?.subdomain || 'school'}.squl.co.ke
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DrawerFooter className="border-t border-border bg-slate-50 dark:bg-slate-900 p-6">
          <div className="flex gap-3">
            <Button 
              type="submit" 
              onClick={form.handleSubmit(onSubmit as any)}
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium transition-colors gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Send Teacher Invitation
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDrawerOpen(false)}
              disabled={isLoading}
              className="px-6 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
    
    {/* Success Modal */}
    {invitationData && (
      <InvitationSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        invitationData={invitationData}
        schoolSubdomain={schoolConfig?.tenant?.subdomain}
      />
    )}
    </>
  );
} 
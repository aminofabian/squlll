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
import { useTenantSubjects } from '@/lib/hooks/useTenantSubjects';
import { useGradeLevelsForSchoolType } from '@/lib/hooks/useGradeLevelsForSchoolType';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InvitationSuccessModal } from './InvitationSuccessModal';

// Teacher form data schema
const teacherFormSchema = z.object({
  email: z.string().email({ message: 'Valid email is required' }),
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  gender: z.enum(['MALE', 'FEMALE'], { required_error: "Please select a gender" }),
  department: z.string().min(1, { message: 'Department is required' }),
  phoneNumber: z.string()
    .min(10, { message: 'Valid phone number is required' })
    .refine((value) => {
      // Allow Kenyan numbers (+254...) and international numbers
      const phoneRegex = /^\+254[0-9]{9}$|^\+[1-9][0-9]{1,14}$/;
      return phoneRegex.test(value);
    }, { message: 'Please enter a valid phone number (e.g., +254700000000)' }),
  address: z.string().optional().or(z.literal('')),
  employeeId: z.string().min(2, { message: 'Employee ID is required' }),
  dateOfBirth: z.string().min(1, { message: 'Date of birth is required' }).refine((dateString) => {
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    // Calculate exact age
    const exactAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
    
    return exactAge >= 18;
  }, { message: 'Teacher must be at least 18 years old' }),
  qualifications: z.string().min(1, { message: 'Qualifications are required' }),
  gradeSubjects: z.record(z.string(), z.array(z.string())).optional().default({}).refine((gradeSubjects) => {
    // Ensure at least one subject is selected across all grades
    const allSubjects = Object.values(gradeSubjects || {}).flat();
    return allSubjects.length > 0;
  }, { message: 'Please select at least one subject for any grade' }),
  tenantGradeLevelIds: z.array(z.string()).min(1, { message: 'Please select at least one grade level' }),
  tenantStreamIds: z.array(z.string()).optional().default([]),
  isClassTeacher: z.boolean().default(false),
  classTeacherType: z.enum(['stream', 'grade']).optional(),
  classTeacherTenantStreamId: z.string().optional(),
  classTeacherTenantGradeLevelId: z.string().optional(),
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
  const [hasShownCompletionToast, setHasShownCompletionToast] = useState(false);
  const [invitationData, setInvitationData] = useState<{
    email: string;
    fullName: string;
    status: string;
    createdAt: string;
  } | null>(null);
  const { data: schoolConfig } = useSchoolConfig();
  
  // Get tenant subjects and grade levels using new GraphQL queries
  const { data: tenantSubjects = [], isLoading: subjectsLoading, error: subjectsError } = useTenantSubjects();
  const { data: gradeLevelsData = [], isLoading: gradeLevelsLoading, error: gradeLevelsError } = useGradeLevelsForSchoolType();
  
  // Transform the new data to match existing component expectations
  const allSubjects = tenantSubjects.map(ts => ({
    id: ts.id,
    name: ts.subject?.name || ts.customSubject?.name || 'Unknown Subject',
    code: ts.subject?.code || ts.customSubject?.code || '',
    subjectType: ts.subjectType,
    category: ts.subject?.category || ts.customSubject?.category,
    department: ts.subject?.department || ts.customSubject?.department,
    shortName: ts.subject?.shortName || ts.customSubject?.shortName,
    isCompulsory: ts.isCompulsory,
    totalMarks: ts.totalMarks,
    passingMarks: ts.passingMarks,
    creditHours: ts.creditHours,
    curriculum: ts.curriculum.name,
    isActive: ts.isActive
  }));
  
  // Transform grade levels data to match existing structure
  const gradeLevels = gradeLevelsData.reduce((acc, gl) => {
    const curriculumName = gl.curriculum.name;
    let level = acc.find(l => l.levelName === curriculumName);
    
    if (!level) {
      level = {
        levelId: gl.curriculum.id,
        levelName: curriculumName,
        grades: []
      };
      acc.push(level);
    }
    
    level.grades.push({
      id: gl.id,
      name: gl.gradeLevel.name,
      streams: gl.tenantStreams.map(ts => ts.stream)
    });
    
    return acc;
  }, [] as Array<{
    levelId: string;
    levelName: string;
    grades: Array<{
      id: string;
      name: string;
      streams: Array<{ id: string; name: string }>;
    }>;
  }>);
  
  // Flatten grades and streams for easier access with the new data structure
  const flatGrades = gradeLevels.flatMap(level =>
    (level.grades || [])
      .filter(grade => grade.id) // Only include grades with valid IDs
      .map(grade => ({
        ...grade,
        levelName: level.levelName,
        levelId: level.levelId,
        streams: grade.streams || []
      }))
  );
  
  // Debug logging to help troubleshoot data loading
  console.log('CreateTeacherDrawer - Debug Info:', {
    schoolConfigLoaded: !!schoolConfig,
    tenantId: schoolConfig?.tenant?.id,
    subjectsLoading,
    gradeLevelsLoading,
    subjectsError: subjectsError?.message,
    gradeLevelsError: gradeLevelsError?.message,
    tenantSubjectsCount: tenantSubjects.length,
    gradeLevelsDataCount: gradeLevelsData.length,
    transformedGradeLevelsCount: gradeLevels.length,
    flatGradesCount: flatGrades.length,
    flatGradesPreview: flatGrades.slice(0, 3).map(g => ({
      id: g.id,
      name: g.name,
      levelName: g.levelName,
      levelId: g.levelId
    }))
  });
  
  // Get unique levels for grade level selection
  const uniqueLevels = gradeLevels.map(level => ({
    id: level.levelId,
    name: level.levelName,
    grades: level.grades || []
  }));
  
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

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema) as any,
    defaultValues: {
      email: '',
      fullName: '',
      firstName: '',
      lastName: '',
      gender: 'MALE',
      department: '',
      phoneNumber: '+254',
      address: '',
      employeeId: '',
      dateOfBirth: '',
      qualifications: '',
      gradeSubjects: {},
      tenantGradeLevelIds: [],
      tenantStreamIds: [],
      isClassTeacher: false,
      classTeacherType: 'stream',
      classTeacherTenantStreamId: '',
      classTeacherTenantGradeLevelId: '',
    },
  });

  // Monitor form completion and show toast when all required fields are filled
  React.useEffect(() => {
    if (!isDrawerOpen || hasShownCompletionToast) return;

    const subscription = form.watch((value) => {
      // Check if all required fields are filled
      const isFormComplete = 
        value.email && 
        value.fullName && 
        value.firstName && 
        value.lastName && 
        value.gender && 
        value.department && 
        value.phoneNumber && 
        value.employeeId && 
        value.dateOfBirth && 
        value.qualifications && 
        value.tenantGradeLevelIds && 
        value.tenantGradeLevelIds.length > 0 &&
        value.gradeSubjects && 
        Object.keys(value.gradeSubjects).length > 0 &&
        Object.values(value.gradeSubjects).some(subjects => subjects && subjects.length > 0);

      if (isFormComplete && !hasShownCompletionToast) {
        setHasShownCompletionToast(true);
        toast.success("🎉 Form Complete!", {
          description: "All required fields have been filled correctly. You can now submit the teacher invitation.",
          duration: 5000,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, isDrawerOpen, hasShownCompletionToast]);

  // Reset completion toast when drawer opens
  React.useEffect(() => {
    if (isDrawerOpen) {
      setHasShownCompletionToast(false);
    }
  }, [isDrawerOpen]);

  // Submit handler
  const onSubmit = async (data: TeacherFormData) => {
    if (!schoolConfig?.tenant?.id) {
      toast.error("Configuration Error", {
        description: "School configuration not available. Please refresh and try again."
      });
      return;
    }
    
    // Check if data is still loading
    if (subjectsLoading || gradeLevelsLoading) {
      toast.error("Data Loading", {
        description: "Subject and grade level data is still loading. Please wait a moment and try again."
      });
      return;
    }
    
    // Check for data loading errors
    if (subjectsError || gradeLevelsError) {
      toast.error("Data Loading Error", {
        description: `Failed to load required data: ${subjectsError?.message || gradeLevelsError?.message}`
      });
      return;
    }
    
    // Additional safety check: ensure grade levels and subjects are loaded
    if (flatGrades.length === 0) {
      toast.error("Data Loading Error", {
        description: "Grade level data is not available. Please refresh and try again."
      });
      return;
    }
    
    if (allSubjects.length === 0) {
      toast.error("Data Loading Error", {
        description: "Subject data is not available. Please refresh and try again."
      });
      return;
    }
    
    // Validate that all selected grade IDs exist in the available grades
    const availableGradeIds = flatGrades.map(g => g.id);
    const invalidGradeIds = data.tenantGradeLevelIds.filter(id => !availableGradeIds.includes(id));
    
    if (invalidGradeIds.length > 0) {
      console.error('Invalid grade IDs detected before submission:', {
        invalidIds: invalidGradeIds,
        availableIds: availableGradeIds.slice(0, 5), // Show first 5 for debugging
        totalAvailable: availableGradeIds.length
      });
      
      toast.error("Invalid Selection", {
        description: "Some selected grade levels are invalid. Please refresh the page and try again."
      });
      return;
    }

    setIsLoading(true);
    setError(null); // Clear any previous errors

    try {
      // Debug: Log form data before processing
      console.log('CreateTeacherDrawer - Form submission data:', {
        selectedGradeIds: data.tenantGradeLevelIds,
        gradeSubjects: data.gradeSubjects,
        selectedStreamIds: data.tenantStreamIds,
        isClassTeacher: data.isClassTeacher,
        classTeacherType: data.classTeacherType,
        classTeacherStreamId: data.classTeacherTenantStreamId,
        classTeacherGradeLevelId: data.classTeacherTenantGradeLevelId
      });
      
      // Debug: Validate that selected grade IDs exist in available grades
      const availableGradeIds = flatGrades.map(g => g.id);
      const invalidGradeIds = data.tenantGradeLevelIds.filter(id => !availableGradeIds.includes(id));
      if (invalidGradeIds.length > 0) {
        console.error('CreateTeacherDrawer - Invalid grade IDs selected:', {
          invalidIds: invalidGradeIds,
          availableIds: availableGradeIds,
          flatGrades: flatGrades.map(g => ({ id: g.id, name: g.name }))
        });
      }
      
      // Filter out any invalid grade IDs before sending (additional safety check)
      const validatedGradeLevelIds = data.tenantGradeLevelIds.filter(id => 
        !invalidGradeIds.includes(id)
      );
      
      console.log('Grade ID validation:', {
        original: data.tenantGradeLevelIds,
        filtered: validatedGradeLevelIds,
        removedIds: data.tenantGradeLevelIds.filter(id => invalidGradeIds.includes(id))
      });
      
      // Ensure we still have valid grade IDs after filtering
      if (validatedGradeLevelIds.length === 0) {
        toast.error("Invalid Grade Selection", {
          description: "All selected grade levels are invalid. Please refresh the page and try selecting different grades."
        });
        return;
      }

      // Convert grade-specific subjects to flat array for API
      const allSelectedSubjects = new Set<string>();
      Object.values(data.gradeSubjects || {}).forEach(subjectIds => {
        (subjectIds as string[]).forEach(id => allSelectedSubjects.add(id));
      });
      const tenantSubjectIds = Array.from(allSelectedSubjects);

      // Ensure at least one subject remains after flattening
      if (tenantSubjectIds.length === 0) {
        toast.error("No Subjects Selected", {
          description: "Please select at least one subject for the teacher."
        });
        return;
      }

      // Normalize department to match allowed list (case-insensitive)
      const allowedDepartments = departments;
      const selectedDept = data.department?.toString().trim();
      const normalizedDepartment = allowedDepartments.find(d => d.toLowerCase() === selectedDept?.toLowerCase()) || allowedDepartments[0];

      // Sanitize employeeId (alphanumeric, dash, slash) and clamp length
      const employeeIdSanitized = data.employeeId
        ? data.employeeId.toString().trim().replace(/[^A-Za-z0-9\/-]/g, '').slice(0, 32)
        : '';

      // Clamp long text fields to reasonable lengths
      const addressClamped = (data.address || '').toString().trim().slice(0, 200);
      const qualificationsClamped = data.qualifications.toString().trim().slice(0, 300);

      // Extract only the fields that are accepted by the API schema
      const createTeacherDto = {
        email: data.email.trim(),
        fullName: data.fullName.trim(),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: "TEACHER",
        gender: data.gender,
        department: normalizedDepartment,
        phoneNumber: data.phoneNumber.trim(),
        address: addressClamped,
        employeeId: employeeIdSanitized,
        dateOfBirth: data.dateOfBirth,
        qualifications: qualificationsClamped,
        tenantSubjectIds: tenantSubjectIds,
        tenantGradeLevelIds: validatedGradeLevelIds, // Use filtered IDs
        ...(data.isClassTeacher && data.classTeacherType === 'stream' && data.classTeacherTenantStreamId && {
          classTeacherTenantStreamId: data.classTeacherTenantStreamId
        }),
        ...(data.isClassTeacher && data.classTeacherType === 'grade' && data.classTeacherTenantGradeLevelId && {
          classTeacherTenantGradeLevelId: data.classTeacherTenantGradeLevelId
        })
      };



      // Note: We no longer send tenantId in the payload - it's not part of the CreateTeacherInvitationDto schema
      const response = await fetch('/api/school/invite-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          createTeacherDto
          // tenantId removed - it will be handled by the API route via auth token
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
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-generate full name when first name changes
                              const lastName = form.getValues('lastName');
                              const newFullName = `${e.target.value} ${lastName}`.trim();
                              if (newFullName && newFullName !== ' ') {
                                form.setValue('fullName', newFullName);
                              }
                            }}
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
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-generate full name when last name changes
                              const firstName = form.getValues('firstName');
                              const newFullName = `${firstName} ${e.target.value}`.trim();
                              if (newFullName && newFullName !== ' ') {
                                form.setValue('fullName', newFullName);
                              }
                            }}
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          Full Name *
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                            (auto-generated, editable)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Full name will be auto-generated" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          💡 Full name is automatically generated from first and last name, but you can edit it if needed.
                        </div>
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
                    render={({ field }) => {
                      // Calculate the maximum year (18 years ago from today)
                      const today = new Date();
                      const maxYear = today.getFullYear() - 18;
                      const minYear = maxYear - 80; // Allow up to 98 years old
                      
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
                          <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
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
                              💡 Teacher must be at least 18 years old (born in {maxYear} or earlier)
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
                                    
                                    return years >= 18 ? '✅ Eligible' : '❌ Too young';
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
                                    // Clear subjects for this grade when grade is deselected
                                    const currentGradeSubjects = form.getValues('gradeSubjects') || {};
                                    const updatedGradeSubjects = { ...currentGradeSubjects };
                                    delete updatedGradeSubjects[grade.id];
                                    form.setValue('gradeSubjects', updatedGradeSubjects);
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
                      name="gradeSubjects"
                      render={({ field }) => {
                        const selectedGradeLevels = form.watch('tenantGradeLevelIds') || [];
                        const selectedGrades = flatGrades.filter(grade => selectedGradeLevels.includes(grade.id));
                        
                        return (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Subjects * (select for each grade individually)
                            </FormLabel>
                            <div className="space-y-6 mt-4">
                              {selectedGrades.map((grade) => (
                                <div key={grade.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    {grade.name}
                                  </h4>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {(() => {
                                      // Find the level that contains this grade
                                      const level = gradeLevels.find(level => 
                                        level.grades?.some(g => g.id === grade.id)
                                      );
                                      
                                      // For the new tenant subjects structure, we filter subjects by curriculum
                                      // that matches the current grade's curriculum
                                      const gradeSubjects = level ? 
                                        allSubjects.filter(subject => 
                                          subject.curriculum === level.levelName || 
                                          !subject.curriculum // Include subjects without specific curriculum as fallback
                                        ) 
                                        : allSubjects;
                                      
                                      return gradeSubjects.map((subject: any) => {
                                        const gradeSubjectIds = field.value?.[grade.id] || [];
                                        const isChecked = gradeSubjectIds.includes(subject.id);
                                        
                                        return (
                                          <div key={`${grade.id}-${subject.id}`} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`subject-${grade.id}-${subject.id}`}
                                              checked={isChecked}
                                              onCheckedChange={(checked) => {
                                                const currentGradeSubjects = field.value || {};
                                                const currentSubjectIds = currentGradeSubjects[grade.id] || [];
                                                
                                                if (checked) {
                                                  // Add subject to this specific grade
                                                  const newSubjectIds = [...currentSubjectIds, subject.id];
                                                  field.onChange({
                                                    ...currentGradeSubjects,
                                                    [grade.id]: newSubjectIds
                                                  });
                                                } else {
                                                  // Remove subject from this specific grade
                                                  const newSubjectIds = currentSubjectIds.filter((id: string) => id !== subject.id);
                                                  field.onChange({
                                                    ...currentGradeSubjects,
                                                    [grade.id]: newSubjectIds
                                                  });
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
                                        );
                                      });
                                    })()}
                                  </div>
                                  {(() => {
                                    const level = gradeLevels.find(level => 
                                      level.grades?.some(g => g.id === grade.id)
                                    );
                                    const gradeSubjects = level ? 
                                      allSubjects.filter(subject => 
                                        subject.curriculum === level.levelName || 
                                        !subject.curriculum
                                      ) 
                                      : allSubjects;
                                    
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
                              This teacher will be responsible for a specific class or grade level
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch('isClassTeacher') && (
                      <div className="mt-4 space-y-4">
                        {/* Class Teacher Type Selection */}
                        <FormField
                          control={form.control as any}
                          name="classTeacherType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Class Teacher Type *
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-2"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="stream" id="stream" />
                                    <label htmlFor="stream" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      Stream Class Teacher
                                    </label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="grade" id="grade" />
                                    <label htmlFor="grade" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      Grade Level Class Teacher
                                    </label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Stream Class Teacher Selection */}
                        {form.watch('classTeacherType') === 'stream' && (
                          <FormField
                            control={form.control as any}
                            name="classTeacherTenantStreamId"
                            render={({ field }) => (
                              <FormItem>
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

                        {/* Grade Level Class Teacher Selection */}
                        {form.watch('classTeacherType') === 'grade' && (
                          <FormField
                            control={form.control as any}
                            name="classTeacherTenantGradeLevelId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  Class Teacher Grade Level *
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
                                      <SelectValue placeholder="Select grade level for class teacher assignment" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {flatGrades
                                      .filter(grade => form.watch('tenantGradeLevelIds')?.includes(grade.id))
                                      .map((grade) => (
                                        <SelectItem key={grade.id} value={grade.id}>
                                          {grade.name}
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
                            value={field.value}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
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

              {/* Selection Summary */}
              {(() => {
                const selectedGrades = form.watch('tenantGradeLevelIds') || [];
                const selectedStreams = form.watch('tenantStreamIds') || [];
                const gradeSubjects = form.watch('gradeSubjects') || {};
                const isClassTeacher = form.watch('isClassTeacher');
                const classTeacherType = form.watch('classTeacherType');
                const classTeacherStreamId = form.watch('classTeacherTenantStreamId');
                const classTeacherGradeLevelId = form.watch('classTeacherTenantGradeLevelId');
                
                const hasSelections = selectedGrades.length > 0 || selectedStreams.length > 0 || Object.keys(gradeSubjects).length > 0;
                
                if (!hasSelections) return null;
                
                // Calculate totals for summary
                const totalSubjects = Object.values(gradeSubjects).flat().length;
                const totalAssignments = selectedGrades.length + selectedStreams.length + (isClassTeacher ? 1 : 0);
                
                return (
                  <div className="relative">
                    {/* Document shadow and background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50/30 to-indigo-50/30 dark:from-slate-700 dark:via-blue-900/10 dark:to-indigo-900/10 rounded-2xl transform rotate-1 scale-[1.02] shadow-2xl"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 dark:from-slate-800 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-2xl transform -rotate-0.5 scale-[1.01] shadow-xl"></div>
                    
                    {/* Main document */}
                    <div className="relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg transform -rotate-0.5 hover:rotate-0 transition-transform duration-300">
                      {/* Document header with paper texture effect */}
                      <div className="relative bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-800 dark:via-blue-900/20 dark:to-indigo-900/20 border-b-2 border-slate-200 dark:border-slate-700 p-6">
                        {/* Paper texture overlay */}
                        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 border-2 border-primary/30 rounded-xl flex items-center justify-center shadow-sm">
                              <CheckCircle className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-serif">
                                Teaching Assignment Summary
                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 font-mono">({totalAssignments} assignments)</span>
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                                📋 Review your selections before submitting the invitation
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary font-mono">{totalSubjects}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">Total Subjects</div>
                          </div>
                        </div>
                      </div>
                    
                      {/* Document content with paper-like styling */}
                      <div className="relative p-6 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-700/30">
                        {/* Subtle paper texture */}
                        <div className="absolute inset-0 opacity-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
                        
                        <div className="relative">
                          {/* Quick Stats Row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {selectedGrades.length > 0 && (
                              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm transform hover:scale-105 transition-transform duration-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{selectedGrades.length}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Grade Levels</div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {selectedStreams.length > 0 && (
                              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm transform hover:scale-105 transition-transform duration-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-500" />
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{selectedStreams.length}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Streams</div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {isClassTeacher && (
                              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm transform hover:scale-105 transition-transform duration-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <IdCard className="h-5 w-5 text-green-500" />
                                  </div>
                                  <div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">1</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Class Teacher</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Detailed Sections */}
                          <div className="space-y-6">
                            {/* Grade Levels with Subjects */}
                            {selectedGrades.length > 0 && (
                              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm transform hover:scale-[1.01] transition-transform duration-200">
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <GraduationCap className="h-4 w-4 text-primary" />
                                  </div>
                                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 font-serif">Grade Level Assignments</h4>
                                  <Badge variant="secondary" className="text-xs font-mono">
                                    {selectedGrades.length} grades
                                  </Badge>
                                </div>
                            
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  {selectedGrades.map(gradeId => {
                                    const grade = flatGrades.find(g => g.id === gradeId);
                                    const gradeSubjectIds = gradeSubjects[gradeId] || [];
                                    const gradeSubjectsList = gradeSubjectIds.map(id => allSubjects.find(s => s.id === id)).filter(Boolean);
                                    
                                    return grade ? (
                                      <div key={gradeId} className="border-2 border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-700/50 dark:to-slate-800/30 shadow-sm transform hover:scale-105 transition-transform duration-200">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-primary rounded-full"></div>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300 font-serif">{grade.name}</span>
                                          </div>
                                          <Badge variant="outline" className="text-xs font-mono">
                                            {gradeSubjectsList.length} subjects
                                          </Badge>
                                        </div>
                                    
                                        {gradeSubjectsList.length > 0 ? (
                                          <div className="flex flex-wrap gap-1.5">
                                            {gradeSubjectsList.map(subject => subject ? (
                                              <span key={subject.id} className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md border border-primary/20 font-mono">
                                                {subject.name}
                                              </span>
                                            ) : null)}
                                          </div>
                                        ) : (
                                          <div className="text-xs text-slate-500 dark:text-slate-400 italic font-mono">
                                            No subjects selected for this grade
                                          </div>
                                        )}
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Streams */}
                            {selectedStreams.length > 0 && (
                              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm transform hover:scale-[1.01] transition-transform duration-200">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-500" />
                                  </div>
                                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 font-serif">Stream Assignments</h4>
                                  <Badge variant="secondary" className="text-xs font-mono">
                                    {selectedStreams.length} streams
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {selectedStreams.map(streamId => {
                                    const stream = allStreams.find(s => s.id === streamId);
                                    return stream ? (
                                      <div key={streamId} className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg shadow-sm transform hover:scale-105 transition-transform duration-200">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <div>
                                          <div className="font-medium text-slate-700 dark:text-slate-300 text-sm font-serif">
                                            {stream.name}
                                          </div>
                                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                            {stream.gradeName}
                                          </div>
                                        </div>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Class Teacher Assignment */}
                            {isClassTeacher && (
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6 shadow-sm transform hover:scale-[1.01] transition-transform duration-200">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <IdCard className="h-4 w-4 text-green-500" />
                                  </div>
                                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 font-serif">Class Teacher Assignment</h4>
                                  <Badge variant="default" className="text-xs bg-green-500 font-mono">
                                    {classTeacherType === 'stream' ? 'Stream Teacher' : 'Grade Teacher'}
                                  </Badge>
                                </div>
                            
                                <div className="bg-white dark:bg-slate-800 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 shadow-sm">
                                  {classTeacherType === 'stream' && classTeacherStreamId ? (
                                    (() => {
                                      const stream = allStreams.find(s => s.id === classTeacherStreamId);
                                      return stream ? (
                                        <div className="flex items-center gap-3">
                                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                          <div>
                                            <div className="font-medium text-slate-700 dark:text-slate-300 font-serif">
                                              Class Teacher for {stream.name}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                                              {stream.gradeName}
                                            </div>
                                          </div>
                                        </div>
                                      ) : null;
                                    })()
                                  ) : classTeacherType === 'grade' && classTeacherGradeLevelId ? (
                                    (() => {
                                      const grade = flatGrades.find(g => g.id === classTeacherGradeLevelId);
                                      return grade ? (
                                        <div className="flex items-center gap-3">
                                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                          <div>
                                            <div className="font-medium text-slate-700 dark:text-slate-300 font-serif">
                                              Class Teacher for {grade.name}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                                              Grade Level Teacher
                                            </div>
                                          </div>
                                        </div>
                                      ) : null;
                                    })()
                                  ) : (
                                    <div className="text-sm text-slate-500 dark:text-slate-400 italic font-mono">
                                      Class teacher assignment pending selection
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
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
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            School Name:
                          </div>
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {schoolConfig?.tenant?.schoolName || 'School Name'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
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
              </div>
            </form>
          </Form>
        </div>

        <DrawerFooter className="border-t border-border bg-slate-50 dark:bg-slate-900 p-6">
          <div className="flex gap-3">
            <Button 
              onClick={form.handleSubmit(onSubmit as any)}
              disabled={isLoading || subjectsLoading || gradeLevelsLoading || flatGrades.length === 0 || allSubjects.length === 0}
              className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium transition-colors gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (subjectsLoading || gradeLevelsLoading) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading Data...
                </>
              ) : flatGrades.length === 0 || allSubjects.length === 0 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading Required Data...
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
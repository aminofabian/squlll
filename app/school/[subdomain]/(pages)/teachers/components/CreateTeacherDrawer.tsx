"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { UserPlus, GraduationCap, Loader2, X } from "lucide-react";
import { toast } from 'sonner';
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig';
import { useTenantSubjects } from '@/lib/hooks/useTenantSubjects';
import { useGradeLevelsForSchoolType } from '@/lib/hooks/useGradeLevelsForSchoolType';
import { InvitationSuccessModal } from './InvitationSuccessModal';
import { TeacherRegistrationForm, TEACHER_WIZARD_STEPS, WIZARD_STEP_FIELDS } from './TeacherRegistrationForm';
import type { TeachingPanel } from './teacher-registration-ui';

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
  defaultOpen?: boolean;
}

export function CreateTeacherDrawer({
  onTeacherCreated,
  defaultOpen = false,
}: CreateTeacherDrawerProps) {
  const queryClient = useQueryClient();
  const isSubmittingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(defaultOpen);
  const [wizardStep, setWizardStep] = useState(0);
  const [teachingPanel, setTeachingPanel] = useState<TeachingPanel>("grades");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<{
    email: string;
    fullName: string;
    status: string;
    createdAt: string;
    emailSent?: boolean;
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
      streams: gl.tenantStreams.map((ts) => ({
        id: ts.id,
        name: ts.stream.name,
      })),
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
  
  const allStreams = flatGrades.flatMap(grade => 
    grade.streams.map(stream => ({
      ...stream,
      gradeName: grade.name,
      gradeId: grade.id
    }))
  );
  
  useEffect(() => {
    if (defaultOpen) {
      setIsDrawerOpen(true);
    }
  }, [defaultOpen]);

  const resetWizard = () => {
    setWizardStep(0);
    setTeachingPanel("grades");
  };

  // Clear error when drawer opens
  const handleDrawerOpenChange = (open: boolean) => {
    setIsDrawerOpen(open);
    if (open) {
      setError(null);
    } else {
      resetWizard();
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

  // Submit handler — guarded against double submission (double-click / Enter + click)
  const onSubmit = useCallback(async (data: TeacherFormData) => {
    if (isSubmittingRef.current) {
      return;
    }

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

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError(null);

    const finishInvitation = async (inviteData: {
      email: string;
      fullName: string;
      status: string;
      createdAt: string;
      emailSent?: boolean;
    }) => {
      setInvitationData(inviteData);
      setShowSuccessModal(true);
      form.reset();
      resetWizard();
      setIsDrawerOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['getTeachers'] });
      onTeacherCreated();

      if (inviteData.emailSent === false) {
        toast.warning('Teacher registered', {
          description:
            'The invitation email could not be sent. Use Resend on the pending invitations list.',
          duration: 10000,
        });
      }
    };

    const isEmailDeliveryFailure = (message: string) =>
      message.toLowerCase().includes('failed to send email');

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
          if (isEmailDeliveryFailure(result.error)) {
            await finishInvitation({
              email: data.email.trim(),
              fullName: data.fullName.trim(),
              status: 'PENDING',
              createdAt: new Date().toISOString(),
              emailSent: false,
            });
            return;
          }

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
      
      await finishInvitation({
        ...inviteData,
        emailSent: inviteData.emailSent !== false,
      });
      
    } catch (error) {
      console.error('Error inviting teacher:', error);
      
      let errorMessage = "We couldn't send the teacher invitation. Please try again.";
      let errorTitle = "Invitation Not Sent";
      
      if (error instanceof Error) {
        errorMessage = error.message;

        // Legacy backend: invitation saved but email provider failed
        if (error.message.toLowerCase().includes('failed to send email')) {
          await finishInvitation({
            email: data.email.trim(),
            fullName: data.fullName.trim(),
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            emailSent: false,
          });
          return;
        }
        
        // Handle specific error types with better titles
        if (error.message.includes('already registered')) {
          errorTitle = "Teacher Already Exists";
        } else if (error.message.includes('already sent') || error.message.includes('Another invitation')) {
          errorTitle = "Invitation Already Sent";
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
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  }, [
    schoolConfig?.tenant?.id,
    subjectsLoading,
    gradeLevelsLoading,
    subjectsError,
    gradeLevelsError,
    flatGrades,
    allSubjects,
    form,
    onTeacherCreated,
    queryClient,
  ]);

  const handleBack = () => {
    if (wizardStep === 2) {
      if (teachingPanel === "subjects") {
        setTeachingPanel("grades");
        return;
      }
      if (teachingPanel === "extras") {
        setTeachingPanel("subjects");
        return;
      }
    }
    if (wizardStep > 0) {
      setWizardStep((s) => s - 1);
    }
  };

  const handleContinue = async () => {
    if (wizardStep === 0 || wizardStep === 1) {
      const fields = WIZARD_STEP_FIELDS[wizardStep];
      const valid = await form.trigger(fields);
      if (valid) {
        setWizardStep((s) => s + 1);
        if (wizardStep === 1) {
          setTeachingPanel("grades");
        }
      }
      return;
    }

    if (teachingPanel === "grades") {
      const valid = await form.trigger(["tenantGradeLevelIds"]);
      if (valid) setTeachingPanel("subjects");
      return;
    }

    if (teachingPanel === "subjects") {
      const valid = await form.trigger(["tenantGradeLevelIds", "gradeSubjects"]);
      if (valid) setTeachingPanel("extras");
    }
  };

  const isLastPanel = wizardStep === 2 && teachingPanel === "extras";
  const showBack = wizardStep > 0 || (wizardStep === 2 && teachingPanel !== "grades");

  const continueLabel =
    wizardStep === 0
      ? "Continue"
      : wizardStep === 1
        ? "Continue"
        : teachingPanel === "grades"
          ? "Next: subjects"
          : teachingPanel === "subjects"
            ? "Next: optional"
            : "Continue";

  const stepDescriptions = [
    "Name, contact, and basic details.",
    "Staff ID, department, and qualifications.",
    "Grades, subjects, and optional class teacher role.",
  ];

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={handleDrawerOpenChange}>
        <DrawerTrigger asChild>
          <Button
            variant="default"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm"
            disabled={isLoading}
          >
            <UserPlus className="h-4 w-4" />
            Add New Teacher
          </Button>
        </DrawerTrigger>
        <DrawerContent
          className="h-[100dvh] max-h-[100dvh] w-full sm:max-w-xl md:max-w-2xl ml-auto flex flex-col bg-slate-50 dark:bg-slate-950"
          data-vaul-drawer-direction="right"
        >
          <DrawerHeader className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DrawerTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Register a new teacher
                </DrawerTitle>
                <DrawerDescription className="text-sm text-muted-foreground mt-1">
                  Step {wizardStep + 1} of {TEACHER_WIZARD_STEPS.length} — {stepDescriptions[wizardStep]}
                </DrawerDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-[1px]">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sending invitation…</p>
                </div>
              </div>
            )}
            <TeacherRegistrationForm
                form={form}
                onSubmit={onSubmit}
                isSubmitting={isLoading}
                error={error}
                departments={departments}
                flatGrades={flatGrades}
                allSubjects={allSubjects}
                gradeLevels={gradeLevels}
                allStreams={allStreams}
                formatPhoneNumber={formatPhoneNumber}
                subjectsLoading={subjectsLoading}
                gradeLevelsLoading={gradeLevelsLoading}
                wizardStep={wizardStep}
                teachingPanel={teachingPanel}
              />
          </div>

          <DrawerFooter className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:px-6 sm:py-4">
            <div className="flex flex-col-reverse sm:flex-row gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDrawerOpen(false)}
                disabled={isLoading}
                className="sm:flex-1"
              >
                Cancel
              </Button>
              {showBack && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="sm:flex-1"
                >
                  Back
                </Button>
              )}
              {isLastPanel ? (
                <Button
                  type="submit"
                  form="teacher-registration-form"
                  disabled={
                    isLoading ||
                    subjectsLoading ||
                    gradeLevelsLoading ||
                    flatGrades.length === 0 ||
                    allSubjects.length === 0
                  }
                  className="sm:flex-[2] bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/20 h-11 text-base font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Registering…
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Register teacher
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={isLoading || subjectsLoading || gradeLevelsLoading}
                  className="sm:flex-[2] bg-primary hover:bg-primary/90 text-white h-11 text-base font-semibold"
                >
                  {continueLabel}
                </Button>
              )}
            </div>
            {wizardStep === 2 && teachingPanel === "subjects" && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-primary mt-2 text-center w-full disabled:opacity-50"
                disabled={isLoading}
                onClick={async () => {
                  if (isSubmittingRef.current || isLoading) return;
                  const valid = await form.trigger(["tenantGradeLevelIds", "gradeSubjects"]);
                  if (valid) {
                    form.handleSubmit(onSubmit)();
                  }
                }}
              >
                Skip optional details and register →
              </button>
            )}
            <p className="text-[11px] text-center text-muted-foreground mt-2">
              {isLastPanel
                ? "An email invitation will be sent to set up their password."
                : "Required fields are marked with *"}
            </p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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

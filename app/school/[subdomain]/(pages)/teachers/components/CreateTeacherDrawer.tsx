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
import { InvitationSuccessModal } from './InvitationSuccessModal';

// Teacher form data schema
const teacherFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  employee_id: z.string().min(2, { message: 'Employee ID is required' }),
  gender: z.string({ required_error: "Please select a gender" }),
  date_of_birth: z.string().min(1, { message: 'Date of birth is required' }),
  join_date: z.string().min(1, { message: 'Join date is required' }),
  designation: z.string().min(1, { message: 'Designation is required' }),
  department: z.string().min(1, { message: 'Department is required' }),
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  email: z.string().email({ message: 'Valid email is required' }),
  address: z.string().optional().or(z.literal('')),
  qualification: z.string().min(1, { message: 'Qualification is required' }),
  specialization: z.string().min(1, { message: 'Specialization is required' }),
  experience: z.coerce.number().min(0, { message: 'Experience is required' }),
  subject_list: z.string().optional().or(z.literal('')),
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
  const [invitationData, setInvitationData] = useState<{
    email: string;
    fullName: string;
    status: string;
    createdAt: string;
  } | null>(null);
  const { data: schoolConfig } = useSchoolConfig();
  
  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: '',
      employee_id: '',
      gender: '',
      date_of_birth: '',
      join_date: '',
      designation: '',
      department: '',
      phone: '',
      email: '',
      address: '',
      qualification: '',
      specialization: '',
      experience: 0,
      subject_list: '',
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

    try {
      const response = await fetch('/api/school/create-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          tenantId: schoolConfig.tenant.id
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create teacher');
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
      toast.error("Invitation Failed", {
        description: error instanceof Error ? error.message : "An error occurred while sending the teacher invitation"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8">
              
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
                    control={form.control}
                    name="name"
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
                    control={form.control}
                    name="employee_id"
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
                    control={form.control}
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
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Designation *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
                              <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="principal">Principal</SelectItem>
                            <SelectItem value="vice_principal">Vice Principal</SelectItem>
                            <SelectItem value="head_teacher">Head Teacher</SelectItem>
                            <SelectItem value="senior_teacher">Senior Teacher</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="assistant_teacher">Assistant Teacher</SelectItem>
                            <SelectItem value="intern">Intern</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="date_of_birth"
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
                  
                  <FormField
                    control={form.control}
                    name="join_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          Join Date *
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
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="qualification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Highest Qualification *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20">
                              <SelectValue placeholder="Select qualification" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="diploma">Diploma in Education</SelectItem>
                            <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                            <SelectItem value="masters">Master's Degree</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Specialization *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Mathematics Education" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Years of Experience *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="0" 
                            {...field} 
                            className="border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject_list"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Subjects Taught
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Math, Physics, Chemistry" 
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
                    <Phone className="h-4 w-4 text-primary" />
                    Contact Information
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
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
                    control={form.control}
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
                    control={form.control}
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
              onClick={form.handleSubmit(onSubmit)}
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
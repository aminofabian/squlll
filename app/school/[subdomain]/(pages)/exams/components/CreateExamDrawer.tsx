"use client";

import React, { useState, useMemo } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Plus, 
  Info, 
  CalendarDays, 
  BookOpen, 
  Clock,
  GraduationCap,
  FileText,
  CheckCircle,
  Award,
  Target,
  Users,
  Loader2,
  School,
  Timer,
  PenTool,
  Wand2,
  MessageSquare
} from "lucide-react";
import { toast } from 'sonner';
import { subjects } from "@/lib/data/mockExams";
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore';
import { useQueryClient } from '@tanstack/react-query';

// Exam form data schema
const examFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  subject: z.string({ required_error: "Please select a subject" }),
  examType: z.string({ required_error: "Please select exam type" }),
  class: z.string({ required_error: "Please select a class" }),
  stream: z.string().optional(),
  term: z.string({ required_error: "Please select a term" }),
  academicYear: z.string({ required_error: "Please select academic year" }),
  dateAdministered: z.string().min(1, { message: 'Exam date is required' }),
  timeStart: z.string().min(1, { message: 'Start time is required' }),
  duration: z.coerce.number().min(30, { message: 'Duration must be at least 30 minutes' }),
  totalMarks: z.coerce.number().min(1, { message: 'Total marks must be at least 1' }),
  instructions: z.string().min(10, { message: 'Instructions must be at least 10 characters' }),
  passingMarks: z.coerce.number().min(1, { message: 'Passing marks is required' }),
});

type ExamFormData = z.infer<typeof examFormSchema>;

// Mock data
const examTypes = [
  'CAT',
  'Midterm', 
  'End Term',
  'Mock',
  'KCSE Trial',
  'Assignment',
  'Project'
];

const terms = ["Term 1", "Term 2", "Term 3"];
const academicYears = ["2023", "2024", "2025", "2026"];

interface CreateExamDrawerProps {
  onExamCreated: () => void;
  trigger?: React.ReactNode;
}

export function CreateExamDrawer({ onExamCreated, trigger }: CreateExamDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Get data from school config store
  const { config, getAllGradeLevels, getStreamsByGradeId, getGradeById } = useSchoolConfigStore();
  
  // Generate classes and streams from store data with proper sorting
  const { classes, streams, allGrades } = useMemo(() => {
    if (!config) {
      return { classes: [], streams: [], allGrades: [] };
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
    
    // Generate classes from grade levels
    const allClasses: string[] = [];
    const allStreams: string[] = [];
    
    config.selectedLevels.forEach(level => {
      level.gradeLevels?.forEach(grade => {
        // Add grade as a class option
        allClasses.push(grade.name);
        
        // Add streams for this grade
        grade.streams?.forEach(stream => {
          allStreams.push(stream.name);
        });
      });
    });
    
    return {
      classes: allClasses.sort(),
      streams: [...new Set(allStreams)].sort(), // Remove duplicates
      allGrades
    };
  }, [config, getAllGradeLevels]);
  
  const form = useForm<ExamFormData>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      examType: '',
      class: '',
      stream: '',
      term: '',
      academicYear: new Date().getFullYear().toString(),
      dateAdministered: '',
      timeStart: '',
      duration: 120,
      totalMarks: 100,
      instructions: '',
      passingMarks: 40,
    },
  });

  // Watch form values for dynamic updates
  const watchedClass = form.watch('class');
  const watchedStream = form.watch('stream');
  
  // Find the selected grade ID from the class name
  const selectedGradeId = useMemo(() => {
    if (!watchedClass || !allGrades) return null;
    const grade = allGrades.find(g => g.name === watchedClass);
    return grade?.id || null;
  }, [watchedClass, allGrades]);
  
  // Get streams for selected grade
  const availableStreams = selectedGradeId ? getStreamsByGradeId(selectedGradeId) : [];
  
  // Get grade info for display
  const selectedGradeInfo = selectedGradeId ? getGradeById(selectedGradeId) : null;

  // Generate exam title automatically
  const generateExamTitle = () => {
    const examType = form.getValues('examType');
    const subject = subjects.find(s => s.id === form.getValues('subject'))?.name;
    const term = form.getValues('term');
    
    if (examType && subject && term) {
      const title = `${term} ${examType} ${subject}`;
      form.setValue('title', title);
    }
  };

  // Watch for changes in key fields to auto-generate title
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'examType' || name === 'subject' || name === 'term') {
        generateExamTitle();
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Submit handler
  const onSubmit = async (data: ExamFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make the actual API call
      console.log('Creating exam:', data);
      
      toast.success("Exam Created Successfully", {
        description: `${data.title} has been created and is ready for administration.`
      });
      
      // Invalidate and refetch school configuration to show any updated data
      await queryClient.invalidateQueries({ queryKey: ['schoolConfig'] });
      
      // Reset form and close drawer
      form.reset();
      setIsDrawerOpen(false);
      onExamCreated();
      
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error("Creation Failed", {
        description: "An error occurred while creating the exam. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2 font-mono">
      <Plus className="h-4 w-4" />
      Create Exam
    </Button>
  );

  // Show loading state if no configuration is available
  if (!config) {
    return (
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          {trigger || defaultTrigger}
        </DrawerTrigger>
        <DrawerContent className="h-full w-full md:w-1/2 bg-slate-50 dark:bg-slate-900" data-vaul-drawer-direction="right">
          <DrawerHeader className="border-b-2 border-primary/20 pb-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                <span className="text-xs font-mono uppercase tracking-wide text-primary">
                  Exam Creation
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-3">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <DrawerTitle className="text-2xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                  New Exam
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

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        {trigger || defaultTrigger}
      </DrawerTrigger>
      <DrawerContent className="h-full w-full md:w-1/2 bg-slate-50 dark:bg-slate-900" data-vaul-drawer-direction="right">
        <DrawerHeader className="border-b-2 border-primary/20 pb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
              <span className="text-xs font-mono uppercase tracking-wide text-primary">
                Exam Creation
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-3">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <DrawerTitle className="text-2xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                New Exam
              </DrawerTitle>
            </div>
            <DrawerDescription className="text-center text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md">
              Complete the form below to create a new examination for your students
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
                    <p className="text-sm text-slate-600 dark:text-slate-400">Creating exam...</p>
                  </div>
                </div>
              )}
              
              {/* Basic Information Section */}
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                    <FileText className="h-3 w-3 mr-2" />
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-mono text-sm">
                          <BookOpen className="h-4 w-4" />
                          Subject *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-slate-800 border-primary/20 shadow-lg">
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name} ({subject.code})
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
                    name="examType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-mono text-sm">
                          <Award className="h-4 w-4" />
                          Exam Type *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                              <SelectValue placeholder="Select exam type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-slate-800 border-primary/20 shadow-lg">
                            {examTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-mono text-sm">
                        <PenTool className="h-4 w-4" />
                        Exam Title *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Term 1 Midterm Mathematics" 
                          {...field} 
                          className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-sm">Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the exam content and scope..."
                          className="resize-none h-20 font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Class & Academic Information */}
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                    <School className="h-3 w-3 mr-2" />
                    Class & Academic Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-mono text-sm">
                          <Users className="h-4 w-4" />
                          Class *
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                              <SelectValue placeholder="Select class" />
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
                    name="stream"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Stream (Optional)</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!watchedClass || availableStreams.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                              <SelectValue placeholder={
                                !watchedClass 
                                  ? "Select a class first" 
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
                        {watchedClass && availableStreams.length === 0 && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            No streams configured for this class
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-sm">Term *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-slate-800 border-primary/20 shadow-lg">
                            {terms.map((term) => (
                              <SelectItem key={term} value={term}>
                                {term}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-sm">Academic Year *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-48">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-slate-800 border-primary/20 shadow-lg">
                          {academicYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Schedule & Duration */}
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                    <CalendarDays className="h-3 w-3 mr-2" />
                    Schedule & Duration
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateAdministered"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-mono text-sm">
                          <CalendarDays className="h-4 w-4" />
                          Exam Date *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            min={new Date().toISOString().split('T')[0]}
                            className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-mono text-sm">
                          <Clock className="h-4 w-4" />
                          Start Time *
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-mono text-sm">
                          <Timer className="h-4 w-4" />
                          Duration (minutes) *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="120"
                            min="30"
                            max="360"
                            {...field}
                            className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-48"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalMarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 font-mono text-sm">
                          <Target className="h-4 w-4" />
                          Total Marks *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100"
                            min="1"
                            max="1000"
                            {...field}
                            className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-48"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="passingMarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-sm">Passing Marks *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="40"
                          min="1"
                          className="font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-48"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Instructions */}
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                    <MessageSquare className="h-3 w-3 mr-2" />
                    Exam Instructions
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-sm">Instructions for Students *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Answer all questions. Show all working clearly. Use blue or black ink only..."
                          className="resize-none h-24 font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Preview Summary */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Exam Summary
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Duration:</span>
                    <span className="text-blue-600 ml-2">{form.watch('duration')} minutes</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Total Marks:</span>
                    <span className="text-blue-600 ml-2">{form.watch('totalMarks')}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Pass Mark:</span>
                    <span className="text-blue-600 ml-2">{form.watch('passingMarks')} ({Math.round((form.watch('passingMarks') / form.watch('totalMarks')) * 100)}%)</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Date:</span>
                    <span className="text-blue-600 ml-2">{form.watch('dateAdministered') || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <DrawerFooter className="border-t border-border bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <DrawerClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DrawerClose>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                onClick={() => form.reset()}
                disabled={isLoading}
              >
                Reset Form
              </Button>
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading}
                className="min-w-32"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Exam
                  </>
                )}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
} 
"use client";

import React, { useState } from "react";
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
  PenTool
} from "lucide-react";
import { toast } from 'sonner';
import { subjects } from "@/lib/data/mockExams";

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

const classes = [
  "Form 1A", "Form 1B", "Form 1C",
  "Form 2A", "Form 2B", "Form 2C", 
  "Form 3A", "Form 3B", "Form 3C",
  "Form 4A", "Form 4B", "Form 4C"
];

const streams = ["A", "B", "C", "East", "West", "North", "South"];
const terms = ["Term 1", "Term 2", "Term 3"];
const academicYears = ["2023", "2024", "2025", "2026"];

interface CreateExamDrawerProps {
  onExamCreated: () => void;
  trigger?: React.ReactNode;
}

export function CreateExamDrawer({ onExamCreated, trigger }: CreateExamDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
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
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Create Exam
    </Button>
  );

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        {trigger || defaultTrigger}
      </DrawerTrigger>
      <DrawerContent className="h-full w-full md:w-2/3 lg:w-1/2 bg-background" data-vaul-drawer-direction="right">
        <DrawerHeader className="border-b border-border bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DrawerTitle className="text-xl font-mono font-bold text-foreground uppercase tracking-wide">
                Create New Exam
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground font-medium">
                Set up a new examination for your students
              </DrawerDescription>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Complete all required fields to create the exam</span>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Subject *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                        <FormLabel className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Exam Type *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exam type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                      <FormLabel className="flex items-center gap-2">
                        <PenTool className="h-4 w-4" />
                        Exam Title *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Term 1 Midterm Mathematics" 
                          {...field} 
                          className="font-medium"
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
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of the exam content and scope..."
                          className="resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Class & Academic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <School className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Class & Academic Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Class *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls} value={cls}>
                                {cls}
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
                    name="stream"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stream</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {streams.map((stream) => (
                              <SelectItem key={stream} value={stream}>
                                Stream {stream}
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
                    name="term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Term *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                      <FormLabel>Academic Year *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <CalendarDays className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Schedule & Duration</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateAdministered"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          Exam Date *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            min={new Date().toISOString().split('T')[0]}
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
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Start Time *
                        </FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
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
                        <FormLabel className="flex items-center gap-2">
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
                        <FormLabel className="flex items-center gap-2">
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
                      <FormLabel>Passing Marks *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="40"
                          min="1"
                          className="w-full md:w-48"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Info className="h-4 w-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Exam Instructions</h3>
                </div>

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions for Students *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., Answer all questions. Show all working clearly. Use blue or black ink only..."
                          className="resize-none h-24"
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
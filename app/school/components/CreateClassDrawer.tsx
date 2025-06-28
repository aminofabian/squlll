'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Plus, X, ChevronRight, School, Book, Users, GraduationCap, ClipboardList } from "lucide-react";

// Data for subjects based on Kenyan CBC structure
const SUBJECT_DATA = {
  "PrePrimary": {
    "grades": ["Baby Class", "PP1", "PP2"],
    "subjects": [
      "Language Activities",
      "Mathematical Activities",
      "Environmental Activities",
      "Psychomotor and Creative Activities",
      "Religious Education Activities"
    ]
  },
  "Tertiary": {
    "grades": ["Year 1", "Year 2", "Year 3", "Year 4"],
    "subjects": [
      "University Core Courses",
      "Major Specific Courses",
      "Minor/Elective Courses",
      "Research Methods"
    ]
  },
  "Other": {
    "grades": ["Not Specified"],
    "subjects": ["Not Specified"]
  },
  "LowerPrimary": {
    "grades": ["Grade 1", "Grade 2", "Grade 3"],
    "subjects": [
      "Literacy",
      "Kiswahili Language Activities",
      "English Language Activities",
      "Indigenous Language Activities",
      "Mathematical Activities",
      "Environmental Activities",
      "Hygiene and Nutrition Activities",
      "Religious Education Activities",
      "Movement and Creative Activities"
    ]
  },
  "UpperPrimary": {
    "grades": ["Grade 4", "Grade 5", "Grade 6"],
    "subjects": [
      "English",
      "Kiswahili",
      "Mathematics",
      "Science and Technology",
      "Agriculture and Nutrition",
      "Social Studies",
      "Religious Education (CRE, IRE, HRE)",
      "Creative Arts",
      "Physical and Health Education",
      "Optional Foreign Languages (e.g. French, Arabic, Mandarin)"
    ]
  },
  "JuniorSecondary": {
    "grades": ["Grade 7", "Grade 8", "Grade 9"],
    "core_subjects": [
      "English",
      "Kiswahili or Kenya Sign Language",
      "Mathematics",
      "Integrated Science",
      "Social Studies",
      "Agriculture",
      "Religious Education (CRE, IRE, HRE)",
      "Health Education",
      "Life Skills Education",
      "Pre-Technical and Pre-Career Education",
      "Sports and Physical Education"
    ],
    "optional_subjects": [
      "Visual Arts",
      "Performing Arts",
      "Home Science",
      "Computer Science",
      "Foreign Languages (German, French, Mandarin, Arabic)",
      "Indigenous Languages",
      "Kenyan Sign Language"
    ]
  },
  "SeniorSecondary": {
    "grades": ["Grade 10", "Grade 11", "Grade 12"],
    "core_subjects": [
      "English",
      "Kiswahili or Kenya Sign Language",
      "Community Service Learning",
      "Physical Education"
    ],
    "pathways": {
      "STEM": [
        "Mathematics / Advanced Math",
        "Biology",
        "Chemistry",
        "Physics",
        "General Science",
        "Agriculture",
        "Computer Studies",
        "Home Science",
        "Drawing and Design",
        "Aviation Technology",
        "Building and Construction",
        "Electrical Technology",
        "Metal Technology",
        "Power Mechanics",
        "Wood Technology",
        "Media Technology",
        "Marine and Fisheries Technology"
      ],
      "SocialSciences": [
        "Literature in English",
        "Advanced English",
        "Indigenous Languages",
        "Kiswahili Kipevu",
        "History and Citizenship",
        "Geography",
        "Business Studies",
        "Religious Studies (CRE, IRE, HRE)",
        "Foreign Languages (French, German, Arabic, Mandarin)",
        "Kenyan Sign Language"
      ],
      "ArtsAndSports": [
        "Music and Dance",
        "Fine Art",
        "Theatre and Film",
        "Sports and Recreation",
        "Creative Writing"
      ]
    }
  }
};

type EducationLevelKey = keyof typeof SUBJECT_DATA; // "PrePrimary" | "LowerPrimary" | ...

// Map your existing EducationLevel type to the keys in SUBJECT_DATA
type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary' | 'tertiary' | 'other';

const mapEducationLevelToSubjectDataKey = (level: EducationLevel): EducationLevelKey | null => {
  switch (level) {
    case 'preschool': return 'PrePrimary';
    case 'primary':
      // For primary, we might need a more granular check based on grade,
      // but for now, let's map to UpperPrimary as a general primary default.
      // A more robust solution might involve another select for Lower/Upper Primary.
      return 'UpperPrimary';
    case 'junior-secondary': return 'JuniorSecondary';
    case 'senior-secondary': return 'SeniorSecondary';
    case 'tertiary': return 'Tertiary';
    case 'other': return 'Other';
    default: return null;
  }
};


// Define the form data type for better type safety
type CreateClassFormData = {
  name: string;
  description: string;
  classTeacherId: string;
  level: EducationLevel;
  grade: string;
  stream: string;
  academicYear: string;
  roomNumber: string;
  capacity: number;
  isBoardingClass: boolean;
  departmentId?: string;
  subjectsOffered: string[]; // Changed to string array
  classMonitorId?: string;
}

export function CreateClassDrawer({ onClassCreated = () => {} }: { onClassCreated: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [formProgress, setFormProgress] = useState(25); // Form progress indicator
  const [initialEducationLevel, setInitialEducationLevel] = useState<string>('primary');

  const form = useForm<CreateClassFormData>({
    defaultValues: {
      name: '',
      description: '',
      classTeacherId: '',
      level: 'primary',
      grade: '',
      stream: '',
      academicYear: new Date().getFullYear().toString(),
      roomNumber: '',
      capacity: 30,
      isBoardingClass: false,
      departmentId: '',
      subjectsOffered: [],
      classMonitorId: '',
    },
  });

  const onSubmit = async (data: CreateClassFormData) => {
    try {
      setIsSubmitting(true)
      console.log('Submitting new class:', data)
      await new Promise(resolve => setTimeout(resolve, 1500))
      form.reset()
      onClassCreated()
      alert('Class created successfully!')
    } catch (error) {
      console.error('Error creating class:', error)
      alert('Failed to create class. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper arrays for select options
  const academicYears = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() + i).toString());
  const kenyanEducationLevels: EducationLevel[] = ['preschool', 'primary', 'junior-secondary', 'senior-secondary', 'tertiary', 'other'];

  const selectedEducationLevel = form.watch('level');
  const selectedGrade = form.watch('grade'); // Watch the grade as well

  const getGradesForLevel = (level: EducationLevel): string[] => {
    // Special case for primary to include both lower and upper primary grades
    if (level === 'primary') {
      return [
        ...SUBJECT_DATA['LowerPrimary'].grades,
        ...SUBJECT_DATA['UpperPrimary'].grades
      ];
    }
    
    const dataKey = mapEducationLevelToSubjectDataKey(level);
    if (!dataKey) return [];

    const levelData = SUBJECT_DATA[dataKey];
    if (levelData && 'grades' in levelData) {
      return (levelData as any).grades;
    }
    return [];
  };

  const availableGrades = useMemo(() => {
    return getGradesForLevel(selectedEducationLevel);
  }, [selectedEducationLevel]);

  // Determine subjects based on selected level and possibly grade
  const getDefaultSubjects = (): string[] => {
    // Special case for primary to include both Lower and Upper Primary subjects
    if (selectedEducationLevel === 'primary') {
      let subjects = [
        ...SUBJECT_DATA['LowerPrimary'].subjects,
        ...SUBJECT_DATA['UpperPrimary'].subjects
      ];
      // Remove duplicates and sort
      return Array.from(new Set(subjects)).sort();
    }

    const dataKey = mapEducationLevelToSubjectDataKey(selectedEducationLevel);
    if (!dataKey) return [];

    const levelData = SUBJECT_DATA[dataKey];

    if (levelData) {
      if ('subjects' in levelData && Array.isArray(levelData.subjects)) {
        return levelData.subjects;
      }
      if (('core_subjects' in levelData && Array.isArray(levelData.core_subjects)) ||
          ('pathways' in levelData && typeof levelData.pathways === 'object')) {
        let subjects: string[] = [];
        if ('core_subjects' in levelData && Array.isArray(levelData.core_subjects)) {
            subjects = [...levelData.core_subjects];
        }
        if (selectedEducationLevel === 'junior-secondary' && 'optional_subjects' in levelData && Array.isArray(levelData.optional_subjects)) {
            subjects = [...subjects, ...levelData.optional_subjects];
        }
        if (selectedEducationLevel === 'senior-secondary' && 'pathways' in levelData) {
            // Flatten all subjects from pathways for selection
            Object.values(levelData.pathways).forEach(pathSubjects => {
                if (Array.isArray(pathSubjects)) {
                    subjects = [...subjects, ...pathSubjects];
                }
            });
        }
        // Remove duplicates and sort
        return Array.from(new Set(subjects)).sort();
      }
    }
    return [];
  };

  const defaultSubjects = getDefaultSubjects();

  // Reset selected subjects when education level changes
  useEffect(() => {
    form.setValue('subjectsOffered', []);
    setCustomSubjectInput(''); // Clear custom input too
  }, [selectedEducationLevel, form.setValue]);


  const handleAddCustomSubject = (field: any) => {
    if (customSubjectInput.trim() && !field.value.includes(customSubjectInput.trim())) {
      field.onChange([...field.value, customSubjectInput.trim()]);
      setCustomSubjectInput('');
    }
  };

  const handleRemoveSubject = (subjectToRemove: string, field: any) => {
    field.onChange(field.value.filter((s: string) => s !== subjectToRemove));
  };

  const handleSelectAllSubjects = (field: any) => {
    // Create a new array with all default subjects to avoid duplicates
    const allSubjects = [...new Set([...defaultSubjects])];
    field.onChange(allSubjects);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="h-7 px-2 border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary/30"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Add Class</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-screen w-full md:w-3/5 lg:w-2/5 bg-white shadow-xl rounded-t-lg" data-vaul-drawer-direction="right">
        <DrawerHeader className="border-b border-[#246a59]/20 pb-4 bg-[#246a59]/10 rounded-t-lg">
          <div className="flex items-center justify-center">
            <div className="bg-[#246a59] p-3 rounded-full shadow-md">
              <School className="h-6 w-6 text-white" />
            </div>
          </div>
          <DrawerTitle className="text-2xl text-[#246a59] font-semibold text-center mt-3 flex items-center justify-center gap-2">
            Create New Class
          </DrawerTitle>
          <DrawerDescription className="text-center text-sm text-[#246a59] mt-1">
            Complete the form below to create a new class in your school
          </DrawerDescription>
        </DrawerHeader>
        
        {/* Form progression indicator */}
        <div className="h-2 bg-gray-100">
          <div className="h-full bg-[#246a59]" style={{ width: `${formProgress}%` }}></div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="w-full bg-gray-100 h-1.5 rounded-full mb-6">
                <div className="bg-custom-blue h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: form.formState.isValid ? '100%' : '40%' }}></div>
              </div>
              
              {/* Form Sections */}
              <div className="flex justify-between items-center text-xs text-[#246a59] font-medium mb-6">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#246a59] text-white flex items-center justify-center">1</div>
                  <span>Basic Info</span>
                </div>
                <div className="h-0.5 w-1/6 bg-indigo-200"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#246a59] text-white flex items-center justify-center">2</div>
                  <span>Education</span>
                </div>
                <div className="h-0.5 w-1/6 bg-indigo-200"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-[#246a59] text-white flex items-center justify-center">3</div>
                  <span>Subjects</span>
                </div>
                <div className="h-0.5 w-1/6 bg-indigo-200"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-indigo-300 text-white flex items-center justify-center">4</div>
                  <span>Details</span>
                </div>
              </div>
              {/* SECTION: Basic Class Information */}
              <div className="mb-8 p-5 bg-white rounded-xl shadow-sm border border-indigo-50 hover:border-indigo-100 transition-all">
                <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center gap-2 pb-2 border-b border-indigo-100">
                  <School className="h-5 w-5 text-[#246a59]" />
                  Basic Class Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Eagles, Junior Primary"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>A unique name for the class (e.g., "Class 4A").</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classTeacherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Teacher</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter teacher ID or name"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Assign a teacher responsible for this class.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              </div>

              {/* Education Level and Grade */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center gap-2 pb-2 border-b border-indigo-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#246a59]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Education Level & Grade
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="preschool">Pre-Primary</SelectItem>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="junior-secondary">Junior Secondary</SelectItem>
                          <SelectItem value="senior-secondary">Senior Secondary</SelectItem>
                          <SelectItem value="tertiary">Tertiary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The overall education stage (e.g., Primary, Junior Secondary).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade / Form</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={availableGrades.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableGrades.length > 0 ? (
                            availableGrades.map(grade => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>No grades available for this level</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>The specific grade or form (e.g., Grade 4, Form 1).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Academic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stream"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stream (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. A, Green, North"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>For classes with multiple streams (e.g., 4 'A', 4 'B').</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Year</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {academicYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>The academic year this class is active for.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Physical and Capacity Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number / Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. A101, Main Hall"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>The physical classroom or location of the class.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (Students)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g. 45"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))} // Ensure number type
                        />
                      </FormControl>
                      <FormDescription>Maximum number of students this class can accommodate.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="isBoardingClass"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Is this a boarding class?</FormLabel>
                        <FormDescription>
                          Check if this class is specifically for boarding students.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Science Department"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Relevant for secondary schools with departments.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SECTION: Subjects Offered */}
              <div className="mb-8 p-5 bg-white rounded-xl shadow-sm border border-indigo-50 hover:border-indigo-100 transition-all">
                <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center gap-2 pb-2 border-b border-indigo-100">
                  <Book className="h-5 w-5 text-[#246a59]" />
                  Subjects Offered
                </h3>
                
                <FormField
                  control={form.control}
                  name="subjectsOffered"
                  render={({ field }) => (
                    <FormItem>
                    <FormDescription>Select default subjects or add custom ones for this class.</FormDescription>
                    <div className="mb-3">
                      <Button 
                        type="button" 
                        onClick={() => handleSelectAllSubjects(field)} 
                        variant="outline" 
                        size="sm"
                        className="border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                      >
                        <Book className="h-4 w-4 mr-1" />
                        Select All Subjects
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 py-2">
                      {defaultSubjects.map(subject => (
                        <div key={subject} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subject-${subject}`}
                            checked={field.value.includes(subject)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, subject])
                                : field.onChange(field.value.filter((value) => value !== subject));
                            }}
                          />
                          <label
                            htmlFor={`subject-${subject}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {subject}
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        placeholder="Add custom subject"
                        value={customSubjectInput}
                        onChange={(e) => setCustomSubjectInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault(); // Prevent form submission
                            handleAddCustomSubject(field);
                          }
                        }}
                      />
                      <Button type="button" onClick={() => handleAddCustomSubject(field)}>
                        Add
                      </Button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {field.value.map((subject: string) => (
                        <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                          {subject}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveSubject(subject, field)} />
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

              {/* SECTION: Additional Details */}
              <div className="mb-8 p-5 bg-white rounded-xl shadow-sm border border-indigo-50 hover:border-indigo-100 transition-all">
                <h3 className="text-lg font-medium text-indigo-800 mb-4 flex items-center gap-2 pb-2 border-b border-indigo-100">
                  <Users className="h-5 w-5 text-[#246a59]" />
                  Additional Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                  <FormField
                    control={form.control}
                    name="classMonitorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Monitor (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter student ID or name"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>The student assigned as the class monitor.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter class description..."
                          {...field}
                          className="min-h-[120px] resize-none"
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a brief description of the class, its focus, and any special requirements.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DrawerFooter className="border-t border-custom-blue/20 pt-6 mt-8 bg-custom-blue/10">
                <div className="flex justify-between w-full">
                  <DrawerClose asChild>
                    <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </DrawerClose>
                  <Button
                    type="submit"
                    className="bg-custom-blue hover:bg-custom-blue/90 text-[#246a59] hover:text-white  hover:bg-[#246a59] font-medium shadow-md hover:shadow-lg transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Creating Class...<div className="ml-2 h-4 w-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></div></>
                    ) : (
                      <>Create Class <ChevronRight className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                </div>
              </DrawerFooter>
            </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default CreateClassDrawer;
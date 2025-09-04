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
  Lock,
  BriefcaseBusiness,
  Calendar,
  Trash2,
  GraduationCap,
  Search,
  CheckCircle,
  AlertCircle,
  Hash,
  UserCheck,
  X,
  Upload,
  Smile,
} from "lucide-react"
import { toast } from 'sonner'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { useQueryClient } from '@tanstack/react-query'

// Student schema for multiple students
const studentSchema = z.object({
  id: z.string().optional(), // Adding ID field for existing students
  name: z.string().min(2, "Student name is required"),
  grade: z.string().min(1, "Student grade is required"),
  class: z.string().min(1, "Student class is required"),
  admissionNumber: z.string().min(1, "Admission number is required"),
  stream: z.string().optional(),
  phone: z.string().optional(), // For manual input
})

// Form validation schema
const parentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  phone: z.string()
    .min(10, { message: 'Valid phone number is required' })
    .refine((value) => {
      // Allow Kenyan numbers (+254...) and international numbers
      const phoneRegex = /^\+254[0-9]{9}$|^\+[1-9][0-9]{1,14}$/;
      return phoneRegex.test(value);
    }, { message: 'Please enter a valid phone number (e.g., +254700000000)' }),
  // New field for the mutation
  linkingMethod: z.enum(["SEARCH_BY_NAME", "ADMISSION_NUMBER", "MANUAL_INPUT"]).default("SEARCH_BY_NAME"),
  // Keep existing fields but make them optional
  relationship: z.enum(["father", "mother", "guardian", "other"]).optional(),
  occupation: z.string().optional().or(z.literal("")),
  workAddress: z.string().optional().or(z.literal("")),
  homeAddress: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  idNumber: z.string().optional().or(z.literal("")),
  // For the search by name option
  studentName: z.string().optional().or(z.literal("")),
  // Keeping the students array for UI purposes
  students: z.array(studentSchema).min(1, "At least one student is required"),
  // These fields won't be used in the mutation but keeping for backward compatibility
  communicationSms: z.boolean(),
  communicationEmail: z.boolean(),
  communicationWhatsapp: z.boolean(),
})

// Define ParentFormData using zod inference - this ensures TypeScript knows about the exact shape
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
  
  // Form handling
  // Explicitly define form type to avoid TypeScript errors
  const form = useForm<ParentFormData>({
    resolver: zodResolver(parentFormSchema) as any, // Using type assertion to resolve compatibility issues
    defaultValues: {
      name: '',
      email: '',
      phone: '+254',
      linkingMethod: 'SEARCH_BY_NAME' as const,
      relationship: 'father' as const,
      occupation: '',
      workAddress: '',
      homeAddress: '',
      emergencyContact: '',
      idNumber: '',
      studentName: '',
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
      id: student.id || '', // Include student ID - this is crucial for the API
      name: student.name,
      admissionNumber: student.admissionNumber,
      grade: gradeName,
      class: className,
      stream: streamName,
      phone: student.phone || '', // Include phone field from search result
    };

    // Add to students array
    form.setValue('students', [...currentStudents, newStudent]);
    
    // Update the studentName field with the selected student's name
    form.setValue('studentName', student.name);
    
    // Log for debugging
    console.log('Added student with ID:', student.id);
    console.log('Student name set to:', student.name);
    console.log('Current students array:', [...currentStudents, newStudent]);

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
  // Use explicit type casting for the submit handler to fix TypeScript errors
  const onSubmit = async (data: ParentFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Students in form:', data.students);
    console.log('Student IDs present:', data.students.map(s => s.id).filter(Boolean));
    console.log('Student Names:', data.students.map(s => s.name));
    console.log('Student Name field value:', data.studentName);
    
    // Ensure we have student data even if empty array is passed
    if (!data.students || !Array.isArray(data.students) || data.students.length === 0) {
      toast.error("Missing Student Data", {
        description: "At least one student must be added."
      });
      return;
    }
    
    // Add a default student if somehow we have an empty array (should never happen due to schema validation)
    if (data.students.length === 0) {
      toast.error("No students found in form data", {
        description: "Please add at least one student before continuing"
      });
      return;
    }
    
    // Validate that each student has required fields
    const incompleteStudents = data.students.filter(student => 
      !student || !student.name || !student.name.trim() || 
      !student.admissionNumber || !student.admissionNumber.trim() || 
      !student.grade || 
      !student.class
    );
    
    if (incompleteStudents.length > 0) {
      toast.error("Incomplete Student Data", {
        description: `${incompleteStudents.length} student(s) have missing required information. Please complete all student forms.`
      });
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('Creating parent invitation:', data);
      
      // Add explicit validation for parent and student data
      if (!data.name || !data.email || !data.phone) {
        toast.error("Missing Parent Data", {
          description: "Parent name, email, and phone are required."
        });
        setIsLoading(false);
        return;
      }
      
      if (!data.students || data.students.length === 0) {
        toast.error("Missing Student Data", {
          description: "At least one student must be added."
        });
        setIsLoading(false);
        return;
      }
      
      // Validate each student has required fields
      const invalidStudents = data.students.filter(student => {
        return !student.name || !student.grade || !student.class || !student.admissionNumber;
      });
      
      if (invalidStudents.length > 0) {
        toast.error("Invalid Student Data", {
          description: `${invalidStudents.length} student(s) have missing required fields (name, grade, class, or admission number).`
        });
        setIsLoading(false);
        return;
      }
      
      // Define interface for manual student data for the API payload
      interface ManualStudent {
        name: string;
        admissionNumber: string;
        grade: string;
        class: string;
        stream: string;
        phone: string;
      }
      
      // Create an array of student objects in the required format for the API
      const processedStudents: ManualStudent[] = data.students.map((student) => {
        // Ensure grade and class are always strings
        let gradeStr = '';
        if (student.grade) {
          if (typeof student.grade === 'object' && student.grade !== null) {
            // Try to access name property if it exists using type assertion
            gradeStr = 'name' in student.grade ? String((student.grade as {name?: string}).name || '') : String(student.grade);
          } else {
            gradeStr = String(student.grade || '');
          }
        }
        
        let classStr = '';
        if (student.class) {
          if (typeof student.class === 'object' && student.class !== null) {
            // Handle case where class might be an object (from API or other source)
            const classObj = student.class as any; // Use type assertion to avoid TypeScript error
            classStr = classObj && typeof classObj === 'object' && 'name' in classObj ? 
              String(classObj.name || '') : String(student.class);
          } else {
            classStr = String(student.class || '');
          }
        }
          
        return {
          name: student.name,
          admissionNumber: student.admissionNumber,
          grade: gradeStr,
          class: classStr,
          stream: student.stream || '',
          phone: student.phone || ''
        };
      });
      
      // Prepare createParentDto object
      const createParentDto = {
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
        // Include the new fields from the updated schema
        linkingMethod: data.linkingMethod,
        studentName: data.studentName || ''
      };

      // Extract student IDs for the new mutation format - ensure IDs are non-empty strings
      const studentIds = data.students
        .map(student => student.id)
        .filter(id => typeof id === 'string' && id.trim() !== '');
      
      // Log the raw student data to debug
      console.log('Raw student data in form:', data.students);
      
      // We're now treating ALL students as manual students for better consistency
      const manualStudents = processedStudents;

      // Get the school's tenant ID from the config
      const tenantId = config?.tenant?.id;
      
      console.log('School config:', config);
      console.log('School tenant ID:', tenantId);
      console.log('Linking method:', data.linkingMethod);
      
      if (!tenantId) {
        toast.error("Configuration Error", {
          description: "School tenant ID not available. Please refresh and try again."
        });
        return;
      }

      // Get the first valid student name from the students array
      const firstStudentName = data.students.find(s => s.name)?.name || '';
      
      // Create a clean parent DTO without any potential conflicting fields
      const cleanParentDto = {
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
        communicationWhatsapp: data.communicationWhatsapp
      };
      
      // Structure payload according to inviteParent mutation input requirements
      const inviteParentInput: {
        createParentDto: typeof cleanParentDto;
        studentName: string;
        linkingMethod: string;
        tenantId: string;
        studentIds: string[];
        manualStudents: ManualStudent[];
      } = {
        createParentDto: cleanParentDto,
        studentName: data.studentName || firstStudentName, // Move to root level
        linkingMethod: 'ADMISSION_NUMBER', // Changed to match API expectations
        tenantId,
        // Include actual student IDs when available - use type predicate to filter out undefined values
        studentIds: data.students.map(s => s.id).filter((id): id is string => typeof id === 'string' && id.trim() !== ''), 
        // Only include manual students when there are no student IDs
        manualStudents: [] as ManualStudent[],
      };
      
      // Log the selected student IDs for debugging
      if (inviteParentInput.studentIds.length > 0) {
        console.log('Using the following student IDs:', inviteParentInput.studentIds);
      }
      
      // Decide whether to use studentIds or manualStudents approach
      if (inviteParentInput.studentIds.length === 0) {
        // No valid IDs, use manual students
        inviteParentInput.manualStudents = processedStudents;
        inviteParentInput.linkingMethod = 'MANUAL_INPUT';
      } else {
        // We have student IDs, keep using ADMISSION_NUMBER method
        inviteParentInput.manualStudents = [];
        console.log(`Using ${inviteParentInput.studentIds.length} student IDs with linking method: ${inviteParentInput.linkingMethod}`);
      }
      
      console.log('Student name at root level:', inviteParentInput.studentName);
      
      // Double-check that we have at least one student
      if ((!inviteParentInput.manualStudents || inviteParentInput.manualStudents.length === 0) && 
          (!inviteParentInput.studentIds || inviteParentInput.studentIds.length === 0)) {
        toast.error("Missing Student Data", {
          description: "At least one student must be added to create a parent."
        });
        setIsLoading(false);
        return;
      }
      
      // For debugging purposes only
      console.log("Student validation passed!");
      console.log("Raw students data:", data.students);
      console.log("Processed studentIds:", studentIds);
      console.log("Processed manualStudents:", processedStudents);
      
      // Add admission number to all manual students to ensure they're valid
      if (inviteParentInput.manualStudents.length > 0) {
        inviteParentInput.manualStudents = inviteParentInput.manualStudents.map(student => ({
          ...student,
          admissionNumber: student.admissionNumber.startsWith('ADM') ? 
            student.admissionNumber : `ADM${student.admissionNumber}`
        }));
      }

      // Force using MANUAL_INPUT with manual students regardless of IDs
      // This approach ensures the API gets student data in a format it expects
      inviteParentInput.linkingMethod = 'MANUAL_INPUT';
      
      // Always provide manual students data
      if (inviteParentInput.studentIds.length > 0 && inviteParentInput.manualStudents.length === 0) {
        // We have student IDs but no manual students - create manual students from existing data
        inviteParentInput.manualStudents = data.students.map(student => {
          // Ensure grade and class are always strings
          let gradeStr = '';
          if (student.grade) {
            if (typeof student.grade === 'object' && student.grade !== null) {
              // Try to access name property if it exists using type assertion
              gradeStr = 'name' in student.grade ? String((student.grade as {name?: string}).name || '') : String(student.grade);
            } else {
              gradeStr = String(student.grade || '');
            }
          }
          
          let classStr = '';
          if (student.class) {
            if (typeof student.class === 'object' && student.class !== null) {
              // Handle case where class might be an object (from API or other source)
              const classObj = student.class as any; // Use type assertion to avoid TypeScript error
              classStr = classObj && typeof classObj === 'object' && 'name' in classObj ? 
                String(classObj.name || '') : String(student.class);
            } else {
              classStr = String(student.class || '');
            }
          }
            
          return {
            name: student.name,
            admissionNumber: student.admissionNumber.startsWith('ADM') ? 
              student.admissionNumber : `ADM${student.admissionNumber}`,
            grade: gradeStr,
            class: classStr,
            stream: student.stream || '',
            phone: student.phone || ''
          };
        });
      }
      
      console.log('Final API payload:', JSON.stringify(inviteParentInput, null, 2));
      
      // Make API call to invite parent with timeout handling
      try {
        // Verify we have at least one valid student
        if (!data.students || !Array.isArray(data.students) || data.students.length === 0) {
          toast.error("Missing Student Data", { 
            description: "Please add at least one student before submitting" 
          });
          setIsLoading(false);
          return;
        }
        
        // Get the first student for simplicity
        const student = data.students[0];
        
        if (!student || !student.name || !student.admissionNumber) {
          toast.error("Invalid Student Data", {
            description: "Student must have name and admission number"
          });
          setIsLoading(false);
          return;
        }
        
        // Set up request timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        // Create a minimal but complete parent payload
        const parent = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          relationship: data.relationship || 'father',
          occupation: data.occupation || '',
          workAddress: data.workAddress || '',
          homeAddress: data.homeAddress || '',
          emergencyContact: data.emergencyContact || '',
          idNumber: data.idNumber || '',
          communicationSms: !!data.communicationSms,
          communicationEmail: !!data.communicationEmail,
          communicationWhatsapp: !!data.communicationWhatsapp
        };
        
        // Create a minimal student with guaranteed string values
        const formattedStudent = {
          name: String(student.name || ''),
          admissionNumber: String(student.admissionNumber || '').startsWith('ADM') ? 
            String(student.admissionNumber || '') : 
            `ADM${String(student.admissionNumber || '')}`,
          grade: String(typeof student.grade === 'string' ? student.grade : ''),
          class: String(typeof student.class === 'string' ? student.class : ''),
          stream: String(student.stream || ''),
          phone: String(student.phone || '')
        };
        
        // Create payload that EXACTLY matches what the route.ts API expects
        // The API specifically checks for: parentData, students (array), linkingMethod, and tenantId
        const apiPayload = {
          // Parent data object
          parentData: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            relationship: data.relationship || 'father',
            occupation: data.occupation || '',
            workAddress: data.workAddress || '',
            homeAddress: data.homeAddress || '',
            emergencyContact: data.emergencyContact || '',
            idNumber: data.idNumber || ''
          },
          // IMPORTANT: API expects 'students' as an array, not 'studentData'
          students: [{
            name: student.name,
            admissionNumber: String(student.admissionNumber).trim().startsWith('ADM') ? 
              String(student.admissionNumber).trim() : 
              `ADM${String(student.admissionNumber).trim()}`,
            grade: typeof student.grade === 'string' ? student.grade : '',
            class: typeof student.class === 'string' ? student.class : '',
            stream: student.stream || '',
            phone: student.phone || ''
          }],
          // Match other expected fields
          linkingMethod: 'MANUAL_INPUT',
          tenantId: tenantId
        };
        
        console.log('Sending API request with body:', JSON.stringify(apiPayload, null, 2));
        
        // Make API request
        const response = await fetch('/api/parents/invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiPayload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Log the full response for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        // Process the response
        if (response.ok) {
          const result = await response.json();
          console.log('API success response:', result);
          
          toast.success("Parent Created", {
            description: "Parent has been successfully created."
          });
          
          // Close drawer and reset form
          onParentCreated(); // Call the callback prop provided
          form.reset();
          
        } else {
          // Handle error response
          try {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            
            // Extract specific error message if available
            const errorMessage = errorData?.message || 
                              errorData?.error?.message ||
                              "Failed to create parent. Please try again.";
                              
            toast.error("Creation Failed", {
              description: errorMessage
            });
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            toast.error("Creation Failed", {
              description: `Error ${response.status}: Failed to create parent. Please try again.`
            });
          }
        }
        
      } catch (error) {
        // Network or other fetch errors (not HTTP errors)
        const fetchError = error as { name?: string, message?: string };
        console.error('Fetch error:', fetchError);
        
        if (fetchError.name === 'AbortError') {
          toast.error("Request Timeout", {
            description: "The server took too long to respond. Please try again."
          });
        } else {
          toast.error("Network Error", {
            description: fetchError.message || "Failed to connect to the server. Please check your connection."
          });
        }
      } finally {
        // Always set loading to false
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Outer try-catch error:', error);
      toast.error("Parent Creation Failed", {
        description: error.message || "An unexpected error occurred. Please try again."
      });
      setIsLoading(false);
    }
  }; // Close onSubmit function

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
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 p-2">
              
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
                          <Input 
                            placeholder="+254700000000" 
                            value={field.value}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              field.onChange(formatted);
                            }}
                            className="font-mono" 
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
                  {/* Students Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                        Students ({watchedStudents.length})
                      </span>
                    </div>
                  </div>

                  {/* Students List */}
                  {watchedStudents.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5">
                      <Users className="h-8 w-8 text-primary/50 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No students added yet. Use the search above to find and add students to this parent.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            These students will be linked to <span className="font-semibold">{form.getValues('name') || 'this parent'}</span>
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                          An invitation will be sent to {form.getValues('email') || form.getValues('phone') || 'the parent'}
                        </p>
                      </div>
                      
                      {watchedStudents.map((student, index) => (
                        <div 
                          key={index} 
                          data-student-index={index}
                          className="border-2 border-primary/20 rounded-xl overflow-hidden transition-all duration-300"
                        >
                          {/* Student Card Header */}
                          <div className="flex items-center justify-between bg-gradient-to-r from-primary/15 to-primary/5 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-800 dark:text-slate-200">
                                  {student.name}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {student.admissionNumber}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStudent(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Student Details */}
                          <div className="bg-white dark:bg-slate-800 p-4">
                            <div className="grid grid-cols-2 gap-3">
                              {student.stream && (
                                <div>
                                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Stream</p>
                                  <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                                    <Hash className="h-3.5 w-3.5 text-primary" />
                                    <span>{student.stream}</span>
                                  </div>
                                </div>
                              )}
                              
                              {student.phone && (
                                <div>
                                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Phone</p>
                                  <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                                    <Phone className="h-3.5 w-3.5 text-primary" />
                                    <span>{student.phone}</span>
                                  </div>
                                </div>
                              )}
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

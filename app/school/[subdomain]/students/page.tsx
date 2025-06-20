"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
// No longer using StudentSearchFilter component for this view
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
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
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Filter, 
  User, 
  UserPlus, 
  Users, 
  Info, 
  CalendarDays, 
  School, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  SortAsc, 
  SortDesc, 
  ListFilter, 
  Clock, 
  Calendar, 
  Heart, 
  Home,
  Mail,
  MapPin,
  Phone,
  X,
  BookText,
  Layers,
  GraduationCap,
  Verified,
  Receipt,
  Crown,
  GraduationCap as Gradebook,
  Grid2x2PlusIcon,
  BookKeyIcon,
  BookOpen
} from "lucide-react";

// Kenya-specific student type
type Student = {
  id: string;
  name: string;
  admissionNumber: string; // Kenya-specific
  photo?: string;
  gender: "male" | "female";
  class: string;
  stream?: string;
  grade: string;
  age: number;
  admissionDate: string;
  status: "active" | "inactive" | "transferred" | "graduated" | "suspended";
  contacts: {
    primaryGuardian: string;
    guardianPhone: string;
    guardianEmail?: string;
    homeAddress?: string;
  };
  academicDetails?: {
    averageGrade?: string; // Kenya uses letter grades like A, B+, etc.
    classRank?: number;
    streamRank?: number;
    yearRank?: number;
    kcpeScore?: number; // Kenya Certificate of Primary Education score
    kcsePrediction?: string; // Kenya Certificate of Secondary Education prediction
  };
  feeStatus?: {
    currentBalance: number;
    lastPaymentDate: string;
    lastPaymentAmount: number;
    scholarshipPercentage?: number;
    paymentHistory?: Array<{
      date: string;
      amount: number;
      receiptNumber: string;
      paymentMethod: string;
    }>;
  };
  attendance?: {
    rate: string;
    absentDays: number;
    lateDays: number;
    trend: "improving" | "declining" | "stable";
  };
  healthInfo?: {
    bloodGroup?: string;
    knownConditions?: string[];
    emergencyContact?: string;
    nhifNumber?: string; // Kenya's National Hospital Insurance Fund
  };
  extraCurricular?: {
    clubs?: string[];
    sports?: string[];
    achievements?: string[];
    leadership?: string[];
  };
};

// Education level type
type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary' | 'all'

// Grade type
interface Grade {
  id: string
  name: string
  displayName: string
  level: EducationLevel
  ageGroup: string
  students: number
  classes: number
}

// Helper function to get level icon
const getLevelIcon = (level: EducationLevel) => {
  switch (level) {
    case 'preschool':
      return <BookText className="h-4 w-4" />
    case 'primary':
      return <BookOpen className="h-4 w-4" />
    case 'junior-secondary':
      return <Layers className="h-4 w-4" />
    case 'senior-secondary':
      return <GraduationCap className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

// Helper function to get level color
const getLevelColor = (level: EducationLevel): string => {
  switch (level) {
    case 'preschool':
      return 'bg-purple-100 text-purple-800'
    case 'primary':
      return 'bg-blue-100 text-blue-800'
    case 'junior-secondary':
      return 'bg-yellow-100 text-yellow-800'
    case 'senior-secondary':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Grade Button Component to display grade with abbreviated names
const GradeButton = ({ grade, selectedGradeId, onClick }: { grade: Grade, selectedGradeId: string, onClick: (id: string) => void }) => (
  <Button
    key={grade.id}
    size="sm"
    variant={selectedGradeId === grade.id ? "default" : "outline"}
    className={`text-xs px-2 py-1 h-8 ${selectedGradeId === grade.id ? 'shadow-sm' : ''}`}
    onClick={() => onClick(grade.id)}
  >
    {grade.name}
  </Button>
)

// Student form data schema
const studentFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  admission_number: z.string().min(2, { message: 'Admission number is required' }),
  gender: z.enum(['male', 'female']),
  grade: z.string(),
  class: z.string(),
  age: z.number(),
  date_of_birth: z.string(),
  admission_date: z.string(),
  guardian_name: z.string().min(2, { message: 'Guardian name is required' }),
  guardian_phone: z.string().min(10, { message: 'Valid phone number is required' }),
  guardian_email: z.string().email().optional().or(z.literal('')),
  home_address: z.string().optional().or(z.literal('')),
  stream: z.string().optional().or(z.literal('')),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

// Helper function to format currency (Kenya Shillings)
const formatCurrency = (amount: number) => {
  return `KES ${amount.toLocaleString()}`;
};

// Student creation drawer component
function CreateStudentDrawer({ onStudentCreated }: { onStudentCreated: () => void }) {
  // Form handling
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      admission_number: '',
      gender: 'male',
      grade: '',
      class: '',
      stream: '',
      date_of_birth: new Date(Date.now() - (10 * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // Default to 10 years ago
      age: 0,
      admission_date: new Date().toISOString().split('T')[0],
      guardian_name: '',
      guardian_phone: '',
      guardian_email: '',
      home_address: '',
    },
  });

  // Submit handler
  const onSubmit = (data: StudentFormData) => {
    // In a real application, this would call an API to create the student
    console.log('Creating student:', data);
    // Simulate API call
    setTimeout(() => {
      onStudentCreated();
      form.reset();
    }, 500);
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="default" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add New Student
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-full md:w-1/2 bg-gradient-to-br from-blue-50 to-white" data-vaul-drawer-direction="right">
        <DrawerHeader className="border-b border-blue-100 pb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-blue-100 rounded-full p-3 mr-3">
              <GraduationCap className="h-6 w-6 text-blue-700" />
            </div>
            <DrawerTitle className="text-xl text-blue-800 font-semibold">Student Registration</DrawerTitle>
          </div>
          <DrawerDescription className="text-center text-sm text-blue-700">Enter new student information for school records</DrawerDescription>
        </DrawerHeader>
        <div className="px-6 py-4 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <h3 className="text-md font-medium text-blue-800 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Student Personal Information */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Student's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="admission_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., KPS/2023/001" {...field} />
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
                      <FormLabel>Gender *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade *</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockGrades.map(grade => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.displayName}
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
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Form 1 East" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stream"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stream (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., East, West, Blue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-custom-blue" />
                        Date of Birth *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="date" 
                            {...field} 
                            className="pl-3 pr-10 cursor-pointer bg-custom-blue/5 border-custom-blue/20 hover:border-custom-blue/40 focus:border-custom-blue focus:ring-2 focus:ring-custom-blue/20 transition-all" 
                          />
                          <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-custom-blue pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="admission_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-custom-blue" />
                        Admission Date *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="date" 
                            {...field} 
                            className="pl-3 pr-10 cursor-pointer bg-custom-blue/5 border-custom-blue/20 hover:border-custom-blue/40 focus:border-custom-blue focus:ring-2 focus:ring-custom-blue/20 transition-all" 
                          />
                          <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-custom-blue pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <h3 className="text-md font-medium text-green-800 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Guardian Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                  control={form.control}
                  name="guardian_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Primary guardian's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardian_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="+254700000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardian_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="guardian@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                  <FormField
                    control={form.control}
                    name="home_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Address (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Physical address" {...field} className="focus:ring-2 focus:ring-green-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Student Portal Access
                  </h3>
                  <Badge className="bg-white text-blue-700">Auto-Generated</Badge>
                </div>
                <p className="text-xs opacity-90 mb-3">Login credentials will be automatically generated and sent to the guardian's email once the student is registered.</p>
                <div className="flex items-center justify-between bg-white/20 rounded p-2 backdrop-blur-sm">
                  <div className="flex items-center">
                    <Verified className="h-4 w-4 mr-2 text-yellow-300" />
                    <span className="text-sm">Student Portal</span>
                  </div>
                  <span className="text-xs bg-white/30 px-2 py-0.5 rounded">portal.kenyaschools.edu</span>
                </div>
              </div>

              <DrawerFooter className="border-t border-blue-100 pt-4">
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2">
                  <UserPlus className="h-4 w-4" />
                  Register New Student
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="border-blue-200 text-blue-700">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Mock data for grades
const mockGrades: Grade[] = [
  // Preschool grades
  {
    id: 'baby-class',
    name: 'Baby',
    displayName: 'Baby Class',
    level: 'preschool',
    ageGroup: '3 years',
    students: 42,
    classes: 2
  },
  {
    id: 'pp1',
    name: 'PP1',
    displayName: 'PP1',
    level: 'preschool',
    ageGroup: '4 years',
    students: 56,
    classes: 3
  },
  {
    id: 'pp2',
    name: 'PP2',
    displayName: 'PP2',
    level: 'preschool',
    ageGroup: '5 years',
    students: 48,
    classes: 2
  },
  
  // Primary grades
  {
    id: 'grade1',
    name: 'G1',
    displayName: 'Grade 1',
    level: 'primary',
    ageGroup: '6 years',
    students: 65,
    classes: 3
  },
  {
    id: 'grade2',
    name: 'G2',
    displayName: 'Grade 2',
    level: 'primary',
    ageGroup: '7 years',
    students: 62,
    classes: 3
  },
  {
    id: 'grade3',
    name: 'G3',
    displayName: 'Grade 3',
    level: 'primary',
    ageGroup: '8 years',
    students: 58,
    classes: 2
  },
  {
    id: 'grade4',
    name: 'G4',
    displayName: 'Grade 4',
    level: 'primary',
    ageGroup: '9 years',
    students: 60,
    classes: 2
  },
  {
    id: 'grade5',
    name: 'G5',
    displayName: 'Grade 5',
    level: 'primary',
    ageGroup: '10 years',
    students: 54,
    classes: 2
  },
  {
    id: 'grade6',
    name: 'G6',
    displayName: 'Grade 6',
    level: 'primary',
    ageGroup: '11 years',
    students: 52,
    classes: 2
  },
  
  // Junior Secondary grades
  {
    id: 'grade7',
    name: 'F1',
    displayName: 'Form 1',
    level: 'junior-secondary',
    ageGroup: '12 years',
    students: 86,
    classes: 3
  },
  {
    id: 'grade8',
    name: 'F2',
    displayName: 'Form 2',
    level: 'junior-secondary',
    ageGroup: '13 years',
    students: 78,
    classes: 3
  },
  {
    id: 'grade9',
    name: 'F3',
    displayName: 'Form 3',
    level: 'junior-secondary',
    ageGroup: '14 years',
    students: 72,
    classes: 2
  },
  
  // Senior Secondary grades
  {
    id: 'grade10',
    name: 'F4',
    displayName: 'Form 4',
    level: 'senior-secondary',
    ageGroup: '15 years',
    students: 68,
    classes: 3
  },
  {
    id: 'grade11',
    name: 'F5',
    displayName: 'Form 5',
    level: 'senior-secondary',
    ageGroup: '16 years',
    students: 54,
    classes: 2
  },
  {
    id: 'grade12',
    name: 'F6',
    displayName: 'Form 6',
    level: 'senior-secondary',
    ageGroup: '17 years',
    students: 48,
    classes: 2
  }
]

export default function StudentsPage() {
  // State for selected student and mobile sidebar visibility
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');

  // Mock data for students (Kenya-specific)
  const students: Student[] = [
    {
      id: "1",
      name: "Wanjiku Kamau",
      admissionNumber: "KPS/2023/001",
      photo: "/students/student-1.jpg",
      gender: "female",
      class: "Form 4",
      stream: "East",
      grade: "F4",
      age: 17,
      admissionDate: "2020-01-15",
      status: "active",
      contacts: {
        primaryGuardian: "James Kamau",
        guardianPhone: "+254722123456",
        guardianEmail: "james.kamau@example.com",
        homeAddress: "456 Moi Avenue, Nairobi"
      },
      academicDetails: {
        averageGrade: "A-",
        classRank: 3,
        streamRank: 1,
        yearRank: 15,
        kcsePrediction: "A"
      },
      feeStatus: {
        currentBalance: 12500,
        lastPaymentDate: "2023-05-10",
        lastPaymentAmount: 15000,
        paymentHistory: [
          { date: "2023-05-10", amount: 15000, receiptNumber: "RCT-2023-1234", paymentMethod: "M-Pesa" },
          { date: "2023-01-15", amount: 25000, receiptNumber: "RCT-2023-0987", paymentMethod: "Bank Transfer" }
        ]
      },
      attendance: {
        rate: "95%",
        absentDays: 3,
        lateDays: 2,
        trend: "stable"
      },
      healthInfo: {
        bloodGroup: "O+",
        knownConditions: ["Asthma"],
        emergencyContact: "+254722987654",
        nhifNumber: "NHIF12345678"
      },
      extraCurricular: {
        clubs: ["Debate Club", "Science Club"],
        sports: ["Volleyball", "Athletics"],
        achievements: ["County Debate Champion 2022"],
        leadership: ["Class Prefect"]
      }
    },
    {
      id: "2",
      name: "Emmanuel Ochieng",
      admissionNumber: "KPS/2022/042",
      photo: "/students/student-2.jpg",
      gender: "male",
      class: "Form 3",
      stream: "West",
      grade: "F3",
      age: 16,
      admissionDate: "2021-01-12",
      status: "active",
      contacts: {
        primaryGuardian: "Sarah Ochieng",
        guardianPhone: "+254733456789",
        homeAddress: "123 Kenyatta Road, Kisumu"
      },
      academicDetails: {
        averageGrade: "B+",
        classRank: 5,
        streamRank: 2,
        kcpeScore: 398
      },
      feeStatus: {
        currentBalance: 0,
        lastPaymentDate: "2023-04-20",
        lastPaymentAmount: 32500,
        scholarshipPercentage: 25
      },
      attendance: {
        rate: "98%",
        absentDays: 1,
        lateDays: 0,
        trend: "improving"
      },
      healthInfo: {
        bloodGroup: "AB-",
        nhifNumber: "NHIF98765432"
      },
      extraCurricular: {
        clubs: ["Chess Club"],
        sports: ["Football", "Rugby"],
        achievements: ["School Football Captain"],
        leadership: ["Sports Captain"]
      }
    },
    {
      id: "3",
      name: "Aisha Mohamed",
      admissionNumber: "KPS/2022/018",
      gender: "female",
      class: "Form 2",
      stream: "North",
      grade: "F2",
      age: 15,
      admissionDate: "2022-01-10",
      status: "active",
      contacts: {
        primaryGuardian: "Hassan Mohamed",
        guardianPhone: "+254711789012",
        guardianEmail: "hassan.mohamed@example.com"
      },
      academicDetails: {
        averageGrade: "A",
        classRank: 1,
        streamRank: 1,
        yearRank: 3,
        kcpeScore: 412
      },
      feeStatus: {
        currentBalance: 5000,
        lastPaymentDate: "2023-05-05",
        lastPaymentAmount: 20000
      },
      attendance: {
        rate: "100%",
        absentDays: 0,
        lateDays: 0,
        trend: "stable"
      },
      extraCurricular: {
        clubs: ["Mathematics Club", "Islamic Students Association"],
        sports: ["Basketball"],
        achievements: ["Mathematics Olympiad Winner"],
        leadership: ["Academic Prefect"]
      }
    },
    {
      id: "4",
      name: "Daniel Mwangi",
      admissionNumber: "KPS/2021/076",
      gender: "male",
      class: "Form 4",
      stream: "East",
      grade: "12",
      age: 18,
      admissionDate: "2020-01-20",
      status: "suspended",
      contacts: {
        primaryGuardian: "Catherine Mwangi",
        guardianPhone: "+254700123456"
      },
      academicDetails: {
        averageGrade: "C+",
        classRank: 24,
        streamRank: 12,
        kcsePrediction: "C+"
      },
      feeStatus: {
        currentBalance: 18700,
        lastPaymentDate: "2023-02-15",
        lastPaymentAmount: 10000
      },
      attendance: {
        rate: "76%",
        absentDays: 12,
        lateDays: 8,
        trend: "declining"
      },
      extraCurricular: {
        clubs: ["Drama Club"],
        sports: ["Football"],
        achievements: [],
        leadership: []
      }
    },
    {
      id: "5",
      name: "Faith Njeri",
      admissionNumber: "KPS/2020/034",
      photo: "/students/student-5.jpg",
      gender: "female",
      class: "Form 4",
      stream: "South",
      grade: "12",
      age: 17,
      admissionDate: "2020-01-15",
      status: "active",
      contacts: {
        primaryGuardian: "Peter Njeri",
        guardianPhone: "+254722987123",
        guardianEmail: "peter.njeri@example.com",
        homeAddress: "789 Tom Mboya Street, Nakuru"
      },
      academicDetails: {
        averageGrade: "B",
        classRank: 8,
        streamRank: 3,
        kcsePrediction: "B+"
      },
      feeStatus: {
        currentBalance: 0,
        lastPaymentDate: "2023-05-20",
        lastPaymentAmount: 35000,
        scholarshipPercentage: 15
      },
      attendance: {
        rate: "94%",
        absentDays: 4,
        lateDays: 1,
        trend: "stable"
      },
      healthInfo: {
        bloodGroup: "A+",
        nhifNumber: "NHIF45678901"
      },
      extraCurricular: {
        clubs: ["Red Cross", "Environmental Club"],
        sports: ["Netball"],
        achievements: ["County Environmental Champion 2022"],
        leadership: ["Environmental Club Chairperson"]
      }
    },
    {
      id: "6",
      name: "John Kipchoge",
      admissionNumber: "KPS/2021/102",
      gender: "male",
      class: "Form 3",
      stream: "North",
      grade: "11",
      age: 16,
      admissionDate: "2021-01-15",
      status: "transferred",
      contacts: {
        primaryGuardian: "Elizabeth Kipchoge",
        guardianPhone: "+254733567890"
      },
      academicDetails: {
        averageGrade: "B-",
        classRank: 12,
        streamRank: 5,
        kcpeScore: 365
      },
      feeStatus: {
        currentBalance: 0,
        lastPaymentDate: "2023-04-10",
        lastPaymentAmount: 15000
      },
      attendance: {
        rate: "92%",
        absentDays: 5,
        lateDays: 3,
        trend: "stable"
      },
      extraCurricular: {
        clubs: [],
        sports: ["Athletics", "Cross Country"],
        achievements: ["County 5000m Champion 2022"],
        leadership: []
      }
    }
  ];

  // Filter and sort students based on selected criteria
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];
    
    // Apply search filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        student => 
          student.name.toLowerCase().includes(lowercasedSearch) ||
          student.admissionNumber.toLowerCase().includes(lowercasedSearch)
      );
    }
    
    // Apply class filter
    if (selectedClass) {
      result = result.filter(student => student.class === selectedClass);
    }
    
    // Apply grade filter
    if (selectedGradeId && selectedGradeId !== 'all') {
      // Find the grade name from the selected grade id
      const selectedGradeObj = mockGrades.find(g => g.id === selectedGradeId);
      if (selectedGradeObj) {
        // Check for various matching patterns between mockGrades and student records
        result = result.filter(student => {
          const studentGrade = student.grade?.toLowerCase();
          const studentClass = student.class?.toLowerCase();
          const gradeName = selectedGradeObj.name?.toLowerCase();
          const gradeDisplayName = selectedGradeObj.displayName?.toLowerCase();
          
          // Special case handling for Form 4 (matches both F4 and 12)
          if (selectedGradeObj.id === 'form4' || selectedGradeObj.name === 'F4') {
            if (studentGrade === 'f4' || studentGrade === '12' || studentClass?.includes('form 4')) {
              return true;
            }
          }
          
          // Check for exact match with name
          if (studentGrade === gradeName) return true;
          
          // Check for class match (e.g., "Form 4" in student.class)
          if (studentClass?.includes(gradeDisplayName)) return true;
          
          // Check if student grade contains the grade name (e.g., "F4" matches "F4")
          if (studentGrade?.includes(gradeName)) return true;
          
          // Check if student grade matches display name without spaces (e.g., "Form4" matches "Form 4")
          const displayNameNoSpaces = gradeDisplayName?.replace(/\s+/g, '');
          if (studentGrade === displayNameNoSpaces) return true;
          
          // Check if student.class contains the grade name (e.g., "Form 4" contains "4")
          const gradeNumber = selectedGradeObj.name.replace(/[^0-9]/g, '');
          if (gradeNumber && studentClass?.includes(gradeNumber)) return true;
          
          // Check for numerical equivalence (e.g., grade "12" matches "Form 4" which is 12th grade)
          // Form 1 = 9th grade, Form 2 = 10th grade, Form 3 = 11th grade, Form 4 = 12th grade
          if (selectedGradeObj.id === 'form1' && studentGrade === '9') return true;
          if (selectedGradeObj.id === 'form2' && studentGrade === '10') return true;
          if (selectedGradeObj.id === 'form3' && studentGrade === '11') return true;
          if (selectedGradeObj.id === 'form4' && studentGrade === '12') return true;
          
          return false;
        });
      }
    }
    
    // Apply status filter
    if (selectedStatus) {
      result = result.filter(student => student.status === selectedStatus);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valA: any;
      let valB: any;
      
      // Determine which field to sort by
      switch (sortField) {
        case "name":
          valA = a.name;
          valB = b.name;
          break;
        case "admissionNumber":
          valA = a.admissionNumber;
          valB = b.admissionNumber;
          break;
        case "class":
          valA = a.class;
          valB = b.class;
          break;
        case "grade":
          valA = parseInt(a.grade);
          valB = parseInt(b.grade);
          break;
        case "age":
          valA = a.age;
          valB = b.age;
          break;
        case "academicRank":
          valA = a.academicDetails?.classRank || 999;
          valB = b.academicDetails?.classRank || 999;
          break;
        case "feeBalance":
          valA = a.feeStatus?.currentBalance || 0;
          valB = b.feeStatus?.currentBalance || 0;
          break;
        default:
          valA = a.name;
          valB = b.name;
      }
      
      // Determine sort direction
      return sortDirection === "asc" 
        ? valA > valB ? 1 : valA < valB ? -1 : 0
        : valA < valB ? 1 : valA > valB ? -1 : 0;
    });
    
    return result;
  }, [students, searchTerm, selectedClass, selectedGradeId, selectedStatus, sortField, sortDirection]);
  
  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "transferred":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "graduated":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  // Get all available classes and grades for filters
  const availableClasses = [...new Set(students.map(student => student.class))];
  const availableGrades = [...new Set(students.map(student => student.grade))].sort((a, b) => parseInt(a) - parseInt(b));
  
  // Function to get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <ArrowUp className="h-3 w-3 text-green-600" />;
      case "declining":
        return <ArrowDown className="h-3 w-3 text-red-600" />;
      case "stable":
        return <Check className="h-3 w-3 text-blue-600" />;
      default:
        return null;
    }
  };
  
  // Education levels mapping (as mentioned in the memory)
  const getEducationLevel = (grade: string) => {
    const gradeNum = parseInt(grade);
    if (gradeNum <= 3) return "preschool";
    if (gradeNum <= 8) return "primary";
    if (gradeNum <= 10) return "junior-secondary";
    return "senior-secondary";
  };
  
  // Set initial selected student instead of waiting for selection
  // Initially selecting Wanjiku Kamau (first student from our data)
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id); // Select first student (Wanjiku Kamau)
    }
  }, [students, selectedStudentId]);


  // Find the selected student details
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find(student => student.id === selectedStudentId);
  }, [selectedStudentId, students]);

  return (
    <div className="flex h-full">
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Search filter column - simplified with only name search */}
      <div className="hidden md:flex flex-col w-96 border-r overflow-y-auto p-6 shrink-0 bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Search Students</h2>
          <p className="text-sm text-muted-foreground">Find students by name</p>
        </div>

        <div className="space-y-6">
          {/* Name Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Student Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name..."
                className="pl-9 h-12 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Clear Search Button */}
          {(searchTerm || selectedGradeId !== 'all') && (
            <div className="pt-1">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGradeId('all');
                }} 
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
        
        {/* Student List with Filtering */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Students <span className="text-muted-foreground">({filteredAndSortedStudents.length})</span></h3>
          </div>
          
          <div className="space-y-2">
            {filteredAndSortedStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students match your search criteria
              </div>
            ) : (
              filteredAndSortedStudents.map((student) => (
                <div
                  key={student.id}
                  className={`p-3 rounded-md border transition-colors cursor-pointer ${student.id === selectedStudentId ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/30'}`}
                  onClick={() => setSelectedStudentId(student.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-green-500' : student.status === 'inactive' ? 'bg-gray-400' : 'bg-red-500'}`} />
                        <div className="font-medium">{student.name}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{student.admissionNumber}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{student.class}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main content column - Grade Filter and Student Details */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {selectedStudent ? 'Student Details' : 'Loading Student Information'}
            </h1>
          </div>
          <CreateStudentDrawer onStudentCreated={() => {}} />
        </div>
        
        {/* Grade Filter Section - New Design */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filter by Grade</h2>
            {selectedGradeId !== 'all' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedGradeId('all')}
              >
                Clear Filter
              </Button>
            )}
          </div>
          
          {/* Education Level Cards - Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Preschool Card */}
            <div className="rounded-lg overflow-hidden border border-blue-100 shadow-sm">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 flex items-center gap-2 border-b border-blue-200">
                {getLevelIcon('preschool')}
                <h3 className="font-medium text-blue-900">Preschool</h3>
              </div>
              <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2">
                  {mockGrades
                    .filter(grade => grade.level === 'preschool')
                    .map(grade => (
                      <Button
                        key={grade.id}
                        variant={selectedGradeId === grade.id ? "default" : "outline"}
                        className={`h-10 ${selectedGradeId === grade.id ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50 border-blue-200'}`}
                        onClick={() => setSelectedGradeId(grade.id)}
                      >
                        {grade.name}
                      </Button>
                    ))
                  }
                </div>
              </div>
            </div>
            
            {/* Primary Card */}
            <div className="rounded-lg overflow-hidden border border-green-100 shadow-sm">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 flex items-center gap-2 border-b border-green-200">
                {getLevelIcon('primary')}
                <h3 className="font-medium text-green-900">Primary</h3>
              </div>
              <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2">
                  {mockGrades
                    .filter(grade => grade.level === 'primary')
                    .map(grade => (
                      <Button
                        key={grade.id}
                        variant={selectedGradeId === grade.id ? "default" : "outline"}
                        className={`h-10 ${selectedGradeId === grade.id ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 border-green-200'}`}
                        onClick={() => setSelectedGradeId(grade.id)}
                      >
                        {grade.name}
                      </Button>
                    ))
                  }
                </div>
              </div>
            </div>
            
            {/* Junior Secondary Card */}
            <div className="rounded-lg overflow-hidden border border-amber-100 shadow-sm">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 flex items-center gap-2 border-b border-amber-200">
                {getLevelIcon('junior-secondary')}
                <h3 className="font-medium text-amber-900">Junior Secondary</h3>
              </div>
              <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2">
                  {mockGrades
                    .filter(grade => grade.level === 'junior-secondary')
                    .map(grade => (
                      <Button
                        key={grade.id}
                        variant={selectedGradeId === grade.id ? "default" : "outline"}
                        className={`h-10 ${selectedGradeId === grade.id ? 'bg-amber-600 hover:bg-amber-700' : 'hover:bg-amber-50 border-amber-200'}`}
                        onClick={() => setSelectedGradeId(grade.id)}
                      >
                        {grade.name}
                      </Button>
                    ))
                  }
                </div>
              </div>
            </div>
            
            {/* Senior Secondary Card */}
            <div className="rounded-lg overflow-hidden border border-purple-100 shadow-sm">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 flex items-center gap-2 border-b border-purple-200">
                {getLevelIcon('senior-secondary')}
                <h3 className="font-medium text-purple-900">Senior Secondary</h3>
              </div>
              <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2">
                  {mockGrades
                    .filter(grade => grade.level === 'senior-secondary')
                    .map(grade => (
                      <Button
                        key={grade.id}
                        variant={selectedGradeId === grade.id ? "default" : "outline"}
                        className={`h-10 ${selectedGradeId === grade.id ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-50 border-purple-200'}`}
                        onClick={() => setSelectedGradeId(grade.id)}
                      >
                        {grade.name}
                      </Button>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Selection Indicator */}
          {selectedGradeId !== 'all' && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Currently viewing:</span>
              <Badge variant="secondary" className="font-medium">
                {mockGrades.find(g => g.id === selectedGradeId)?.displayName || 'All Grades'}
              </Badge>
            </div>
          )}
        </div>

        {/* Student Details Section */}
        {selectedStudent ? (
          <div className="space-y-6">
            {/* Student profile header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Student photo */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100">
                    {selectedStudent.photo ? (
                      <img 
                        src={selectedStudent.photo} 
                        alt={selectedStudent.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <User className="h-12 w-12 text-slate-400" />
                      </div>
                    )}
                    
                    <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white
                      ${selectedStudent.status === 'active' ? 'bg-green-500' : 
                        selectedStudent.status === 'inactive' ? 'bg-gray-400' : 
                        selectedStudent.status === 'suspended' ? 'bg-red-500' : 'bg-yellow-500'}`}
                    />
                  </div>
                </div>
                
                {/* Student basic info */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Info className="h-3.5 w-3.5" />
                        <span>ID: {selectedStudent.admissionNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <School className="h-3.5 w-3.5" />
                        <span>Class: {selectedStudent.class}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>Age: {selectedStudent.age}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Badge className={`${selectedStudent.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 
                      selectedStudent.status === 'inactive' ? 'bg-gray-100 text-gray-800 border-gray-200' : 
                      selectedStudent.status === 'suspended' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                      {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {selectedStudent.gender}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      Grade {selectedStudent.grade}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Student details tabs */}
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="academics">Academics</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                    <CardDescription>
                      Detailed personal information about {selectedStudent.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Personal Details</h3>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2">
                            <div className="font-medium text-sm">Full Name</div>
                            <div>{selectedStudent.name}</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="font-medium text-sm">Age</div>
                            <div>{selectedStudent.age} years</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="font-medium text-sm">Gender</div>
                            <div className="capitalize">{selectedStudent.gender}</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="font-medium text-sm">Admission Number</div>
                            <div>{selectedStudent.admissionNumber}</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="font-medium text-sm">Admission Date</div>
                            <div>{selectedStudent.admissionDate}</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="font-medium text-sm">Status</div>
                            <div className="capitalize">{selectedStudent.status}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Contact Information</h3>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2">
                            <div className="font-medium text-sm">Guardian Name</div>
                            <div>{selectedStudent.contacts.primaryGuardian}</div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="font-medium text-sm">Guardian Phone</div>
                            <div>{selectedStudent.contacts.guardianPhone}</div>
                          </div>
                          {selectedStudent.contacts.guardianEmail && (
                            <div className="grid grid-cols-2">
                              <div className="font-medium text-sm">Guardian Email</div>
                              <div>{selectedStudent.contacts.guardianEmail}</div>
                            </div>
                          )}
                          {selectedStudent.contacts.homeAddress && (
                            <div className="grid grid-cols-2">
                              <div className="font-medium text-sm">Address</div>
                              <div>{selectedStudent.contacts.homeAddress}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="academics">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="p-4 border rounded-md bg-blue-50">
                        <h3 className="text-md font-semibold mb-3 flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Current Performance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="p-3 bg-white rounded-md border">
                            <div className="text-xs text-muted-foreground mb-1">Average Grade</div>
                            <div className="text-2xl font-bold text-blue-700">{selectedStudent.academicDetails?.averageGrade || 'N/A'}</div>
                          </div>
                          <div className="p-3 bg-white rounded-md border">
                            <div className="text-xs text-muted-foreground mb-1">Class Rank</div>
                            <div className="text-2xl font-bold">
                              {selectedStudent.academicDetails?.classRank || 'N/A'}
                              <span className="text-xs font-normal ml-1">/ {selectedStudent.academicDetails?.classRank ? '30' : '0'}</span>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-md border">
                            <div className="text-xs text-muted-foreground mb-1">Stream Rank</div>
                            <div className="text-2xl font-bold">
                              {selectedStudent.academicDetails?.streamRank || 'N/A'}
                              <span className="text-xs font-normal ml-1">/ {selectedStudent.academicDetails?.streamRank ? '15' : '0'}</span>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-md border">
                            <div className="text-xs text-muted-foreground mb-1">Year Rank</div>
                            <div className="text-2xl font-bold">
                              {selectedStudent.academicDetails?.yearRank || 'N/A'}
                              <span className="text-xs font-normal ml-1">/ {selectedStudent.academicDetails?.yearRank ? '120' : '0'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md">
                        <h3 className="text-md font-semibold mb-3">Exam History</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Term</th>
                                <th className="text-left p-2">Average</th>
                                <th className="text-left p-2">Class Rank</th>
                                <th className="text-left p-2">Stream Rank</th>
                                <th className="text-left p-2">Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b hover:bg-muted/30">
                                <td className="p-2">Term 1, 2023</td>
                                <td className="p-2 font-medium">A-</td>
                                <td className="p-2">3 / 30</td>
                                <td className="p-2">1 / 15</td>
                                <td className="p-2">Excellent performance</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/30">
                                <td className="p-2">Term 3, 2022</td>
                                <td className="p-2 font-medium">B+</td>
                                <td className="p-2">4 / 30</td>
                                <td className="p-2">2 / 15</td>
                                <td className="p-2">Good improvement</td>
                              </tr>
                              <tr className="border-b hover:bg-muted/30">
                                <td className="p-2">Term 2, 2022</td>
                                <td className="p-2 font-medium">B</td>
                                <td className="p-2">6 / 30</td>
                                <td className="p-2">3 / 15</td>
                                <td className="p-2">Consistent performance</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      {selectedStudent.academicDetails?.kcsePrediction && (
                        <div className="p-4 border rounded-md bg-green-50">
                          <h3 className="text-md font-semibold mb-3">KCSE Prediction</h3>
                          <div className="p-3 bg-white rounded-md border inline-block">
                            <div className="text-xs text-muted-foreground mb-1">Predicted Grade</div>
                            <div className="text-3xl font-bold text-green-700">{selectedStudent.academicDetails.kcsePrediction}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Records</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 text-muted-foreground">
                      Attendance records will appear here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="fees">
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 text-muted-foreground">
                      Fee payment history will appear here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-8 text-muted-foreground">
                      Student documents will appear here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-medium mb-2">No student selected</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please select a student from the list on the left to view their complete details, attendance records, academic performance, and other information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// StudentCard component to display Kenya-specific student information with a premium UI
function StudentCard({ 
  student, 
  getStatusColor,
  getTrendIcon
}: { 
  student: Student; 
  getStatusColor: (status: string) => string;
  getTrendIcon: (trend: string) => React.ReactNode;
}) {
  // Format currency - Kenya uses KES (Kenyan Shilling)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <Card className="overflow-hidden border-l-4 border-l-sky-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            {student.photo ? (
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                {student.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-bold">{student.name}</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-medium">{student.admissionNumber}</span>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  {student.gender === "female" ? (
                    <Grid2x2PlusIcon className="h-3.5 w-3.5 text-pink-500" />
                  ) : (
                    <BookKeyIcon className="h-3.5 w-3.5 text-blue-500" />
                  )}
                  <span className="text-xs text-muted-foreground capitalize">{student.gender}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <Badge 
              className={`${getStatusColor(student.status)} px-3 py-0.5 font-medium`}
            >
              <div className="w-1.5 h-1.5 rounded-full mr-1 bg-current inline-block"></div>
              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Age: {student.age} years
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 pt-0">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Class</div>
            <div className="flex items-center gap-1.5">
              <Gradebook className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-sm font-medium">{student.class}</span>
              {student.stream && (
                <Badge variant="outline" className="text-xs h-5 font-normal">
                  {student.stream} Stream
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Admitted</div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-sm">
                {new Date(student.admissionDate).toLocaleDateString("en-KE", { 
                  day: "numeric", 
                  month: "short", 
                  year: "numeric" 
                })}
              </span>
            </div>
          </div>
        </div>
        
        {/* Academic Information */}
        <div className="p-3 bg-blue-50/50 rounded mb-3 border border-blue-100">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-xs font-semibold text-blue-700 flex items-center">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              Academic Performance
            </h4>
            {student.academicDetails?.averageGrade && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-3">
                Grade: {student.academicDetails.averageGrade}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs">
            {student.academicDetails?.classRank && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Class Rank:</span>
                <span className="font-medium">{student.academicDetails.classRank}</span>
              </div>
            )}
            
            {student.academicDetails?.streamRank && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stream Rank:</span>
                <span className="font-medium">{student.academicDetails.streamRank}</span>
              </div>
            )}
            
            {student.academicDetails?.yearRank && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Year Rank:</span>
                <span className="font-medium">{student.academicDetails.yearRank}</span>
              </div>
            )}
            
            {student.academicDetails?.kcpeScore && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">KCPE:</span>
                <span className="font-medium">{student.academicDetails.kcpeScore} marks</span>
              </div>
            )}
            
            {student.academicDetails?.kcsePrediction && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">KCSE Pred.:</span>
                <span className="font-medium">{student.academicDetails.kcsePrediction}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Fee Status */}
        <div className="p-3 bg-yellow-50/50 rounded mb-3 border border-yellow-100">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-xs font-semibold text-yellow-700 flex items-center">
              <Receipt className="h-3.5 w-3.5 mr-1" />
              Fee Status
            </h4>
            {student.feeStatus?.scholarshipPercentage && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3">
                {student.feeStatus.scholarshipPercentage}% Scholarship
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="col-span-2 flex items-center justify-between mb-0.5">
              <span className="text-xs text-muted-foreground">Current Balance:</span>
              <span className={`text-sm font-medium ${student.feeStatus?.currentBalance ? 'text-red-600' : 'text-green-600'}`}>
                {student.feeStatus ? formatCurrency(student.feeStatus.currentBalance) : 'N/A'}
              </span>
            </div>
            
            {student.feeStatus?.lastPaymentDate && (
              <div className="col-span-2 text-xs">
                <span className="text-muted-foreground">Last payment:</span>
                <span className="ml-1">
                  {formatCurrency(student.feeStatus.lastPaymentAmount)} on {' '}
                  {new Date(student.feeStatus.lastPaymentDate).toLocaleDateString("en-KE", { 
                    day: "numeric", 
                    month: "short" 
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom section with tabs or condensed info */}
        <div className="flex flex-wrap gap-1.5 items-center text-xs">
          {/* Attendance stats */}
          {student.attendance && (
            <div className="flex items-center gap-1 pr-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Attendance:</span>
              <span className="font-medium flex items-center gap-0.5">
                {student.attendance.rate}
                {student.attendance.trend && getTrendIcon(student.attendance.trend)}
              </span>
            </div>
          )}
          
          {/* Health info (simplified) */}
          {student.healthInfo?.bloodGroup && (
            <div className="flex items-center gap-1 border-l border-gray-200 pl-1.5 pr-1.5">
              <Heart className="h-3 w-3 text-red-500" />
              <span className="text-muted-foreground">Blood:</span>
              <span className="font-medium">{student.healthInfo.bloodGroup}</span>
            </div>
          )}
          
          {/* Guardian info (simplified) */}
          {student.contacts?.primaryGuardian && (
            <div className="flex items-center gap-1 border-l border-gray-200 pl-1.5">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Guardian:</span>
              <span className="font-medium">{student.contacts.primaryGuardian}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-3">
        {/* Extra curricular activities badges */}
        {student.extraCurricular && (
          <div className="w-full">
            {student.extraCurricular.leadership && student.extraCurricular.leadership.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {student.extraCurricular.leadership.map((role, index) => (
                  <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 text-xs border-purple-200">
                    <Crown className="h-3 w-3 mr-1" />
                    {role}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap gap-1">
              {student.extraCurricular.clubs && student.extraCurricular.clubs.map((club, index) => (
                <Badge key={index} variant="outline" className="text-xs border-gray-200 bg-white">
                  {club}
                </Badge>
              ))}
              
              {student.extraCurricular.sports && student.extraCurricular.sports.map((sport, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 text-xs border-green-200">
                  {sport}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
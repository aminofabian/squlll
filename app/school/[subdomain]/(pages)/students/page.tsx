"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
// No longer using StudentSearchFilter component for this view
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateStudentDrawer } from './components/CreateStudentDrawer';
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
  Receipt,
  Crown,
  GraduationCap as Gradebook,
  Grid2x2PlusIcon,
  BookKeyIcon,
  BookOpen,
  Loader2,
  Download,
  Printer,
  ChevronDown,
  ChevronRight,
  FileText
} from "lucide-react";

// Import hooks and types for real data
import { useStudents, useStudentsFromStore } from '@/lib/hooks/useStudents';
import { GraphQLStudent } from '@/types/student';
import SchoolReportCard from './components/ReportCard';
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig';
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore';
import AllGradesStudentsTable from "./components/AllGradesStudentsTable";
import { StudentsStats } from "./components/StudentsStats";

// Kenya-specific student type (adapted from GraphQL data)
type Student = {
  id: string;
  name: string;
  admissionNumber: string;
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
    averageGrade?: string;
    classRank?: number;
    streamRank?: number;
    yearRank?: number;
    kcpeScore?: number;
    kcsePrediction?: string;
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
    nhifNumber?: string;
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

// Helper function to format currency (Kenya Shillings)
const formatCurrency = (amount: number) => {
  return `KES ${amount.toLocaleString()}`;
};

// Helper function to generate stable mock data based on student ID
const generateStableMockData = (studentId: string) => {
  // Use a simple hash function to generate consistent values based on student ID
  const hash = studentId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const absHash = Math.abs(hash);
  
  return {
    academicDetails: {
      averageGrade: ["A", "A-", "B+", "B", "B-"][absHash % 5],
      classRank: (absHash % 30) + 1,
      streamRank: (absHash % 15) + 1,
      yearRank: (absHash % 120) + 1,
      kcpeScore: (absHash % 100) + 300,
      kcsePrediction: ["A", "A-", "B+", "B", "B-"][absHash % 5]
    },
    feeStatus: {
      currentBalance: (absHash % 20000),
      lastPaymentDate: "2024-01-15", // Fixed date to avoid hydration issues
      lastPaymentAmount: (absHash % 35000) + 10000,
      scholarshipPercentage: absHash % 10 === 0 ? (absHash % 30) + 10 : undefined
    },
    attendance: {
      rate: `${(absHash % 20) + 80}%`,
      absentDays: absHash % 10,
      lateDays: absHash % 5,
      trend: ["improving", "declining", "stable"][absHash % 3] as "improving" | "declining" | "stable"
    },
    healthInfo: {
      bloodGroup: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"][absHash % 8],
      nhifNumber: `NHIF${studentId.slice(0, 8).toUpperCase()}`
    },
    extraCurricular: {
      clubs: [["Debate Club", "Science Club", "Mathematics Club"][absHash % 3]],
      sports: [["Football", "Basketball", "Athletics"][absHash % 3]],
      achievements: [],
      leadership: absHash % 10 === 0 ? ["Class Prefect"] : []
    },
    stream: ["East", "West", "North", "South"][absHash % 4]
  };
};

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
  // State for mobile sidebar visibility and student selection
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'compact' | 'uganda-classic'>('modern');
  const [displayedStudentsCount, setDisplayedStudentsCount] = useState(10);


  // Fetch real data from the store
  const { students: graphqlStudents, isLoading, error } = useStudentsFromStore();
  const { refetch } = useStudents();
  
  // Fetch school configuration
  const { data: schoolConfig } = useSchoolConfig();
  const { config, getGradeById, getAllGradeLevels } = useSchoolConfigStore();
  
  // Get all available grades from school config
  const allGradeLevels = getAllGradeLevels();
  
  // Debug: Log what grades are available
  console.log('Available grade levels:', allGradeLevels.map(level => ({
    levelName: level.levelName,
    grades: level.grades.map(g => g.name)
  })));
  
  // Debug: Check if we have Senior Secondary level
  const seniorSecondaryLevel = allGradeLevels.find(level => 
    level.levelName.toLowerCase().includes('senior secondary')
  );
  console.log('Senior Secondary level found:', seniorSecondaryLevel ? {
    name: seniorSecondaryLevel.levelName,
    grades: seniorSecondaryLevel.grades.map(g => g.name)
  } : 'NOT FOUND');
  
  // Add fallback grades if they're missing from the configuration
  const enhancedGradeLevels = useMemo(() => {
    const levels = [...allGradeLevels];
    
    // Check if we have Senior Secondary level but missing F4, F5, F6
    let seniorSecondaryLevel = levels.find(level => 
      level.levelName.toLowerCase().includes('senior secondary')
    );
    
    // If no Senior Secondary level exists, create one
    if (!seniorSecondaryLevel) {
      console.log('Creating Senior Secondary level as fallback');
      seniorSecondaryLevel = {
        levelId: 'fallback-senior-secondary',
        levelName: 'Senior Secondary',
        grades: []
      };
      levels.push(seniorSecondaryLevel);
    }
    
          if (seniorSecondaryLevel) {
        const existingGradeNames = seniorSecondaryLevel.grades.map(g => g.name.toLowerCase());
        console.log('Existing grades in Senior Secondary:', existingGradeNames);
        const missingGrades = [];
        
        // Check for missing Form 4, 5, 6 (or Grade 10, 11, 12)
        const hasGrade10 = existingGradeNames.some(name => name.includes('grade 10') || name.includes('form 4') || name.includes('f4'));
        const hasGrade11 = existingGradeNames.some(name => name.includes('grade 11') || name.includes('form 5') || name.includes('f5'));
        const hasGrade12 = existingGradeNames.some(name => name.includes('grade 12') || name.includes('form 6') || name.includes('f6'));
        
        console.log('Grade detection:', { hasGrade10, hasGrade11, hasGrade12 });
        
        if (!hasGrade10) {
          missingGrades.push({
            id: 'fallback-f4',
            name: 'Grade 10',
            age: 17,
            streams: []
          });
        }
        
        if (!hasGrade11) {
          missingGrades.push({
            id: 'fallback-f5',
            name: 'Grade 11',
            age: 18,
            streams: []
          });
        }
        
        if (!hasGrade12) {
          missingGrades.push({
            id: 'fallback-f6',
            name: 'Grade 12',
            age: 19,
            streams: []
          });
        }
        
        if (missingGrades.length > 0) {
          // Add missing grades to the senior secondary level
          seniorSecondaryLevel.grades = [...seniorSecondaryLevel.grades, ...missingGrades];
          console.log('Added fallback grades:', missingGrades.map(g => g.name));
        } else {
          console.log('No missing grades to add');
        }
      }
    
    return levels;
  }, [allGradeLevels]);
  
  // Helper function to categorize levels for filtering
  const getLevelCategory = (levelName: string): string => {
    const lowerLevelName = levelName.toLowerCase();
    if (lowerLevelName.includes('preschool') || lowerLevelName.includes('baby') || lowerLevelName.includes('nursery')) {
      return 'preschool';
    }
    if (lowerLevelName.includes('primary') || lowerLevelName.includes('grade 1') || lowerLevelName.includes('grade 2') || 
        lowerLevelName.includes('grade 3') || lowerLevelName.includes('grade 4') || lowerLevelName.includes('grade 5') || 
        lowerLevelName.includes('grade 6')) {
      return 'primary';
    }
    if (lowerLevelName.includes('junior') || lowerLevelName.includes('form 1') || lowerLevelName.includes('form 2') ||
        lowerLevelName.includes('grade 7') || lowerLevelName.includes('grade 8')) {
      return 'junior-secondary';
    }
    if (lowerLevelName.includes('senior') || lowerLevelName.includes('form 3') || lowerLevelName.includes('form 4') ||
        lowerLevelName.includes('grade 9') || lowerLevelName.includes('grade 10') || lowerLevelName.includes('grade 11') || 
        lowerLevelName.includes('grade 12')) {
      return 'senior-secondary';
    }
    return 'primary'; // Default fallback
  };

  // Transform GraphQL data to match our Student type
  const students: Student[] = useMemo(() => {
    // Filter out any invalid student data
    const validStudents = graphqlStudents.filter(student => 
      student && 
      student.id && 
      student.admission_number
    );

    return validStudents.map((graphqlStudent: GraphQLStudent) => {
      // Use stable mock data generation based on student ID
      const mockData = generateStableMockData(graphqlStudent.id);
      
      // Calculate age from admission date (assuming we have this data)
      const admissionDate = "2024-01-15"; // Fixed date to avoid hydration issues
      const age = 16; // Default age, should be calculated from date of birth
      
      // Use actual name from GraphQL data or fallback to email-based name
      const generateNameFromEmail = (email: string) => {
        const username = email.split('@')[0];
        return username
          .replace(/[0-9]/g, '') // Remove numbers
          .replace(/([A-Z])/g, ' $1') // Add spaces before capitals
          .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
          .trim();
      };
      
      const studentName = graphqlStudent.user?.name 
        ? graphqlStudent.user.name
        : graphqlStudent.user?.email 
          ? generateNameFromEmail(graphqlStudent.user.email)
          : `Student ${graphqlStudent.admission_number}`;
      
      const guardianName = studentName.split(' ')[0] || 'Guardian';
      
      // Get grade information from school config
      const gradeInfo = graphqlStudent.grade ? getGradeById(graphqlStudent.grade) : null;
      const gradeName = gradeInfo?.grade.name || 'Unknown Grade';
      
      // Convert Grade 7+ to Form 1, Grade 8 to Form 2, etc.
      const convertGradeToForm = (gradeName: string): string => {
        // Check if it's a numeric grade (Grade 7, Grade 8, etc.)
        const gradeMatch = gradeName.match(/Grade\s+(\d+)/i);
        if (gradeMatch) {
          const gradeNumber = parseInt(gradeMatch[1]);
          // Convert Grade 7+ to Form 1+ (up to Grade 12 = Form 6)
          if (gradeNumber >= 7 && gradeNumber <= 12) {
            const formNumber = gradeNumber - 6; // Grade 7 = Form 1, Grade 8 = Form 2, etc.
            return `Form ${formNumber}`;
          }
        }
        return gradeName; // Return original if not a Grade 7+ or doesn't match pattern
      };
      
      const convertedGradeName = convertGradeToForm(gradeName);
      
      return {
        id: graphqlStudent.id,
        name: studentName,
        admissionNumber: graphqlStudent.admission_number,
        photo: undefined, // No photo in GraphQL data
        gender: graphqlStudent.gender as "male" | "female" || "male",
        class: convertedGradeName,
        stream: mockData.stream,
        grade: convertedGradeName,
        age,
        admissionDate,
        status: graphqlStudent.isActive ? "active" : "inactive" as const,
        contacts: {
          primaryGuardian: `Guardian of ${guardianName}`,
          guardianPhone: graphqlStudent.phone || 'N/A',
          guardianEmail: graphqlStudent.user?.email || 'guardian@example.com',
          homeAddress: "Nairobi, Kenya"
        },
        academicDetails: mockData.academicDetails,
        feeStatus: {
          ...mockData.feeStatus,
          currentBalance: graphqlStudent.feesOwed || 0,
          lastPaymentAmount: graphqlStudent.totalFeesPaid || 0,
        },
        attendance: mockData.attendance,
        healthInfo: mockData.healthInfo,
        extraCurricular: mockData.extraCurricular
      };
    });
  }, [graphqlStudents, getGradeById]);

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
      // Find the grade name from the selected grade id using school config
      const selectedGradeInfo = getGradeById(selectedGradeId);
      if (selectedGradeInfo) {
        const selectedGradeName = selectedGradeInfo.grade.name;
        
                 // Convert the selected grade to Form if it's Grade 7+
         const convertGradeToForm = (gradeName: string): string => {
           const gradeMatch = gradeName.match(/Grade\s+(\d+)/i);
           if (gradeMatch) {
             const gradeNumber = parseInt(gradeMatch[1]);
             if (gradeNumber >= 7 && gradeNumber <= 12) {
               const formNumber = gradeNumber - 6;
               return `Form ${formNumber}`;
             }
           }
           return gradeName;
         };
        
        const convertedSelectedGrade = convertGradeToForm(selectedGradeName);
        
        // Filter students based on converted grade names
        result = result.filter(student => {
          const studentGrade = student.grade?.toLowerCase();
          const studentClass = student.class?.toLowerCase();
          const selectedGrade = convertedSelectedGrade.toLowerCase();
          
          // Check for exact match with converted grade name
          if (studentGrade === selectedGrade || studentClass === selectedGrade) {
              return true;
            }
          
          // Check if student grade/class contains the selected grade
          if (studentGrade?.includes(selectedGrade) || studentClass?.includes(selectedGrade)) {
            return true;
          }
          
          // Handle Form matching (e.g., "Form 1" matches "form 1", "form1")
          const formMatch = selectedGrade.match(/form\s*(\d+)/i);
          if (formMatch) {
            const formNumber = formMatch[1];
            if (studentGrade?.includes(`form ${formNumber}`) || 
                studentGrade?.includes(`form${formNumber}`) ||
                studentClass?.includes(`form ${formNumber}`) ||
                studentClass?.includes(`form${formNumber}`)) {
              return true;
            }
          }
          
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
          // Handle Form grades for sorting (Form 1, Form 2, etc.)
          const getGradeNumber = (grade: string): number => {
            const formMatch = grade.match(/Form\s*(\d+)/i);
            if (formMatch) {
              const formNumber = parseInt(formMatch[1]);
              // Form 1 = 7, Form 2 = 8, Form 3 = 9, Form 4 = 10, Form 5 = 11, Form 6 = 12
              return formNumber + 6;
            }
            const gradeMatch = grade.match(/Grade\s*(\d+)/i);
            if (gradeMatch) {
              return parseInt(gradeMatch[1]);
            }
            return parseInt(grade) || 0;
          };
          valA = getGradeNumber(a.grade);
          valB = getGradeNumber(b.grade);
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

  // Add a mounted state to prevent hydration issues
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Find the selected student details
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find(student => student.id === selectedStudentId);
  }, [selectedStudentId, students]);

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="flex h-full">
        <div className="hidden md:flex flex-col w-96 border-r overflow-y-auto p-6 shrink-0 bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">Search Students</h2>
            <p className="text-sm text-muted-foreground">Find students by name</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Student Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  className="pl-9 h-12 text-base"
                  disabled
                />
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Students <span className="text-muted-foreground">(0)</span></h3>
            </div>
            <div className="space-y-2">
              <div className="text-center py-8 text-muted-foreground">
                Loading students...
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
            </div>
            <h2 className="text-2xl font-medium mb-2">Loading student information</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please wait while we load the student data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Search filter column - styled to match theme */}
      <div className="hidden md:flex flex-col w-96 border-r border-primary/20 overflow-y-auto p-6 shrink-0 bg-white dark:bg-slate-900">

        <div className="space-y-6">
          {/* Name Search */}
          <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
            <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
              <label className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                <Search className="h-3 w-3 mr-2" />
                Student Name
              </label>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-primary" />
              <Input
                type="text"
                placeholder="Search by name..."
                className="pl-9 h-12 text-base font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setDisplayedStudentsCount(10); // Reset to show first 10 when searching
                }}
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
                  setDisplayedStudentsCount(10); // Reset to show first 10
                }} 
                className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
        
        {/* Student List with Filtering and Pagination */}
        <div className="mt-8 border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">Students</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Showing {Math.min(displayedStudentsCount, filteredAndSortedStudents.length)} of {filteredAndSortedStudents.length} students
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">
              {filteredAndSortedStudents.length}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            {filteredAndSortedStudents.length === 0 ? (
              <div className="text-center py-8 text-slate-600 dark:text-slate-400 font-medium">
                No students match your search criteria
              </div>
            ) : (
              filteredAndSortedStudents.slice(0, displayedStudentsCount).map((student) => {
                return (
                  <div
                    key={student.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      student.id === selectedStudentId 
                        ? 'bg-primary/10 border-primary/40 shadow-md' 
                        : 'bg-white dark:bg-slate-800 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedStudentId(student.id)}
                    title="Click to view student details"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            student.status === 'active' ? 'bg-green-500' : 
                            student.status === 'inactive' ? 'bg-gray-400' : 'bg-red-500'
                          }`} />
                          <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
                            {student.name}
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                          {student.admissionNumber}
                        </div>
                      </div>
                      <div className="text-sm font-mono text-primary font-medium">
                        {student.class}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Info */}
          {filteredAndSortedStudents.length > displayedStudentsCount && (
            <div className="border-t border-primary/20 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  Showing {displayedStudentsCount} of {filteredAndSortedStudents.length} students
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDisplayedStudentsCount(prev => Math.min(prev + 10, filteredAndSortedStudents.length))}
                  className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono text-xs"
                >
                  Load More ({Math.min(10, filteredAndSortedStudents.length - displayedStudentsCount)})
                </Button>
              </div>
            </div>
          )}
          
          {/* Show All Loaded Message */}
          {displayedStudentsCount >= filteredAndSortedStudents.length && filteredAndSortedStudents.length > 10 && (
            <div className="border-t border-primary/20 pt-4">
              <div className="flex items-center justify-center">
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  All {filteredAndSortedStudents.length} students loaded
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content column - Grade Filter and Student Details */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              Students
            </h1>
          </div>
          <CreateStudentDrawer onStudentCreated={(studentName) => {
            // Refetch students data to ensure search filter updates
            refetch();
            // Clear grade and status filters to show the new student
            setSelectedGradeId('all');
            setSelectedStatus('');
            setSelectedClass('');
            // If student name is provided, search for the new student
            if (studentName) {
              setSearchTerm(studentName);
            } else {
              setSearchTerm('');
            }
          }} />
        </div>
        
        {/* Student Details Section */}
        {selectedStudent ? (
          // Show detailed student view
          <div className="space-y-6">
            {/* Back button */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedStudentId(null)}
                className="flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono"
              >
                ← Back to Students
              </Button>
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-4">
                <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-2">
                  <span className="text-xs font-mono uppercase tracking-wide text-primary">
                    Student Details
                  </span>
                </div>
                <h2 className="text-xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                  {selectedStudent.name}
                </h2>
              </div>
          </div>
          
            {/* Student profile header */}
            <div className="border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Student photo */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
                    {selectedStudent.photo ? (
                      <img 
                        src={selectedStudent.photo} 
                        alt={selectedStudent.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <User className="h-12 w-12 text-primary" />
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
                    <h2 className="text-2xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">{selectedStudent.name}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Info className="h-3.5 w-3.5 text-primary" />
                        <span>ID: {selectedStudent.admissionNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <School className="h-3.5 w-3.5 text-primary" />
                        <span>Class: {selectedStudent.class}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-primary" />
                        <span>Age: {selectedStudent.age}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Badge className={`font-mono text-xs capitalize border-2 ${
                      selectedStudent.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                        : selectedStudent.status === 'inactive' 
                          ? 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
                          : selectedStudent.status === 'suspended' 
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' 
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                    }`}>
                      {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="capitalize font-mono border-primary/20 text-primary">
                      {selectedStudent.gender}
                    </Badge>
                    <Badge variant="outline" className="capitalize font-mono border-primary/20 text-primary">
                      Grade {selectedStudent.grade}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Student details tabs */}
            <Tabs defaultValue="details">
              <TabsList className="grid grid-cols-5 mb-6 border-2 border-primary/20 bg-primary/5 rounded-xl p-1">
                <TabsTrigger value="details" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Details</TabsTrigger>
                <TabsTrigger value="attendance" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Attendance</TabsTrigger>
                <TabsTrigger value="academics" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Academics</TabsTrigger>
                <TabsTrigger value="fees" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Fees</TabsTrigger>
                <TabsTrigger value="documents" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card className="border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <CardHeader className="border-b-2 border-primary/20 bg-primary/5">
                    <CardTitle className="font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">Student Information</CardTitle>
                    <CardDescription className="font-mono text-slate-600 dark:text-slate-400">
                      Detailed personal information about {selectedStudent.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                        <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                          <h3 className="text-xs font-mono uppercase tracking-wide text-primary">Personal Details</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-primary/10">
                            <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Full Name</div>
                            <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{selectedStudent.name}</div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-primary/10">
                            <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Age</div>
                            <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{selectedStudent.age} years</div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-primary/10">
                            <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Gender</div>
                            <div className="font-mono text-sm text-slate-900 dark:text-slate-100 capitalize">{selectedStudent.gender}</div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-primary/10">
                            <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Admission Number</div>
                            <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{selectedStudent.admissionNumber}</div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-primary/10">
                            <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Admission Date</div>
                            <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{selectedStudent.admissionDate}</div>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Status</div>
                            <div className="font-mono text-sm text-slate-900 dark:text-slate-100 capitalize">{selectedStudent.status}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                        <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                          <h3 className="text-xs font-mono uppercase tracking-wide text-primary">Contact Information</h3>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-primary/10">
                            <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Guardian Name</div>
                            <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{selectedStudent.contacts.primaryGuardian}</div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-primary/10">
                            <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Guardian Phone</div>
                            <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{selectedStudent.contacts.guardianPhone}</div>
                          </div>
                          {selectedStudent.contacts.guardianEmail && (
                            <div className="flex justify-between items-center py-2 border-b border-primary/10">
                              <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Guardian Email</div>
                              <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{selectedStudent.contacts.guardianEmail}</div>
                            </div>
                          )}
                          {selectedStudent.contacts.homeAddress && (
                            <div className="flex justify-between items-center py-2">
                              <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Address</div>
                              <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{selectedStudent.contacts.homeAddress}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="academics">
                <Card className="border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <CardHeader className="border-b-2 border-primary/20 bg-primary/5">
                    <CardTitle className="font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">Academic Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                        <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                          <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                            <BookOpen className="h-3 w-3 mr-2" />
                            Current Performance
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="border-2 border-primary/20 bg-white dark:bg-slate-700 rounded-xl p-4">
                            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">Average Grade</div>
                            <div className="text-2xl font-mono font-bold text-primary">{selectedStudent.academicDetails?.averageGrade || 'N/A'}</div>
                          </div>
                          <div className="border-2 border-primary/20 bg-white dark:bg-slate-700 rounded-xl p-4">
                            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">Class Rank</div>
                            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                              {selectedStudent.academicDetails?.classRank || 'N/A'}
                              <span className="text-xs font-normal ml-1 text-slate-600 dark:text-slate-400">/ {selectedStudent.academicDetails?.classRank ? '30' : '0'}</span>
                            </div>
                          </div>
                          <div className="border-2 border-primary/20 bg-white dark:bg-slate-700 rounded-xl p-4">
                            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">Stream Rank</div>
                            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                              {selectedStudent.academicDetails?.streamRank || 'N/A'}
                              <span className="text-xs font-normal ml-1 text-slate-600 dark:text-slate-400">/ {selectedStudent.academicDetails?.streamRank ? '15' : '0'}</span>
                            </div>
                          </div>
                          <div className="border-2 border-primary/20 bg-white dark:bg-slate-700 rounded-xl p-4">
                            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">Year Rank</div>
                            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                              {selectedStudent.academicDetails?.yearRank || 'N/A'}
                              <span className="text-xs font-normal ml-1 text-slate-600 dark:text-slate-400">/ {selectedStudent.academicDetails?.yearRank ? '120' : '0'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                        <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                          <h3 className="text-xs font-mono uppercase tracking-wide text-primary">Exam History</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b-2 border-primary/20">
                                <th className="text-left p-3 font-mono font-bold text-primary">Term</th>
                                <th className="text-left p-3 font-mono font-bold text-primary">Average</th>
                                <th className="text-left p-3 font-mono font-bold text-primary">Class Rank</th>
                                <th className="text-left p-3 font-mono font-bold text-primary">Stream Rank</th>
                                <th className="text-left p-3 font-mono font-bold text-primary">Comments</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-primary/10 hover:bg-primary/5">
                                <td className="p-3 font-mono text-slate-700 dark:text-slate-300">Term 1, 2023</td>
                                <td className="p-3 font-mono font-medium text-primary">A-</td>
                                <td className="p-3 font-mono text-slate-700 dark:text-slate-300">3 / 30</td>
                                <td className="p-3 font-mono text-slate-700 dark:text-slate-300">1 / 15</td>
                                <td className="p-3 font-mono text-slate-600 dark:text-slate-400">Excellent performance</td>
                              </tr>
                              <tr className="border-b border-primary/10 hover:bg-primary/5">
                                <td className="p-3 font-mono text-slate-700 dark:text-slate-300">Term 3, 2022</td>
                                <td className="p-3 font-mono font-medium text-primary">B+</td>
                                <td className="p-3 font-mono text-slate-700 dark:text-slate-300">4 / 30</td>
                                <td className="p-3 font-mono text-slate-700 dark:text-slate-300">2 / 15</td>
                                <td className="p-3 font-mono text-slate-600 dark:text-slate-400">Good improvement</td>
                              </tr>
                              <tr className="border-b border-primary/10 hover:bg-primary/5">
                                <td className="p-3 font-mono text-slate-700 dark:text-slate-300">Term 2, 2022</td>
                                <td className="p-3 font-mono font-medium text-primary">B</td>
                                <td className="p-3 font-mono text-slate-700 dark:text-slate-300">6 / 30</td>
                                <td className="p-3 font-mono text-slate-700 dark:text-slate-300">3 / 15</td>
                                <td className="p-3 font-mono text-slate-600 dark:text-slate-400">Consistent performance</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      {selectedStudent.academicDetails?.kcsePrediction && (
                        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                            <h3 className="text-xs font-mono uppercase tracking-wide text-primary">KCSE Prediction</h3>
                          </div>
                          <div className="border-2 border-primary/20 bg-white dark:bg-slate-700 rounded-xl p-4 inline-block">
                            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">Predicted Grade</div>
                            <div className="text-3xl font-mono font-bold text-primary">{selectedStudent.academicDetails.kcsePrediction}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="attendance">
                <Card className="border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <CardHeader className="border-b-2 border-primary/20 bg-primary/5">
                    <CardTitle className="font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">Attendance Records</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center p-8 text-slate-600 dark:text-slate-400 font-mono">
                      Attendance records will appear here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="fees">
                <Card className="border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                  <CardHeader className="border-b-2 border-primary/20 bg-primary/5">
                    <CardTitle className="font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">Fee Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center p-8 text-slate-600 dark:text-slate-400 font-mono">
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
                    {selectedStudent && (
                      <div className="space-y-4">
                        {/* Report Card Section */}
                        <div className="border border-[#246a59]/20 rounded-lg overflow-hidden">
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedDocuments);
                              if (newExpanded.has('report-card')) {
                                newExpanded.delete('report-card');
                              } else {
                                newExpanded.add('report-card');
                              }
                              setExpandedDocuments(newExpanded);
                            }}
                            className="w-full p-4 bg-[#246a59]/5 hover:bg-[#246a59]/10 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#246a59] rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold text-[#246a59]">Academic Report Card</h3>
                                <p className="text-sm text-gray-600">Term 1, 2024</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {expandedDocuments.has('report-card') ? (
                                <ChevronDown className="w-5 h-5 text-[#246a59]" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-[#246a59]" />
                              )}
                            </div>
                          </button>
                          
                          {expandedDocuments.has('report-card') && (
                            <div className="p-4 border-t border-[#246a59]/20 bg-white">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Template:</span>
                                    <select
                                      value={selectedTemplate}
                                      onChange={(e) => setSelectedTemplate(e.target.value as 'modern' | 'classic' | 'compact' | 'uganda-classic')}
                                      className="border border-[#246a59]/30 rounded px-2 py-1 text-sm bg-white"
                                    >
                                      <option value="modern">Modern</option>
                                      <option value="classic">Classic</option>
                                      <option value="compact">Compact</option>
                                      <option value="uganda-classic">Uganda Classic</option>
                                    </select>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-[#246a59]/30 text-[#246a59] hover:bg-[#246a59]/10"
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Download PDF
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-[#246a59]/30 text-[#246a59] hover:bg-[#246a59]/10"
                                    >
                                      <Printer className="w-4 h-4 mr-2" />
                                      Print
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Report Card Component */}
                              <div className="border border-[#246a59]/20 rounded-lg overflow-hidden">
                                <SchoolReportCard
                                  student={{
                                    id: selectedStudent.id,
                                    name: selectedStudent.name,
                                    admissionNumber: selectedStudent.admissionNumber,
                                    gender: selectedStudent.gender,
                                    grade: selectedStudent.grade,
                                    stream: selectedStudent.stream,
                                    user: { email: selectedStudent.contacts?.guardianEmail || '' }
                                  }}
                                  school={{
                                    id: config?.id || 'school-id',
                                    schoolName: config?.tenant?.schoolName || 'School Name',
                                    subdomain: config?.tenant?.subdomain || 'school'
                                  }}
                                  subjects={config?.selectedLevels?.flatMap(level => level.subjects) || []}
                                  term="1"
                                  year="2024"
                                  template={selectedTemplate}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Other Documents Section */}
                        <div className="border border-[#246a59]/20 rounded-lg overflow-hidden">
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedDocuments);
                              if (newExpanded.has('other-docs')) {
                                newExpanded.delete('other-docs');
                              } else {
                                newExpanded.add('other-docs');
                              }
                              setExpandedDocuments(newExpanded);
                            }}
                            className="w-full p-4 bg-[#246a59]/5 hover:bg-[#246a59]/10 transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#246a59] rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold text-[#246a59]">Other Documents</h3>
                                <p className="text-sm text-gray-600">Additional student documents</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {expandedDocuments.has('other-docs') ? (
                                <ChevronDown className="w-5 h-5 text-[#246a59]" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-[#246a59]" />
                              )}
                            </div>
                          </button>
                          
                          {expandedDocuments.has('other-docs') && (
                            <div className="p-4 border-t border-[#246a59]/20 bg-white">
                              <div className="text-center p-8 text-muted-foreground">
                                Additional student documents will appear here
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          // Show grade filter and table
          <>
            {/* Stats Section - Only show when viewing all grades */}
            {selectedGradeId === 'all' && (
              <div className="mb-8">
                <StudentsStats
                  totalStudents={students.length}
                  studentsAddedToday={Math.floor(Math.random() * 5) + 1} // Mock data
                  absentToday={Math.floor(Math.random() * 20) + 5}
                  presentToday={students.length - (Math.floor(Math.random() * 20) + 5)}
                  classesWithMarkedRegisters={Math.floor(Math.random() * 15) + 10}
                  totalClasses={20}
                  topPerformingGrade="Form 4"
                  studentsWithScholarships={Math.floor(Math.random() * 15) + 5}
                  newAdmissionsThisMonth={Math.floor(Math.random() * 20) + 10}
                  feeDefaulters={Math.floor(Math.random() * 10) + 2}
                  averageGrade="B+"
                />
              </div>
            )}

            {/* Grade Filter Section */}
            <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-2">
                    <span className="text-xs font-mono uppercase tracking-wide text-primary">
                      Grade Filter
                    </span>
                  </div>
                  <h2 className="text-xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                    Filter by Grade Level
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                    Select a specific grade to view students or view all grades
                  </p>
                </div>
                {selectedGradeId !== 'all' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedGradeId('all')}
                    className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
              
              {/* All Grades Grid */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-primary/20 p-6">
                <div className="flex flex-wrap gap-3">
                  {/* All Grades Button */}
                  <Button
                    variant={selectedGradeId === 'all' ? "default" : "outline"}
                    size="sm"
                    className={`font-mono min-w-[6rem] h-10 rounded-lg transition-all duration-200 font-semibold tracking-wide ${
                      selectedGradeId === 'all' 
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-2 border-primary/80' 
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedGradeId('all')}
                  >
                    All Grades
                  </Button>
                  
                  {/* Grade Buttons */}
                  {(() => {
                    const allGrades = enhancedGradeLevels.flatMap(level => level.grades);
                    console.log('All grades before processing:', allGrades.map(g => g.name));
                    console.log('Enhanced grade levels:', enhancedGradeLevels.map(level => ({
                      levelName: level.levelName,
                      grades: level.grades.map(g => g.name)
                    })));
                    return allGrades;
                  })()
                    .sort((a, b) => {
                      // Sort grades logically: PP1, PP2, G1, G2, G3, G4, G5, G6, F1, F2, F3, F4, F5, F6
                      const getGradeOrder = (gradeName: string): number => {
                        const lowerName = gradeName.toLowerCase();
                        if (lowerName.includes('pp1') || lowerName.includes('baby')) return 1;
                        if (lowerName.includes('pp2') || lowerName.includes('nursery')) return 2;
                        if (lowerName.includes('pp3') || lowerName.includes('reception')) return 3;
                        // Check for higher grades first (more specific matches)
                        if (lowerName.includes('grade 12') || lowerName.includes('form 6') || lowerName.includes('f6')) return 15;
                        if (lowerName.includes('grade 11') || lowerName.includes('form 5') || lowerName.includes('f5')) return 14;
                        if (lowerName.includes('grade 10') || lowerName.includes('form 4') || lowerName.includes('f4')) return 13;
                        if (lowerName.includes('grade 9') || lowerName.includes('form 3') || lowerName.includes('f3')) return 12;
                        if (lowerName.includes('grade 8') || lowerName.includes('form 2') || lowerName.includes('f2')) return 11;
                        if (lowerName.includes('grade 7') || lowerName.includes('form 1') || lowerName.includes('f1')) return 10;
                        if (lowerName.includes('grade 6') || lowerName.includes('g6')) return 9;
                        if (lowerName.includes('grade 5') || lowerName.includes('g5')) return 8;
                        if (lowerName.includes('grade 4') || lowerName.includes('g4')) return 7;
                        if (lowerName.includes('grade 3') || lowerName.includes('g3')) return 6;
                        if (lowerName.includes('grade 2') || lowerName.includes('g2')) return 5;
                        if (lowerName.includes('grade 1') || lowerName.includes('g1')) return 4;
                        return 999; // Unknown grades at the end
                      };
                      const orderA = getGradeOrder(a.name);
                      const orderB = getGradeOrder(b.name);
                      console.log(`Sorting: ${a.name} (${orderA}) vs ${b.name} (${orderB})`);
                      return orderA - orderB;
                    })
                    .filter((grade, index, array) => {
                      // Remove duplicates based on short name
                      const getShortName = (gradeName: string): string => {
                        const lowerName = gradeName.toLowerCase();
                        if (lowerName.includes('pp1') || lowerName.includes('baby')) return 'PP1';
                        if (lowerName.includes('pp2') || lowerName.includes('nursery')) return 'PP2';
                        if (lowerName.includes('pp3') || lowerName.includes('reception')) return 'PP3';
                        // Check for higher grades first (more specific matches)
                        if (lowerName.includes('grade 12') || lowerName.includes('form 6') || lowerName.includes('f6')) return 'F6';
                        if (lowerName.includes('grade 11') || lowerName.includes('form 5') || lowerName.includes('f5')) return 'F5';
                        if (lowerName.includes('grade 10') || lowerName.includes('form 4') || lowerName.includes('f4')) return 'F4';
                        if (lowerName.includes('grade 9') || lowerName.includes('form 3') || lowerName.includes('f3')) return 'F3';
                        if (lowerName.includes('grade 8') || lowerName.includes('form 2') || lowerName.includes('f2')) return 'F2';
                        if (lowerName.includes('grade 7') || lowerName.includes('form 1') || lowerName.includes('f1')) return 'F1';
                        if (lowerName.includes('grade 6') || lowerName.includes('g6')) return 'G6';
                        if (lowerName.includes('grade 5') || lowerName.includes('g5')) return 'G5';
                        if (lowerName.includes('grade 4') || lowerName.includes('g4')) return 'G4';
                        if (lowerName.includes('grade 3') || lowerName.includes('g3')) return 'G3';
                        if (lowerName.includes('grade 2') || lowerName.includes('g2')) return 'G2';
                        if (lowerName.includes('grade 1') || lowerName.includes('g1')) return 'G1';
                        return gradeName.substring(0, 3).toUpperCase(); // Fallback
                      };
                      
                      const currentShortName = getShortName(grade.name);
                      const firstIndex = array.findIndex(g => getShortName(g.name) === currentShortName);
                      const shouldKeep = index === firstIndex;
                      if (!shouldKeep) {
                        console.log(`Filtering out duplicate grade: ${grade.name} (${currentShortName})`);
                      }
                      return shouldKeep; // Keep only the first occurrence of each short name
                    })
                    .map((grade, index, array) => {
                      // Create a short display name
                      const getShortName = (gradeName: string): string => {
                        const lowerName = gradeName.toLowerCase();
                        if (lowerName.includes('pp1') || lowerName.includes('baby')) return 'PP1';
                        if (lowerName.includes('pp2') || lowerName.includes('nursery')) return 'PP2';
                        if (lowerName.includes('pp3') || lowerName.includes('reception')) return 'PP3';
                        // Check for higher grades first (more specific matches)
                        if (lowerName.includes('grade 12') || lowerName.includes('form 6') || lowerName.includes('f6')) return 'F6';
                        if (lowerName.includes('grade 11') || lowerName.includes('form 5') || lowerName.includes('f5')) return 'F5';
                        if (lowerName.includes('grade 10') || lowerName.includes('form 4') || lowerName.includes('f4')) return 'F4';
                        if (lowerName.includes('grade 9') || lowerName.includes('form 3') || lowerName.includes('f3')) return 'F3';
                        if (lowerName.includes('grade 8') || lowerName.includes('form 2') || lowerName.includes('f2')) return 'F2';
                        if (lowerName.includes('grade 7') || lowerName.includes('form 1') || lowerName.includes('f1')) return 'F1';
                        if (lowerName.includes('grade 6') || lowerName.includes('g6')) return 'G6';
                        if (lowerName.includes('grade 5') || lowerName.includes('g5')) return 'G5';
                        if (lowerName.includes('grade 4') || lowerName.includes('g4')) return 'G4';
                        if (lowerName.includes('grade 3') || lowerName.includes('g3')) return 'G3';
                        if (lowerName.includes('grade 2') || lowerName.includes('g2')) return 'G2';
                        if (lowerName.includes('grade 1') || lowerName.includes('g1')) return 'G1';
                        return gradeName.substring(0, 3).toUpperCase(); // Fallback
                      };
                      
                      const shortName = getShortName(grade.name);
                      const isSelected = selectedGradeId === grade.id;
                      
                      // Determine grade level for styling
                      const getGradeLevel = (shortName: string): string => {
                        if (shortName.startsWith('PP')) return 'preschool';
                        if (shortName.startsWith('G')) return 'primary';
                        if (shortName.startsWith('F')) return 'secondary';
                        return 'other';
                      };
                      
                      const gradeLevel = getGradeLevel(shortName);
                      
                      // Get level-specific styling
                      const getLevelStyles = (level: string, isSelected: boolean) => {
                        const baseStyles = "font-mono min-w-[3.5rem] h-10 rounded-lg transition-all duration-200 font-semibold tracking-wide";
                        
                        if (isSelected) {
                          switch (level) {
                            case 'preschool':
                              return `${baseStyles} bg-slate-800 text-white shadow-lg shadow-slate-800/25 border-2 border-slate-700`;
                            case 'primary':
                              return `${baseStyles} bg-slate-700 text-white shadow-lg shadow-slate-700/25 border-2 border-slate-600`;
                            case 'secondary':
                              return `${baseStyles} bg-slate-600 text-white shadow-lg shadow-slate-600/25 border-2 border-slate-500`;
                            default:
                              return `${baseStyles} bg-primary text-white shadow-lg shadow-primary/25 border-2 border-primary/80`;
                          }
                        } else {
                          switch (level) {
                            case 'preschool':
                              return `${baseStyles} bg-slate-50 text-slate-700 border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:shadow-md`;
                            case 'primary':
                              return `${baseStyles} bg-slate-100 text-slate-700 border-2 border-slate-300 hover:bg-slate-200 hover:border-slate-400 hover:shadow-md`;
                            case 'secondary':
                              return `${baseStyles} bg-white text-slate-700 border-2 border-slate-400 hover:bg-slate-50 hover:border-slate-500 hover:shadow-md`;
                            default:
                              return `${baseStyles} bg-white text-slate-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md`;
                          }
                        }
                      };
                      
                      // Add level separators
                      const shouldAddSeparator = () => {
                        if (index === 0) return false;
                        const prevGrade = array[index - 1];
                        const prevShortName = getShortName(prevGrade.name);
                        const prevLevel = getGradeLevel(prevShortName);
                        return prevLevel !== gradeLevel;
                      };
                      
                      return (
                        <React.Fragment key={grade.id}>
                          {shouldAddSeparator() && (
                            <div className="w-px h-8 bg-primary/30 mx-2 self-center" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`font-mono min-w-[3.5rem] h-10 rounded-lg transition-all duration-200 font-semibold tracking-wide ${
                              isSelected
                                ? 'bg-primary text-white shadow-lg shadow-primary/25 border-2 border-primary/80'
                                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md'
                            }`}
                            onClick={() => setSelectedGradeId(grade.id)}
                            title={grade.name} // Show full name on hover
                          >
                            {shortName}
                          </Button>
                        </React.Fragment>
                      );
                    })}
                </div>
              </div>
              
                            {/* Current Selection Indicator */}
              {selectedGradeId !== 'all' && (
                <div className="mt-6 flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
                    <School className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-mono text-slate-700 dark:text-slate-300">Currently viewing:</span>
                    <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 font-mono">
                      {getGradeById(selectedGradeId)?.grade.name || 'All Grades'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Students Table */}
            <AllGradesStudentsTable
              students={filteredAndSortedStudents.map(s => ({
                id: s.id,
                name: s.name,
                session: s.admissionDate, // or use a real session field if available
                gender: s.gender,
                dob: s.admissionDate, // or s.dob if available
                class: s.class,
                section: s.stream || "-",
                guardianName: s.contacts?.primaryGuardian || "-",
                guardianEmail: s.contacts?.guardianEmail || "-",
                guardianMobile: s.contacts?.guardianPhone || "-",
                status: s.status,
              }))}
              onStudentClick={setSelectedStudentId}
            />
          </>
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
                {student.admissionDate}
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
                  {student.feeStatus.lastPaymentDate}
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
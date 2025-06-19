"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
// No longer using StudentSearchFilter component for this view
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    if (selectedGrade) {
      result = result.filter(student => student.grade === selectedGrade);
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
  }, [students, searchTerm, selectedClass, selectedGrade, selectedStatus, sortField, sortDirection]);
  
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

      {/* Search filter column - expanded to take up more space */}
      <div className="hidden md:flex flex-col w-96 border-r overflow-y-auto p-6 shrink-0 bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Search Students</h2>
          <p className="text-sm text-muted-foreground">Find students by name or grade</p>
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

          {/* Grade Filter Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Filter by Grade</label>
              {selectedGradeId !== 'all' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedGradeId('all')} 
                  className="h-7 px-2 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            
            {/* Education Level Headers */}
            <div className="space-y-4">
              {/* Preschool */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getLevelIcon('preschool')}
                  <h4 className="text-sm font-medium">Preschool</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mockGrades
                    .filter(grade => grade.level === 'preschool')
                    .map(grade => (
                      <GradeButton 
                        key={grade.id} 
                        grade={grade} 
                        selectedGradeId={selectedGradeId} 
                        onClick={setSelectedGradeId} 
                      />
                    ))
                  }
                </div>
              </div>
              
              {/* Primary */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getLevelIcon('primary')}
                  <h4 className="text-sm font-medium">Primary</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mockGrades
                    .filter(grade => grade.level === 'primary')
                    .map(grade => (
                      <GradeButton 
                        key={grade.id} 
                        grade={grade} 
                        selectedGradeId={selectedGradeId} 
                        onClick={setSelectedGradeId} 
                      />
                    ))
                  }
                </div>
              </div>
              
              {/* Junior Secondary */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getLevelIcon('junior-secondary')}
                  <h4 className="text-sm font-medium">Junior Secondary</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mockGrades
                    .filter(grade => grade.level === 'junior-secondary')
                    .map(grade => (
                      <GradeButton 
                        key={grade.id} 
                        grade={grade} 
                        selectedGradeId={selectedGradeId} 
                        onClick={setSelectedGradeId} 
                      />
                    ))
                  }
                </div>
              </div>
              
              {/* Senior Secondary */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getLevelIcon('senior-secondary')}
                  <h4 className="text-sm font-medium">Senior Secondary</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {mockGrades
                    .filter(grade => grade.level === 'senior-secondary')
                    .map(grade => (
                      <GradeButton 
                        key={grade.id} 
                        grade={grade} 
                        selectedGradeId={selectedGradeId} 
                        onClick={setSelectedGradeId} 
                      />
                    ))
                  }
                </div>
              </div>
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
            <h3 className="text-base font-medium">
              {searchTerm || selectedGradeId !== 'all' ? 'Filtered Students' : 'All Students'}
            </h3>
            
            {/* Filter badges */}
            <div className="flex items-center gap-1">
              {selectedGradeId !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  {mockGrades.find(g => g.id === selectedGradeId)?.displayName || ''}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {students
              .filter(student => {
                // Filter by search term if present
                const nameMatch = searchTerm ? 
                  student.name.toLowerCase().includes(searchTerm.toLowerCase()) : 
                  true;
                
                // Filter by grade if selected
                const selectedGrade = mockGrades.find(g => g.id === selectedGradeId);
                const gradeMatch = selectedGradeId !== 'all' && selectedGrade ? 
                  student.class?.startsWith(selectedGrade.displayName) : 
                  true;
                  
                return nameMatch && gradeMatch;
              })
                .map(student => {
                  // Calculate fees balance
                  const feesBalance = (student as any).fees?.balance || 0;
                  const formattedBalance = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'KES',
                    minimumFractionDigits: 0,
                  }).format(feesBalance);
                  
                  return (
                    <div 
                      key={student.id}
                      className={`flex flex-col p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${selectedStudentId === student.id ? 'bg-primary/5 border border-primary/20' : 'border'}`}
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shadow-sm">
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-semibold text-base truncate">{student.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{student.class} {student.stream}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-muted-foreground">Gender:</span> 
                          <span className="font-medium">{student.gender || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs justify-end">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="outline" className="h-5 text-xs px-1 capitalize">
                            {student.status || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-muted-foreground">Admission:</span> 
                          <span className="font-medium">{(student as any).admissionNo || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs justify-end">
                          <span className="text-muted-foreground">Fees:</span> 
                          <span className={`font-medium ${feesBalance > 0 ? 'text-red-500' : ''}`}>
                            {formattedBalance}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
              {students.filter(student => {
                const nameMatch = searchTerm ? student.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
                const gradeMatch = selectedGradeId !== 'all' ? 
                  student.class?.includes(mockGrades.find(g => g.id === selectedGradeId)?.displayName || '') : 
                  true;
                return nameMatch && gradeMatch;
              }).length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  No students match your filters
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Main content column - Student Details */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {selectedStudent ? 'Student Details' : 'Loading Student Information'}
            </h1>
          </div>
          <Button variant="default" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add New Student
          </Button>
        </div>


        {!selectedStudent ? (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <div className="bg-muted/30 rounded-full p-6 mb-4">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-medium mb-2">No student selected</h2>
            <p className="text-muted-foreground max-w-md">
              Please select a student from the list on the left to view their complete details, attendance records, academic performance, and other information.
            </p>
          </div>
        ) : (
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
    <Card className="overflow-hidden" style={{ borderLeft: "4px solid", borderLeftColor: "#0ea5e9" }}>
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


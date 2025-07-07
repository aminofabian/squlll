"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateParentDrawer } from './components/CreateParentDrawer';
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
  Users,
  UserCheck,
  Baby,
  UserPlus,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

// Parent/Guardian type
type Parent = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  relationship: "father" | "mother" | "guardian" | "other";
  occupation?: string;
  workAddress?: string;
  homeAddress?: string;
  emergencyContact?: string;
  idNumber?: string; // National ID for Kenya
  students: {
    id: string;
    name: string;
    grade: string;
    class: string;
    stream?: string;
    admissionNumber: string;
  }[];
  status: "active" | "inactive";
  registrationDate: string;
  lastContact?: string;
  communicationPreferences: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  feeStatus?: {
    totalOwed: number;
    lastPayment?: string;
    paymentMethod?: string;
  };
};

// Education level type for filtering
type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary' | 'all'

// Grade type for filtering
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
      return <Baby className="h-4 w-4" />
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
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'primary':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'junior-secondary':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'senior-secondary':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Grade Button Component
const GradeButton = ({ grade, selectedGradeId, onClick }: { grade: Grade, selectedGradeId: string, onClick: (id: string) => void }) => (
  <Button
    key={grade.id}
    size="sm"
    variant={selectedGradeId === grade.id ? "default" : "outline"}
    className={`text-xs px-2 py-1 h-8 font-mono ${selectedGradeId === grade.id ? 'shadow-sm' : ''}`}
    onClick={() => onClick(grade.id)}
  >
    {grade.name}
  </Button>
)

// Helper function to format currency (Kenya Shillings)
const formatCurrency = (amount: number) => {
  return `KES ${amount.toLocaleString()}`;
};

// Mock data for grades (same as students page for filtering)
const mockGrades: Grade[] = [
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
    id: 'grade10',
    name: 'F4',
    displayName: 'Form 4',
    level: 'senior-secondary',
    ageGroup: '15 years',
    students: 68,
    classes: 3
  }
]

export default function ParentsPage() {
  // State for selected parent and filters
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  // Mock data for parents
  const parents: Parent[] = [
    {
      id: "1",
      name: "James Kamau",
      email: "james.kamau@example.com",
      phone: "+254722123456",
      relationship: "father",
      occupation: "Engineer",
      workAddress: "Nairobi CBD",
      homeAddress: "456 Moi Avenue, Nairobi",
      emergencyContact: "+254733987654",
      idNumber: "12345678",
      students: [
        {
          id: "1",
          name: "Wanjiku Kamau",
          grade: "F4",
          class: "Form 4 East",
          stream: "East",
          admissionNumber: "KPS/2023/001"
        }
      ],
      status: "active",
      registrationDate: "2023-01-15",
      lastContact: "2024-01-20",
      communicationPreferences: {
        sms: true,
        email: true,
        whatsapp: true
      },
      feeStatus: {
        totalOwed: 25000,
        lastPayment: "2024-01-10",
        paymentMethod: "M-Pesa"
      }
    },
    {
      id: "2",
      name: "Grace Wanjiru",
      email: "grace.wanjiru@gmail.com",
      phone: "+254788456789",
      relationship: "mother",
      occupation: "Teacher",
      homeAddress: "123 Kenyatta Avenue, Kiambu",
      emergencyContact: "+254722567890",
      idNumber: "87654321",
      students: [
        {
          id: "2",
          name: "Peter Wanjiru",
          grade: "G3",
          class: "Grade 3 Blue",
          stream: "Blue",
          admissionNumber: "KPS/2024/015"
        },
        {
          id: "3",
          name: "Mary Wanjiru",
          grade: "PP1",
          class: "PP1 Red",
          admissionNumber: "KPS/2024/025"
        }
      ],
      status: "active",
      registrationDate: "2024-01-10",
      lastContact: "2024-01-18",
      communicationPreferences: {
        sms: true,
        email: false,
        whatsapp: true
      },
      feeStatus: {
        totalOwed: 45000,
        lastPayment: "2024-01-05",
        paymentMethod: "Bank Transfer"
      }
    },
    {
      id: "3",
      name: "David Ochieng",
      phone: "+254712345678",
      relationship: "guardian",
      occupation: "Business Owner",
      homeAddress: "789 Uhuru Highway, Nakuru",
      emergencyContact: "+254723456789",
      students: [
        {
          id: "4",
          name: "Faith Akinyi",
          grade: "F2",
          class: "Form 2 West",
          stream: "West",
          admissionNumber: "KPS/2023/087"
        }
      ],
      status: "active",
      registrationDate: "2023-08-20",
      lastContact: "2024-01-15",
      communicationPreferences: {
        sms: true,
        email: false,
        whatsapp: false
      },
      feeStatus: {
        totalOwed: 0,
        lastPayment: "2024-01-12",
        paymentMethod: "Cash"
      }
    },
    {
      id: "4",
      name: "Sarah Muthoni",
      email: "s.muthoni@yahoo.com",
      phone: "+254700987654",
      relationship: "mother",
      occupation: "Nurse",
      workAddress: "Kenyatta Hospital",
      homeAddress: "234 Tom Mboya Street, Nairobi",
      emergencyContact: "+254711234567",
      idNumber: "34567890",
      students: [
        {
          id: "5",
          name: "John Muthoni",
          grade: "G1",
          class: "Grade 1 Green",
          stream: "Green",
          admissionNumber: "KPS/2024/045"
        }
      ],
      status: "active",
      registrationDate: "2024-01-05",
      communicationPreferences: {
        sms: true,
        email: true,
        whatsapp: true
      },
      feeStatus: {
        totalOwed: 15000,
        lastPayment: "2023-12-28",
        paymentMethod: "M-Pesa"
      }
    }
  ];

  // Filter parents based on search and filters
  const filteredParents = useMemo(() => {
    let filtered = parents.filter(parent => {
      const matchesSearch = parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           parent.phone.includes(searchTerm) ||
                           (parent.email && parent.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           parent.students.some(student => 
                             student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
                           );

      const matchesRelationship = selectedRelationship === '' || parent.relationship === selectedRelationship;
      const matchesStatus = selectedStatus === '' || parent.status === selectedStatus;
      
      const matchesGrade = selectedGradeId === 'all' || 
                          parent.students.some(student => student.grade === selectedGradeId);

      return matchesSearch && matchesRelationship && matchesStatus && matchesGrade;
    });

    // Sort parents
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'relationship':
          aValue = a.relationship;
          bValue = b.relationship;
          break;
        case 'registrationDate':
          aValue = new Date(a.registrationDate);
          bValue = new Date(b.registrationDate);
          break;
        case 'studentCount':
          aValue = a.students.length;
          bValue = b.students.length;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [parents, searchTerm, selectedRelationship, selectedStatus, selectedGradeId, sortField, sortDirection]);

  // Get selected parent
  const selectedParent = parents.find(parent => parent.id === selectedParentId);

    // Set initial selected parent when component mounts
  useEffect(() => {
    if (parents.length > 0 && !selectedParentId) {
      setSelectedParentId(parents[0].id);
    }
  }, [parents, selectedParentId]);
  useEffect(() => {
    if (parents.length > 0 && !selectedParentId) {
      setSelectedParentId(parents[0].id);
    }
  }, [parents, selectedParentId]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'father':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mother':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'guardian':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'other':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEducationLevel = (grade: string) => {
    const gradeInfo = mockGrades.find(g => g.id === grade);
    return gradeInfo?.level || 'primary';
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="flex h-full">
      {/* Search filter column - Parents list */}
      <div className={`hidden md:flex flex-col border-r overflow-y-auto shrink-0 bg-white transition-all duration-300 ease-in-out ${
        isSidebarMinimized ? 'w-16 p-2' : 'w-96 p-6'
      }`}>
        {/* Toggle button for minimize/expand */}
        <div className={`mb-4 ${isSidebarMinimized ? 'flex justify-center' : 'flex justify-between items-center'}`}>
          {!isSidebarMinimized && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Search Parents</h2>
              <p className="text-sm text-muted-foreground">Find parents and guardians</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="border-primary/30 hover:bg-primary/5"
            title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isSidebarMinimized ? (
          // Minimized view - only filters icon when active
          <div className="space-y-4">
            {/* Filters icon - only show when filters are active */}
            {(searchTerm || selectedRelationship || selectedStatus || selectedGradeId !== 'all') && (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-1">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-primary font-mono">Filters</span>
              </div>
            )}
          </div>
        ) : (
          // Full view
          <div className="space-y-6">
            {/* Name Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Parent/Guardian Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, phone, email..."
                  className="pl-9 h-12 text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter by Relationship */}
            <div>
              <label className="block text-sm font-medium mb-2">Relationship</label>
              <select
                value={selectedRelationship}
                onChange={(e) => setSelectedRelationship(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
              >
                <option value="">All Relationships</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Clear Search Button */}
            {(searchTerm || selectedRelationship || selectedStatus || selectedGradeId !== 'all') && (
              <div className="pt-1">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRelationship('');
                    setSelectedStatus('');
                    setSelectedGradeId('all');
                  }} 
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Parent List with Filtering */}
        {!isSidebarMinimized && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Parents <span className="text-muted-foreground">({filteredParents.length})</span></h3>
            </div>
            
            <div className="space-y-2">
              {filteredParents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No parents match your search criteria
                </div>
              ) : (
                filteredParents.map((parent) => (
                  <div
                    key={parent.id}
                    className={`p-3 rounded-md border transition-colors cursor-pointer ${parent.id === selectedParentId ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/30'}`}
                    onClick={() => setSelectedParentId(parent.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${parent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <div className="font-medium">{parent.name}</div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <Badge className={getRelationshipColor(parent.relationship)} variant="outline">
                            {parent.relationship}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {parent.students.length} student{parent.students.length !== 1 ? 's' : ''}
                        </div>
                        {parent.feeStatus && parent.feeStatus.totalOwed > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            Owes: {formatCurrency(parent.feeStatus.totalOwed)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main content column - Grade Filter and Parent Details */}
      <div className="flex-1 overflow-auto p-8 relative">
        {/* Floating toggle button when sidebar is minimized */}
        {isSidebarMinimized && (
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarMinimized(false)}
              className="border-primary/30 hover:bg-primary/5 shadow-lg bg-white"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {selectedParent ? 'Parent Details' : 'Select a Parent'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Sidebar toggle button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
              className="border-primary/30 hover:bg-primary/5"
              title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
            >
              {isSidebarMinimized ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
            <CreateParentDrawer onParentCreated={() => {}} />
          </div>
        </div>
        
        {/* Grade Filter Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filter by Student Grade</h2>
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
            <div className="rounded-lg overflow-hidden border border-purple-100 shadow-sm">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 flex items-center gap-2 border-b border-purple-200">
                {getLevelIcon('preschool')}
                <h3 className="font-medium text-purple-900">Preschool</h3>
              </div>
              <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2">
                  {mockGrades
                    .filter(grade => grade.level === 'preschool')
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
            
            {/* Primary Card */}
            <div className="rounded-lg overflow-hidden border border-blue-100 shadow-sm">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 flex items-center gap-2 border-b border-blue-200">
                {getLevelIcon('primary')}
                <h3 className="font-medium text-blue-900">Primary</h3>
              </div>
              <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2">
                  {mockGrades
                    .filter(grade => grade.level === 'primary')
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
            
            {/* Junior Secondary Card */}
            <div className="rounded-lg overflow-hidden border border-yellow-100 shadow-sm">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 flex items-center gap-2 border-b border-yellow-200">
                {getLevelIcon('junior-secondary')}
                <h3 className="font-medium text-yellow-900">Junior Secondary</h3>
              </div>
              <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2">
                  {mockGrades
                    .filter(grade => grade.level === 'junior-secondary')
                    .map(grade => (
                      <Button
                        key={grade.id}
                        variant={selectedGradeId === grade.id ? "default" : "outline"}
                        className={`h-10 ${selectedGradeId === grade.id ? 'bg-yellow-600 hover:bg-yellow-700' : 'hover:bg-yellow-50 border-yellow-200'}`}
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
            <div className="rounded-lg overflow-hidden border border-red-100 shadow-sm">
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 flex items-center gap-2 border-b border-red-200">
                {getLevelIcon('senior-secondary')}
                <h3 className="font-medium text-red-900">Senior Secondary</h3>
              </div>
              <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-2">
                  {mockGrades
                    .filter(grade => grade.level === 'senior-secondary')
                    .map(grade => (
                      <Button
                        key={grade.id}
                        variant={selectedGradeId === grade.id ? "default" : "outline"}
                        className={`h-10 ${selectedGradeId === grade.id ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 border-red-200'}`}
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
        </div>

        {/* Parent Details */}
        {selectedParent ? (
          <ParentDetailView parent={selectedParent} formatCurrency={formatCurrency} />
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select a parent to view details
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Choose a parent from the list on the left to see their information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Parent Detail View Component
function ParentDetailView({ 
  parent, 
  formatCurrency 
}: { 
  parent: Parent; 
  formatCurrency: (amount: number) => string;
}) {
  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'father':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mother':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'guardian':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'other':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Parent Info */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-mono font-bold">{parent.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRelationshipColor(parent.relationship)}>
                  {parent.relationship}
                </Badge>
                <Badge className={getStatusColor(parent.status)}>
                  {parent.status}
                </Badge>
              </div>
            </div>
          </div>
          {parent.feeStatus && (
            <div className="text-right">
              <div className="text-sm text-slate-600">Outstanding Balance</div>
              <div className={`text-2xl font-mono font-bold ${
                parent.feeStatus.totalOwed > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(parent.feeStatus.totalOwed)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <h3 className="text-lg font-mono font-bold mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-mono">{parent.phone}</span>
            </div>
            {parent.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">{parent.email}</span>
              </div>
            )}
            {parent.homeAddress && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">{parent.homeAddress}</span>
              </div>
            )}
            {parent.emergencyContact && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-red-500" />
                <span className="font-mono text-sm">Emergency: {parent.emergencyContact}</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <h3 className="text-lg font-mono font-bold mb-4">Personal Details</h3>
          <div className="space-y-3">
            {parent.idNumber && (
              <div className="grid grid-cols-2">
                <div className="font-medium text-sm">ID Number</div>
                <div className="font-mono">{parent.idNumber}</div>
              </div>
            )}
            {parent.occupation && (
              <div className="grid grid-cols-2">
                <div className="font-medium text-sm">Occupation</div>
                <div>{parent.occupation}</div>
              </div>
            )}
            {parent.workAddress && (
              <div className="grid grid-cols-2">
                <div className="font-medium text-sm">Work Address</div>
                <div className="text-sm">{parent.workAddress}</div>
              </div>
            )}
            <div className="grid grid-cols-2">
              <div className="font-medium text-sm">Registered</div>
              <div className="text-sm">{new Date(parent.registrationDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Students */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <h3 className="text-lg font-mono font-bold mb-4">Children ({parent.students.length})</h3>
        <div className="grid gap-3">
          {parent.students.map(student => (
            <div key={student.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono font-medium">{student.name}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {student.class} • Grade {student.grade}
                  </div>
                </div>
                <div className="text-sm font-mono text-slate-500">
                  {student.admissionNumber}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <h3 className="text-lg font-mono font-bold mb-4">Communication Preferences</h3>
        <div className="flex gap-3">
          {parent.communicationPreferences.sms && <Badge variant="outline">SMS</Badge>}
          {parent.communicationPreferences.email && <Badge variant="outline">Email</Badge>}
          {parent.communicationPreferences.whatsapp && <Badge variant="outline">WhatsApp</Badge>}
        </div>
      </div>

      {/* Fee Information */}
      {parent.feeStatus && (
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <h3 className="text-lg font-mono font-bold mb-4">Fee Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-600">Total Owed</div>
              <div className={`text-xl font-mono font-bold ${
                parent.feeStatus.totalOwed > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(parent.feeStatus.totalOwed)}
              </div>
            </div>
            {parent.feeStatus.lastPayment && (
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600">Last Payment</div>
                <div className="font-mono">{parent.feeStatus.lastPayment}</div>
              </div>
            )}
            {parent.feeStatus.paymentMethod && (
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600">Payment Method</div>
                <div>{parent.feeStatus.paymentMethod}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  PanelLeftOpen,
  Loader2,
  BarChart3,
  ChevronDown,
  ChevronRight
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
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [displayedParentsCount, setDisplayedParentsCount] = useState(10);
  const [showStats, setShowStats] = useState(false);

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
      
      const matchesGrade = selectedGradeId === 'all' || 
                          parent.students.some(student => student.grade === selectedGradeId);

      return matchesSearch && matchesGrade;
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
  }, [parents, searchTerm, selectedGradeId, sortField, sortDirection]);

  // Get selected parent
  const selectedParent = parents.find(parent => parent.id === selectedParentId);

  // Set initial selected parent when component mounts
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
      {/* Search filter column - styled to match students page */}
      {!isSidebarCollapsed && (
        <div className="hidden md:flex flex-col w-96 border-r border-primary/20 overflow-y-auto p-6 shrink-0 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out relative">
          {/* Collapse button positioned at top-right of sidebar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarCollapsed(true)}
            className="absolute top-4 right-4 border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all duration-200 z-10"
            title="Hide search sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
          
          <div className="space-y-6">
            <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
              <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                <label className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                  <Search className="h-3 w-3 mr-2" />
                  Parent Name
                </label>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-primary" />
                <Input
                  type="text"
                  placeholder="Search by name, phone, email..."
                  className="pl-9 h-12 text-base font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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
                    setDisplayedParentsCount(10);
                  }} 
                  className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
          
          <div className="mt-8 border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">Parents</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Showing {Math.min(displayedParentsCount, filteredParents.length)} of {filteredParents.length} parents
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border border-primary/20 font-mono">
                {filteredParents.length}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              {filteredParents.length === 0 ? (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400 font-medium">
                  No parents match your search criteria
                </div>
              ) : (
                filteredParents.slice(0, displayedParentsCount).map((parent) => (
                  <div
                    key={parent.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      parent.id === selectedParentId 
                        ? 'bg-primary/10 border-primary/40 shadow-md' 
                        : 'bg-white dark:bg-slate-800 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedParentId(parent.id)}
                    title="Click to view parent details"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            parent.status === 'active' ? 'bg-green-500' : 
                            parent.status === 'inactive' ? 'bg-gray-400' : 'bg-red-500'
                          }`} />
                          <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
                            {parent.name}
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mb-1">
                          <Badge className={getRelationshipColor(parent.relationship)} variant="outline">
                            {parent.relationship}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                          {parent.students.length} student{parent.students.length !== 1 ? 's' : ''}
                        </div>
                        {parent.feeStatus && parent.feeStatus.totalOwed > 0 && (
                          <div className="text-xs text-red-600 mt-1 font-mono">
                            Owes: {formatCurrency(parent.feeStatus.totalOwed)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredParents.length > displayedParentsCount && (
              <div className="border-t border-primary/20 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    Showing {displayedParentsCount} of {filteredParents.length} parents
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDisplayedParentsCount(prev => Math.min(prev + 10, filteredParents.length))}
                    className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono text-xs"
                  >
                    Load More ({Math.min(10, filteredParents.length - displayedParentsCount)})
                  </Button>
                </div>
              </div>
            )}
            
            {displayedParentsCount >= filteredParents.length && filteredParents.length > 10 && (
              <div className="border-t border-primary/20 pt-4">
                <div className="flex items-center justify-center">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    All {filteredParents.length} parents loaded
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content column - Grade Filter and Parent Details */}
      <div className="flex-1 overflow-auto p-8 transition-all duration-300 ease-in-out relative">
        {/* Floating toggle button when sidebar is collapsed */}
        {isSidebarCollapsed && (
          <div className="absolute top-6 left-6 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarCollapsed(false)}
              className="border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all duration-200"
              title="Show search sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              {selectedParent ? 'Parent Details' : 'Parents'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Sidebar toggle button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200"
              title={isSidebarCollapsed ? "Show search sidebar" : "Hide search sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
            <CreateParentDrawer onParentCreated={() => {}} />
          </div>
        </div>
        
        {selectedParent ? (
          <ParentDetailView parent={selectedParent} formatCurrency={formatCurrency} />
        ) : (
          // Show grade filter and stats
          <>
            {/* Expandable Stats Section - Only show when viewing all grades */}
            {selectedGradeId === 'all' && (
              <div className="mb-8">
                <div className="border-2 border-primary/20 bg-primary/5 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="w-full p-4 flex items-center justify-between hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-mono font-semibold text-slate-900 dark:text-slate-100">Parent Statistics</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">View comprehensive parent statistics and metrics</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary border border-primary/30 font-mono text-xs">
                        {parents.length} Parents
                      </Badge>
                      {showStats ? (
                        <ChevronDown className="w-5 h-5 text-primary" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                  
                  {showStats && (
                    <div className="border-t-2 border-primary/20 bg-white dark:bg-slate-800 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                                {parents.length}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                Total Parents
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <UserCheck className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                                {parents.filter(p => p.status === 'active').length}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                Active Parents
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                                {parents.reduce((total, parent) => total + parent.students.length, 0)}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                Total Students
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <Receipt className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                                {parents.filter(p => p.feeStatus && p.feeStatus.totalOwed > 0).length}
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                Fee Defaulters
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grade Filter Section */}
            <div className="mb-8">
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-2">
                      <span className="text-xs font-mono uppercase tracking-wide text-primary">
                        Grade Filter
                      </span>
                    </div>
                    <h2 className="text-xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                      Filter by Student Grade
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      Select a specific grade to view parents or view all grades
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
                
                <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-primary/20 p-6">
                  <div className="flex flex-wrap gap-3">
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
                    
                    {mockGrades.map((grade) => (
                      <Button
                        key={grade.id}
                        variant={selectedGradeId === grade.id ? "default" : "outline"}
                        size="sm"
                        className={`font-mono min-w-[6rem] h-10 rounded-lg transition-all duration-200 font-semibold tracking-wide ${
                          selectedGradeId === grade.id 
                            ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-2 border-primary/80' 
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md'
                        }`}
                        onClick={() => setSelectedGradeId(grade.id)}
                      >
                        {grade.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Parents Table/Grid */}
            <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">All Parents</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Showing {filteredParents.length} parents
                  </p>
                </div>
              </div>
              
              {filteredParents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No parents found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Try adjusting your search criteria or add a new parent.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredParents.map((parent) => (
                    <div
                      key={parent.id}
                      className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200 cursor-pointer"
                      onClick={() => setSelectedParentId(parent.id)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${
                          parent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
                          {parent.name}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          <Badge className={getRelationshipColor(parent.relationship)} variant="outline">
                            {parent.relationship}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                          {parent.phone}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {parent.students.length} student{parent.students.length !== 1 ? 's' : ''}
                        </div>
                        {parent.feeStatus && parent.feeStatus.totalOwed > 0 && (
                          <div className="text-xs text-red-600 font-mono">
                            Owes: {formatCurrency(parent.feeStatus.totalOwed)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
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

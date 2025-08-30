"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Info, 
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle,
  Loader2,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Search,
  User,
  Users,
  BookOpen,
  Mail,
  Award,
} from "lucide-react";
import { CreateTeacherDrawer } from "./components/CreateTeacherDrawer";
import { TeachersSearchSidebar } from "./components/TeachersSearchSidebar";
import { TeacherDetailView } from "./components/TeacherDetailView";
import { TeachersStats } from "./components/TeachersStats";
import { TeachersTable } from "./components/TeachersTable";
import { PendingInvitations } from "./components/PendingInvitations";
import { usePendingInvitationsStore } from "@/lib/stores/usePendingInvitationsStore";
import { useTeachersByTenantQuery, useTeacherData } from "@/lib/stores/useTeachersStore";
import { getTenantInfo } from "@/lib/utils";


// Teacher type definition
type Teacher = {
  // Basic Information
  id: string;
  name: string;
  title?: string; // Mr., Ms., Dr., etc.
  photo?: string;
  gender: "male" | "female";
  dateOfBirth: string;
  joinDate: string;
  employeeId: string;
  staffId?: string;
  status: "active" | "on leave" | "former" | "substitute" | "retired";
  designation: string; // Role/Position (e.g., senior_teacher, HOD, Class Teacher)
  department: string; // e.g., Mathematics, Sciences
  
  // Academic & Teaching Info
  subjects: string[]; // e.g., Mathematics, Physics
  classesAssigned: string[]; // e.g., Form 3A, 4B
  grades: string[]; // e.g., Form 3, Form 4 / Grade 10, 11
  curriculum?: string[]; // CBC, 8-4-4, IGCSE
  timetable?: { day: string; periods: {time: string; class: string; subject: string}[] }[];
  classTeacherOf?: string; // if assigned to a specific class
  
  // Professional Qualifications
  academic: {
    qualification: string; // Highest Degree (e.g., PhD in Education, BSc in Mathematics)
    university?: string; // University/College Attended
    specialization: string;
    experience: number; // years
    tscNumber?: string; // TSC Number (for Kenyan schools)
    certifications?: string[];
  };
  
  // Contact Information
  contacts: {
    phone: string;
    email: string;
    address?: string;
    officeLocation?: string; // Office / Staff Room Location
  };
  
  // Performance & Records
  performance?: {
    rating: number; // Out of 5
    lastEvaluation?: string;
    studentPerformance?: string;
    classPerformance?: { subject: string; performance: string }[];
    subjectPerformanceHistory?: { year: string; performance: string }[];
    attendanceRate?: number; // percentage
    disciplineReports?: number; // count of discipline reports filed
    studentsMentored?: number; // count
    trend?: "improving" | "declining" | "stable";
  };
  
  // Administrative & Extra Duties
  responsibilities?: string[];
  extraCurricular?: {
    clubs?: string[];
    sports?: string[];
    committees?: string[];
  };
  leadershipRoles?: string[];
  administrativeNotes?: string;
  reportsSubmitted?: { type: string; date: string; status: string }[];
  administrative?: {
    roles?: string[];
    committees?: string[];
    reports?: { type: string; date: string; status: string }[];
    notes?: { title: string; date: string; addedBy: string; content: string }[];
  };
  
  // Attachments & Documents
  documents?: {
    name: string;
    type: 'pdf' | 'image' | 'doc' | string;
    url: string;
    size: string;
    dateAdded?: string;
  }[];
  
  // System Metadata
  systemMetadata?: {
    dateAdded: string;
    lastUpdated: string;
    updatedBy: string; // Admin ID or name
  };
  
  // Extras
  awards?: string[];
  languagesSpoken?: string[];
  motto?: string;
  officeHours?: { day: string; hours: string }[];
};

// Function to transform basic user data to Teacher format
const transformUserToTeacher = (user: any): Teacher => {
  return {
    id: user.id,
    name: user.name,
    employeeId: `TCH/${new Date().getFullYear()}/${user.id.slice(-3)}`,
    gender: "male", // Default value since usersByTenant doesn't provide this
    dateOfBirth: "1980-01-01", // Default value
    joinDate: new Date().toISOString().split('T')[0],
    status: "active", // Default to active
    subjects: ["General"], // Default value
    classesAssigned: [],
    grades: [],
    designation: "teacher",
    department: "General", // Default value since usersByTenant doesn't provide this
    contacts: {
      phone: "+254700000000", // Default value
      email: user.email,
      address: "Address not provided"
    },
    academic: {
      qualification: "bachelors",
      specialization: "General Education",
      experience: 1,
      certifications: []
    },
    performance: {
      rating: 4.0,
      lastEvaluation: new Date().toISOString().split('T')[0],
      studentPerformance: "Good",
      trend: "stable"
    },
    responsibilities: [],
    extraCurricular: {
      clubs: [],
      sports: [],
      committees: []
    }
  };
};



// Main teacher page component
function TeachersPage() {
  const tenantInfo = getTenantInfo();
  const tenantId = tenantInfo?.tenantId;
  const hasInitialFetch = useRef(false);
  
  // Debug logging
  console.log('TeachersPage: Tenant info:', tenantInfo);
  console.log('TeachersPage: Tenant ID:', tenantId);
  
  // Fetch teachers data
  const { fetchTeachersByTenant } = useTeachersByTenantQuery()
  const { teacherStaffUsers: graphqlTeachers, isLoading: teachersLoading, error: teachersError } = useTeacherData()
  
  // Transform basic user data to Teacher format
  const teachers = useMemo(() => {
    return (graphqlTeachers as any[]).map(transformUserToTeacher);
  }, [graphqlTeachers]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [displayedTeachersCount, setDisplayedTeachersCount] = useState(10);
  const [showStats, setShowStats] = useState(false);
  const [teacherCreated, setTeacherCreated] = useState(false);
  
  // Pending invitations store and query
  const { invitations, isLoading: invitationsLoading, error: invitationsError, fetchPendingInvitations } = usePendingInvitationsStore();
  
  // Fetch data on component mount (only once)
  useEffect(() => {
    if (tenantId && !hasInitialFetch.current) {
      hasInitialFetch.current = true
      fetchTeachersByTenant(tenantId).catch(console.error)
      fetchPendingInvitations(tenantId);
    }
  }, [tenantId, fetchTeachersByTenant, fetchPendingInvitations])
  
  // Extract unique teacher names, departments, and designations for the filter
  const teacherNames = useMemo(() => {
    return [...new Set(teachers.map(teacher => teacher.name))].sort();
  }, [teachers]);
  
  const departments = useMemo(() => {
    return [...new Set(teachers.map(teacher => teacher.department))].sort();
  }, [teachers]);
  
  const designations = useMemo(() => {
    return [...new Set(teachers.map(teacher => teacher.designation))].sort();
  }, [teachers]);
  
  // Get the selected teacher's details
  const selectedTeacher = useMemo(() => {
    if (!selectedTeacherId) return null;
    return teachers.find(teacher => teacher.id === selectedTeacherId);
  }, [selectedTeacherId, teachers]);

  const handleTeacherCreated = () => {
    setTeacherCreated(true);
    // Refresh teachers data when a new teacher is created
    if (tenantId) {
      fetchTeachersByTenant(tenantId).catch(console.error);
    }
    setTimeout(() => {
      setTeacherCreated(false);
    }, 3000);
  };

  // Filter teachers based on search and filters
  const filteredTeachers = useMemo(() => {
    let filtered = teachers.filter((teacher: Teacher) => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.contacts.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.subjects.some((subject: string) => 
                             subject.toLowerCase().includes(searchTerm.toLowerCase())
                           );

      return matchesSearch;
    });

    return filtered;
  }, [teachers, searchTerm]);

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
                  Teacher Name
                </label>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-primary" />
                <Input
                  type="text"
                  placeholder="Search by name, employee ID, email..."
                  className="pl-9 h-12 text-base font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>



            {/* Clear Search Button */}
            {searchTerm && (
              <div className="pt-1">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setDisplayedTeachersCount(10);
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
                <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">Teachers</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Showing {Math.min(displayedTeachersCount, filteredTeachers.length)} of {filteredTeachers.length} teachers
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border border-primary/20 font-mono">
                {filteredTeachers.length}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400 font-medium">
                  No teachers match your search criteria
                </div>
              ) : (
                filteredTeachers.slice(0, displayedTeachersCount).map((teacher) => (
                  <div
                    key={teacher.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      teacher.id === selectedTeacherId 
                        ? 'bg-primary/10 border-primary/40 shadow-md' 
                        : 'bg-white dark:bg-slate-800 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    title="Click to view teacher details"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            teacher.status === 'active' ? 'bg-green-500' : 
                            teacher.status === 'on leave' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                          <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
                            {teacher.name}
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mb-1">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                            {teacher.department}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                          {teacher.subjects.join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredTeachers.length > displayedTeachersCount && (
              <div className="border-t border-primary/20 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    Showing {displayedTeachersCount} of {filteredTeachers.length} teachers
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDisplayedTeachersCount(prev => Math.min(prev + 10, filteredTeachers.length))}
                    className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono text-xs"
                  >
                    Load More ({Math.min(10, filteredTeachers.length - displayedTeachersCount)})
                  </Button>
                </div>
              </div>
            )}
            
            {displayedTeachersCount >= filteredTeachers.length && filteredTeachers.length > 10 && (
              <div className="border-t border-primary/20 pt-4">
                <div className="flex items-center justify-center">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    All {filteredTeachers.length} teachers loaded
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content column - Department Filter and Teacher Details */}
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
              {selectedTeacher ? 'Teacher Details' : 'Teachers'}
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
            <CreateTeacherDrawer onTeacherCreated={handleTeacherCreated} />
          </div>
        </div>

        {/* Teachers Loading and Error States */}
        {!tenantId && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Tenant ID not found. Please log in again to access teacher data.
          </div>
        )}

        {teachersLoading && tenantId && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md flex items-center">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Loading teachers data...
          </div>
        )}

        {teachersError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Error loading teachers: {teachersError}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => tenantId && fetchTeachersByTenant(tenantId)}
              className="border-red-200 text-red-700 hover:bg-red-100"
            >
              Retry
            </Button>
          </div>
        )}

        {selectedTeacher ? (
          <TeacherDetailView teacher={selectedTeacher} />
        ) : (
          // Show department filter and stats
          <>
            {/* Expandable Stats Section */}
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
                      <h3 className="font-mono font-semibold text-slate-900 dark:text-slate-100">Teacher Statistics</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">View comprehensive teacher statistics and metrics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border border-primary/30 font-mono text-xs">
                      {teachers.length} Teachers
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
                              {teachers.length}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                              Total Teachers
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                              {teachers.filter(t => t.status === 'active').length}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                              Active Teachers
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                              {departments.length}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                              Departments
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Award className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                              {teachers.filter(t => t.performance?.rating && t.performance.rating >= 4).length}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                              High Performers
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Success message */}
            {teacherCreated && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Teacher created successfully!
              </div>
            )}

            {/* Pending Invitations Section */}
            <PendingInvitations 
              invitations={invitations}
              isLoading={invitationsLoading}
              error={invitationsError}
              onInvitationResent={(invitationId) => {
                // Optionally refetch invitations after resend
                if (tenantId) {
                  fetchPendingInvitations(tenantId);
                }
              }}
            />

            {/* Teachers Table */}
            <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">All Teachers</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Showing {filteredTeachers.length} teachers
                  </p>
                </div>
              </div>
              
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No teachers found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Try adjusting your search criteria or add a new teacher.
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg border border-primary/20 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-primary/5 border-b border-primary/20">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Teacher
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Employee ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Subjects
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10">
                        {filteredTeachers.map((teacher) => (
                          <tr 
                            key={teacher.id}
                            className="hover:bg-primary/5 transition-colors cursor-pointer"
                            onClick={() => setSelectedTeacherId(teacher.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {teacher.photo ? (
                                    <img 
                                      className="h-10 w-10 rounded-full object-cover" 
                                      src={teacher.photo} 
                                      alt={teacher.name} 
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <User className="h-5 w-5 text-primary" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                                    {teacher.name}
                                  </div>
                                  <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {teacher.designation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                                {teacher.department}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900 dark:text-slate-100">
                              {teacher.employeeId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {teacher.subjects.map((subject, index) => (
                                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                    {subject}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {teacher.performance?.rating ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, index) => (
                                      <div 
                                        key={index} 
                                        className={`h-2 w-2 rounded-full ${
                                          index < teacher.performance!.rating ? 'bg-yellow-400' : 'bg-gray-200'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                                    {teacher.performance.rating}/5
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">No rating</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  teacher.status === 'active' ? 'bg-green-500' : 
                                  teacher.status === 'on leave' ? 'bg-yellow-500' : 
                                  teacher.status === 'former' ? 'bg-gray-400' :
                                  teacher.status === 'substitute' ? 'bg-blue-500' :
                                  'bg-purple-500'
                                }`} />
                                <Badge variant="outline" className={`
                                  text-xs ${
                                    teacher.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    teacher.status === 'on leave' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                                    teacher.status === 'former' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                                    teacher.status === 'substitute' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-purple-50 text-purple-700 border-purple-200'
                                  }
                                `}>
                                  {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                                </Badge>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Teachers page component
export default TeachersPage;
             
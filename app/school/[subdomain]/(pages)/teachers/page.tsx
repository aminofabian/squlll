"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
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
  Award,
  Calendar,
  Clock,
  Edit,
  GraduationCap,
  Phone,
  Plus,
  CheckCircle,
  Mail,
  MapPin,
  ClipboardList,
  FileText,
  File,
  Image,
  Download,
  BookOpen,
  Calculator,
  Music,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Loader2
} from "lucide-react";
import { CreateTeacherDrawer } from "./components/CreateTeacherDrawer";
import { usePendingInvitationsStore, PendingInvitation } from "@/lib/stores/usePendingInvitationsStore";
import { useTeachersByTenant, useTeacherStaffUsersFromStore } from "@/lib/hooks/useTeachers";
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

// Mock data for the departments - used for filtering
const departments = [
  'English',
  'Mathematics',
  'Science',
  'Social Studies',
  'Physical Education',
  'Arts & Music',
  'Languages',
  'Computer Science',
  'Special Education',
  'Administration'
];

// Function to transform store data to Teacher format
const transformStoreDataToTeacher = (storeUser: { id: string; name: string; email: string }): Teacher => {
  return {
    id: storeUser.id,
    name: storeUser.name,
    employeeId: `TCH/${new Date().getFullYear()}/${storeUser.id.slice(-3)}`,
    gender: "male", // Default value
    dateOfBirth: "1980-01-01", // Default value
    joinDate: new Date().toISOString().split('T')[0], // Default to today
    status: "active",
    subjects: ["General"], // Default value
    classesAssigned: [],
    grades: [],
    designation: "teacher",
    department: "general",
    contacts: {
      phone: "+254700000000", // Default value
      email: storeUser.email,
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

// Teacher detail view component for drawer and panel
function TeacherDetailView({ teacher }: { teacher: Teacher }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Header with profile photo and basic info */}
      <div className="p-4 sm:p-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {teacher.photo ? (
              <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden border-2 border-custom-blue/20">
                <img
                  src={teacher.photo}
                  alt={teacher.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-custom-blue/10 flex items-center justify-center text-custom-blue border-2 border-custom-blue/20">
                <User className="h-10 w-10" />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-xl">{(teacher.title ? teacher.title + ' ' : '') + teacher.name}</h3>
            <p className="text-sm text-muted-foreground">
              {teacher.designation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`
                ${teacher.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                ${teacher.status === 'on leave' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                ${teacher.status === 'former' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                ${teacher.status === 'substitute' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                ${teacher.status === 'retired' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
              `}>
                {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
              </Badge>
              <Badge variant="outline" className="bg-custom-blue/10 text-custom-blue border-custom-blue/20">
                {teacher.department}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabbed content */}
      <div className="p-4 sm:p-5">
        <Tabs defaultValue="info">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          {/* Basic Info Tab */}
          <TabsContent value="info" className="space-y-4">
            {/* Basic Information Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <User className="h-4 w-4" /> Basic Information
              </h4>
              <div className="bg-gray-50 rounded-md p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Employee ID</p>
                    <p className="text-sm font-medium">{teacher.employeeId}</p>
                  </div>
                  {teacher.staffId && (
                    <div>
                      <p className="text-xs text-gray-500">Staff ID</p>
                      <p className="text-sm font-medium">{teacher.staffId}</p>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-medium capitalize">{teacher.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="text-sm font-medium">{new Date(teacher.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Join Date</p>
                  <p className="text-sm font-medium">{new Date(teacher.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            {/* Contact Information Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" /> Contact Information
              </h4>
              <div className="bg-gray-50 rounded-md p-3 space-y-2">
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="text-sm font-medium">{teacher.contacts.phone}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="text-sm font-medium">{teacher.contacts.email}</p>
                </div>
                
                {teacher.contacts.address && (
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </p>
                    <p className="text-sm font-medium">{teacher.contacts.address}</p>
                  </div>
                )}
                
                {teacher.contacts.officeLocation && (
                  <div>
                    <p className="text-xs text-gray-500">Office Location</p>
                    <p className="text-sm font-medium">{teacher.contacts.officeLocation}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Academic Tab */}
          <TabsContent value="academic" className="space-y-4">
            {/* Academic & Teaching Info Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Academic & Teaching Info
              </h4>
              
              <div className="bg-gray-50 rounded-md p-3 space-y-3">
                {/* Subjects */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Subjects Taught</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subject, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Grades */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Grades Taught</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.grades.map((grade, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {grade}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Classes */}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Classes Assigned</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.classesAssigned.map((cls, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Class Teacher */}
                {teacher.classTeacherOf && (
                  <div>
                    <p className="text-xs text-gray-500">Class Teacher of</p>
                    <p className="text-sm font-medium">{teacher.classTeacherOf}</p>
                  </div>
                )}
                
                {/* Curriculum */}
                {teacher.curriculum && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Curriculum</p>
                    <div className="flex flex-wrap gap-1">
                      {teacher.curriculum.map((curr, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          {curr}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Professional Qualifications */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" /> Professional Qualifications
              </h4>
              
              <div className="bg-gray-50 rounded-md p-3 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Highest Degree</p>
                  <p className="text-sm font-medium">{teacher.academic.qualification}</p>
                </div>
                
                {teacher.academic.university && (
                  <div>
                    <p className="text-xs text-gray-500">University/College</p>
                    <p className="text-sm font-medium">{teacher.academic.university}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-gray-500">Specialization</p>
                  <p className="text-sm font-medium">{teacher.academic.specialization}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Years of Experience</p>
                  <p className="text-sm font-medium">{teacher.academic.experience} years</p>
                </div>
                
                {teacher.academic.tscNumber && (
                  <div>
                    <p className="text-xs text-gray-500">TSC Number</p>
                    <p className="text-sm font-medium">{teacher.academic.tscNumber}</p>
                  </div>
                )}
                
                {/* Certifications */}
                {teacher.academic.certifications && teacher.academic.certifications.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Certifications</p>
                    <div className="flex flex-wrap gap-1">
                      {teacher.academic.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Timetable Summary */}
            {teacher.timetable && teacher.timetable.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Timetable Summary
                </h4>
                
                <div className="bg-gray-50 rounded-md p-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b">
                        <th className="text-left py-2 font-medium">Day</th>
                        <th className="text-left py-2 font-medium">Periods</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacher.timetable.map((day, dayIndex) => (
                        <tr key={dayIndex} className="border-b border-gray-200">
                          <td className="py-2 font-medium">{day.day}</td>
                          <td className="py-2">
                            <div className="flex flex-col gap-1">
                              {day.periods.map((period, periodIndex) => (
                                <div key={periodIndex} className="text-xs">
                                  <span className="font-medium">{period.time}</span>:
                                  <span className="text-gray-600"> {period.class}</span> -
                                  <span className="text-custom-blue"> {period.subject}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            {/* Performance Rating */}
            {teacher.performance && (
              <>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" /> Performance Rating
                  </h4>
                  
                  <div className="bg-gray-50 rounded-md p-3 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Overall Rating</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, index) => (
                          <div key={index} className={`h-3 w-3 rounded-full ${index < teacher.performance!.rating ? 'bg-custom-blue' : 'bg-gray-200'}`}></div>
                        ))}
                        <span className="text-sm font-medium ml-2">{teacher.performance.rating}/5</span>
                        
                        {teacher.performance.trend && (
                          <Badge variant="outline" className={`ml-2 text-xs ${teacher.performance.trend === 'improving' ? 'bg-green-50 text-green-700' : teacher.performance.trend === 'declining' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                            {teacher.performance.trend.charAt(0).toUpperCase() + teacher.performance.trend.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {teacher.performance.lastEvaluation && (
                      <div>
                        <p className="text-xs text-gray-500">Last Evaluation</p>
                        <p className="text-sm font-medium">{teacher.performance.lastEvaluation}</p>
                      </div>
                    )}
                    
                    {teacher.performance.studentPerformance && (
                      <div>
                        <p className="text-xs text-gray-500">Student Performance</p>
                        <p className="text-sm font-medium">{teacher.performance.studentPerformance}</p>
                      </div>
                    )}
                    
                    {teacher.performance.attendanceRate && (
                      <div>
                        <p className="text-xs text-gray-500">Attendance Rate</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 overflow-hidden">
                          <div 
                            className="bg-custom-blue h-2.5 rounded-full" 
                            style={{ width: `${teacher.performance.attendanceRate}%` }}
                          ></div>
                        </div>
                        <p className="text-sm font-medium mt-1">{teacher.performance.attendanceRate}%</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Class Performance */}
                {teacher.performance.classPerformance && teacher.performance.classPerformance.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Class Performance
                    </h4>
                    
                    <div className="bg-gray-50 rounded-md p-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500 border-b">
                            <th className="text-left py-2 font-medium">Subject</th>
                            <th className="text-left py-2 font-medium">Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teacher.performance.classPerformance.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="py-2 font-medium">{item.subject}</td>
                              <td className="py-2">{item.performance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Subject Performance History */}
                {teacher.performance.subjectPerformanceHistory && teacher.performance.subjectPerformanceHistory.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Subject Performance History
                    </h4>
                    
                    <div className="bg-gray-50 rounded-md p-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500 border-b">
                            <th className="text-left py-2 font-medium">Year</th>
                            <th className="text-left py-2 font-medium">Performance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teacher.performance.subjectPerformanceHistory.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="py-2 font-medium">{item.year}</td>
                              <td className="py-2">{item.performance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Discipline & Mentoring */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teacher.performance.disciplineReports !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Discipline Reports</h4>
                      <div className="bg-gray-50 rounded-md p-3 text-center">
                        <span className="text-2xl font-semibold text-custom-blue">{teacher.performance.disciplineReports}</span>
                        <p className="text-xs text-gray-500 mt-1">Reports Filed</p>
                      </div>
                    </div>
                  )}
                  
                  {teacher.performance.studentsMentored !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Students Mentored</h4>
                      <div className="bg-gray-50 rounded-md p-3 text-center">
                        <span className="text-2xl font-semibold text-custom-blue">{teacher.performance.studentsMentored}</span>
                        <p className="text-xs text-gray-500 mt-1">Total Students</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* No Performance Data */}
            {!teacher.performance && (
              <div className="bg-gray-50 rounded-md p-4 text-center">
                <p className="text-gray-500">No performance data available</p>
              </div>
            )}
          </TabsContent>
          

        </Tabs>
      </div>
    </div>
  );
}

// Teachers search filter component with department, designation and teacher name filters
function TeachersSearchFilter({ 
  onSearch, 
  onFilterChange,
  departments,
  designations,
  teacherNames, 
}: { 
  onSearch: (query: string) => void, 
  onFilterChange: (filters: { department?: string, designation?: string, teacherName?: string }) => void,
  departments: string[],
  designations: string[],
  teacherNames: string[], 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDesignation, setSelectedDesignation] = useState<string>("");
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    onFilterChange({ 
      department: value, 
      designation: selectedDesignation,
      teacherName: selectedTeacherName 
    });
  };

  const handleDesignationChange = (value: string) => {
    setSelectedDesignation(value);
    onFilterChange({ 
      department: selectedDepartment, 
      designation: value,
      teacherName: selectedTeacherName 
    });
  };

  const handleTeacherNameChange = (value: string) => {
    setSelectedTeacherName(value);
    onFilterChange({ 
      department: selectedDepartment, 
      designation: selectedDesignation,
      teacherName: value 
    });
  };
  
  const handleReset = () => {
    setSearchQuery("");
    setSelectedDepartment("");
    setSelectedDesignation("");
    setSelectedTeacherName("");
    onSearch("");
    onFilterChange({ department: "", designation: "", teacherName: "" });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-custom-blue/20 mb-5 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search teachers by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200 focus-within:bg-white focus:border-custom-blue focus:ring-2 focus:ring-custom-blue/20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="bg-custom-blue hover:bg-custom-blue/90 text-white gap-2"
            >
              <Search className="h-4 w-4" /> Search
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="border-gray-200 text-gray-600 hover:bg-gray-50 gap-2"
              onClick={handleReset}
            >
              <ListFilter className="h-4 w-4" /> Reset
            </Button>
          </div>
        </form>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <School className="h-4 w-4 text-custom-blue" />
            <span className="text-sm font-medium text-gray-600">Department:</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button 
              size="sm" 
              variant={selectedDepartment === "" ? "default" : "outline"}
              className={selectedDepartment === "" ? "bg-custom-blue text-white" : "border-gray-200 text-gray-700"}
              onClick={() => handleDepartmentChange("")}
            >
              All
            </Button>
            {departments.map((dept) => (
              <Button 
                key={dept.toLowerCase()} 
                size="sm" 
                variant={selectedDepartment === dept.toLowerCase() ? "default" : "outline"}
                className={selectedDepartment === dept.toLowerCase() ? "bg-custom-blue text-white" : "border-gray-200 text-gray-700"}
                onClick={() => handleDepartmentChange(dept.toLowerCase())}
              >
                {dept}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-custom-blue" />
            <span className="text-sm font-medium text-gray-600">Designation:</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button 
              size="sm" 
              variant={selectedDesignation === "" ? "default" : "outline"}
              className={selectedDesignation === "" ? "bg-custom-blue text-white" : "border-gray-200 text-gray-700"}
              onClick={() => handleDesignationChange("")}
            >
              All
            </Button>
            {designations.map((designation) => (
              <Button 
                key={designation} 
                size="sm" 
                variant={selectedDesignation === designation ? "default" : "outline"}
                className={selectedDesignation === designation ? "bg-custom-blue text-white" : "border-gray-200 text-gray-700"}
                onClick={() => handleDesignationChange(designation)}
              >
                {designation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-custom-blue" />
            <span className="text-sm font-medium text-gray-600">Teacher Name:</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button 
              size="sm" 
              variant={selectedTeacherName === "" ? "default" : "outline"}
              className={selectedTeacherName === "" ? "bg-custom-blue text-white" : "border-gray-200 text-gray-700"}
              onClick={() => handleTeacherNameChange("")}
            >
              All
            </Button>
            {teacherNames.map((name) => (
              <Button 
                key={name} 
                size="sm" 
                variant={selectedTeacherName === name ? "default" : "outline"}
                className={selectedTeacherName === name ? "bg-custom-blue text-white" : "border-gray-200 text-gray-700"}
                onClick={() => handleTeacherNameChange(name)}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Extract designations from the dropdown options available in the form
const designations = [
  'principal',
  'vice_principal',
  'head_teacher',
  'senior_teacher',
  'teacher'
];

// Enhanced Teacher Card component with better structure
function TeacherCard({ teacher, isSelected }: { teacher: Teacher; isSelected?: boolean }) {
  // Special handling for Dr. Alice Johnson
  const isAliceJohnson = teacher.name === "Dr. Alice Johnson";

  return (
    <Card className={`h-full hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}>
      <CardHeader>
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
              {teacher.photo ? (
                <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium">{teacher.name}</h4>
              <p className="text-sm text-muted-foreground capitalize">
                {teacher.designation.replace('_', ' ')}
              </p>
            </div>
          </div>
          {isAliceJohnson && (
            <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Department</p>
            <p className="font-medium capitalize">{teacher.department}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Classes & Grades</p>
            <div className="flex flex-wrap gap-1">
              {teacher.classesAssigned.map((className: string, index: number) => (
                <Badge key={`class-${index}`} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{className}</Badge>
              ))}
              {teacher.subjects.map((subject: string, index: number) => (
                <Badge key={`subject-${index}`} variant="outline" className="bg-green-50 text-green-700 border-green-200">{subject}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
  );
}

// Main teacher page component
function TeachersPage() {
  const tenantInfo = getTenantInfo();
  const tenantId = tenantInfo?.tenantId;
  
  // Debug logging
  console.log('TeachersPage: Tenant info:', tenantInfo);
  console.log('TeachersPage: Tenant ID:', tenantId);
  
  const { data, isLoading: teachersLoading, error: teachersError, refetch: refetchTeachers } = useTeachersByTenant(tenantId || "", "TEACHER");
  const { teacherStaffUsers } = useTeacherStaffUsersFromStore();
  
  // Transform store data to Teacher format
  const teachers = useMemo(() => {
    return teacherStaffUsers.map(transformStoreDataToTeacher);
  }, [teacherStaffUsers]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [displayedTeachersCount, setDisplayedTeachersCount] = useState(10);
  const [showStats, setShowStats] = useState(false);
  const [teacherCreated, setTeacherCreated] = useState(false);
  
  // Pending invitations store and query
  const { invitations, isLoading: invitationsLoading, error: invitationsError, fetchPendingInvitations } = usePendingInvitationsStore();
  
  // Ref to track if fetch has been called for this component instance
  const hasFetchedRef = useRef(false);
  
  // Fetch data on component mount
  useEffect(() => {
    if (!hasFetchedRef.current && tenantId) {
      console.log('TeachersPage: Initial fetch triggered for tenant:', tenantId);
      hasFetchedRef.current = true;
      fetchPendingInvitations(tenantId);
      // Teachers data is automatically fetched by the useTeachersByTenant hook
    }
  }, [fetchPendingInvitations, tenantId]); // Fetch when tenantId is available
  
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
    refetchTeachers();
    setTimeout(() => {
      setTeacherCreated(false);
    }, 3000);
  };

  // Filter teachers based on search and filters
  const filteredTeachers = useMemo(() => {
    let filtered = teachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.contacts.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           teacher.subjects.some(subject => 
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

        {teachersError && tenantId && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
            <div className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Error loading teachers: {teachersError.message}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchTeachers()}
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
            <div className="mb-8">
              <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">Pending Teacher Invitations</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {invitationsLoading ? 'Loading...' : `Showing ${invitations.length} pending invitations`}
                    </p>
                  </div>
                  {invitationsError && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Error loading invitations
                    </Badge>
                  )}
                </div>
                
                {invitationsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading pending invitations...</p>
                  </div>
                ) : invitationsError ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">
                      <Info className="h-8 w-8 mx-auto" />
                    </div>
                    <h3 className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Error loading invitations
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      {invitationsError}
                    </p>
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      No pending invitations
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      All teacher invitations have been processed.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-primary/20 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-primary/5 border-b border-primary/20">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Invited By
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Created At
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/10">
                          {invitations.map((invitation) => (
                            <tr key={invitation.id} className="hover:bg-primary/5 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Mail className="h-4 w-4 text-primary" />
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                                      {invitation.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                                  {invitation.role}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    invitation.status === 'PENDING' ? 'bg-yellow-500' : 
                                    invitation.status === 'ACCEPTED' ? 'bg-green-500' : 
                                    invitation.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-400'
                                  }`} />
                                  <Badge variant="outline" className={`
                                    text-xs ${
                                      invitation.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                      invitation.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : 
                                      invitation.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                                      'bg-gray-50 text-gray-700 border-gray-200'
                                    }
                                  `}>
                                    {invitation.status}
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                                {invitation.invitedBy ? (
                                  <div>
                                    <div className="font-medium">{invitation.invitedBy.name}</div>
                                    <div className="text-slate-500">{invitation.invitedBy.email}</div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">System</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                                {new Date(invitation.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
             
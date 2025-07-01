"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
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
} from "lucide-react";
import { CreateTeacherDrawer } from "./components/CreateTeacherDrawer";


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

// Mock data for teachers
const mockTeachers: Teacher[] = [
  {
    id: "t1",
    name: "Dr. Alice Johnson",
    employeeId: "TCH/2023/001",
    photo: "/images/teacher1.jpg",
    gender: "female",
    dateOfBirth: "1980-05-15",
    joinDate: "2020-01-10",
    status: "active",
    subjects: ["Mathematics", "Physics"],
    classesAssigned: ["Form 3A", "Form 4B"],
    grades: ["Form 3", "Form 4"],
    designation: "senior_teacher",
    department: "mathematics",
    contacts: {
      phone: "+254712345678",
      email: "alice.johnson@kenyaschools.edu",
      address: "123 Nairobi Avenue"
    },
    academic: {
      qualification: "phd",
      specialization: "Applied Mathematics",
      experience: 12,
      certifications: ["Advanced Pedagogical Training"]
    },
    performance: {
      rating: 4.8,
      lastEvaluation: "2023-06-15",
      studentPerformance: "Excellent",
      trend: "improving"
    },
    responsibilities: ["Math Department Coordinator", "Examination Committee"],
    extraCurricular: {
      clubs: ["Mathematics Club"],
      sports: [],
      committees: ["Academic Council"]
    }
  },
  {
    id: "t2",
    name: "James Omondi",
    employeeId: "TCH/2023/002",
    photo: "/images/teacher2.jpg",
    gender: "male",
    dateOfBirth: "1985-09-22",
    joinDate: "2019-05-15",
    status: "active",
    subjects: ["English", "Literature"],
    classesAssigned: ["Form 2A", "Form 3C"],
    grades: ["Form 2", "Form 3"],
    designation: "teacher",
    department: "english",
    contacts: {
      phone: "+254723456789",
      email: "james.omondi@kenyaschools.edu",
      address: "45 Moi Avenue"
    },
    academic: {
      qualification: "masters",
      specialization: "English Literature",
      experience: 8,
      certifications: ["Creative Writing Workshop"]
    },
    performance: {
      rating: 4.5,
      lastEvaluation: "2023-05-20",
      studentPerformance: "Very Good",
      trend: "stable"
    },
    responsibilities: ["Drama Club Advisor"],
    extraCurricular: {
      clubs: ["Debating Club", "Creative Writing Club"],
      sports: [],
      committees: ["Cultural Committee"]
    }
  },
  {
    id: "t3",
    name: "Wangari Muthoni",
    employeeId: "TCH/2023/003",
    photo: "/images/teacher3.jpg",
    gender: "female",
    dateOfBirth: "1990-03-12",
    joinDate: "2021-08-30",
    status: "active",
    subjects: ["Biology", "Chemistry"],
    classesAssigned: ["Form 1B", "Form 2D"],
    grades: ["Form 1", "Form 2"],
    designation: "teacher",
    department: "science",
    contacts: {
      phone: "+254734567890",
      email: "wangari.muthoni@kenyaschools.edu",
      address: "78 Kenyatta Street"
    },
    academic: {
      qualification: "bachelors",
      specialization: "Biological Sciences",
      experience: 3,
      certifications: ["Laboratory Safety Training"]
    },
    performance: {
      rating: 4.2,
      lastEvaluation: "2023-06-10",
      studentPerformance: "Good",
      trend: "improving"
    },
    responsibilities: ["Laboratory Coordinator"],
    extraCurricular: {
      clubs: ["Environmental Club"],
      sports: ["Volleyball Coach"],
      committees: ["Field Trip Committee"]
    }
  },
  {
    id: "t4",
    name: "Mohammed Hassan",
    employeeId: "TCH/2023/004",
    photo: "/images/teacher4.jpg",
    gender: "male",
    dateOfBirth: "1975-12-05",
    joinDate: "2015-01-05",
    status: "active",
    subjects: ["History", "Religious Studies"],
    classesAssigned: ["Form 3D", "Form 4A"],
    grades: ["Form 3", "Form 4"],
    designation: "head_teacher",
    department: "social studies",
    contacts: {
      phone: "+254745678901",
      email: "mohammed.hassan@kenyaschools.edu",
      address: "123 Unity Road"
    },
    academic: {
      qualification: "masters",
      specialization: "African History",
      experience: 15,
      certifications: ["Educational Leadership Program"]
    },
    performance: {
      rating: 4.9,
      lastEvaluation: "2023-05-05",
      studentPerformance: "Excellent",
      trend: "stable"
    },
    responsibilities: ["Social Studies Department Head", "School Discipline Committee Chair"],
    extraCurricular: {
      clubs: ["History Club"],
      sports: [],
      committees: ["School Board Representative"]
    }
  }
];

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
  const [teachers] = useState<Teacher[]>(mockTeachers);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>(mockTeachers);
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherCreated, setTeacherCreated] = useState(false);
  // Add state for filters
  const [filters, setFilters] = useState<{ department?: string, designation?: string, teacherName?: string }>({});
  // Add state for selected teacher and mobile sidebar
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Extract unique teacher names for the filter
  const teacherNames = useMemo(() => {
    return [...new Set(teachers.map(teacher => teacher.name))].sort();
  }, [teachers]);
  
  // Check if the device is mobile
  const [isMobile, setIsMobile] = useState(false);
  
  // Set up a media query to detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint in Tailwind
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Get the selected teacher's details
  const selectedTeacher = useMemo(() => {
    if (!selectedTeacherId) return null;
    return teachers.find(teacher => teacher.id === selectedTeacherId);
  }, [selectedTeacherId, teachers]);

  const handleTeacherCreated = () => {
    setTeacherCreated(true);
    // In a real application, we would fetch the updated list from the backend
    setTimeout(() => {
      setTeacherCreated(false);
    }, 3000);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterTeachers(query, filters);
  };

  // Add filter change handler
  const handleFilterChange = (newFilters: { department?: string, designation?: string, teacherName?: string }) => {
    const updatedFilters = { ...newFilters };
    setFilters(updatedFilters);
    filterTeachers(searchQuery, updatedFilters);
  };
  
  // Combined filtering function
  const filterTeachers = (query: string, activeFilters: { department?: string, designation?: string, teacherName?: string }) => {
    let filtered = [...teachers];
    
    // Apply search query filter
    if (query.trim()) {
      filtered = filtered.filter(teacher =>
        teacher.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply teacher name filter
    if (activeFilters.teacherName) {
      filtered = filtered.filter(teacher => teacher.name === activeFilters.teacherName);
    }
    
    // Apply department filter
    if (activeFilters?.department) {
      const department = activeFilters.department; // Store in a local constant
      filtered = filtered.filter(teacher => 
        teacher.department.toLowerCase() === department.toLowerCase()
      );
    }
    
    // Apply designation filter
    if (activeFilters?.designation) {
      const designation = activeFilters.designation; // Store in a local constant
      filtered = filtered.filter(teacher => 
        teacher.designation.toLowerCase() === designation.toLowerCase()
      );
    }
    
    setFilteredTeachers(filtered);
  };

  return (
    <div className="flex h-full">
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Search filter sidebar */}
      <div className="hidden md:flex flex-col w-96 border-r overflow-y-auto p-6 shrink-0 bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Teachers
          </h2>
          <p className="text-sm text-muted-foreground">Search and filter teaching staff</p>
        </div>

        <div className="space-y-6">
          {/* Name Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Teacher Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name..."
                className="pl-9 h-12 text-base"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Designation Filter removed as requested */}

          {/* Teacher Name Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Filter by Teacher Name</label>
              {filters.teacherName && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleFilterChange({...filters, teacherName: undefined})} 
                  className="h-7 px-2 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto pr-1">
              {teacherNames.map(name => (
                <Button
                  key={name}
                  variant={filters.teacherName === name ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${filters.teacherName === name ? "" : "border-gray-200 bg-white"}`}
                  onClick={() => handleFilterChange({...filters, teacherName: name})}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>

          {/* Reset all filters */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-gray-200"
              onClick={() => {
                setSearchQuery('');
                setFilters({});
                filterTeachers('', {});
              }}
            >
              Reset All Filters
            </Button>
          </div>

          {/* Add Teacher Button */}
          <div className="pt-4">
            <CreateTeacherDrawer onTeacherCreated={handleTeacherCreated} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-4 py-6 md:px-8 md:py-8">
          {/* Mobile header */}
          <div className="flex items-center justify-between mb-6 md:hidden">
            <div>
              <h1 className="text-2xl font-bold text-custom-blue flex items-center">
                <Users className="h-6 w-6 mr-2" />
                Teachers
              </h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Department Filter - New Vertical Design */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filter by Department</h2>
              {filters.department && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleFilterChange({...filters, department: undefined})}
                >
                  Clear Filter
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Department Card */}
              <div className="rounded-lg overflow-hidden border border-blue-100 shadow-sm">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 flex items-center gap-2 border-b border-blue-200">
                  <BookOpen className="h-5 w-5 text-blue-700" />
                  <h3 className="font-medium text-blue-900">Languages & Humanities</h3>
                </div>
                <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                  <div className="grid grid-cols-1 gap-2">
                    {departments
                      .filter(dept => ['English', 'Languages', 'Social Studies'].includes(dept))
                      .map(department => (
                        <Button
                          key={department}
                          variant={filters.department === department ? "default" : "outline"}
                          className={`h-9 justify-start ${filters.department === department ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50 border-blue-200'}`}
                          onClick={() => handleFilterChange({...filters, department})}
                        >
                          {department}
                        </Button>
                      ))
                    }
                  </div>
                </div>
              </div>
              
              {/* STEM Card */}
              <div className="rounded-lg overflow-hidden border border-green-100 shadow-sm">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 flex items-center gap-2 border-b border-green-200">
                  <Calculator className="h-5 w-5 text-green-700" />
                  <h3 className="font-medium text-green-900">STEM</h3>
                </div>
                <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                  <div className="grid grid-cols-1 gap-2">
                    {departments
                      .filter(dept => ['Mathematics', 'Science', 'Computer Science'].includes(dept))
                      .map(department => (
                        <Button
                          key={department}
                          variant={filters.department === department ? "default" : "outline"}
                          className={`h-9 justify-start ${filters.department === department ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 border-green-200'}`}
                          onClick={() => handleFilterChange({...filters, department})}
                        >
                          {department}
                        </Button>
                      ))
                    }
                  </div>
                </div>
              </div>
              
              {/* Creative & Physical Card */}
              <div className="rounded-lg overflow-hidden border border-amber-100 shadow-sm">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 flex items-center gap-2 border-b border-amber-200">
                  <Music className="h-5 w-5 text-amber-700" />
                  <h3 className="font-medium text-amber-900">Creative & Physical</h3>
                </div>
                <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                  <div className="grid grid-cols-1 gap-2">
                    {departments
                      .filter(dept => ['Arts & Music', 'Physical Education'].includes(dept))
                      .map(department => (
                        <Button
                          key={department}
                          variant={filters.department === department ? "default" : "outline"}
                          className={`h-9 justify-start ${filters.department === department ? 'bg-amber-600 hover:bg-amber-700' : 'hover:bg-amber-50 border-amber-200'}`}
                          onClick={() => handleFilterChange({...filters, department})}
                        >
                          {department}
                        </Button>
                      ))
                    }
                  </div>
                </div>
              </div>
              
              {/* Support Services Card */}
              <div className="rounded-lg overflow-hidden border border-purple-100 shadow-sm">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 flex items-center gap-2 border-b border-purple-200">
                  <Briefcase className="h-5 w-5 text-purple-700" />
                  <h3 className="font-medium text-purple-900">Support Services</h3>
                </div>
                <div className="p-3 space-y-2 bg-white/80 backdrop-blur-sm">
                  <div className="grid grid-cols-1 gap-2">
                    {departments
                      .filter(dept => ['Special Education', 'Administration'].includes(dept))
                      .map(department => (
                        <Button
                          key={department}
                          variant={filters.department === department ? "default" : "outline"}
                          className={`h-9 justify-start ${filters.department === department ? 'bg-purple-600 hover:bg-purple-700' : 'hover:bg-purple-50 border-purple-200'}`}
                          onClick={() => handleFilterChange({...filters, department})}
                        >
                          {department}
                        </Button>
                      ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Current selection indicator */}
          {filters.department && (
            <div className="mb-6 flex items-center">
              <span className="text-sm text-gray-500">Currently viewing: </span>
              <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                {filters.department}
              </Badge>
            </div>
          )}
          
          {teacherCreated && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Teacher created successfully!
            </div>
          )}

          {filteredTeachers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-500">No teachers found</h3>
              <p className="text-gray-400 mt-1">
                {searchQuery || filters.department || filters.designation ? 
                  "No teachers match your search criteria" : 
                  "No teachers available in the system"}
              </p>
              {(searchQuery || filters.department || filters.designation) && (
                <Button 
                  variant="outline" 
                  className="mt-4 border-gray-200"
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({});
                    filterTeachers('', {});
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">All Teachers ({filteredTeachers.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map(teacher => (
                  <div key={teacher.id} onClick={() => setSelectedTeacherId(teacher.id)}>
                    <TeacherCard 
                      teacher={teacher} 
                      isSelected={selectedTeacherId === teacher.id}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Teacher Details Drawer for Mobile */}
      {selectedTeacher && isMobile && (
        <Drawer open={!!selectedTeacherId && isMobile} onOpenChange={() => setSelectedTeacherId(null)}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>Teacher Details</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto">
              <TeacherDetailView teacher={selectedTeacher} />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Teacher Details Panel for Desktop */}
      {selectedTeacher && !isMobile && selectedTeacherId && (
        <div className="hidden lg:block w-96 border-l overflow-y-auto p-6 shrink-0 bg-white">
          <TeacherDetailView teacher={selectedTeacher} />
        </div>
      )}
    </div>
  );
}

export default TeachersPage;
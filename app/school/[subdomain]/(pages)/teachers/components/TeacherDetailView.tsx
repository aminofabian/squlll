"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  User, 
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  Calendar
} from "lucide-react";

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

interface TeacherDetailViewProps {
  teacher: Teacher;
}

export function TeacherDetailView({ teacher }: TeacherDetailViewProps) {
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

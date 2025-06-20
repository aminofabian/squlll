'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { SchoolSearchFilter } from '@/components/dashboard/SchoolSearchFilter'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockGrades, mockClasses, mockStudents, getStreamsForGrade, getGradeStreamAbbr, getTeacherById, getSubjectById } from '@/lib/data/mockclasses'
import type { Grade, Class, Student } from '@/lib/data/mockclasses'

import { 
  Calendar,
  User,
  UserCheck,
  MessageSquare,
  Info,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  GraduationCap, 
  Search, 
  Users, 
  Crown, 
  Trophy, 
  Clock, 
  CalendarDays, 
  Plus, 
  Banknote, 
  Clock3, 
  BookOpen, 
  Briefcase, 
  GraduationCap as GradIcon, 
  BarChart, 
  Users2, 
  CircleAlert,
  ChevronRight,
  Check,
  FileText,
  FilePlus,
  Layers,
  Medal,
  Music,
  Award,
  ChartBar,
  Filter,
  X,
  UserX,
  CalendarX,
  
  
} from 'lucide-react'

// Helper function to get student name by ID
const getStudentNameById = (studentId: string): string => {
  const student = mockStudents.find(student => student.id === studentId);
  return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
}

// Mock component for empty state
function EmptyState({ selectedGrade = null, selectedStatus = 'all', searchTerm = '' }: {
  selectedGrade?: string | null,
  selectedStatus?: string,
  searchTerm?: string
}) {
  // Create a more specific message based on active filters
  let message = 'Try adjusting your search or filters to find what you\'re looking for.'
  
  if (selectedGrade) {
    message = 'No classes found for the selected grade. Try selecting a different grade.'
  } else if (selectedStatus !== 'all') {
    message = 'No ' + selectedStatus + ' classes found. Try another status filter.'
  } else if (searchTerm) {
    message = 'No classes match your search term "' + searchTerm + '". Try a different search.'
  }

  return (
    <div className="bg-gray-50 border p-8 text-center animate-fadeIn">
      <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {message}
      </p>
    </div>
  )
}

// Use the EducationLevel type from mockclasses.ts
import type { EducationLevel } from '@/lib/data/mockclasses'


// Helper function to get status color for badges
function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Helper function to get color for education level badges
function getLevelColor(level: EducationLevel) {
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

// Helper function to get icon for education level
function getLevelIcon(level: EducationLevel) {
  switch (level) {
    case 'preschool':
      return <BookOpen className="h-4 w-4" />
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

// Helper function for component-specific status color styling
function getComponentStatusColor(status: string) {
  switch(status) {
    case 'active': return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-400';
    case 'scheduled': return 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-400';
    case 'completed': return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-400';
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-400';
  }
}

// Helper function for component-specific level color styling
function getComponentLevelColor(level: string) {
  switch(level) {
    case 'preschool': return 'bg-purple-100 text-purple-800 border-purple-400';
    case 'primary': return 'bg-blue-100 text-blue-800 border-blue-400';
    case 'junior-secondary': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
    case 'senior-secondary': return 'bg-red-100 text-red-800 border-red-400';
    default: return 'bg-gray-100 text-gray-800 border-gray-400';
  }
}

/**
 * Mock grades data with abbreviations for display
 */

function GradeButton({ 
  grade, 
  selectedGradeId, 
  onClick 
}: { 
  grade: Grade; 
  selectedGradeId: string; 
  onClick: (id: string) => void;
}) {
  const isSelected = selectedGradeId === grade.id
  
  return (
    <button
      key={grade.id}
      onClick={() => onClick(grade.id)}
      className={isSelected ? getLevelColor(grade.level) : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
    >
      {grade.displayName}
    </button>
  )
}

/**
 * Card component for displaying individual class details
 */
function ClassCard({ cls }: { cls: Class }) {
  return (
    <Card 
      className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1 border-l-4 overflow-hidden" 
      style={{
        borderLeftColor: cls.currentLesson ? '#10b981' : 
                      cls.status === 'active' ? '#3b82f6' : 
                      cls.status === 'scheduled' ? '#8b5cf6' : '#6b7280'
      }}
    >
      <CardHeader className="pb-0 pt-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold">{cls.name}</CardTitle>
              {cls.streamName && (
                <Badge variant="secondary" className="ml-1 font-medium">
                  {cls.streamName} Stream
                </Badge>
              )}
            </div>
            <CardDescription className="mt-1">{cls.description}</CardDescription>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge className={getComponentLevelColor(cls.level) + " px-2 py-1 font-medium"}>
                {cls.level.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Badge>
              <Badge variant="outline" className="px-2 py-1 font-medium">{cls.grade}</Badge>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={getComponentStatusColor(cls.status) + " px-3 py-1 font-medium"}>
              <div className="w-2 h-2 mr-1.5 bg-current inline-block"></div>
              {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
            </Badge>
            
            {/* Current lesson status badge (if applicable) */}
            {cls.currentLesson && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse px-3 py-1  font-medium">
                <span className="w-2 h-2  mr-1.5 bg-red-500 inline-block animate-pulse"></span>
                Live Lesson
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {/* Quick Stats Bar */}
        <div className="mb-5 grid grid-cols-4 gap-2 text-xs">
          <div className="bg-blue-50 p-2 rounded flex flex-col items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">{cls.students}</span>
            <span className="text-blue-700">Students</span>
          </div>
          {cls.attendance && (
            <div className="bg-amber-50 p-2 rounded flex flex-col items-center justify-center">
              <span className="text-amber-600 font-bold text-lg">{cls.attendance.rate}</span>
              <span className="text-amber-700">Attendance</span>
            </div>
          )}
          {cls.academicPerformance && (
            <div className="bg-emerald-50 p-2 rounded flex flex-col items-center justify-center">
              <span className="text-emerald-600 font-bold text-lg">{cls.academicPerformance.averageGrade}</span>
              <span className="text-emerald-700">Avg Grade</span>
            </div>
          )}
          {cls.fees && (
            <div className="bg-purple-50 p-2 rounded flex flex-col items-center justify-center">
              <span className="text-purple-600 font-bold text-lg">{cls.fees.unpaidCount}</span>
              <span className="text-purple-700">Fee Pending</span>
            </div>
          )}
        </div>
        
        {/* Current lesson section - displayed prominently if there's an ongoing lesson */}
        {cls.currentLesson && (
          <div className="mb-5 bg-gradient-to-r from-green-50 to-green-100 p-4 border-l-4 border-green-500 shadow-sm">
            <h4 className="text-sm font-semibold text-green-800 flex items-center mb-2">
              <BookOpen className="h-5 w-5 mr-2" />
              Ongoing: {getSubjectById(cls.currentLesson.subjectId)?.name || cls.currentLesson.subjectId} Class
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <User className="h-3.5 w-3.5 mr-1.5 text-green-700" />
                <span className="text-xs text-gray-700">{getTeacherById(cls.currentLesson.teacherId) ? `${getTeacherById(cls.currentLesson.teacherId)?.firstName} ${getTeacherById(cls.currentLesson.teacherId)?.lastName}` : cls.currentLesson.teacherId}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-green-700" />
                <span className="text-xs text-gray-700">{cls.currentLesson.startTime} - {cls.currentLesson.endTime}</span>
              </div>
              {cls.currentLesson.topic && (
                <div className="flex items-center col-span-2">
                  <FileText className="h-3.5 w-3.5 mr-1.5 text-green-700" />
                  <span className="text-xs text-gray-700">Topic: {cls.currentLesson.topic}</span>
                </div>
              )}
              {cls.currentLesson.room && (
                <div className="flex items-center col-span-2">
                  <Layers className="h-3.5 w-3.5 mr-1.5 text-green-700" />
                  <span className="text-xs text-gray-700">Room: {cls.currentLesson.room}</span>
                </div>
              )}
              
              <div className="flex items-center col-span-2 mt-2 justify-end">
                <Users className="h-3 w-3 mr-1 text-green-700" /> 
                <span className="text-xs text-gray-700">{cls.students} students</span>
              </div>
            </div>
          </div>
        )}

        {/* Basic class info - premium card layout */}
        <div className="bg-gradient-to-r from-slate-50 to-gray-50  p-4 shadow-sm border border-gray-100 mb-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
                <div className="mr-2 p-1 bg-blue-100  flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-blue-700" />
                </div>
                Staff & Students
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-5 h-5 flex justify-center items-center text-gray-500">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="ml-2 flex items-center">
                    <span className="font-medium">{cls.classTeacherId ? getTeacherById(cls.classTeacherId)?.firstName + " " + getTeacherById(cls.classTeacherId)?.lastName : (cls.instructorId ? getTeacherById(cls.instructorId)?.firstName + " " + getTeacherById(cls.instructorId)?.lastName : "No Teacher Assigned")}</span>
                    {cls.classTeacherId && <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded ml-2">Class Teacher</span>}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 flex justify-center items-center text-gray-500">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="ml-2">
                    <span className="font-medium">{cls.students}</span> students
                    {cls.genderBreakdown && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5  ml-2">
                        {cls.genderBreakdown.male} boys, {cls.genderBreakdown.female} girls
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-700 flex items-center">
                <div className="mr-2 p-1 bg-purple-100  flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-purple-700" />
                </div>
                Schedule
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-5 h-5 flex justify-center items-center text-gray-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="ml-2">{cls.schedule.days.join(', ')}</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 flex justify-center items-center text-gray-500">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="ml-2">{cls.schedule.startTime} - {cls.schedule.endTime}</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 flex justify-center items-center text-gray-500">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <span className="ml-2">Age: {cls.ageGroup}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Class Leadership Section */}
        {cls.classLeadership && (
          <div className="mb-5 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 shadow-sm border border-indigo-100">
            <h4 className="text-sm font-semibold mb-3 text-indigo-900 flex items-center">
              <div className="mr-2 p-1 bg-indigo-100 flex items-center justify-center">
                <Crown className="h-3.5 w-3.5 text-indigo-700" />
              </div>
              Class Leadership
            </h4>
            
            {/* Leadership Summary Bar */}
            <div className="flex items-center justify-between bg-white p-2 shadow-sm mb-3 border-l-4 border-indigo-500">
              <div className="flex items-center">
                <div className="p-1.5 mr-2 rounded-full bg-indigo-100">
                  <Crown className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs text-indigo-600 font-medium">Led by</div>
                  <div className="font-semibold text-indigo-900">
                    {cls.classLeadership?.prefectId ? getStudentNameById(cls.classLeadership.prefectId) : "No prefect assigned"}
                  </div>
                </div>
              </div>
              
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                {(cls.classLeadership.classMonitors?.length || 0) + 
                 (cls.classLeadership.assistantPrefectId ? 1 : 0) + 
                 (cls.classLeadership.timekeeperId ? 1 : 0) + 
                 (cls.classLeadership.prefectId ? 1 : 0)} Leaders
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              {cls.classLeadership.prefectId && (
                <div className="flex items-center bg-white p-2 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-1.5 mr-2 bg-indigo-100 rounded-full">
                    <Crown className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-600 font-medium">Prefect</div>
                    <div className="font-medium">{typeof cls.classLeadership.prefectId === 'string' ? cls.classLeadership.prefectId : 'Invalid ID'}</div>
                  </div>
                </div>
              )}
              {cls.classLeadership.assistantPrefectId && (
                <div className="flex items-center bg-white p-2 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-1.5 mr-2 bg-blue-100 rounded-full">
                    <Trophy className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-600 font-medium">Assistant</div>
                    <div>{typeof cls.classLeadership.assistantPrefectId === 'string' ? cls.classLeadership.assistantPrefectId : 'Invalid ID'}</div>
                  </div>
                </div>
              )}
              {cls.classLeadership.timekeeperId && (
                <div className="flex items-center bg-white p-2 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="p-1.5 mr-2 bg-green-100 rounded-full">
                    <Clock className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-600 font-medium">Timekeeper</div>
                    <div>{typeof cls.classLeadership.timekeeperId === 'string' ? cls.classLeadership.timekeeperId : 'Invalid ID'}</div>
                  </div>
                </div>
              )}
              
              {/* Subject Monitors Section */}
              {cls.classLeadership.subjectMonitors && Object.keys(cls.classLeadership.subjectMonitors).length > 0 && (
                <div className="col-span-2 mb-2 bg-white p-2 shadow-sm">
                  <div className="text-xs text-indigo-600 font-medium mb-2">Subject Monitors</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(cls.classLeadership.subjectMonitors).map(([subject, monitor], idx) => (
                      <div key={idx} className="flex items-center text-xs">
                        <Badge className="bg-blue-50 text-blue-700 mr-1 w-24 justify-center overflow-hidden text-ellipsis">
                          {subject}
                        </Badge>
                        <span>{monitor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {cls.classLeadership.classMonitors && cls.classLeadership.classMonitors.length > 0 && (
                <div className="col-span-2 mt-1">
                  <div className="text-xs text-indigo-600 font-medium mb-1">Class Monitors</div>
                  <div className="flex flex-wrap gap-2">
                    {cls.classLeadership.classMonitors.map((monitor, idx) => (
                      <Badge key={idx} className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
                        {monitor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Attendance Statistics */}
        {cls.attendance && (
          <div className="mb-5 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 shadow-sm border border-indigo-100">
            <h4 className="text-sm font-semibold mb-3 text-indigo-900 flex items-center">
              <div className="mr-2 p-1 bg-indigo-100 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-indigo-700" />
              </div>
              Attendance Statistics
              <Badge variant="outline" className="ml-2 text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-200">
                {cls.attendance.rate}% Present
              </Badge>
            </h4>
            
            {/* Overall attendance metrics */}
            <div className="bg-white p-3 shadow-sm mb-3 border border-indigo-100">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex flex-col items-center p-2 bg-indigo-50 rounded-md">
                  <div className="text-xs text-indigo-600 font-medium mb-1">Present Today</div>
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 mr-1.5 text-green-600" />
                    <div className="font-bold text-xl">{cls.attendance.presentToday ?? cls.attendance.present ?? 0}</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-red-50 rounded-md">
                  <div className="text-xs text-red-600 font-medium mb-1">Absent Today</div>
                  <div className="flex items-center">
                    <UserX className="h-4 w-4 mr-1.5 text-red-600" />
                    <div className="font-bold text-xl">{cls.attendance.absentToday ?? (cls.attendance.absences ? cls.attendance.absences.total : 0)}</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-amber-50 rounded-md">
                  <div className="text-xs text-amber-600 font-medium mb-1">Late Today</div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1.5 text-amber-600" />
                    <div className="font-bold text-xl">{cls.attendance.lateToday ?? 0}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Weekly Attendance Trend */}
            <div className="bg-white p-3 shadow-sm mb-3 border border-indigo-100">
              <div className="text-xs text-indigo-700 font-medium mb-2 flex justify-between items-center">
                <span>Weekly Attendance Trend</span>
                <div className="text-gray-500">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' - '}
                  {(() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 6);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  })()}
                </div>
              </div>
              
              <div className="flex items-end space-x-1 h-24">
                {[...Array(7)].map((_, i) => {
                  // Generate more realistic attendance data - higher on weekdays, lower on weekends
                  const isWeekend = i > 4;
                  const baseRate = isWeekend ? 70 : 90;
                  const variance = isWeekend ? 20 : 8;
                  const rate = Math.min(100, Math.max(0, baseRate - Math.floor(Math.random() * variance)));
                  const height = rate + '%';
                  const day = new Date();
                  day.setDate(day.getDate() - (6 - i));
                  const dayLabel = day.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 1);
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-1">{rate}%</div>
                      <div 
                        className={`w-full rounded-t ${rate > 90 ? 'bg-green-500' : rate > 80 ? 'bg-blue-500' : rate > 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ height }}
                      />
                      <div className="text-xs text-center text-gray-600 mt-1">{dayLabel}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Absenteeism Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Frequently Absent Students */}
              <div className="bg-white p-3 shadow-sm border border-indigo-100">
                <div className="text-xs font-medium mb-2 text-indigo-700">Frequent Absentees</div>
                {cls.attendance.frequentAbsentees && cls.attendance.frequentAbsentees.length > 0 ? (
                  <div className="space-y-1.5">
                    {cls.attendance.frequentAbsentees.slice(0, 3).map((absentee, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                          <UserX className="h-3 w-3 mr-1.5 text-red-500" />
                          <span>{absentee.student}</span>
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          {absentee.days} days
                        </Badge>
                      </div>
                    ))}
                    
                    {cls.attendance.frequentAbsentees.length > 3 && (
                      <div className="text-xs text-center text-indigo-600 pt-1">
                        +{cls.attendance.frequentAbsentees.length - 3} more students
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">No frequent absentees</div>
                )}
              </div>
              
              {/* Recent Absences */}
              <div className="bg-white p-3 shadow-sm border border-indigo-100">
                <div className="text-xs font-medium mb-2 text-indigo-700">Today's Absences</div>
                {cls.attendance.absentStudents && cls.attendance.absentStudents.length > 0 ? (
                  <div className="space-y-1">
                    {cls.attendance.absentStudents.slice(0, 3).map((absentee, idx) => (
                      <div key={idx} className="flex items-center text-xs">
                        <CalendarX className="h-3 w-3 mr-1.5 text-red-500" />
                        <span>{absentee.student}</span>
                        {idx === 0 && (
                          <Badge variant="outline" className="ml-1 text-xs bg-red-50 text-red-700 border-red-200">
                            {absentee.reason || 'Sick'}
                          </Badge>
                        )}
                      </div>
                    ))}
                    
                    {cls.attendance.absentStudents.length > 3 && (
                      <div className="text-xs text-center text-indigo-600 pt-1">
                        +{cls.attendance.absentStudents.length - 3} more absences today
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">No absences recorded today</div>
                )}
              </div>
            </div>
            
            {/* Attendance Statistics */}
            <div className="bg-white p-3 shadow-sm border border-indigo-100">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-indigo-600 font-medium mb-1">Monthly Averages</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span className="font-medium">{(parseFloat(cls.attendance.rate) + (Math.random() * 5 - 2.5)).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Absences:</span>
                      <span className="font-medium">{Math.round(cls.attendance.absent * 4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Excused:</span>
                      <span className="font-medium">{Math.round(cls.attendance.absent * 4 * 0.6)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-indigo-600 font-medium mb-1">Absence Type</div>
                  <div className="flex items-center mt-2 flex-wrap">
                    <div className="flex items-center mr-3 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                      <span>Sick: {cls.attendance.absences ? Math.round(cls.attendance.absences.medical) : 0}</span>
                    </div>
                    <div className="flex items-center mr-3 mb-1">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-1"></div>
                      <span>Family: {cls.attendance.absences ? Math.round(cls.attendance.absences.excused) : 0}</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
                      <span>Other: {cls.attendance.absences ? Math.round(cls.attendance.absences.unexcused) : 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Resource Allocation Section */}
        <div className="mb-5 bg-gradient-to-r from-teal-50 to-cyan-50 p-4 shadow-sm border border-teal-100">
          <h4 className="text-sm font-semibold mb-3 text-teal-900 flex items-center">
            <div className="mr-2 p-1 bg-teal-100 flex items-center justify-center">
              <Layers className="h-3.5 w-3.5 text-teal-700" />
            </div>
            Resource Allocation
          </h4>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white p-2 rounded flex flex-col items-center justify-center">
              <div className="text-xs text-teal-600 font-medium mb-1">Textbooks</div>
              <div className="font-bold text-lg">{Math.floor(Math.random() * 15) + 30}/{cls.students} Students</div>
            </div>
            
            <div className="bg-white p-2 rounded flex flex-col items-center justify-center">
              <div className="text-xs text-teal-600 font-medium mb-1">Learning Materials</div>
              <div className="font-bold text-lg">{Math.floor(Math.random() * 10) + 40}/{cls.students} Students</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 col-span-2">
              <div className="bg-white p-2 rounded flex flex-col items-center justify-center">
                <div className="text-xs text-teal-600 font-medium mb-1">Desks</div>
                <div className="font-bold text-lg">{cls.students}</div>
              </div>
              <div className="bg-white p-2 rounded flex flex-col items-center justify-center">
                <div className="text-xs text-teal-600 font-medium mb-1">Computers</div>
                <div className="font-bold text-lg">{Math.floor(cls.students * 0.7)}</div>
              </div>
              <div className="bg-white p-2 rounded flex flex-col items-center justify-center">
                <div className="text-xs text-teal-600 font-medium mb-1">Boards</div>
                <div className="font-bold text-lg">{cls.level === 'senior-secondary' ? 2 : 1}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Academic Performance Section */}
        {cls.academicPerformance && (
          <div className="mb-5 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-sm border border-emerald-100">
            <h4 className="text-sm font-semibold mb-3 text-emerald-900 flex items-center">
              <div className="mr-2 p-1 bg-emerald-100 flex items-center justify-center">
                <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
              </div>
              Academic Performance
              <Badge variant="outline" className="ml-2 text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                {cls.academicPerformance.overallPerformance}
              </Badge>
            </h4>
            
            {/* Performance metrics overview */}
            <div className="bg-white p-3 shadow-sm mb-3 border border-emerald-100">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex flex-col items-center">
                  <div className="text-xs text-emerald-600 font-medium mb-1">Average Grade</div>
                  <div className="font-bold text-xl">{cls.academicPerformance.averageGrade}</div>
                  {cls.academicPerformance.previousTerm && (
                    <div className="flex items-center mt-1 text-xs">
                      <span className="text-gray-500 mr-1">Previous: {cls.academicPerformance.previousTerm.averageGrade}</span>
                      {cls.academicPerformance.improvement > 0 ? (
                        <span className="text-green-600 flex items-center">
                          <ArrowUp className="h-3 w-3 mr-0.5" />
                          {cls.academicPerformance.improvement}%
                        </span>
                      ) : cls.academicPerformance.improvement < 0 ? (
                        <span className="text-red-600 flex items-center">
                          <ArrowDown className="h-3 w-3 mr-0.5" />
                          {Math.abs(cls.academicPerformance.improvement)}%
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center">
                          <ArrowRight className="h-3 w-3 mr-0.5" />
                          {cls.academicPerformance.improvement}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-xs text-emerald-600 font-medium mb-1">Class Ranking</div>
                  <div className="font-bold text-xl">
                    {cls.academicPerformance.ranking}
                    <span className="text-sm font-normal text-gray-500">/{cls.academicPerformance.totalClasses || '–'}</span>
                  </div>
                  {cls.academicPerformance.previousTerm && (
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      Previous: {cls.academicPerformance.previousTerm.ranking}/{cls.academicPerformance.totalClasses || '–'}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-xs text-emerald-600 font-medium mb-1">Target Mean</div>
                  <div className="font-bold text-xl">
                    {cls.academicPerformance.targetMeanScore || '–'}
                  </div>
                  <div className="flex items-center mt-1 text-xs">
                    {cls.academicPerformance.averageGrade && cls.academicPerformance.targetMeanScore && (
                      <Badge className={
                        (parseFloat(cls.academicPerformance.averageGrade) >= parseFloat(String(cls.academicPerformance.targetMeanScore || '0'))) ?
                        "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }>
                        {(parseFloat(cls.academicPerformance.averageGrade) >= parseFloat(String(cls.academicPerformance.targetMeanScore || '0'))) ?
                          'Target Achieved' : 'Below Target'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subject Performance Section */}
            {cls.academicPerformance.subjectPerformance && Object.keys(cls.academicPerformance.subjectPerformance).length > 0 && (
              <div className="bg-white p-3 border border-emerald-100 shadow-sm mb-3">
                <div className="text-xs font-medium mb-2 text-emerald-700 border-b border-emerald-100 pb-2">
                  Subject Performance
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(cls.academicPerformance.subjectPerformance).slice(0, 4).map(([subject, data], idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="w-32 text-xs">{subject}</div>
                      <div className="flex-grow">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${idx % 2 === 0 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                            style={{ width: `${Math.min(100, (data.averageScore / 100) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-2 text-xs font-medium w-8 text-right">{data.averageScore}%</div>
                      <div className="ml-2 text-xs w-16 text-right">
                        <span className="text-green-600">{data.highestScore}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-red-500">{data.lowestScore}</span>
                      </div>
                    </div>
                  ))}
                  
                  {Object.keys(cls.academicPerformance.subjectPerformance).length > 4 && (
                    <div className="text-xs text-center text-emerald-600">
                      +{Object.keys(cls.academicPerformance.subjectPerformance).length - 4} more subjects
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Top Students Section */}
            {cls.academicPerformance.topStudents && cls.academicPerformance.topStudents.length > 0 && (
              <div className="bg-white p-3 border border-emerald-100 shadow-sm">
                <div className="text-xs font-medium mb-2 text-emerald-700 flex justify-between items-center">
                  <span>Top Performing Students</span>
                  <Badge className="bg-emerald-100 text-emerald-800">
                    {cls.academicPerformance.topStudents.length} students
                  </Badge>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {cls.academicPerformance.topStudents.slice(0, 3).map((studentId, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-gray-200 text-gray-700' : 'bg-amber-50 text-amber-700'}`}>
                          {idx + 1}
                        </div>
                        <span className="ml-2 text-sm">{studentId}</span>
                      </div>
                      <Badge className={idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-gray-100 text-gray-800' : 'bg-amber-50 text-amber-700'}>
                        {idx === 0 ? 'A' : idx === 1 ? 'A-' : 'B+'}
                      </Badge>
                    </div>
                  ))}
                  
                  {cls.academicPerformance.topStudents.length > 3 && (
                    <div className="py-1 text-xs text-center text-emerald-600">
                      +{cls.academicPerformance.topStudents.length - 3} more top students
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Attendance Section */}
        {cls.attendance && (
          <div className="mb-5 bg-gradient-to-r from-amber-50 to-orange-50  p-4 shadow-sm border border-amber-100">
            <h4 className="text-sm font-semibold mb-3 text-amber-900 flex items-center">
              <div className="mr-2 p-1 bg-amber-100  flex items-center justify-center">
                <CalendarDays className="h-3.5 w-3.5 text-amber-700" />
              </div>
              Attendance
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-2  shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-600 font-medium">Attendance Rate</div>
                  <div className="font-bold text-lg">{cls.attendance.rate}</div>
                </div>
                {cls.attendance.trend && (
                  <Badge 
                    variant="outline" 
                    className={(cls.attendance.trend === 'improving' ? 
                      'bg-green-50 text-green-700 border-green-100' : 
                      cls.attendance.trend === 'stable' ? 
                      'bg-blue-50 text-blue-700 border-blue-100' : 
                      'bg-red-50 text-red-700 border-red-100') + " px-2 py-1 capitalize"}
                  >
                    {cls.attendance.trend === 'improving' && <ArrowUp className="h-3 w-3 mr-1 inline" />}
                    {cls.attendance.trend === 'declining' && <ArrowDown className="h-3 w-3 mr-1 inline" />}
                    {cls.attendance.trend === 'stable' && <ArrowRight className="h-3 w-3 mr-1 inline" />}
                    {cls.attendance.trend}
                  </Badge>
                )}
              </div>
              
              <div className="bg-white p-2  shadow-sm">
                <div className="text-xs text-amber-600 font-medium mb-1">Absences</div>
                <div className="grid grid-cols-2 gap-2">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 justify-center">
                    {cls.attendance.absentToday} today
                  </Badge>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 justify-center">
                    {cls.attendance.absentThisWeek} this week
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Assignments Tracking Section */}
        {/* Schedule */}
        <div className="mb-5 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 shadow-sm border border-amber-100">
          <h4 className="text-sm font-semibold mb-3 text-amber-900 flex items-center">
            <div className="mr-2 p-1 bg-amber-100 flex items-center justify-center">
              <CalendarDays className="h-3.5 w-3.5 text-amber-700" />
            </div>
            Schedule
          </h4>
          
          {/* Weekly Timetable Visualization */}
          <div className="bg-white p-3 shadow-sm text-sm mb-3 overflow-x-auto">
            <div className="text-xs font-medium mb-2">Weekly Timetable</div>
            <table className="w-full min-w-max border-collapse text-xs">
              <thead>
                <tr className="bg-amber-50">
                  <th className="p-1 border border-amber-100 w-20">Time</th>
                  <th className="p-1 border border-amber-100">Monday</th>
                  <th className="p-1 border border-amber-100">Tuesday</th>
                  <th className="p-1 border border-amber-100">Wednesday</th>
                  <th className="p-1 border border-amber-100">Thursday</th>
                  <th className="p-1 border border-amber-100">Friday</th>
                </tr>
              </thead>
              <tbody>
                {['8:00-9:00', '9:00-10:00', '10:00-11:00', '11:30-12:30', '12:30-1:30'].map((timeSlot, timeIdx) => (
                  <tr key={timeIdx} className="hover:bg-amber-50">
                    <td className="p-1 border border-amber-100 font-medium text-center">{timeSlot}</td>
                    {[0, 1, 2, 3, 4].map((day) => {
                      // Randomly determine if this class is happening in this time slot for this day
                      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
                      const hasClass = cls.schedule.days.includes(weekdays[day] as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday') && Math.random() > 0.7;
                      const subjects = ['Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies', 'PE', 'Art', 'Music'];
                      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
                      
                      return (
                        <td key={day} className="p-1 border border-amber-100 text-center">
                          {hasClass ? (
                            <div className="p-1 bg-amber-100 rounded text-amber-800 text-xs">
                              {randomSubject}
                              <div className="text-xs text-amber-600">{cls.instructorId}</div>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Class time and dates - Summary */}
          <div className="bg-white p-3 shadow-sm text-sm mb-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-amber-600 font-medium mb-1">Days</div>
                <div className="font-medium">{cls.schedule.days.join(', ')}</div>
              </div>
              <div>
                <div className="text-xs text-amber-600 font-medium mb-1">Time</div>
                <div className="font-medium">{cls.schedule.startTime} - {cls.schedule.endTime}</div>
              </div>
              {cls.schedule.venue && (
                <div className="col-span-2">
                  <div className="text-xs text-amber-600 font-medium mb-1">Venue</div>
                  <div className="font-medium">{cls.schedule.venue}</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Age group */}
          <div className="text-sm">
            <div className="text-xs text-amber-600 font-medium mb-1">Age Group</div>
            <div className="font-medium">{cls.ageGroup}</div>
          </div>
        </div>
        
        {/* Syllabus Progress Section */}
        <div className="mb-5 bg-gradient-to-r from-blue-50 to-sky-50 p-4 shadow-sm border border-blue-100">
          <h4 className="text-sm font-semibold mb-3 text-blue-900 flex items-center">
            <div className="mr-2 p-1 bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-3.5 w-3.5 text-blue-700" />
            </div>
            Syllabus Progress
            <Badge variant="outline" className="ml-2 text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
              {Math.floor(Math.random() * 30) + 70}% Complete
            </Badge>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Overall Progress Bar */}
            <div className="bg-white p-3 shadow-sm col-span-full">
              <div className="flex justify-between mb-1 text-xs">
                <span>Term Progress</span>
                <span className="font-medium">{Math.floor(Math.random() * 30) + 70 + '%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: (Math.floor(Math.random() * 30) + 70) + '%' }}
                ></div>
              </div>
              
              {/* Key Subjects Progress */}
              <div className="grid grid-cols-1 gap-2 mt-2">
                {['Mathematics', 'English', 'Kiswahili', 'Science'].map((subject, idx) => {
                  const progress = Math.floor(Math.random() * 30) + 70;
                  return (
                    <div key={idx} className="flex items-center">
                      <div className="w-20 text-xs">{subject}</div>
                      <div className="flex-grow">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={idx % 2 === 0 ? 'bg-blue-500 h-1.5 rounded-full' : 'bg-sky-500 h-1.5 rounded-full'} 
                            style={{ width: progress + '%' }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-8 text-right text-xs ml-2">{progress + '%'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Upcoming Topics */}
            <div className="bg-white p-3 shadow-sm">
              <div className="text-xs font-medium mb-2 text-blue-700">Upcoming Topics</div>
              <ul className="text-xs space-y-1.5">
                {['Quadratic Equations', 'Essay Writing', 'Digestive System', 'Kenyan History'].map((topic, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="p-0.5 bg-blue-100 rounded-full mr-1.5 mt-0.5">
                      <ChevronRight className="h-2.5 w-2.5 text-blue-700" />
                    </div>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Completed Topics */}
            <div className="bg-white p-3 shadow-sm">
              <div className="text-xs font-medium mb-2 text-green-700">Recently Completed</div>
              <ul className="text-xs space-y-1.5">
                {['Linear Equations', 'Comprehension', 'Plant Cells', 'Pre-Colonial Kenya'].map((topic, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="p-0.5 bg-green-100 rounded-full mr-1.5 mt-0.5">
                      <Check className="h-2.5 w-2.5 text-green-700" />
                    </div>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Upcoming Examinations */}
        <div className="mb-5 bg-gradient-to-r from-rose-50 to-red-50 p-4 shadow-sm border border-rose-100">
          <h4 className="text-sm font-semibold mb-3 text-rose-900 flex items-center">
            <div className="mr-2 p-1 bg-rose-100 flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-rose-700" />
            </div>
            Upcoming Exams
          </h4>
          
          <div className="bg-white overflow-hidden border border-rose-100 divide-y divide-rose-100">
            {[1, 2, 3].map((_, idx) => {
              const daysAway = Math.floor(Math.random() * 14) + 1;
              const examDate = new Date();
              examDate.setDate(examDate.getDate() + daysAway);
              const formattedDate = examDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short'});
              const subjects = ['End-Term Mathematics', 'English CAT', 'Science Practical', 'Kiswahili Insha'];
              
              return (
                <div key={idx} className="p-2.5 hover:bg-rose-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm">{subjects[idx]}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{['90 minutes', '45 minutes', '2 hours'][idx]}</div>
                    </div>
                    <Badge className={daysAway <= 3 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}>
                      {formattedDate}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs flex items-center">
                    <FilePlus className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                    {Math.floor(Math.random() * 10) + 30} students registered
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Assignments Tracking Section */}
        {cls.assignments && (
          <div className="mb-5 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 shadow-sm border border-blue-100">
            <h4 className="text-sm font-semibold mb-3 text-blue-900 flex items-center">
              <div className="mr-2 p-1 bg-blue-100 flex items-center justify-center">
                <FileText className="h-3.5 w-3.5 text-blue-700" />
              </div>
              Assignments & Homework
            </h4>
            
            <div className="bg-white p-3 shadow-sm mb-3">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex flex-col items-center justify-center p-1 bg-blue-50 rounded">
                  <div className="text-xs text-blue-600 font-medium mb-1">Issued</div>
                  <div className="font-bold text-lg">{cls.assignments.issued}</div>
                </div>
                <div className="flex flex-col items-center justify-center p-1 bg-green-50 rounded">
                  <div className="text-xs text-green-600 font-medium mb-1">Submitted</div>
                  <div className="font-bold text-lg">{cls.assignments.submitted}</div>
                </div>
                <div className="flex flex-col items-center justify-center p-1 bg-amber-50 rounded">
                  <div className="text-xs text-amber-600 font-medium mb-1">Pending</div>
                  <div className="font-bold text-lg">{cls.assignments.issued - cls.assignments.submitted}</div>
                </div>
              </div>
            </div>
              
            {/* Upcoming assignments */}
            {cls.assignments.upcoming && cls.assignments.upcoming.length > 0 && (
              <div className="bg-white border border-blue-100 overflow-hidden">
                <div className="bg-blue-50 px-3 py-1.5">
                  <div className="font-medium text-blue-800 text-xs">Upcoming Assignments</div>
                </div>
                <div className="p-2 text-xs">
                  {cls.assignments.upcoming.map((assignment, idx) => (
                    <Badge key={idx} className="bg-blue-50 text-blue-700 border-blue-100 mb-1 mr-1">
                      {assignment.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Discipline Section */}
        {cls.discipline && (
          <div className="mb-5 bg-gradient-to-r from-rose-50 to-red-50 p-4 shadow-sm border border-rose-100">
            <h4 className="text-sm font-semibold mb-3 text-rose-900 flex items-center">
              <div className="mr-2 p-1 bg-rose-100 flex items-center justify-center">
                <Info className="h-3.5 w-3.5 text-rose-700" />
              </div>
              Discipline Records
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-2 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs text-rose-600 font-medium">Warning Reports</div>
                  <div className="font-bold text-lg">{cls.discipline.warningReports}</div>
                </div>
                {cls.discipline.warningReports > 5 && <Badge className="bg-red-100 text-red-800">High</Badge>}
                {cls.discipline.warningReports > 0 && cls.discipline.warningReports <= 5 && <Badge className="bg-amber-100 text-amber-800">Medium</Badge>}
                {cls.discipline.warningReports === 0 && <Badge className="bg-green-100 text-green-800">None</Badge>}
              </div>
              
              <div className="bg-white p-2 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs text-rose-600 font-medium">Suspensions</div>
                  <div className="font-bold text-lg">{cls.discipline.suspensions}</div>
                </div>
                {cls.discipline.suspensions > 0 && <Badge className="bg-red-100 text-red-800">Action Needed</Badge>}
                {cls.discipline.suspensions === 0 && <Badge className="bg-green-100 text-green-800">None</Badge>}
              </div>
            </div>
          </div>
        )}
        
        {/* Fee Status Section (if applicable) - Enhanced with visual indicators */}
        {cls.fees && (
          <div className="mb-5 bg-gradient-to-r from-purple-50 to-fuchsia-50 p-4 shadow-sm border border-purple-100">
            <h4 className="text-sm font-semibold mb-3 text-purple-900 flex items-center">
              <div className="mr-2 p-1 bg-purple-100 flex items-center justify-center">
                <Banknote className="h-3.5 w-3.5 text-purple-700" />
              </div>
              Fee Status
              <Badge variant="outline" className="ml-2 text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                {Math.round((cls.fees.paid / cls.fees.billed) * 100) + '%'} Collection
              </Badge>
            </h4>
            
            {/* Payment Progress Visual Bar */}
            <div className="bg-white p-3 shadow-sm mb-3">
              <div className="flex justify-between mb-1 text-xs">
                <span>Fee Collection Progress</span>
                <span className="font-medium">{Math.round((cls.fees.paid / cls.fees.billed) * 100) + '%'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full" 
                  style={{ width: Math.round((cls.fees.paid / cls.fees.billed) * 100) + '%' }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="bg-purple-50 p-2 rounded">
                  <div className="text-xs text-purple-600 font-medium mb-1">Billed</div>
                  <div className="font-semibold">KES {cls.fees.billed.toLocaleString()}</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-xs text-green-600 font-medium mb-1">Paid</div>
                  <div className="font-semibold text-green-700">KES {cls.fees.paid.toLocaleString()}</div>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <div className="text-xs text-red-600 font-medium mb-1">Pending</div>
                  <div className="font-semibold text-red-600">KES {cls.fees.pending.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            {/* Payment Statistics */}
            <div className="bg-white p-3 shadow-sm mb-3 flex justify-between">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-700">{cls.fees.clearedCount || 0}</div>
                <div className="text-xs text-gray-500">Cleared</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">{cls.fees.unpaidCount}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {Math.round(((cls.fees.clearedCount || 0) / ((cls.fees.clearedCount || 0) + (cls.fees.unpaidCount || 1))) * 100) + '%'}
                </div>
                <div className="text-xs text-gray-500">Rate</div>
              </div>
            </div>
            
            {/* Top Defaulters - Enhanced with payment amount and days overdue */}
            {cls.fees.studentsPendingFees && cls.fees.studentsPendingFees.length > 0 && (
              <div className="bg-white border border-red-100 overflow-hidden">
                <div className="bg-red-50 px-3 py-1.5 flex justify-between items-center">
                  <div className="font-medium text-red-800 text-xs">Students with pending fees</div>
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-800 border-red-200">
                    {cls.fees.unpaidCount} students
                  </Badge>
                </div>
                
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-1.5 text-left">Student</th>
                      <th className="p-1.5 text-right">Amount</th>
                      <th className="p-1.5 text-right">Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cls.fees.studentsPendingFees.slice(0, 5).map((student, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-1.5">{student}</td>
                        <td className="p-1.5 text-right text-red-600 font-medium">KES {(Math.floor(Math.random() * 5000) + 1000).toLocaleString()}</td>
                        <td className="p-1.5 text-right">{Math.floor(Math.random() * 30) + 5}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {cls.fees.studentsPendingFees.length > 5 && (
                  <div className="p-1.5 text-center text-xs text-purple-600 border-t">
                    +{cls.fees.studentsPendingFees.length - 5} more students with pending fees
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col w-full pt-3 pb-4">
        {/* Additional Kenya-specific information */}
        {(cls.parentsMeeting || cls.classTeacherRemarks || cls.clubsRepresentation) && (
          <div className="w-full border-t pt-3 mb-4">
            <div className="bg-gradient-to-r from-gray-50 to-slate-50  p-3 shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold mb-2 text-gray-700 flex items-center">
                <div className="mr-2 p-1 bg-gray-200  flex items-center justify-center">
                  <Info className="h-3 w-3 text-gray-600" />
                </div>
                Additional Information
              </h4>
              
              <div className="space-y-2 text-sm">
                {cls.parentsMeeting && (
                  <div className="flex items-start">
                    <Calendar className="h-3.5 w-3.5 mr-2 mt-0.5 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">Next parents meeting:</span>{' '}
                      <span className="text-gray-600">
                        {cls.parentsMeeting.nextDate} at {cls.parentsMeeting.venue}
                      </span>
                    </div>
                  </div>
                )}
                
                {cls.clubsRepresentation && cls.clubsRepresentation.length > 0 && (
                  <div className="flex items-start">
                    <Trophy className="h-3.5 w-3.5 mr-2 mt-0.5 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-700">Clubs:</span>{' '}
                      <span className="text-gray-600">
                        {cls.clubsRepresentation.join(', ')}
                      </span>
                    </div>
                  </div>
                )}
                
                {cls.classTeacherRemarks && (
                  <div className="mt-2 bg-white border-l-4 border-gray-300 p-2  italic text-gray-600">
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5 inline-block text-gray-400" />
                    "{cls.classTeacherRemarks}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between w-full mt-1 gap-2">
          <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50 flex-1">
            <Users className="mr-2 h-4 w-4" />
            Students
          </Button>
          <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex-1">
            <BookOpen className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}


// Main component for displaying classes
function ClassesPage() {
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all')
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedStream, setSelectedStream] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  // Get available streams for selected grade
  const availableStreams = useMemo(() => {
    return getStreamsForGrade(selectedGradeId)
  }, [selectedGradeId])
  
  // Check if the device is mobile
  const [isMobile, setIsMobile] = useState(false)
  
  // Set up a media query to detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint in Tailwind
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  // Filter classes based on selected criteria
  const filteredClasses = useMemo(() => {
    return mockClasses
      .filter((cls: Class) => selectedGradeId === 'all' || cls.grade === selectedGradeId)
      .filter((cls: Class) => selectedStatus === 'all' || cls.status === selectedStatus)
      .filter((cls: Class) => selectedStream === 'all' || cls.stream === selectedStream)
      .filter((cls: Class) => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        return (
          cls.name.toLowerCase().includes(search) ||
          cls.description.toLowerCase().includes(search) ||
          (getTeacherById(cls.instructorId)?.firstName.toLowerCase().includes(search) || false) ||
          (getTeacherById(cls.instructorId)?.lastName.toLowerCase().includes(search) || false)
        )
      })
  }, [selectedGradeId, selectedStatus, selectedStream, searchTerm])

  // Update selected grade display name when grade ID changes
  useEffect(() => {
    if (selectedGradeId === 'all') {
      setSelectedGrade(null)
      return
    }
    
    const grade = mockGrades.find(g => g.id === selectedGradeId)
    setSelectedGrade(grade ? grade.displayName : null)
  }, [selectedGradeId])

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
      <div 
        className={`${isMobileSidebarOpen ? 'fixed inset-y-0 left-0 z-40 w-72' : 'hidden'} md:flex md:sticky md:top-0 md:flex-col md:w-96 md:h-screen border-r overflow-y-auto p-6 shrink-0 bg-white`}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Classes
          </h2>
          <p className="text-sm text-muted-foreground">Search and filter classes</p>
        </div>

        <div className="space-y-6">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium mb-2">Search Classes</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search classes..."
                className="pl-9 h-12 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>


          {/* Grade filters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Filter by Grade</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSelectedGradeId('all')
                  setSelectedGrade(null)
                }} 
                className="h-7 px-2 text-xs"
                disabled={selectedGradeId === 'all'}
              >
                Clear
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1">
              <Button
                variant={selectedGradeId === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedGradeId('all')
                  setSelectedGrade(null)
                }}
                className={`w-full justify-start ${selectedGradeId === 'all' ? 'bg-gray-600 hover:bg-gray-700' : 'border-gray-200 bg-white'}`}
              >
                All Grades
              </Button>
              
              {/* Group grades by education level */}
              {['preschool', 'primary', 'junior-secondary', 'senior-secondary'].map(level => {
                const levelGrades = mockGrades.filter(g => g.level === level);
                if (levelGrades.length === 0) return null;
                
                return (
                  <div key={level} className="w-full">
                    <div className="mt-2 mb-1 text-xs font-semibold flex items-center">
                      {getLevelIcon(level as EducationLevel)}
                      <span className="ml-1">
                        {level === 'preschool' ? 'Preschool' : 
                         level === 'primary' ? 'Primary' : 
                         level === 'junior-secondary' ? 'Junior Secondary' : 'Senior Secondary'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      {levelGrades.map(grade => (
                        <React.Fragment key={grade.id}>
                          <Button
                            variant={selectedGradeId === grade.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedGradeId(grade.id)
                              setSelectedGrade(grade.displayName)
                              setSelectedStream('all') // Reset stream when changing grade
                            }}
                            className={`w-full justify-start ${selectedGradeId === grade.id ? getComponentLevelColor(grade.level) : 'border-gray-200 bg-white'}`}
                          >
                            <span className="mr-1 font-mono text-xs">{grade.name}</span>
                            {grade.displayName}
                          </Button>
                          
                          {/* Show streams directly under this grade when it's selected */}
                          {selectedGradeId === grade.id && (
                            <div className="ml-4 mt-1 mb-2 space-y-1">
                              {/* Stream filter title */}
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-gray-500">Streams</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setSelectedStream('all')} 
                                  className="h-6 px-2 text-xs"
                                  disabled={selectedStream === 'all'}
                                >
                                  Clear
                                </Button>
                              </div>
                              
                              {/* Stream filter buttons */}
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant={selectedStream === 'all' ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedStream('all')}
                                  className={`w-full justify-start text-xs ${selectedStream === 'all' ? 'bg-gray-600 hover:bg-gray-700' : 'border-gray-200 bg-white'}`}
                                >
                                  All Streams
                                </Button>
                                
                                {getStreamsForGrade(grade.id).map((stream, _index, _array) => {
                                  // Ensure grade is properly typed as Grade object
                                  const gradeObj: Grade = grade;
                                  const streamAbbr = getGradeStreamAbbr(gradeObj, stream);
                                  
                                  return (
                                    <Button
                                      key={stream}
                                      variant={selectedStream === stream ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setSelectedStream(stream)}
                                      className={`w-full justify-start text-xs ${selectedStream === stream ? 'bg-teal-600 hover:bg-teal-700' : 'border-gray-200 bg-white'}`}
                                    >
                                      <span className="font-mono text-xs">{streamAbbr}</span>
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );  

              })}
              
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Classes</h1>
            <p className="text-gray-600">
              Manage class information, assignments, and student performance across all grades
            </p>
          </div>

          <div className="flex gap-2">
            {/* Add Class button */}
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add Class
            </Button>
            {/* Export Report button */}
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Export Report
            </Button>
            
            {/* Show filter button on mobile */}
            <Button 
              variant="outline" 
              className="md:hidden" 
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Active filter indicators */}
        {(selectedStatus !== 'all' || selectedGradeId !== 'all' || selectedStream !== 'all' || searchTerm) && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <p className="text-sm font-medium mr-2">Active filters:</p>
            

            
            {selectedStatus !== 'all' && (
              <Badge variant="outline" className="flex gap-1 items-center">
                Status: {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStatus('all')} />
              </Badge>
            )}
            
            {selectedGradeId !== 'all' && (
              <Badge variant="outline" className="flex gap-1 items-center">
                Grade: {selectedGrade}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedGradeId('all')} />
              </Badge>
            )}
            
            {selectedStream !== 'all' && (
              <Badge variant="outline" className="flex gap-1 items-center bg-teal-50 border-teal-300">
                Stream: {selectedStream}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStream('all')} />
              </Badge>
            )}
            
            {searchTerm && (
              <Badge variant="outline" className="flex gap-1 items-center">
                Search: {searchTerm}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-gray-500 hover:text-gray-700" 
              onClick={() => {
                setSelectedStatus('all')
                setSelectedGradeId('all')
                setSelectedStream('all')
                setSearchTerm('')
              }}
            >Clear all</Button>
          </div>
        )}
        
        {/* Filter summary bar */}
        {(selectedStatus !== 'all' || selectedGrade) && (
          <div className="bg-gray-50 p-3 mb-6 rounded-lg border flex flex-wrap items-center text-sm">
            <div className="text-gray-600 mr-2">Filters:</div>
            

            
            {selectedStatus !== 'all' && (
              <Badge variant="secondary" className="mr-2">
                Status: {selectedStatus} 
                <button 
                  onClick={() => setSelectedStatus('all')} 
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >×</button>
              </Badge>
            )}
            
            {selectedGrade && (
              <Badge variant="secondary" className="mr-2">
                Grade: {selectedGrade} 
                <button 
                  onClick={() => setSelectedGradeId('all')} 
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >×</button>
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-gray-500 hover:text-gray-700" 
              onClick={() => {
                setSelectedStatus('all')
                setSelectedGradeId('all')
                setSelectedStream('all')
                setSearchTerm('')
              }}
            >Clear all</Button>
          </div>
        )}
        
        {/* Display filtered classes or empty state */}
        <div className="grid grid-cols-1 gap-6">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((cls: Class) => (
              <ClassCard key={cls.id} cls={cls} />
            ))
          ) : (
            <div className="col-span-3">
              <EmptyState 
                selectedGrade={selectedGrade} 
                selectedStatus={selectedStatus} 
                searchTerm={searchTerm} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Export the ClassesPage component as default
export default ClassesPage;

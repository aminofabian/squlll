"use client"

import { useState, useMemo } from 'react'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { ExamsFilterSidebar } from "@/components/dashboard/ExamsFilterSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Plus, 
  Eye, 
  Edit, 
  Download, 
  FileText, 
  BarChart3, 
  Users, 
  Trophy, 
  Calendar,
  BookOpen,
  Target,
  TrendingUp,
  GraduationCap,
  Filter,
  ArrowLeft,
  User,
  School,
  Clock,
  Star,
  ChevronDown,
  ChevronRight,
  Award,
  CheckCircle
} from "lucide-react"
import { mockExams, mockStudentResults, subjects } from "@/lib/data/mockExams"
import { Exam, StudentExamResult } from "@/types/exam"
import { format } from "date-fns"
import { CreateExamDrawer } from "./components/CreateExamDrawer"
import { ReportCardTemplateModal } from "./components/ReportCardTemplateModal"

// Student Performance View Component
function StudentPerformanceView({ studentId }: { studentId: string }) {
  const studentResults = mockStudentResults.filter(r => r.studentId === studentId)
  const student = studentResults[0]?.student

  if (!student) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">Student not found</h3>
            <p className="text-gray-600">No performance data available for this student.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const averageScore = studentResults.length > 0 ? 
    studentResults.reduce((sum, r) => sum + r.percentage, 0) / studentResults.length : 0

  // Calculate subject-wise performance
  const subjectPerformance = subjects.map(subject => {
    const subjectResults = studentResults.filter(result => {
      const exam = mockExams.find(e => e.id === result.examId)
      return exam?.subject.id === subject.id
    })
    
    const avgScore = subjectResults.length > 0 
      ? subjectResults.reduce((sum, r) => sum + r.percentage, 0) / subjectResults.length 
      : 0
    
    const bestScore = subjectResults.length > 0 
      ? Math.max(...subjectResults.map(r => r.percentage)) 
      : 0
    
    const trend = subjectResults.length >= 2 
      ? subjectResults[subjectResults.length - 1].percentage - subjectResults[0].percentage
      : 0

    return {
      subject,
      average: Math.round(avgScore),
      best: bestScore,
      trend,
      examCount: subjectResults.length,
      results: subjectResults
    }
  }).filter(perf => perf.examCount > 0)

  // Performance grade calculation
  const getPerformanceGrade = (percentage: number) => {
    if (percentage >= 80) return { grade: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (percentage >= 70) return { grade: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (percentage >= 60) return { grade: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (percentage >= 50) return { grade: 'Average', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { grade: 'Below Average', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const overallGrade = getPerformanceGrade(averageScore)

  return (
    <div className="space-y-6">
      {/* Student Header Card */}
      <Card className="border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-8">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="h-24 w-24 bg-gray-200 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-2xl font-bold text-gray-700">
                  {student.firstName[0]}{student.lastName[0]}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-3xl font-bold text-gray-900">{student.firstName} {student.lastName}</h2>
                <Badge variant="outline" className="bg-white">ID: {student.admissionNumber}</Badge>
              </div>
                             <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                 <div className="flex items-center gap-2">
                   <School className="h-4 w-4" />
                   <span className="font-medium">{student.class} - {student.stream}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <User className="h-4 w-4" />
                   <span>{student.gender}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <Calendar className="h-4 w-4" />
                   <span>ID: {student.admissionNumber}</span>
                 </div>
               </div>
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-lg ${overallGrade.bg}`}>
                  <span className={`font-medium ${overallGrade.color}`}>{overallGrade.grade}</span>
                </div>
                <div className="text-4xl font-bold text-gray-900">{Math.round(averageScore)}%</div>
                <span className="text-gray-600">Overall Average</span>
              </div>
            </div>
            
            <div className="text-right space-y-3">
              <div className="flex gap-2">
                <ReportCardTemplateModal
                  student={{
                    id: student.id,
                    name: `${student.firstName} ${student.lastName}`,
                    admissionNumber: student.admissionNumber,
                    gender: student.gender,
                    grade: student.class,
                    stream: student.stream,
                    user: { email: `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@school.com` }
                  }}
                  school={{
                    id: '',
                    schoolName: '',
                    subdomain: ''
                  }}
                  subjects={subjects}
                  term="1"
                  year="2024"
                />
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Transcript
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-2">Total Exams</div>
                <div className="text-3xl font-bold text-gray-900">{studentResults.length}</div>
                <div className="text-xs text-gray-500 mt-1">Across all subjects</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-2">Highest Score</div>
                <div className="text-3xl font-bold text-green-600">
                  {studentResults.length > 0 ? Math.max(...studentResults.map(r => r.percentage)) : 0}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Personal best</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-2">Class Rank</div>
                <div className="text-3xl font-bold text-yellow-600">
                  #{studentResults[0]?.positionInClass || 'N/A'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Current position</div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-2">Attendance</div>
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round((studentResults.filter(r => r.status === 'present').length / studentResults.length) * 100)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Exam attendance</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance Breakdown */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Subject Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectPerformance.map((perf) => {
              const subjectGrade = getPerformanceGrade(perf.average)
              return (
                <Card key={perf.subject.id} className="border border-gray-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{perf.subject.name}</h4>
                        <p className="text-sm text-gray-600">Code: {perf.subject.code}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{perf.average}%</div>
                        <div className={`text-xs px-2 py-1 rounded ${subjectGrade.bg} ${subjectGrade.color}`}>
                          {subjectGrade.grade}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Best Score</span>
                        <span className="font-semibold text-green-600">{perf.best}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Exams Taken</span>
                        <span className="font-semibold">{perf.examCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Trend</span>
                        <div className={`flex items-center gap-1 ${perf.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <span className="font-semibold">{perf.trend > 0 ? '+' : ''}{Math.round(perf.trend)}%</span>
                          <TrendingUp className={`h-3 w-3 ${perf.trend < 0 ? 'transform rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Progress value={perf.average} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expandable Exam Sessions */}
      <ExamSessionsList studentResults={studentResults} />
    </div>
  )
}

// Expandable Exam Sessions Component
function ExamSessionsList({ studentResults }: { studentResults: StudentExamResult[] }) {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())

  // Group results by exam session (examType + term + academicYear)
  const examSessions = useMemo(() => {
    const sessionsMap = new Map<string, {
      sessionKey: string;
      sessionName: string;
      examType: string;
      term: string;
      academicYear: string;
      dateRange: { start: Date; end: Date };
      results: (StudentExamResult & { exam: Exam })[];
      totalSubjects: number;
      averageScore: number;
      overallPosition: number;
      status: 'completed' | 'in-progress' | 'upcoming';
    }>()

    studentResults.forEach(result => {
      const exam = mockExams.find(e => e.id === result.examId)
      if (!exam) return

      const sessionKey = `${exam.examType}-${exam.term}-${exam.academicYear}`
      
      if (!sessionsMap.has(sessionKey)) {
        sessionsMap.set(sessionKey, {
          sessionKey,
          sessionName: `${exam.term} ${exam.examType} Exams`,
          examType: exam.examType,
          term: exam.term,
          academicYear: exam.academicYear,
          dateRange: { 
            start: new Date(exam.dateAdministered), 
            end: new Date(exam.dateAdministered) 
          },
          results: [],
          totalSubjects: 0,
          averageScore: 0,
          overallPosition: 0,
          status: 'completed'
        })
      }

      const session = sessionsMap.get(sessionKey)!
      session.results.push({ ...result, exam })
      
      // Update date range
      const examDate = new Date(exam.dateAdministered)
      if (examDate < session.dateRange.start) session.dateRange.start = examDate
      if (examDate > session.dateRange.end) session.dateRange.end = examDate
    })

    // Calculate session statistics
    sessionsMap.forEach(session => {
      session.totalSubjects = session.results.length
      session.averageScore = session.results.reduce((sum, r) => sum + r.percentage, 0) / session.results.length
      session.overallPosition = Math.round(session.results.reduce((sum, r) => sum + r.positionInClass, 0) / session.results.length)
    })

    return Array.from(sessionsMap.values()).sort((a, b) => 
      new Date(b.dateRange.start).getTime() - new Date(a.dateRange.start).getTime()
    )
  }, [studentResults])

  const toggleSession = (sessionKey: string) => {
    const newExpanded = new Set(expandedSessions)
    if (newExpanded.has(sessionKey)) {
      newExpanded.delete(sessionKey)
    } else {
      newExpanded.add(sessionKey)
    }
    setExpandedSessions(newExpanded)
  }

  const getPerformanceGrade = (percentage: number) => {
    if (percentage >= 80) return { grade: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (percentage >= 70) return { grade: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (percentage >= 60) return { grade: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (percentage >= 50) return { grade: 'Average', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { grade: 'Below Average', color: 'text-red-600', bg: 'bg-red-50' }
  }

  if (studentResults.length === 0) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">No exam results</h3>
            <p className="text-gray-600">This student hasn't taken any exams yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Exam Sessions & Subject Scores
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Compare Sessions
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {examSessions.map((session) => {
            const isExpanded = expandedSessions.has(session.sessionKey)
            const sessionGrade = getPerformanceGrade(session.averageScore)
            
            return (
              <Collapsible
                key={session.sessionKey}
                open={isExpanded}
                onOpenChange={() => toggleSession(session.sessionKey)}
              >
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500" />
                            )}
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Award className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{session.sessionName}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{format(session.dateRange.start, 'MMM dd')} - {format(session.dateRange.end, 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{session.totalSubjects} Subjects</span>
                              </div>
                              <Badge variant="outline" className="bg-white">
                                {session.term} {session.academicYear}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900 mb-1">{Math.round(session.averageScore)}%</div>
                            <div className={`text-sm px-3 py-1 rounded-lg ${sessionGrade.bg} ${sessionGrade.color} font-medium`}>
                              {sessionGrade.grade}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-2xl font-bold text-yellow-600 mb-1">
                              <Trophy className="h-6 w-6" />
                              <span>#{session.overallPosition}</span>
                            </div>
                            <div className="text-sm text-gray-600">Avg Position</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-green-600 font-medium">Completed</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <Card className="mt-2 border border-gray-100 bg-gray-50">
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4 text-gray-900">Subject-wise Performance</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {session.results.map((result) => {
                          const resultGrade = getPerformanceGrade(result.percentage)
                          return (
                            <Card key={result.id} className="border border-white bg-white hover:shadow-md transition-shadow">
                              <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <BookOpen className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                      <h5 className="font-semibold text-gray-900">{result.exam.subject.name}</h5>
                                      <p className="text-sm text-gray-600">Code: {result.exam.subject.code}</p>
                                    </div>
                                  </div>
                                  <Badge variant={result.grade.startsWith('A') ? 'default' : 'outline'} className="font-bold">
                                    {result.grade}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Score</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-lg">{result.marksScored}/{result.totalMarks}</span>
                                      <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                                        result.percentage >= 70 ? 'bg-green-100 text-green-700' :
                                        result.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {result.percentage}%
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Class Position</span>
                                    <div className="flex items-center gap-1">
                                      <Trophy className="h-4 w-4 text-yellow-500" />
                                      <span className="font-bold">#{result.positionInClass}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Performance</span>
                                    <div className={`px-2 py-1 rounded ${resultGrade.bg}`}>
                                      <span className={`text-xs font-medium ${resultGrade.color}`}>{resultGrade.grade}</span>
                                    </div>
                                  </div>
                                  
                                  <Progress value={result.percentage} className="h-2 mt-3" />
                                  
                                                                     {result.teacherComment && (
                                     <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                       <p className="text-sm text-blue-800 italic">"{result.teacherComment}"</p>
                                       {result.gradedBy && (
                                         <p className="text-xs text-blue-600 mt-1">- {result.gradedBy.name}</p>
                                       )}
                                     </div>
                                   )}
                                </div>
                                
                                <div className="flex gap-1 mt-4">
                                  <Button size="sm" variant="ghost" className="flex-1">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button size="sm" variant="ghost" className="flex-1">
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                      
                      {/* Session Summary */}
                      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-3">Session Summary</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">{session.totalSubjects}</div>
                            <div className="text-sm text-gray-600">Subjects</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-600">{Math.round(session.averageScore)}%</div>
                            <div className="text-sm text-gray-600">Average</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-600">
                              {Math.max(...session.results.map(r => r.percentage))}%
                            </div>
                            <div className="text-sm text-gray-600">Highest</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-yellow-600">#{session.overallPosition}</div>
                            <div className="text-sm text-gray-600">Position</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default function ExamsPage() {
  const [selectedClass, setSelectedClass] = useState<string>("Form 2A")
  const [selectedTerm, setSelectedTerm] = useState<string>("Term 1")
  const [selectedYear, setSelectedYear] = useState<string>("2025")
  const [viewMode, setViewMode] = useState<'overview' | 'results' | 'student'>('overview')
  const [selectedStudentId, setSelectedStudentId] = useState<string>()
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('')
  const [examTypeFilter, setExamTypeFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const classes = [
    "Form 1A", "Form 1B", "Form 1C",
    "Form 2A", "Form 2B", "Form 2C", 
    "Form 3A", "Form 3B", "Form 3C",
    "Form 4A", "Form 4B", "Form 4C"
  ]

  const terms = ["Term 1", "Term 2", "Term 3"]
  const years = ["2023", "2024", "2025"]

  // Filter exams based on current selection
  const filteredExams = useMemo(() => {
    return mockExams.filter(exam => {
      const matchesClass = exam.class === selectedClass && 
                          exam.term === selectedTerm && 
                          exam.academicYear === selectedYear
      const matchesType = examTypeFilter === 'all' || exam.examType === examTypeFilter
      const matchesSubject = subjectFilter === 'all' || exam.subject.name === subjectFilter  
      const matchesStatus = statusFilter === 'all' || exam.status === statusFilter
      
      return matchesClass && matchesType && matchesSubject && matchesStatus
    })
  }, [selectedClass, selectedTerm, selectedYear, examTypeFilter, subjectFilter, statusFilter])

  return (
    <DashboardLayout
      searchFilter={<ExamsFilterSidebar 
        searchTerm={studentSearchTerm}
        onSearchChange={setStudentSearchTerm}
        onStudentSelect={(studentId) => {
          setSelectedStudentId(studentId)
          setViewMode('student')
        }}
        selectedStudentId={selectedStudentId}
      />}
    >
      <div className="space-y-6">
        {/* Clean Header */}
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {viewMode === 'student' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setViewMode('overview')
                      setSelectedStudentId(undefined)
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Overview
                  </Button>
                )}
                <div className="p-3 bg-gray-100 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {viewMode === 'student' ? 'Student Performance Analytics' : 'Exams Management'}
                  </h1>
                  <p className="text-gray-600">
                    {viewMode === 'student' 
                      ? 'Comprehensive student performance analysis and insights'
                      : 'Comprehensive exam management and analytics dashboard'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreateExamDrawer 
                  onExamCreated={() => {
                    // Refresh the exams list after creation
                    window.location.reload();
                  }}
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Exam
                    </Button>
                  }
                />
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Performance View */}
        {viewMode === 'student' && selectedStudentId && (
          <StudentPerformanceView studentId={selectedStudentId} />
        )}

        {/* Exams Overview - Only show when not viewing student details */}
        {viewMode === 'overview' && (
          <>
            {/* Class Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                    <School className="h-4 w-4" />
                    Class Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4" />
                    Academic Term
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                    <Clock className="h-4 w-4" />
                    Academic Year
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                    <Star className="h-4 w-4" />
                    Current Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-900 mb-1">{selectedClass}</div>
                    <div className="text-sm text-gray-600">{selectedTerm} {selectedYear}</div>
                    <div className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 py-1 rounded">
                      {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-700">
                    <Filter className="h-4 w-4" />
                    Quick Filter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="CAT">CAT</SelectItem>
                      <SelectItem value="Midterm">Midterm</SelectItem>
                      <SelectItem value="End Term">End Term</SelectItem>
                      <SelectItem value="Mock">Mock</SelectItem>
                      <SelectItem value="KCSE Trial">KCSE Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Exams Table */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Exams for {selectedClass} - {selectedTerm} {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredExams.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-gray-900">No exams found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      No exams have been created for this class and term yet. Create your first exam to get started.
                    </p>
                    <CreateExamDrawer 
                      onExamCreated={() => {
                        // Refresh the exams list after creation
                        window.location.reload();
                      }}
                      trigger={
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Exam
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exam Details</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total Marks</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExams.map((exam) => (
                          <TableRow key={exam.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <div className="font-medium text-gray-900">{exam.title}</div>
                                <div className="text-sm text-gray-600">{exam.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{exam.subject.name}</div>
                                  <div className="text-sm text-gray-600">Code: {exam.subject.code}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-medium">{exam.examType}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{format(new Date(exam.dateAdministered), 'MMM dd, yyyy')}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-lg">{exam.totalMarks}</TableCell>
                            <TableCell>
                              <Badge variant={exam.status === 'completed' ? 'default' : 'outline'}>
                                {exam.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

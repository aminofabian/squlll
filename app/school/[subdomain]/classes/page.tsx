'use client'

import { useState } from 'react'
import { SchoolSearchFilter } from '@/components/dashboard/SchoolSearchFilter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowDown, 
  ArrowRight, 
  ArrowUp, 
  Banknote, 
  BookOpen, 
  BookText, 
  Calendar, 
  CalendarDays, 
  ChartBar, 
  Clock, 
  Crown, 
  Info, 
  MessageSquare, 
  Trophy, 
  User, 
  Users,
  GraduationCap,
  Layers,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type EducationLevel = 
  | 'preschool' 
  | 'primary' 
  | 'junior-secondary' 
  | 'senior-secondary' 
  | 'other'

type GradeType = 
  | 'Baby Class' | 'PP1' | 'PP2' 
  | 'Grade 1' | 'Grade 2' | 'Grade 3' | 'Grade 4' | 'Grade 5' | 'Grade 6'
  | 'Grade 7' | 'Grade 8' | 'Grade 9'
  | 'Grade 10' | 'Grade 11' | 'Grade 12'
  | 'Other'

interface Class {
  id: string
  name: string
  description: string
  instructor: string
  schedule: string
  time: string
  students: number
  status: 'active' | 'scheduled' | 'completed'
  level: EducationLevel
  grade: GradeType
  ageGroup: string
  pathway?: string
  
  // Additional detailed information
  classTeacher?: string
  genderBreakdown?: { male: number, female: number }
  academicPerformance?: {
    averageGrade: string
    gradeDistribution: { A: number, B: number, C: number, D: number, E: number }
    topStudents: string[]
  }
  attendance?: {
    rate: string
    absentToday: number
    absentThisWeek: number
    trend: 'improving' | 'stable' | 'declining'
  }
  fees?: {
    billed: number
    paid: number
    pending: number
    unpaidCount: number
    clearedCount?: number
    studentsPendingFees?: string[]
  }
  discipline?: {
    warningReports: number
    suspensions: number
  }
  assignments?: {
    issued: number
    submitted: number
    upcoming: string[]
  }
  
  // Kenya-specific school information
  currentLesson?: {
    subject: string
    teacher: string
    startTime: string
    endTime: string
    topic: string
    room: string
  }
  classLeadership?: {
    prefect: string
    assistantPrefect?: string
    timekeeper?: string
    classMonitors: string[]
    subjectMonitors?: Record<string, string>
  }
  kcpePerformanceMean?: string
  kcseMean?: string
  streamName?: string
  examRanking?: {
    internalRank: number
    zonalPosition?: number
    countyPosition?: number
  }
  clubsRepresentation?: string[]
  parentsMeeting?: {
    nextDate: string
    agenda: string
    venue: string
  }
  classTeacherRemarks?: string
}

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

function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | ''>('')
  const [activeTab, setActiveTab] = useState<string>('all')
  
  // State for selected grade and its name
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [selectedGradeName, setSelectedGradeName] = useState<string | null>(null)

  // Handler for level change to fix type issues
  const handleLevelChange = (value: string) => {
    // Type assertion to ensure value is either an EducationLevel or empty string
    setSelectedLevel(value as EducationLevel | '')
  }
  
  // Mock class data based on Kenya education system
  const classes: Class[] = [
    // Preschool classes
    {
      id: '1',
      name: 'Baby Class - Morning Session',
      description: 'Early childhood development and play-based learning',
      instructor: 'Ms. Sarah Omondi',
      classTeacher: 'Ms. Sarah Omondi',
      schedule: 'Mon-Fri',
      time: '8:00 AM - 11:00 AM',
      students: 18,
      status: 'active',
      level: 'preschool',
      grade: 'Baby Class',
      ageGroup: '3 years',
      genderBreakdown: { male: 10, female: 8 },
      academicPerformance: {
        averageGrade: 'B+',
        gradeDistribution: { A: 5, B: 8, C: 3, D: 2, E: 0 },
        topStudents: ['Olivia Wanjiku', 'Daniel Kariuki', 'Grace Muthoni']
      },
      attendance: {
        rate: '92%',
        absentToday: 2,
        absentThisWeek: 5,
        trend: 'stable'
      },
      fees: {
        billed: 45000,
        paid: 38000,
        pending: 7000,
        unpaidCount: 3,
        clearedCount: 15,
        studentsPendingFees: ['Noah Gitonga', 'Mercy Adhiambo', 'James Odhiambo']
      },
      assignments: {
        issued: 12,
        submitted: 10,
        upcoming: ['Color recognition', 'Basic shapes']
      },
      discipline: {
        warningReports: 2,
        suspensions: 0
      },
      currentLesson: {
        subject: 'Creative Arts',
        teacher: 'Ms. Sarah Omondi',
        startTime: '9:15 AM',
        endTime: '10:00 AM',
        topic: 'Animal Drawings',
        room: 'Rainbow Room'
      },
      classLeadership: {
        prefect: 'Daniel Kariuki',
        classMonitors: ['Olivia Wanjiku', 'James Odhiambo'],
        timekeeper: 'Grace Muthoni'
      },
      streamName: 'Morning Session',
      classTeacherRemarks: 'The class is making good progress in language development. Need more focus on social skills.'
    },
    {
      id: '2',
      name: 'PP1 - Literacy Skills',
      description: 'Basic literacy and numeracy for pre-primary learners',
      instructor: 'Mr. David Kamau',
      classTeacher: 'Mr. David Kamau',
      schedule: 'Mon-Fri',
      time: '8:00 AM - 12:00 PM',
      students: 22,
      status: 'active',
      level: 'preschool',
      grade: 'PP1',
      ageGroup: '4 years',
      genderBreakdown: { male: 12, female: 10 },
      academicPerformance: {
        averageGrade: 'B',
        gradeDistribution: { A: 6, B: 9, C: 5, D: 2, E: 0 },
        topStudents: ['James Mwangi', 'Lucy Wambui', 'Thomas Gitau']
      },
      attendance: {
        rate: '94%',
        absentToday: 1,
        absentThisWeek: 4,
        trend: 'improving'
      },
      fees: {
        billed: 50000,
        paid: 45000,
        pending: 5000,
        unpaidCount: 2
      },
      assignments: {
        issued: 15,
        submitted: 14,
        upcoming: ['Letter recognition', 'Basic counting']
      },
      discipline: {
        warningReports: 1,
        suspensions: 0
      }
    },
    {
      id: '3',
      name: 'PP2 - School Readiness',
      description: 'Preparation for primary school curriculum',
      instructor: 'Ms. Mary Akinyi',
      schedule: 'Mon-Fri',
      time: '8:00 AM - 12:30 PM',
      students: 25,
      status: 'active',
      level: 'preschool',
      grade: 'PP2',
      ageGroup: '5 years'
    },
    
    // Primary school classes
    {
      id: '4',
      name: 'Grade 1 - English & Kiswahili',
      description: 'Foundational literacy in English and Kiswahili',
      instructor: 'Ms. Jane Wangari',
      schedule: 'Mon-Fri',
      time: '8:00 AM - 3:30 PM',
      students: 30,
      status: 'active',
      level: 'primary',
      grade: 'Grade 1',
      ageGroup: '6 years'
    },
    {
      id: '5',
      name: 'Grade 3 - Mathematics',
      description: 'Number operations, patterns and measurements',
      instructor: 'Mr. Peter Odhiambo',
      schedule: 'Mon-Fri',
      time: '8:00 AM - 3:30 PM',
      students: 28,
      status: 'active',
      level: 'primary',
      grade: 'Grade 3',
      ageGroup: '8 years'
    },
    {
      id: '6',
      name: 'Grade 5 - Science & Technology',
      description: 'Integrated science and technology under CBC',
      instructor: 'Dr. Susan Karanja',
      schedule: 'Mon-Fri',
      time: '8:00 AM - 4:00 PM',
      students: 32,
      status: 'scheduled',
      level: 'primary',
      grade: 'Grade 5',
      ageGroup: '10 years'
    },
    {
      id: '7',
      name: 'Grade 6 - Social Studies',
      description: 'Kenya and its relationship with the world',
      instructor: 'Mr. James Maina',
      schedule: 'Mon-Fri',
      time: '8:00 AM - 4:00 PM',
      students: 35,
      status: 'active',
      level: 'primary',
      grade: 'Grade 6',
      ageGroup: '11 years'
    },
    {
      id: '7',
      name: 'Grade 3 - Science Class',
      description: 'Introduction to basic scientific concepts for young learners',
      instructor: 'Ms. Jane Njeri',
      classTeacher: 'Ms. Jane Njeri',
      schedule: 'Mon, Wed, Fri',
      time: '10:30 AM - 12:30 PM',
      students: 32,
      status: 'active',
      level: 'primary',
      grade: 'Grade 3',
      ageGroup: '8 years',
      genderBreakdown: { male: 17, female: 15 },
      academicPerformance: {
        averageGrade: 'B+',
        gradeDistribution: { A: 10, B: 15, C: 5, D: 2, E: 0 },
        topStudents: ['Michael Kamau', 'Rebecca Achieng', 'Eric Maina']
      },
      attendance: {
        rate: '90%',
        absentToday: 3,
        absentThisWeek: 8,
        trend: 'declining'
      },
      fees: {
        billed: 65000,
        paid: 52000,
        pending: 13000,
        unpaidCount: 5,
        clearedCount: 27,
        studentsPendingFees: ['John Mutua', 'Lucy Wambui', 'Peter Ouma', 'Irene Njoki', 'Brian Ochieng']
      },
      assignments: {
        issued: 18,
        submitted: 15,
        upcoming: ['Plant life cycle', 'States of matter', 'Simple machines']
      },
      discipline: {
        warningReports: 4,
        suspensions: 1
      },
      currentLesson: {
        subject: 'Environmental Activities',
        teacher: 'Mr. Paul Wekesa',
        startTime: '10:30 AM',
        endTime: '11:15 AM',
        topic: 'Water Conservation',
        room: 'Science Lab 1'
      },
      classLeadership: {
        prefect: 'Rebecca Achieng',
        assistantPrefect: 'Eric Maina',
        classMonitors: ['Michael Kamau', 'Esther Njeri', 'Kevin Omondi'],
        subjectMonitors: {
          'Science': 'Michael Kamau',
          'Mathematics': 'John Kamau',
          'English': 'Esther Njeri'
        }
      },
      kcpePerformanceMean: '345/500',
      streamName: 'North',
      examRanking: {
        internalRank: 2,
        zonalPosition: 5
      },
      clubsRepresentation: ['Environmental Club', 'Science Club', 'Chess Club'],
      parentsMeeting: {
        nextDate: '2025-07-15',
        agenda: 'Mid-term progress review and curriculum changes',
        venue: 'School Hall'
      },
      classTeacherRemarks: 'This class shows good potential in sciences. Need to improve on language subjects.'
    },
    {
      id: '8',
      name: 'Grade 7 - Integrated Science',
      description: 'Introduction to core scientific concepts',
      instructor: 'Ms. Patricia Njeri',
      schedule: 'Mon-Fri',
      time: '7:30 AM - 4:30 PM',
      students: 40,
      status: 'active',
      level: 'junior-secondary',
      grade: 'Grade 7',
      ageGroup: '12 years'
    },
    {
      id: '9',
      name: 'Grade 8 - Mathematics',
      description: 'Advanced mathematical concepts and problem solving',
      instructor: 'Mr. Timothy Kimathi',
      schedule: 'Mon-Fri',
      time: '7:30 AM - 4:30 PM',
      students: 38,
      status: 'scheduled',
      level: 'junior-secondary',
      grade: 'Grade 8',
      ageGroup: '13 years'
    },
    {
      id: '10',
      name: 'Grade 7 - Mathematics',
      description: 'Junior secondary mathematics curriculum introduction',
      instructor: 'Mr. Edwin Mutua',
      classTeacher: 'Mrs. Faith Wangari',
      schedule: 'Mon-Thu',
      time: '8:00 AM - 10:00 AM',
      students: 38,
      status: 'active',
      level: 'junior-secondary',
      grade: 'Grade 7',
      ageGroup: '12 years',
      genderBreakdown: { male: 20, female: 18 },
      academicPerformance: {
        averageGrade: 'B-',
        gradeDistribution: { A: 7, B: 12, C: 14, D: 4, E: 1 },
        topStudents: ['Robert Ochieng', 'Diana Mwende', 'Peter Njoroge']
      },
      attendance: {
        rate: '89%',
        absentToday: 4,
        absentThisWeek: 12,
        trend: 'stable'
      },
      fees: {
        billed: 80000,
        paid: 62000,
        pending: 18000,
        unpaidCount: 7
      },
      discipline: {
        warningReports: 6,
        suspensions: 2
      },
      assignments: {
        issued: 22,
        submitted: 19,
        upcoming: ['Algebraic equations', 'Geometric transformations']
      }
    },
    
    // Senior Secondary classes
    {
      id: '13',
      name: 'Grade 11 - Physics',
      description: 'Advanced physics curriculum for senior secondary students',
      instructor: 'Dr. Samuel Maina',
      classTeacher: 'Mrs. Elizabeth Otieno',
      schedule: 'Mon, Wed, Fri',
      time: '10:30 AM - 12:30 PM',
      students: 25,
      status: 'active',
      level: 'senior-secondary',
      grade: 'Grade 11',
      ageGroup: '16 years',
      pathway: 'Science & Technology',
      genderBreakdown: { male: 15, female: 10 },
      academicPerformance: {
        averageGrade: 'A-',
        gradeDistribution: { A: 12, B: 8, C: 3, D: 2, E: 0 },
        topStudents: ['Kevin Macharia', 'Faith Nyambura', 'Brian Otieno']
      },
      attendance: {
        rate: '95%',
        absentToday: 1,
        absentThisWeek: 2,
        trend: 'stable'
      },
      fees: {
        billed: 120000,
        paid: 105000,
        pending: 15000,
        unpaidCount: 3,
        clearedCount: 22,
        studentsPendingFees: ['Gilbert Mwangi', 'Mercy Wanjiru', 'Simon Kipkoech']
      },
      discipline: {
        warningReports: 1,
        suspensions: 0
      },
      assignments: {
        issued: 25,
        submitted: 24,
        upcoming: ['Electromagnetism', 'Quantum Physics Introduction']
      },
      currentLesson: {
        subject: 'Advanced Physics',
        teacher: 'Dr. Samuel Maina',
        startTime: '11:00 AM',
        endTime: '12:30 PM',
        topic: 'Wave-Particle Duality',
        room: 'Physics Lab'
      },
      classLeadership: {
        prefect: 'Brian Otieno',
        assistantPrefect: 'Faith Nyambura',
        classMonitors: ['Kevin Macharia', 'Jane Muthoni'],
        subjectMonitors: {
          'Physics': 'Kevin Macharia',
          'Chemistry': 'Faith Nyambura',
          'Mathematics': 'Ahmed Hussein',
          'Biology': 'Mary Akinyi'
        }
      },
      kcseMean: '8.7/12',
      streamName: 'Science',
      examRanking: {
        internalRank: 1,
        zonalPosition: 2,
        countyPosition: 15
      },
      clubsRepresentation: ['Science Congress', 'Robotics Club', 'Chess Team', 'Debate Club'],
      parentsMeeting: {
        nextDate: '2025-06-28',
        agenda: 'KCSE preparation and university applications',
        venue: 'Science Block Auditorium'
      },
      classTeacherRemarks: 'Exceptional group with strong STEM performance. Has produced the best results in regional science competitions for three consecutive years.'
    },
    {
      id: '11',
      name: 'Grade 11 - Literature (Arts)',
      description: 'Advanced literary analysis and creative writing',
      instructor: 'Ms. Faith Wanjiku',
      schedule: 'Mon-Fri',
      time: '7:00 AM - 5:00 PM',
      students: 22,
      status: 'active',
      level: 'senior-secondary',
      grade: 'Grade 11',
      ageGroup: '16 years',
      pathway: 'Arts & Sports'
    },
    {
      id: '12',
      name: 'Grade 12 - Economics (Social Sciences)',
      description: 'Advanced economic theories and case studies',
      instructor: 'Prof. Thomas Mboya',
      schedule: 'Mon-Fri',
      time: '7:00 AM - 5:00 PM',
      students: 24,
      status: 'completed',
      level: 'senior-secondary',
      grade: 'Grade 12',
      ageGroup: '17 years',
      pathway: 'Social Sciences'
    }
  ]
  
  // Get all unique education levels for filtering
  const educationLevels = Array.from(new Set(classes.map(cls => cls.level)))
  
  // Filter classes based on search term, status, active tab, and selected grade
  const filteredClasses = classes.filter(cls => {
    // Filter by active tab (education level)
    if (activeTab !== 'all' && cls.level !== activeTab) {
      return false
    }
    
    // Filter by status
    if (selectedStatus !== 'all' && cls.status !== selectedStatus) {
      return false
    }
    
    // Filter by selected grade
    if (selectedGradeName && cls.grade !== selectedGradeName) {
      return false
    }
    
    // Filter by search term
    if (searchTerm && !cls.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !cls.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !cls.instructor.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    return true
  })

  // Handle search from filter component
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    
    // If user starts typing a search, clear the grade selection for better UX
    if (term && selectedGrade) {
      setSelectedGrade(null)
    }
  }
  
  // Handle grade selection from filter component
  const handleGradeSelect = (grade: any) => {
    // If the same grade is clicked again, clear the filter
    if (selectedGrade === grade.id) {
      setSelectedGrade(null)
      setSelectedGradeName(null)
    } else {
      setSelectedGrade(grade.id)
      setSelectedGradeName(grade.name) // Store the grade name for display
    }
  }
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedGrade(null)
    setSelectedGradeName(null)
    setSelectedStatus('all')
    setSearchTerm('')
    
    // Reset active tab if needed
    if (activeTab !== 'all') {
      setActiveTab('all')
    }
  }

  // Count classes by level
  const preschoolCount = classes.filter(c => c.level === 'preschool').length
  const primaryCount = classes.filter(c => c.level === 'primary').length
  const juniorSecondaryCount = classes.filter(c => c.level === 'junior-secondary').length
  const seniorSecondaryCount = classes.filter(c => c.level === 'senior-secondary').length

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
          <p className="text-gray-500">Manage and monitor all your school classes</p>
        </div>
        <Button>
          <GraduationCap className="mr-2 h-4 w-4" />
          Create Class
        </Button>
      </div>

      {/* Tabs for education levels */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full mb-4">
          <TabsTrigger value="all">All Levels</TabsTrigger>
          <TabsTrigger value="preschool">Preschool</TabsTrigger>
          <TabsTrigger value="primary">Primary</TabsTrigger>
          <TabsTrigger value="junior-secondary">Junior Sec</TabsTrigger>
          <TabsTrigger value="senior-secondary">Senior Sec</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <SchoolSearchFilter onSearch={handleSearch} type="classes" onGradeSelect={handleGradeSelect} />
                
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Grade Filter for each education level */}
                {activeTab !== 'all' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Grade</label>
                    <Select value={selectedLevel} onValueChange={handleLevelChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {activeTab === 'preschool' && (
                          <>
                            <SelectItem value="Baby Class">Baby Class (3 yrs)</SelectItem>
                            <SelectItem value="PP1">PP1 (4 yrs)</SelectItem>
                            <SelectItem value="PP2">PP2 (5 yrs)</SelectItem>
                          </>
                        )}
                        {activeTab === 'primary' && (
                          <>
                            <SelectItem value="Grade 1">Grade 1 (6 yrs)</SelectItem>
                            <SelectItem value="Grade 2">Grade 2 (7 yrs)</SelectItem>
                            <SelectItem value="Grade 3">Grade 3 (8 yrs)</SelectItem>
                            <SelectItem value="Grade 4">Grade 4 (9 yrs)</SelectItem>
                            <SelectItem value="Grade 5">Grade 5 (10 yrs)</SelectItem>
                            <SelectItem value="Grade 6">Grade 6 (11 yrs)</SelectItem>
                          </>
                        )}
                        {activeTab === 'junior-secondary' && (
                          <>
                            <SelectItem value="Grade 7">Grade 7 (12 yrs)</SelectItem>
                            <SelectItem value="Grade 8">Grade 8 (13 yrs)</SelectItem>
                            <SelectItem value="Grade 9">Grade 9 (14 yrs)</SelectItem>
                          </>
                        )}
                        {activeTab === 'senior-secondary' && (
                          <>
                            <SelectItem value="Grade 10">Grade 10 (15 yrs)</SelectItem>
                            <SelectItem value="Grade 11">Grade 11 (16 yrs)</SelectItem>
                            <SelectItem value="Grade 12">Grade 12 (17 yrs)</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Pathway filter for senior secondary */}
                {activeTab === 'senior-secondary' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">Pathway</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pathway" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Pathways</SelectItem>
                        <SelectItem value="arts">Arts & Sports</SelectItem>
                        <SelectItem value="stem">STEM</SelectItem>
                        <SelectItem value="social">Social Sciences</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Classes</span>
                    <span className="font-medium">{classes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Preschool</span>
                    <span className="font-medium">{preschoolCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Primary</span>
                    <span className="font-medium">{primaryCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Junior Secondary</span>
                    <span className="font-medium">{juniorSecondaryCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Senior Secondary</span>
                    <span className="font-medium">{seniorSecondaryCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-3">
            {/* Filter Summary Bar */}
            <div className="flex items-center justify-between mb-4 bg-muted/30 p-3  transition-all duration-200">
              <div className="flex items-center space-x-2">
                {selectedGrade ? (
                  <>
                    <span className="font-medium">Filtered by grade:</span>
                    <Badge className="animate-fadeIn" variant="outline">
                      {selectedGradeName}
                    </Badge>
                  </>
                ) : (
                  <span className="font-medium">All grades</span>
                )}
                
                {selectedStatus !== 'all' && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Badge variant="secondary">
                      {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                    </Badge>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredClasses.length} of {classes.length} classes
                </span>
                
                {(selectedGrade || selectedStatus !== 'all' || searchTerm) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                    </svg>
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 gap-4 transition-all duration-300 ease-in-out">
                {filteredClasses.length > 0 ? filteredClasses.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                )) : (
                  <EmptyState 
                    selectedGrade={selectedGrade}
                    selectedStatus={selectedStatus}
                    searchTerm={searchTerm}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="preschool" className="mt-0">
              <div className="grid grid-cols-1 gap-4 transition-all duration-300 ease-in-out">
                {filteredClasses.length > 0 ? filteredClasses.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                )) : (
                  <EmptyState 
                    selectedGrade={selectedGrade}
                    selectedStatus={selectedStatus}
                    searchTerm={searchTerm}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="primary" className="mt-0">
              <div className="grid grid-cols-1 gap-4 transition-all duration-300 ease-in-out">
                {filteredClasses.length > 0 ? filteredClasses.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                )) : (
                  <EmptyState 
                    selectedGrade={selectedGrade}
                    selectedStatus={selectedStatus}
                    searchTerm={searchTerm}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="junior-secondary" className="mt-0">
              <div className="grid grid-cols-1 gap-4 transition-all duration-300 ease-in-out">
                {filteredClasses.length > 0 ? filteredClasses.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                )) : (
                  <EmptyState 
                    selectedGrade={selectedGrade}
                    selectedStatus={selectedStatus}
                    searchTerm={searchTerm}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="senior-secondary" className="mt-0">
              <div className="grid grid-cols-1 gap-4 transition-all duration-300 ease-in-out">
                {filteredClasses.length > 0 ? filteredClasses.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} />
                )) : (
                  <EmptyState 
                    selectedGrade={selectedGrade}
                    selectedStatus={selectedStatus}
                    searchTerm={searchTerm}
                  />
                )}
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

// Card component for displaying individual class details
function ClassCard({ cls }: { cls: Class }) {
  return (
    <Card key={cls.id} className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1 border-l-4 overflow-hidden" 
          style={{
            borderLeftColor: cls.currentLesson ? '#10b981' : 
                          cls.status === 'active' ? '#3b82f6' : 
                          cls.status === 'scheduled' ? '#8b5cf6' : '#6b7280'
          }}>
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
              <Badge className={`${getLevelColor(cls.level)} px-2 py-1  font-medium`}>
                {getLevelIcon(cls.level)}
                <span className="ml-1">
                  {cls.level.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </Badge>
              <Badge variant="outline" className="px-2 py-1  font-medium">{cls.grade}</Badge>
              {cls.pathway && <Badge variant="secondary" className="px-2 py-1  font-medium">{cls.pathway}</Badge>}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${getStatusColor(cls.status)} px-3 py-1  font-medium`}>
              <div className="w-2 h-2  mr-1.5 bg-current inline-block"></div>
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
        {/* Current lesson section - displayed prominently if there's an ongoing lesson */}
        {cls.currentLesson && (
          <div className="mb-5 bg-gradient-to-r from-green-50 to-green-100 p-4  border-l-4 border-green-500 shadow-sm">
            <h4 className="text-sm font-semibold text-green-800 flex items-center mb-2">
              <BookOpen className="h-5 w-5 mr-2" />
              Ongoing: {cls.currentLesson.subject} Class
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-green-800 font-medium">{cls.currentLesson.teacher}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-green-600" />
                <span>{cls.currentLesson.startTime} - {cls.currentLesson.endTime}</span>
              </div>
              <div className="flex items-center col-span-2 mt-1">
                <BookText className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">Topic:</span>
                <span className="ml-1.5 italic">"{cls.currentLesson.topic}"</span>
              </div>
              <div className="flex items-center mt-1">
                <div className="h-4 w-4 mr-2 text-green-600 flex items-center justify-center">🏫</div>
                <span>Room {cls.currentLesson.room}</span>
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
                    <span className="font-medium">{cls.classTeacher ? cls.classTeacher : cls.instructor}</span>
                    {cls.classTeacher && <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded ml-2">Class Teacher</span>}
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
                  <span className="ml-2">{cls.schedule}</span>
                </div>
                
                <div className="flex items-center">
                  <div className="w-5 h-5 flex justify-center items-center text-gray-500">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="ml-2">{cls.time}</span>
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
          <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50  p-4 shadow-sm border border-blue-100">
            <h4 className="text-sm font-semibold mb-3 text-indigo-900 flex items-center">
              <div className="mr-2 p-1 bg-indigo-100  flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-indigo-700" />
              </div>
              Class Leadership
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {cls.classLeadership.prefect && (
                <div className="flex items-center bg-white p-2  shadow-sm">
                  <div className="p-1.5 mr-2 bg-yellow-100 ">
                    <Crown className="h-3.5 w-3.5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-600 font-medium">Prefect</div>
                    <div className="font-medium">{cls.classLeadership.prefect}</div>
                  </div>
                </div>
              )}
              {cls.classLeadership.assistantPrefect && (
                <div className="flex items-center bg-white p-2  shadow-sm">
                  <div className="p-1.5 mr-2 bg-blue-100 ">
                    <Trophy className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-600 font-medium">Assistant</div>
                    <div>{cls.classLeadership.assistantPrefect}</div>
                  </div>
                </div>
              )}
              {cls.classLeadership.timekeeper && (
                <div className="flex items-center bg-white p-2  shadow-sm">
                  <div className="p-1.5 mr-2 bg-green-100 ">
                    <Clock className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-indigo-600 font-medium">Timekeeper</div>
                    <div>{cls.classLeadership.timekeeper}</div>
                  </div>
                </div>
              )}
              {cls.classLeadership.classMonitors && cls.classLeadership.classMonitors.length > 0 && (
                <div className="col-span-2 mt-1">
                  <div className="text-xs text-indigo-600 font-medium mb-1">Class Monitors</div>
                  <div className="flex flex-wrap gap-2">
                    {cls.classLeadership.classMonitors.map((monitor, idx) => (
                      <Badge key={idx} className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100">
                        {monitor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Academic Performance Section */}
        {cls.academicPerformance && (
          <div className="mb-5 bg-gradient-to-r from-emerald-50 to-teal-50  p-4 shadow-sm border border-emerald-100">
            <h4 className="text-sm font-semibold mb-3 text-emerald-900 flex items-center">
              <div className="mr-2 p-1 bg-emerald-100  flex items-center justify-center">
                <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
              </div>
              Academic Performance
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white p-2  shadow-sm flex flex-col">
                <span className="text-xs text-emerald-600 font-medium">Average Grade</span>
                <span className="font-bold text-lg">{cls.academicPerformance.averageGrade}</span>
              </div>
              
              {cls.examRanking && (
                <div className="bg-white p-2  shadow-sm flex flex-col">
                  <span className="text-xs text-emerald-600 font-medium">Class Rank</span>
                  <div className="flex items-baseline">
                    <span className="font-bold text-lg">{cls.examRanking.internalRank}</span>
                    {cls.examRanking.zonalPosition && (
                      <span className="text-xs text-gray-500 ml-2">
                        Zonal: {cls.examRanking.zonalPosition}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 col-span-2">
                {cls.kcpePerformanceMean && (
                  <div className="bg-white p-2  shadow-sm flex items-center">
                    <div className="p-1.5 mr-2 bg-teal-100 ">
                      <ChartBar className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-xs text-emerald-600 font-medium">KCPE Mean</div>
                      <div className="font-medium">{cls.kcpePerformanceMean}</div>
                    </div>
                  </div>
                )}
                
                {cls.kcseMean && (
                  <div className="bg-white p-2  shadow-sm flex items-center">
                    <div className="p-1.5 mr-2 bg-teal-100 ">
                      <ChartBar className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-xs text-emerald-600 font-medium">KCSE Mean</div>
                      <div className="font-medium">{cls.kcseMean}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {cls.academicPerformance.topStudents && cls.academicPerformance.topStudents.length > 0 && (
                <div className="col-span-2 mt-2">
                  <div className="text-xs text-emerald-600 font-medium mb-1">Top Students</div>
                  <div className="flex flex-wrap gap-2">
                    {cls.academicPerformance.topStudents.map((student, idx) => (
                      <Badge key={idx} className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100">
                        {student}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
                    className={`${cls.attendance.trend === 'improving' ? 
                      'bg-green-50 text-green-700 border-green-100' : 
                      cls.attendance.trend === 'stable' ? 
                      'bg-blue-50 text-blue-700 border-blue-100' : 
                      'bg-red-50 text-red-700 border-red-100'} 
                    px-2 py-1 capitalize`}
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
        
        {/* Fee Status Section (if applicable) */}
        {cls.fees && (
          <div className="mb-5 bg-gradient-to-r from-purple-50 to-fuchsia-50  p-4 shadow-sm border border-purple-100">
            <h4 className="text-sm font-semibold mb-3 text-purple-900 flex items-center">
              <div className="mr-2 p-1 bg-purple-100  flex items-center justify-center">
                <Banknote className="h-3.5 w-3.5 text-purple-700" />
              </div>
              Fee Status
            </h4>
            
            <div className="bg-white p-3  shadow-sm mb-3">
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div>
                  <div className="text-xs text-purple-600 font-medium mb-1">Billed</div>
                  <div className="font-semibold">KES {cls.fees.billed.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-purple-600 font-medium mb-1">Paid</div>
                  <div className="font-semibold text-green-700">KES {cls.fees.paid.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-purple-600 font-medium mb-1">Pending</div>
                  <div className="font-semibold text-red-600">KES {cls.fees.pending.toLocaleString()}</div>
                </div>
              </div>
            </div>
              
            {/* Students with fee status */}
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs text-purple-600 font-medium">Student Fee Status</div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                  {cls.fees.unpaidCount} pending
                </Badge>
                {cls.fees.clearedCount && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {cls.fees.clearedCount} cleared
                  </Badge>
                )}
              </div>
            </div>
            
            {/* List students with pending fees */}
            {cls.fees.studentsPendingFees && cls.fees.studentsPendingFees.length > 0 && (
              <div className="bg-white border border-red-100  overflow-hidden">
                <div className="bg-red-50 px-3 py-1.5">
                  <div className="font-medium text-red-800 text-xs">Students with pending fees</div>
                </div>
                <div className="p-2 text-xs flex flex-wrap gap-2">
                  {cls.fees.studentsPendingFees.map((student, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white text-red-600 border-red-200">
                      {student}
                    </Badge>
                  ))}
                </div>
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

// Empty state component when no classes are found
function EmptyState({ selectedGrade = null, selectedStatus = 'all', searchTerm = '' }: {
  selectedGrade?: string | null,
  selectedStatus?: string,
  searchTerm?: string
}) {
  // Create a more specific message based on active filters
  let message = 'Try adjusting your search or filters to find what you\'re looking for.'
  
  if (selectedGrade) {
    message = `No classes found for the selected grade. Try selecting a different grade.`
  } else if (selectedStatus !== 'all') {
    message = `No ${selectedStatus} classes found. Try another status filter.`
  } else if (searchTerm) {
    message = `No classes match your search term "${searchTerm}". Try a different search.`
  }

  return (
    <div className="bg-gray-50 border  p-8 text-center animate-fadeIn">
      <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {message}
      </p>
    </div>
  )
}

export default ClassesPage

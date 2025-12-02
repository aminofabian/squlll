"use client"

import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSchoolConfig } from '../../../../../lib/hooks/useSchoolConfig'
import { useTenantStatistics } from '../../../../../lib/hooks/useTenantStatistics'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { SchoolSidebar } from "@/components/dashboard/SchoolSidebar"
import { SearchFilter } from "@/components/dashboard/SearchFilter"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { Activity, AlertTriangle, Clock, Store, Users, BarChart3, CircleDollarSign, ShieldAlert, Zap, GraduationCap, CalendarDays, ClipboardList, TrendingUp, BookOpen, PanelLeftClose, PanelLeftOpen, Loader2, Plus } from "lucide-react"
import { useStudentsStore } from '@/lib/stores/useStudentsStore'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { mockClasses } from '@/lib/data/mockclasses'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { DashboardSearchSidebar } from './components/DashboardSearchSidebar'
import { CreateAcademicYearModal } from './components/CreateAcademicYearModal'
import { ViewAcademicYearsDrawer } from './components/ViewAcademicYearsDrawer'
import { TermsManager } from './components/TermsManager'

export default function SchoolDashboard() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  const schoolName = subdomain.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  
  // State declarations
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showStats, setShowStats] = useState(false)
  
  // Check school configuration
  const { data: config, isLoading, error } = useSchoolConfig()
  
  // Get tenant statistics
  const { data: tenantStats, isLoading: statsLoading, error: statsError } = useTenantStatistics()
  
  // Get real data from stores (must be called before any conditional returns)
  const { students } = useStudentsStore()
  const { config: schoolConfig } = useSchoolConfigStore()
  
  // Helper function to get grade display name (moved before useMemo hooks)
  function getGradeDisplayName(gradeName: string): string {
    const lowerName = gradeName.toLowerCase();
    
    // Handle special cases first
    if (lowerName.includes('pp1') || lowerName.includes('baby')) return 'PP1';
    if (lowerName.includes('pp2') || lowerName.includes('nursery')) return 'PP2';
    if (lowerName.includes('pp3') || lowerName.includes('reception')) return 'PP3';
    
    // Handle Form grades (Grade 7+ becomes Form 1+)
    if (lowerName.includes('grade 7') || lowerName.includes('g7')) return 'Form 1';
    if (lowerName.includes('grade 8') || lowerName.includes('g8')) return 'Form 2';
    if (lowerName.includes('grade 9') || lowerName.includes('g9')) return 'Form 3';
    if (lowerName.includes('grade 10') || lowerName.includes('g10')) return 'Form 4';
    if (lowerName.includes('grade 11') || lowerName.includes('g11')) return 'Form 5';
    if (lowerName.includes('grade 12') || lowerName.includes('g12')) return 'Form 6';
    
    // Handle regular grade numbers
    const match = gradeName.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (num >= 1 && num <= 6) {
        return `Grade ${num}`;
      }
    }
    
    // If no pattern matches, return the original name
    return gradeName;
  }

  // Get selected grade information (moved before conditional returns)
  const selectedGradeInfo = useMemo(() => {
    if (!selectedGrade || !schoolConfig) return null
    
    for (const level of schoolConfig.selectedLevels) {
      const grade = level.gradeLevels?.find(g => g.id === selectedGrade)
      if (grade) {
        return {
          grade,
          level,
          displayName: getGradeDisplayName(grade.name)
        }
      }
    }
    return null
  }, [selectedGrade, schoolConfig])

  // Filter students based on selected grade (moved before conditional returns)
  const filteredStudents = useMemo(() => {
    if (!selectedGrade || !selectedGradeInfo) return students
    
    return students.filter(student => {
      if (typeof student.grade === 'string') return false
      return student.grade.gradeLevel.name.toLowerCase() === selectedGradeInfo.grade.name.toLowerCase()
    })
  }, [students, selectedGrade, selectedGradeInfo])

  // Calculate real statistics (moved before conditional returns)
  const realStats = useMemo(() => {
    const studentsToUse = selectedGrade ? filteredStudents : students
    
    // Use tenant statistics for overall school stats, fallback to local data
    const totalStudents = !selectedGrade && tenantStats 
      ? tenantStats.studentCount 
      : studentsToUse.length
    const activeStudents = studentsToUse.filter(s => s.isActive).length
    const totalFeesOwed = studentsToUse.reduce((sum, s) => sum + s.feesOwed, 0)
    const totalFeesPaid = studentsToUse.reduce((sum, s) => sum + s.totalFeesPaid, 0)
    
    // Filter classes based on selected grade
    const classesToUse = selectedGrade && selectedGradeInfo 
      ? mockClasses.filter(c => 
          c.grade.toLowerCase() === selectedGradeInfo.grade.name.toLowerCase() && 
          c.status === 'active'
        )
      : mockClasses.filter(c => c.status === 'active')
    const totalClasses = classesToUse.length
    
    // Filter subjects based on selected grade
    const totalSubjects = selectedGrade && selectedGradeInfo 
      ? selectedGradeInfo.level.subjects.length
      : (schoolConfig?.selectedLevels.reduce((sum, level) => sum + level.subjects.length, 0) || 0)
    
    // Calculate attendance rate (mock data for now)
    const attendanceRate = selectedGrade ? 92.5 : 95.8
    
    // Calculate academic progress (mock data for now)
    const academicProgress = selectedGrade ? 89.2 : 87.5
    
    // Calculate monthly change (mock data for now)
    const monthlyChange = selectedGrade ? Math.floor(Math.random() * 10) + 2 : Math.floor(Math.random() * 20) + 5
    
    return {
      totalStudents,
      activeStudents,
      totalClasses,
      totalSubjects,
      attendanceRate,
      academicProgress,
      monthlyChange,
      totalFeesOwed,
      totalFeesPaid
    }
  }, [students, filteredStudents, selectedGrade, selectedGradeInfo, schoolConfig, tenantStats])

  // Generate grade-specific activities (moved before conditional returns)
  const recentActivities = useMemo(() => {
    const baseActivities = [
      {
        id: 1,
        type: 'attendance',
        action: 'marked attendance',
        target: selectedGrade && selectedGradeInfo ? `${selectedGradeInfo.displayName}A` : 'Grade 10A',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        type: 'grade',
        action: 'updated grades',
        target: selectedGrade ? 'Mathematics Class' : 'Mathematics Class',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString()
      },
      {
        id: 3,
        type: 'event',
        action: 'scheduled',
        target: selectedGrade ? 'Parent-Teacher Meeting' : 'Parent-Teacher Meeting',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString()
      }
    ]

    if (selectedGrade && selectedGradeInfo) {
      return baseActivities.map(activity => ({
        ...activity,
        target: activity.target.replace('Grade 10A', `${selectedGradeInfo.displayName}A`)
      }))
    }

    return baseActivities
  }, [selectedGrade, selectedGradeInfo])

  // Generate grade-specific events (moved before conditional returns)
  const upcomingEvents = useMemo(() => {
    const baseEvents = [
      { name: "Parent-Teacher Conference", date: "Mar 15", attendees: selectedGrade ? 25 : 45 },
      { name: "Science Fair", date: "Mar 20", attendees: selectedGrade ? 60 : 120 },
      { name: "Sports Day", date: "Mar 25", attendees: selectedGrade ? 100 : 200 }
    ]

    if (selectedGrade && selectedGradeInfo) {
      return baseEvents.map(event => ({
        ...event,
        name: `${selectedGradeInfo.displayName} ${event.name}`,
        attendees: Math.floor(event.attendees * (filteredStudents.length / students.length))
      }))
    }

    return baseEvents
  }, [selectedGrade, selectedGradeInfo, filteredStudents, students])

  // Generate grade-specific class performance (moved before conditional returns)
  const classPerformance = useMemo(() => {
    if (selectedGrade && selectedGradeInfo) {
      // Show streams for the selected grade
      const streams = selectedGradeInfo.grade.streams || []
      return streams.map((stream, index) => ({
        name: `${selectedGradeInfo.displayName}${stream.name}`,
        average: 85 + Math.random() * 10, // Random average between 85-95
        students: Math.floor(filteredStudents.length / Math.max(streams.length, 1))
      }))
    }

    // Show overall class performance
    return [
      { name: "Grade 10A", average: 85.6, students: 32 },
      { name: "Grade 11B", average: 82.3, students: 28 },
      { name: "Grade 12C", average: 88.9, students: 30 }
    ]
  }, [selectedGrade, selectedGradeInfo, filteredStudents])
  
  // Redirect to main page if school is not configured
  useEffect(() => {
    if (!isLoading && !error && (!config || !config.selectedLevels || config.selectedLevels.length === 0)) {
      // School is not configured, redirect to main page which will show SchoolTypeSetup
      router.push(`/school/${subdomain}`)
    }
  }, [config, isLoading, error, router, subdomain])

  // Handle responsive sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (isInitialLoad) {
        // On initial load, default to collapsed on 11-inch and medium devices (768px - 1200px)
        // 11-inch devices are typically around 820-834px width
        if (width >= 768 && width < 1200) {
          setIsSidebarCollapsed(true)
        }
        setIsInitialLoad(false)
      } else {
        // On subsequent resizes, auto-adjust based on screen size
        // Keep sidebar minimized for 11-inch devices and smaller tablets/laptops
        if (width >= 768 && width < 1200) {
          setIsSidebarCollapsed(true)
        } else if (width >= 1200) {
          setIsSidebarCollapsed(false)
        }
        // Keep current state on small devices (< 768px) as sidebar is hidden via CSS
      }
    }

    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Call once on mount to handle initial state
    handleResize()

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [isInitialLoad])
  
  // Show loading state while checking configuration or loading statistics
  if (isLoading || (statsLoading && !selectedGrade)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm text-gray-500">Loading dashboard...</p>
      </div>
    )
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  // If school is not configured, don't render dashboard (will redirect)
  if (!config || !config.selectedLevels || config.selectedLevels.length === 0) {
    return null
  }



  const dashboardStats = [
    {
      title: "Total Students",
      value: realStats.totalStudents.toLocaleString(),
      change: `+${realStats.monthlyChange} this month`,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Attendance Rate",
      value: `${realStats.attendanceRate}%`,
      change: "+0.6% vs last week",
      icon: CalendarDays,
      color: "text-green-600"
    },
    {
      title: "Active Classes",
      value: realStats.totalClasses.toString(),
      change: "Current semester",
      icon: BookOpen,
      color: "text-purple-600"
    },
    {
      title: "Academic Progress",
      value: `${realStats.academicProgress}%`,
      change: "+2.3% this term",
      icon: TrendingUp,
      color: "text-blue-600"
    }
  ]



  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId)
    
    // Check if this is a grade selection (grades have UUID-like IDs)
    if (filterId !== 'all' && filterId.length > 20) {
      setSelectedGrade(filterId)
    } else {
      setSelectedGrade(null)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setSelectedFilter('all')
  }

  const handleGradeSelect = (gradeId: string) => {
    if (gradeId === 'all') {
      setSelectedGrade(null)
    } else {
      setSelectedGrade(gradeId)
    }
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedGrade(null)
  }

  return (
    <div className="flex h-full">
      {/* Search filter column - styled to match theme */}
      {!isSidebarCollapsed && (
        <DashboardSearchSidebar
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value);
          }}
          onClearFilters={handleClearFilters}
          selectedGradeId={selectedFilter}
          onCollapse={() => setIsSidebarCollapsed(true)}
          students={students}
          selectedGrade={selectedGrade}
          onGradeSelect={handleGradeSelect}
          schoolConfig={schoolConfig}
        />
      )}

      {/* Main content column */}
      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out relative">
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
            <h1 className="text-xl md:text-2xl font-bold truncate">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* View Academic Years button */}
            <ViewAcademicYearsDrawer 
              onAcademicYearCreated={() => {
                // Optionally refresh data or show success message
                console.log('Academic year created successfully')
              }}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
                >
                  Academic Year
                </Button>
              }
            />
            
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
          </div>
        </div>

        <div className="space-y-8">
          {/* Page Header */}
          <div className="border-b-2 border-primary/20 pb-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                  <span className="text-xs font-mono uppercase tracking-wide text-primary">
                    {selectedGrade ? 'Grade Overview' : 'School Overview'}
                  </span>
                </div>
                {selectedGrade && (
                  <button
                    onClick={() => {
                      setSelectedGrade(null)
                      setSelectedFilter('all')
                    }}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-mono hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    ← Back to All Grades
                  </button>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100 break-words">
                {selectedGrade && selectedGradeInfo 
                  ? `${selectedGradeInfo.displayName} Dashboard`
                  : `${schoolName} Dashboard`
                }
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                {selectedGrade 
                  ? `Monitor ${selectedGradeInfo?.displayName} performance and activities`
                  : 'Monitor school performance and activities'
                }
              </p>
            </div>
          </div>

          {/* Expandable Stats Section - Only show when viewing all grades */}
          {!selectedGrade && (
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
                      <h3 className="font-mono font-semibold text-slate-900 dark:text-slate-100">School Statistics</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">View comprehensive school statistics and metrics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border border-primary/30 font-mono text-xs">
                      {tenantStats ? tenantStats.studentCount : students.length} Students
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
                    {/* Tenant Statistics Section */}
                    {tenantStats && (
                      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <h4 className="font-mono font-semibold text-sm uppercase tracking-wide text-primary mb-3">
                          Live School Statistics
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="text-center">
                            <div className="font-mono font-bold text-lg text-primary">{tenantStats.studentCount}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Students</div>
                          </div>
                          <div className="text-center">
                            <div className="font-mono font-bold text-lg text-primary">{tenantStats.teacherCount}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Teachers</div>
                          </div>
                          <div className="text-center">
                            <div className="font-mono font-bold text-lg text-primary">{tenantStats.streamCount}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Streams</div>
                          </div>
                          <div className="text-center">
                            <div className="font-mono font-bold text-lg text-primary">{tenantStats.totalCount}</div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Total Users</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Error state for statistics */}
                    {statsError && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-mono font-semibold text-sm text-red-800 mb-2">
                          Statistics Error
                        </h4>
                        <p className="text-sm text-red-600">
                          {statsError instanceof Error ? statsError.message : 'Failed to load statistics'}
                        </p>
                      </div>
                    )}
                    

                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grade-Specific Information */}
          {selectedGrade && selectedGradeInfo && (
            <div className="border-2 border-primary/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-mono font-bold">{selectedGradeInfo.displayName} Details</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedGradeInfo.level.name} • {selectedGradeInfo.level.subjects.length} subjects
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Student Demographics */}
                <div className="space-y-4">
                  <h3 className="font-mono font-bold text-sm uppercase tracking-wide text-slate-600">Student Demographics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 truncate mr-2">Male Students</span>
                      <span className="font-mono font-bold text-primary shrink-0">
                        {filteredStudents.filter(s => s.gender.toLowerCase() === 'male').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 truncate mr-2">Female Students</span>
                      <span className="font-mono font-bold text-primary shrink-0">
                        {filteredStudents.filter(s => s.gender.toLowerCase() === 'female').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 truncate mr-2">Active Students</span>
                      <span className="font-mono font-bold text-primary shrink-0">
                        {filteredStudents.filter(s => s.isActive).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Overview */}
                <div className="space-y-4">
                  <h3 className="font-mono font-bold text-sm uppercase tracking-wide text-slate-600">Financial Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 truncate mr-2">Total Fees Paid</span>
                      <span className="font-mono font-bold text-emerald-600 text-right shrink-0">
                        KES {filteredStudents.reduce((sum, s) => sum + s.totalFeesPaid, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 truncate mr-2">Outstanding Fees</span>
                      <span className="font-mono font-bold text-orange-600 text-right shrink-0">
                        KES {filteredStudents.reduce((sum, s) => sum + s.feesOwed, 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 truncate mr-2">Collection Rate</span>
                      <span className="font-mono font-bold text-primary shrink-0">
                        {(() => {
                          const totalPaid = filteredStudents.reduce((sum, s) => sum + s.totalFeesPaid, 0)
                          const totalOwed = filteredStudents.reduce((sum, s) => sum + s.feesOwed, 0)
                          const total = totalPaid + totalOwed
                          return total > 0 ? Math.round((totalPaid / total) * 100) : 0
                        })()}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Academic Structure */}
                <div className="space-y-4">
                  <h3 className="font-mono font-bold text-sm uppercase tracking-wide text-slate-600">Academic Structure</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 truncate mr-2">Subjects Offered</span>
                      <span className="font-mono font-bold text-primary shrink-0">
                        {selectedGradeInfo.level.subjects.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 truncate mr-2">Active Classes</span>
                      <span className="font-mono font-bold text-primary shrink-0">
                        {mockClasses.filter(c => 
                          c.grade.toLowerCase() === selectedGradeInfo.grade.name.toLowerCase() && 
                          c.status === 'active'
                        ).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 truncate mr-2">Streams</span>
                      <span className="font-mono font-bold text-primary shrink-0">
                        {selectedGradeInfo.grade.streams?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streams List */}
              {selectedGradeInfo.grade.streams && selectedGradeInfo.grade.streams.length > 0 && (
                <div className="mt-6 pt-6 border-t border-primary/20">
                  <h3 className="font-mono font-bold text-sm uppercase tracking-wide text-slate-600 mb-4">Streams</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedGradeInfo.grade.streams.map((stream) => (
                      <div key={stream.id} className="p-3 md:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-medium truncate mr-2">{stream.name}</span>
                          <span className="text-sm text-slate-500 shrink-0">
                            {Math.floor(filteredStudents.length / selectedGradeInfo.grade.streams.length)} students
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Grid - Each Section in Its Own Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {/* Recent Activities */}
            <div className="border-2 border-primary/20 rounded-xl">
              <div className="p-4 border-b-2 border-primary/20">
                <h2 className="font-mono font-bold">Recent Activities</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        <Users className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-mono font-medium truncate">{activity.target}</div>
                          <div className="text-xs text-slate-500 truncate">{activity.action}</div>
                        </div>
                      </div>
                      <div className="text-xs font-mono shrink-0 ml-2">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="border-2 border-primary/20 rounded-xl">
              <div className="p-4 border-b-2 border-primary/20">
                <h2 className="font-mono font-bold">Upcoming Events</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <div key={event.name} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        <CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-mono font-medium truncate">{event.name}</div>
                          <div className="text-xs text-slate-500 truncate">{event.date} • {event.attendees} attendees</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Class Performance */}
            <div className="border-2 border-primary/20 rounded-xl">
              <div className="p-4 border-b-2 border-primary/20">
                <h2 className="font-mono font-bold">Class Performance</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {classPerformance.map(classData => (
                    <div key={classData.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono truncate mr-2">{classData.name}</span>
                        <span className="text-xs font-mono shrink-0">{classData.average}% avg</span>
                      </div>
                      <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${classData.average}%` }} 
                        />
                      </div>
                      <div className="text-xs text-slate-500 truncate">{classData.students} students</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-2 border-primary/20 rounded-xl">
              <div className="p-4 border-b-2 border-primary/20">
                <h2 className="font-mono font-bold">Quick Actions</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center p-2 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors min-h-[100px] w-full">
                    <Users className="h-4 w-4 text-primary mb-2 shrink-0" />
                    <span className="text-xs font-mono text-center leading-tight px-1 break-words w-full">Take Attendance</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-2 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors min-h-[100px] w-full">
                    <GraduationCap className="h-4 w-4 text-primary mb-2 shrink-0" />
                    <span className="text-xs font-mono text-center leading-tight px-1 break-words w-full">Enter Grades</span>
                  </button>
                  <ViewAcademicYearsDrawer 
                    onAcademicYearCreated={() => {
                      console.log('Academic year created successfully')
                    }}
                    trigger={
                      <button className="flex flex-col items-center justify-center p-2 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors min-h-[100px] w-full">
                        <CalendarDays className="h-4 w-4 text-primary mb-2 shrink-0" />
                        <span className="text-xs font-mono text-center leading-tight px-1 break-words w-full">Academic Year</span>
                      </button>
                    }
                  />
                  <button className="flex flex-col items-center justify-center p-2 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors min-h-[100px] w-full">
                    <ClipboardList className="h-4 w-4 text-primary mb-2 shrink-0" />
                    <span className="text-xs font-mono text-center leading-tight px-1 break-words w-full">Create Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Terms Management */}
            <TermsManager 
              className="md:col-span-2 xl:col-span-1"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 
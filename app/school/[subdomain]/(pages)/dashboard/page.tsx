"use client"

import { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSchoolConfig } from '../../../../../lib/hooks/useSchoolConfig'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { SchoolSidebar } from "@/components/dashboard/SchoolSidebar"
import { SearchFilter } from "@/components/dashboard/SearchFilter"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { Activity, AlertTriangle, Clock, Store, Users, BarChart3, CircleDollarSign, ShieldAlert, Zap, GraduationCap, CalendarDays, ClipboardList, TrendingUp, BookOpen } from "lucide-react"

export default function SchoolDashboard() {
  const params = useParams()
  const router = useRouter()
  const subdomain = params.subdomain as string
  const schoolName = subdomain.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  
  // Check school configuration
  const { data: config, isLoading, error } = useSchoolConfig()
  
  // Redirect to main page if school is not configured
  useEffect(() => {
    if (!isLoading && !error && (!config || !config.selectedLevels || config.selectedLevels.length === 0)) {
      // School is not configured, redirect to main page which will show SchoolTypeSetup
      router.push(`/school/${subdomain}`)
    }
  }, [config, isLoading, error, router, subdomain])
  
  // Show loading state while checking configuration
  if (isLoading) {
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

  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const dashboardStats = [
    {
      title: "Total Students",
      value: "1,234",
      change: "+12 this month",
      icon: Users,
      color: "text-[#246a59]"
    },
    {
      title: "Attendance Rate",
      value: "95.8%",
      change: "+0.6% vs last week",
      icon: CalendarDays,
      color: "text-green-600"
    },
    {
      title: "Active Classes",
      value: "48",
      change: "Current semester",
      icon: BookOpen,
      color: "text-purple-600"
    },
    {
      title: "Academic Progress",
      value: "87.5%",
      change: "+2.3% this term",
      icon: TrendingUp,
      color: "text-blue-600"
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'attendance',
      action: 'marked attendance',
      target: 'Grade 10A',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'grade',
      action: 'updated grades',
      target: 'Mathematics Class',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString()
    },
    {
      id: 3,
      type: 'event',
      action: 'scheduled',
      target: 'Parent-Teacher Meeting',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString()
    }
  ]

  const upcomingEvents = [
    { name: "Parent-Teacher Conference", date: "Mar 15", attendees: 45 },
    { name: "Science Fair", date: "Mar 20", attendees: 120 },
    { name: "Sports Day", date: "Mar 25", attendees: 200 }
  ]

  const classPerformance = [
    { name: "Grade 10A", average: 85.6, students: 32 },
    { name: "Grade 11B", average: 82.3, students: 28 },
    { name: "Grade 12C", average: 88.9, students: 30 }
  ]

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setSelectedFilter('all')
  }

  return (
    <DashboardLayout
      sidebar={<SchoolSidebar subdomain={subdomain} schoolName={schoolName} />}
      searchFilter={
        <SearchFilter 
          type="dashboard" 
          onStoreSelect={handleFilterSelect}
          onSearch={handleSearch}
        />
      }
      mobileNav={<MobileNav />}
    >
      <div className="space-y-8">
        {/* Page Header */}
        <div className="border-b-2 border-[#246a59]/20 pb-8">
          <div className="flex flex-col gap-2">
            <div className="inline-block w-fit px-3 py-1 bg-[#246a59]/5 border border-[#246a59]/20 rounded-md">
              <span className="text-xs font-mono uppercase tracking-wide text-[#246a59]">
                School Overview
              </span>
            </div>
            <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
              {schoolName} Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Monitor school performance and activities
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat) => (
            <div key={stat.title} className="border-2 border-[#246a59]/20 bg-[#246a59]/5 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={stat.color}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-wide text-slate-600 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-mono font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="border-2 border-[#246a59]/20 rounded-xl">
            <div className="p-4 border-b-2 border-[#246a59]/20">
              <h2 className="font-mono font-bold">Recent Activities</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-[#246a59]/5 border border-[#246a59]/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-[#246a59]" />
                      <div>
                        <div className="font-mono font-medium">{activity.target}</div>
                        <div className="text-xs text-slate-500">{activity.action}</div>
                      </div>
                    </div>
                    <div className="text-xs font-mono">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="border-2 border-[#246a59]/20 rounded-xl">
            <div className="p-4 border-b-2 border-[#246a59]/20">
              <h2 className="font-mono font-bold">Upcoming Events</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.name} className="flex items-center justify-between p-3 bg-[#246a59]/5 border border-[#246a59]/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-[#246a59]" />
                      <div>
                        <div className="font-mono font-medium">{event.name}</div>
                        <div className="text-xs text-slate-500">{event.date} • {event.attendees} attendees</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Class Performance */}
          <div className="border-2 border-[#246a59]/20 rounded-xl">
            <div className="p-4 border-b-2 border-[#246a59]/20">
              <h2 className="font-mono font-bold">Class Performance</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {classPerformance.map(classData => (
                  <div key={classData.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono">{classData.name}</span>
                      <span className="text-xs font-mono">{classData.average}% avg</span>
                    </div>
                    <div className="h-2 bg-[#246a59]/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#246a59] rounded-full" 
                        style={{ width: `${classData.average}%` }} 
                      />
                    </div>
                    <div className="text-xs text-slate-500">{classData.students} students</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-2 border-[#246a59]/20 rounded-xl">
            <div className="p-4 border-b-2 border-[#246a59]/20">
              <h2 className="font-mono font-bold">Quick Actions</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-[#246a59]/5 border border-[#246a59]/20 rounded-lg hover:bg-[#246a59]/10 transition-colors">
                  <Users className="h-6 w-6 text-[#246a59] mx-auto mb-2" />
                  <span className="text-sm font-mono">Take Attendance</span>
                </button>
                <button className="p-4 bg-[#246a59]/5 border border-[#246a59]/20 rounded-lg hover:bg-[#246a59]/10 transition-colors">
                  <GraduationCap className="h-6 w-6 text-[#246a59] mx-auto mb-2" />
                  <span className="text-sm font-mono">Enter Grades</span>
                </button>
                <button className="p-4 bg-[#246a59]/5 border border-[#246a59]/20 rounded-lg hover:bg-[#246a59]/10 transition-colors">
                  <CalendarDays className="h-6 w-6 text-[#246a59] mx-auto mb-2" />
                  <span className="text-sm font-mono">Schedule Event</span>
                </button>
                <button className="p-4 bg-[#246a59]/5 border border-[#246a59]/20 rounded-lg hover:bg-[#246a59]/10 transition-colors">
                  <ClipboardList className="h-6 w-6 text-[#246a59] mx-auto mb-2" />
                  <span className="text-sm font-mono">Create Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 
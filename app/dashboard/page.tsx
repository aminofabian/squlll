"use client"

import { useState, useMemo } from 'react'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { SearchFilter } from "@/components/dashboard/SearchFilter"
import { MobileNav } from "@/components/dashboard/MobileNav"
import { Activity, AlertTriangle, Clock, Store, Users, BarChart3, CircleDollarSign, ShieldAlert, Zap, GraduationCap, CalendarDays, ClipboardList, TrendingUp, BookOpen } from "lucide-react"

const dashboardStats = [
  {
    title: "Total Students",
    value: "1,234",
    change: "+12 this month",
    icon: Users,
    color: "text-primary"
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

interface SystemStatus {
  name: string
  status: 'operational' | 'degraded' | 'down'
  uptime: string
  lastIncident?: string
}

const systemStatuses: SystemStatus[] = [
  {
    name: "API Gateway",
    status: "operational",
    uptime: "99.99%"
  },
  {
    name: "Authentication Service",
    status: "operational",
    uptime: "99.95%"
  },
  {
    name: "Database Cluster",
    status: "degraded",
    uptime: "99.90%",
    lastIncident: "2024-01-20T15:30:00Z"
  }
]

interface RecentActivity {
  id: number
  type: 'store' | 'api_key' | 'credential' | 'auth'
  action: string
  target: string
  timestamp: string
}

const recentActivities: RecentActivity[] = [
  {
    id: 1,
    type: 'store',
    action: 'created',
    target: 'GameStore Alpha',
    timestamp: '2024-01-20T16:45:00Z'
  },
  {
    id: 2,
    type: 'api_key',
    action: 'regenerated',
    target: 'BetaCasino',
    timestamp: '2024-01-20T16:30:00Z'
  },
  {
    id: 3,
    type: 'credential',
    action: 'updated',
    target: 'GAMEROOM credentials for Lucky Games',
    timestamp: '2024-01-20T16:15:00Z'
  }
]

interface StoreDetail {
  id: number
  name: string
  requests: string
  lastActive: string
}

const mockDashboardFilters = [
  {
    id: 1,
    name: "Active Stores",
    type: "store" as const,
    value: "active",
    count: 15,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Failed Requests",
    type: "status" as const,
    value: "failed",
    count: 23,
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 3,
    name: "GAMEROOM Issues",
    type: "provider" as const,
    value: "GAMEROOM",
    count: 5,
    created_at: "2024-01-15T10:30:00Z"
  }
]

const mockStoreDetails: Record<number, StoreDetail> = {
  1: {
    id: 1,
    name: "GameStore Alpha",
    requests: "15,420",
    lastActive: "2 minutes ago"
  },
  2: {
    id: 2,
    name: "BetaCasino",
    requests: "8,934",
    lastActive: "5 minutes ago"
  }
}

const mockProviderIssues = {
  GAMEROOM: {
    errors: [
      {
        id: 1,
        error: "API Timeout",
        count: 3,
        lastOccurred: "5 minutes ago",
        affectedStores: ["GameStore Alpha", "BetaCasino"]
      },
      {
        id: 2,
        error: "Authentication Failed",
        count: 2,
        lastOccurred: "15 minutes ago",
        affectedStores: ["Lucky Games"]
      }
    ],
    responseTime: "245ms",
    availability: "98.5%"
  }
}

const mockStatusIssues = {
  recentErrors: [
    {
      id: 1,
      type: "API Error",
      message: "Request timeout exceeded",
      timestamp: "2024-01-20T16:45:00Z",
      count: 23
    },
    {
      id: 2,
      type: "Database Error",
      message: "Connection pool exhausted",
      timestamp: "2024-01-20T16:30:00Z",
      count: 5
    }
  ],
  errorRate: "0.8%",
  avgResponseTime: "189ms"
}

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

export default function DashboardPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setSelectedFilter('all')
  }

  const getFilterContent = (filterId: string) => {
    const filter = mockDashboardFilters.find(f => f.id.toString() === filterId)
    if (!filter) return null

    switch (filter.type) {
      case 'store':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-custom-blue" />
                  <span className="text-sm font-mono">Active Stores</span>
                </div>
                <p className="text-2xl font-mono font-bold mt-2">15</p>
              </div>
              <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-mono">Total Revenue</span>
                </div>
                <p className="text-2xl font-mono font-bold mt-2">$45.2K</p>
              </div>
              <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-mono">API Requests</span>
                </div>
                <p className="text-2xl font-mono font-bold mt-2">1.2M</p>
              </div>
            </div>

            {/* Store List */}
            <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700">
                <h2 className="font-mono font-bold">Active Stores</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {Object.values(mockStoreDetails).map(store => (
                    <div key={store.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded">
                      <div className="flex items-center gap-3">
                        <Store className="h-5 w-5 text-custom-blue" />
                        <div>
                          <div className="font-mono font-medium">{store.name}</div>
                          <div className="text-xs text-slate-500">{store.requests} requests</div>
                        </div>
                      </div>
                      <div className="text-xs font-mono">{store.lastActive}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'provider':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-mono">Active Issues</span>
                </div>
                <p className="text-2xl font-mono font-bold mt-2">{mockProviderIssues.GAMEROOM.errors.length}</p>
              </div>
              <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-mono">Response Time</span>
                </div>
                <p className="text-2xl font-mono font-bold mt-2">{mockProviderIssues.GAMEROOM.responseTime}</p>
              </div>
              <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-mono">Availability</span>
                </div>
                <p className="text-2xl font-mono font-bold mt-2">{mockProviderIssues.GAMEROOM.availability}</p>
              </div>
            </div>

            <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700">
                <h2 className="font-mono font-bold">Recent Issues</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {mockProviderIssues.GAMEROOM.errors.map(error => (
                    <div key={error.id} className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                      <div className="flex items-center justify-between">
                        <div className="font-mono font-medium text-red-600">{error.error}</div>
                        <div className="text-xs font-mono">{error.lastOccurred}</div>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        Affected stores: {error.affectedStores.join(", ")}
                      </div>
                      <div className="mt-1 text-xs font-mono text-red-500">
                        Occurred {error.count} times
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'status':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-mono">Error Rate</span>
                </div>
                <p className="text-2xl font-mono font-bold mt-2">{mockStatusIssues.errorRate}</p>
              </div>
              <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-mono">Avg Response</span>
                </div>
                <p className="text-2xl font-mono font-bold mt-2">{mockStatusIssues.avgResponseTime}</p>
              </div>
            </div>

            <div className="border-2 border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="p-4 border-b-2 border-slate-200 dark:border-slate-700">
                <h2 className="font-mono font-bold">Recent Errors</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {mockStatusIssues.recentErrors.map(error => (
                    <div key={error.id} className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                      <div className="flex items-center justify-between">
                        <div className="font-mono font-medium text-red-600">{error.type}</div>
                        <div className="text-xs font-mono">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">{error.message}</div>
                      <div className="mt-1 text-xs font-mono text-red-500">
                        Occurred {error.count} times
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const filteredDashboard = useMemo(() => {
    if (!searchTerm) return mockDashboardFilters
    return mockDashboardFilters.filter(filter => 
      filter.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  return (
    <DashboardLayout
      sidebar={<Sidebar />}
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
        <div className="border-b-2 border-primary/20 pb-8">
          <div className="flex flex-col gap-2">
            <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
              <span className="text-xs font-mono uppercase tracking-wide text-primary">
                School Overview
              </span>
            </div>
            <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
              Dashboard
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              Monitor school performance and activities
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat) => (
            <div key={stat.title} className="border-2 border-primary/20 bg-primary/5 p-4 rounded-xl">
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
          <div className="border-2 border-primary/20 rounded-xl">
            <div className="p-4 border-b-2 border-primary/20">
              <h2 className="font-mono font-bold">Recent Activities</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
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
          <div className="border-2 border-primary/20 rounded-xl">
            <div className="p-4 border-b-2 border-primary/20">
              <h2 className="font-mono font-bold">Upcoming Events</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.name} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-primary" />
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
          <div className="border-2 border-primary/20 rounded-xl">
            <div className="p-4 border-b-2 border-primary/20">
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
                    <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
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
          <div className="border-2 border-primary/20 rounded-xl">
            <div className="p-4 border-b-2 border-primary/20">
              <h2 className="font-mono font-bold">Quick Actions</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <span className="text-sm font-mono">Take Attendance</span>
                </button>
                <button className="p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                  <GraduationCap className="h-6 w-6 text-primary mx-auto mb-2" />
                  <span className="text-sm font-mono">Enter Grades</span>
                </button>
                <button className="p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                  <CalendarDays className="h-6 w-6 text-primary mx-auto mb-2" />
                  <span className="text-sm font-mono">Schedule Event</span>
                </button>
                <button className="p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors">
                  <ClipboardList className="h-6 w-6 text-primary mx-auto mb-2" />
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
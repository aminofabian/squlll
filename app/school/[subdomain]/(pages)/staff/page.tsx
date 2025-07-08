"use client"

import { useState, useMemo, useEffect, useRef } from 'react'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  SortAsc,
  SortDesc,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  BookOpen,
  Settings,
  Shield,
  User,
  Building,
  PanelLeftClose,
  PanelLeftOpen,
  Copy
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { CreateStaffDrawer } from "./components/CreateStaffDrawer"
import { useStaffByTenantQuery, useStaffData } from "@/lib/stores/useStaffStore"
// Removed: import { getCookie } from 'cookies-next'

// Staff type definition
interface Staff {
  id: string
  name: string
  employeeId: string
  photo?: string
  email: string
  phone: string
  position: string
  department: string
  staffType: 'teaching' | 'administrative' | 'support' | 'part-time' | 'substitute'
  status: 'active' | 'on-leave' | 'terminated' | 'retired'
  joinDate: string
  dateOfBirth?: string
  address?: string
  
  // Professional Information
  qualifications: string[]
  experience: number
  subjects?: string[] // For teachers
  classesAssigned?: string[] // For teachers
  specializations?: string[]
  
  // Performance & Records
  rating?: number
  lastEvaluation?: string
  attendanceRate?: number
  
  // Administrative
  reportsTo?: string
  responsibilities: string[]
  workSchedule?: string
  officeLocation?: string
  
  // Emergency & Personal
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  
  // System
  createdAt: string
  updatedAt: string
}

// Transform GraphQL data to Staff interface
const transformGraphQLToStaff = (graphqlStaff: { id: string; name: string; email: string }): Staff => {
  return {
    id: graphqlStaff.id,
    name: graphqlStaff.name,
    employeeId: `STF/${new Date().getFullYear()}/${graphqlStaff.id.slice(-3)}`,
    email: graphqlStaff.email,
    phone: "+254 700 000 000", // Default phone since not in GraphQL
    position: "Staff Member", // Default position
    department: "General", // Default department
    staffType: "administrative" as const, // Default staff type
    status: "active" as const, // Default status
    joinDate: new Date().toISOString().split('T')[0], // Default join date
    qualifications: ["Staff Member"], // Default qualifications
    experience: 1, // Default experience
    responsibilities: ["General Staff Duties"], // Default responsibilities
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Filter and search functions
const nonTeachingStaffTypes = ['administrative', 'support', 'part-time', 'substitute']

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const hasInitialFetch = useRef(false)

  // Get tenant ID from cookies (client-side)
  const tenantId = typeof document !== 'undefined'
    ? document.cookie
        .split('; ')
        .find(row => row.startsWith('tenantId='))
        ?.split('=')[1]
    : undefined;

  // Fetch staff data
  const { fetchStaffByTenant } = useStaffByTenantQuery()
  const { staff: graphqlStaff, isLoading, error } = useStaffData()

  // Transform GraphQL data to Staff interface
  const transformedStaff: Staff[] = useMemo(() => {
    return graphqlStaff.map(transformGraphQLToStaff)
  }, [graphqlStaff])

  // Filter staff by name search only - only non-teaching staff
  const filteredStaff = useMemo(() => {
    return transformedStaff.filter(staff => 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name))
  }, [transformedStaff, searchTerm])

  // Calculate statistics for non-teaching staff only
  const stats = useMemo(() => {
    const total = transformedStaff.length
    const active = transformedStaff.filter(s => s.status === 'active').length
    const administrative = transformedStaff.filter(s => s.staffType === 'administrative').length
    const avgExperience = total > 0 ? transformedStaff.reduce((sum, s) => sum + s.experience, 0) / total : 0

    return {
      total,
      active,
      administrative,
      avgExperience: Math.round(avgExperience * 10) / 10
    }
  }, [transformedStaff])

  // Fetch staff data on component mount (only once)
  useEffect(() => {
    if (tenantId && !hasInitialFetch.current) {
      hasInitialFetch.current = true
      fetchStaffByTenant(tenantId).catch(console.error)
    }
  }, [tenantId, fetchStaffByTenant])

  const getStaffTypeIcon = (type: string) => {
    switch (type) {
      case 'administrative': return <Briefcase className="h-4 w-4" />
      case 'support': return <Settings className="h-4 w-4" />
      case 'part-time': return <Clock className="h-4 w-4" />
      case 'substitute': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'on-leave': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
      case 'terminated': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'retired': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-mono">Loading staff data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-mono font-bold text-red-600 mb-2">Error Loading Staff Data</h2>
          <p className="text-slate-600 font-mono">{error}</p>
          <Button 
            onClick={() => tenantId && fetchStaffByTenant(tenantId)} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Filter Column */}
      <div className={`border-r-2 border-primary/20 bg-primary/5 sticky top-0 h-screen overflow-y-auto transition-all duration-300 ease-in-out ${
        isSidebarMinimized ? 'w-16 p-2' : 'w-80 p-6'
      }`}>
        {/* Toggle button for minimize/expand */}
        <div className={`mb-4 ${isSidebarMinimized ? 'flex justify-center' : 'flex justify-between items-center'}`}>
          {!isSidebarMinimized && (
            <div className="space-y-2">
              {/* <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/30 rounded-md">
                <span className="text-xs font-mono uppercase tracking-wide text-primary font-bold">
                </span>
              </div> */}
              <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
              </p>
            </div>
          )}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200"
            title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button> */}
        </div>

        {isSidebarMinimized ? (
          // Minimized view - only filters icon when active
          <div className="space-y-4">
            {/* Filters icon - only show when search is active */}
            {searchTerm && (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-1">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-primary font-mono">Filters</span>
              </div>
            )}
          </div>
        ) : (
          // Full view
          <div className="space-y-6">
            {/* Staff Search Styled Like Image */}
            <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-4 mt-2 mb-6 shadow-sm">
              {/* Minimize icon at top right */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className="absolute -top-3 right-2 shadow border border-slate-200 bg-white w-8 h-8 p-0 flex items-center justify-center"
                style={{ zIndex: 10 }}
                title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
              >
                {isSidebarMinimized ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>

              {/* Pill label */}
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-green-50 border border-green-200 rounded-full text-xs font-mono text-green-900">
                <Search className="h-4 w-4 mr-1 text-green-700" />
                STAFF NAME
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-mono border border-slate-200 bg-white text-green-900"
                />
              </div>
            </div>



            {/* Staff Names List */}
            <div className="border-2 border-primary/30 rounded-lg p-4 bg-white dark:bg-slate-900 max-h-96 overflow-y-auto">
              <div className="inline-block w-fit px-2 py-1 bg-primary/10 border border-primary/20 rounded text-xs font-mono uppercase tracking-wide text-primary mb-3">
                Staff Directory ({filteredStaff.length})
              </div>
              <div className="space-y-2">
                {filteredStaff.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff)}
                    className="w-full text-left p-2 rounded border border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {getStaffTypeIcon(staff.staffType)}
                      <div className="flex-1">
                        <div className="text-sm font-mono font-medium">{staff.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{staff.position}</div>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredStaff.length === 0 && (
                  <div className="text-center py-4 text-sm text-slate-500 font-mono">
                    No staff found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </div>

            {/* Clear Search */}
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="w-full border-primary/30 bg-white dark:bg-slate-900 font-mono hover:bg-primary/5"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8 relative">
        {/* Floating toggle button when sidebar is minimized */}
        {isSidebarMinimized && (
          <div className="absolute top-6 left-6 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarMinimized(false)}
              className="border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all duration-200"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
        {!selectedStaff ? (
          <>
            {/* Page Header */}
            <div className="border-b-2 border-primary/20 pb-6">
              <div className="flex flex-col gap-2">
                <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                  <span className="text-xs font-mono uppercase tracking-wide text-primary">
                    Non-Teaching Staff
                  </span>
                </div>
                <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                  Administrative & Support Staff
                </h1>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Manage administrative, support, and non-teaching staff members
                  </p>
                  <div className="flex items-center gap-2">
                    {/* Add Staff Button */}
                    <Button
                      onClick={() => setShowCreateDrawer(true)}
                      className="bg-primary hover:bg-primary/90 text-white font-mono"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Non-Teaching Staff
                    </Button>
                    {/* Sidebar toggle button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                      className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200"
                      title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
                    >
                      {isSidebarMinimized ? (
                        <PanelLeftOpen className="h-4 w-4" />
                      ) : (
                        <PanelLeftClose className="h-4 w-4" />
                      )}
                    </Button>
                    <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                      Showing {filteredStaff.length} of {transformedStaff.length} staff members
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="border-2 border-primary/30 rounded-lg p-6 bg-white dark:bg-slate-900 shadow-sm">
              <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                <span className="text-xs font-mono uppercase tracking-wide text-primary font-bold">
                  Non-Teaching Staff Stats
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="text-2xl font-mono font-bold text-primary">{stats.total}</div>
                  <div className="text-sm font-mono text-slate-600">Total</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                  <div className="text-2xl font-mono font-bold text-green-600">{stats.active}</div>
                  <div className="text-sm font-mono text-slate-600">Active</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <div className="text-2xl font-mono font-bold text-blue-600">{stats.administrative}</div>
                  <div className="text-sm font-mono text-slate-600">Admin</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
                  <div className="text-2xl font-mono font-bold text-purple-600">{stats.avgExperience}y</div>
                  <div className="text-sm font-mono text-slate-600">Avg Exp</div>
                </div>
              </div>
            </div>

            {/* Staff Table */}
            <div className="border-primary/20 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/5 border-b-2 border-primary/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-wide text-primary font-bold">
                        Staff Member
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-wide text-primary font-bold">
                        Position & Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-wide text-primary font-bold">
                        Contact Information
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-wide text-primary font-bold">
                        Experience & Rating
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-mono uppercase tracking-wide text-primary font-bold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((staff, index) => (
                      <tr key={staff.id}>
                        <td colSpan={5} className="bg-transparent border-none p-0">
                          <div className="mb-3 p-4 bg-white dark:bg-slate-900 shadow border border-primary/20 transition hover:bg-primary/5">
                            {/* Main info (name, position, contact, etc.) */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                  <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
                                    {staff.name}
                                  </div>
                                  <div className="text-xs font-mono text-slate-500">
                                    {staff.employeeId}
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  {getStaffTypeIcon(staff.staffType)}
                                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                                    {staff.position}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building className="h-3 w-3 text-slate-400" />
                                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                                    {staff.department}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                                    {staff.email}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                                    {staff.phone}
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                                  Experience: {staff.experience} years
                                </div>
                                {staff.rating && (
                                  <div className="flex items-center gap-1">
                                    <Award className="h-3 w-3 text-yellow-500" />
                                    <span className="text-xs font-mono">{staff.rating}/5</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs font-mono ${getStatusColor(staff.status)}`}
                                >
                                  {staff.status.replace('-', ' ')}
                                </Badge>
                              </div>
                            </div>
                            <div className="border-t border-primary/10 mt-4 mb-3"></div>
                            {/* Additional details (badge, action buttons, etc.) */}
                            <div className="relative pt-10">
                              {/* Staff member indicator */}
                              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                <div className="inline-flex items-center gap-2 px-4 py-1 bg-primary/10 border border-primary/30 mt-2">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  <span className="text-xs font-mono text-primary font-medium">
                                    {staff.name.split(' ')[0]} {staff.name.split(' ')[1]}
                                  </span>
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                </div>
                              </div>
                              {/* Action buttons */}
                              <div className="flex justify-center gap-3 mt-6 mb-2">
                                <Button size="sm" variant="outline" className="flex items-center gap-1 text-green-700 border-green-200 hover:bg-green-50" onClick={e => { e.stopPropagation(); window.open(`tel:${staff.phone.replace(/\s+/g, '')}`); }}>
                                  <Phone className="h-4 w-4" /> Call
                                </Button>
                                <Button size="sm" variant="outline" className="flex items-center gap-1 text-blue-700 border-blue-200 hover:bg-blue-50" onClick={e => { e.stopPropagation(); window.open(`mailto:${staff.email}`); }}>
                                  <Mail className="h-4 w-4" /> Email
                                </Button>
                                <Button size="sm" variant="outline" className="flex items-center gap-1 text-slate-700 border-slate-200 hover:bg-slate-100" onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(staff.email); }}>
                                  <Copy className="h-4 w-4" /> Copy Email
                                </Button>
                                <Button size="sm" variant="outline" className="flex items-center gap-1 text-purple-700 border-purple-200 hover:bg-purple-50" onClick={e => { e.stopPropagation(); alert('Show profile for ' + staff.name); }}>
                                  <User className="h-4 w-4" /> Profile
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono pt-2">
                                <div className="space-y-2">
                                  <div className="text-slate-500 uppercase tracking-wide">Qualifications</div>
                                  <div className="flex flex-wrap gap-1">
                                    {staff.qualifications.slice(0, 2).map((qual, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {qual}
                                      </Badge>
                                    ))}
                                    {staff.qualifications.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{staff.qualifications.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="text-slate-500 uppercase tracking-wide">Responsibilities</div>
                                  <div className="flex flex-wrap gap-1">
                                    {staff.responsibilities.slice(0, 2).map((resp, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {resp}
                                      </Badge>
                                    ))}
                                    {staff.responsibilities.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{staff.responsibilities.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="text-slate-500 uppercase tracking-wide">Additional Info</div>
                                  <div className="space-y-1">
                                    {staff.officeLocation && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-slate-400" />
                                        <span>{staff.officeLocation}</span>
                                      </div>
                                    )}
                                    {staff.workSchedule && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-slate-400" />
                                        <span>{staff.workSchedule}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Empty State */}
            {filteredStaff.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-mono font-medium text-slate-600 dark:text-slate-400 mb-2">
                  No non-teaching staff found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-500 font-mono">
                  {searchTerm ? `No staff found matching "${searchTerm}"` : 'No non-teaching staff members available'}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Staff Detail View */}
            <div className="space-y-8">
              {/* Back Button and Header */}
              <div className="border-b-2 border-primary/20 pb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedStaff(null)}
                    className="border-primary/20 font-mono hover:bg-primary/5"
                  >
                    ← Back to Staff List
                  </Button>
                  <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md">
                    <span className="text-xs font-mono uppercase tracking-wide text-primary">
                      Staff Details
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                      {selectedStaff.name}
                    </h1>
                    <p className="text-lg font-mono text-slate-600 dark:text-slate-400">
                      {selectedStaff.position}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-mono ${getStatusColor(selectedStaff.status)}`}
                      >
                        {selectedStaff.status.replace('-', ' ')}
                      </Badge>
                      <span className="text-sm font-mono text-slate-500">
                        {selectedStaff.employeeId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Details Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="border-2 border-primary/20 rounded-xl p-6">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md mb-4">
                    <span className="text-xs font-mono uppercase tracking-wide text-primary">
                      Personal Information
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase">Email</div>
                        <div className="text-sm font-mono">{selectedStaff.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400" />
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase">Phone</div>
                        <div className="text-sm font-mono">{selectedStaff.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-slate-400" />
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase">Department</div>
                        <div className="text-sm font-mono">{selectedStaff.department}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-400" />
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase">Join Date</div>
                        <div className="text-sm font-mono">
                          {new Date(selectedStaff.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-slate-400" />
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase">Experience</div>
                        <div className="text-sm font-mono">{selectedStaff.experience} years</div>
                      </div>
                    </div>
                    {selectedStaff.address && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-slate-400" />
                        <div>
                          <div className="text-xs font-mono text-slate-500 uppercase">Address</div>
                          <div className="text-sm font-mono">{selectedStaff.address}</div>
                        </div>
                      </div>
                    )}
                    {selectedStaff.officeLocation && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-slate-400" />
                        <div>
                          <div className="text-xs font-mono text-slate-500 uppercase">Office</div>
                          <div className="text-sm font-mono">{selectedStaff.officeLocation}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="border-2 border-primary/20 rounded-xl p-6">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md mb-4">
                    <span className="text-xs font-mono uppercase tracking-wide text-primary">
                      Professional Information
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-mono text-slate-500 uppercase mb-2">Qualifications</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedStaff.qualifications.map((qual, index) => (
                          <Badge key={index} variant="outline" className="text-xs font-mono">
                            {qual}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-mono text-slate-500 uppercase mb-2">Responsibilities</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedStaff.responsibilities.map((resp, index) => (
                          <Badge key={index} variant="outline" className="text-xs font-mono">
                            {resp}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-slate-400" />
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase">Staff Type</div>
                        <div className="text-sm font-mono flex items-center gap-2">
                          {getStaffTypeIcon(selectedStaff.staffType)}
                          {selectedStaff.staffType.charAt(0).toUpperCase() + selectedStaff.staffType.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance & Emergency Contact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Info */}
                {(selectedStaff.rating || selectedStaff.attendanceRate || selectedStaff.lastEvaluation) && (
                  <div className="border-2 border-primary/20 rounded-xl p-6">
                    <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md mb-4">
                      <span className="text-xs font-mono uppercase tracking-wide text-primary">
                        Performance & Records
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedStaff.rating && (
                        <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="text-2xl font-mono font-bold text-primary">
                            {selectedStaff.rating}/5
                          </div>
                          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                            Performance Rating
                          </div>
                        </div>
                      )}
                      {selectedStaff.attendanceRate && (
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                          <div className="text-2xl font-mono font-bold text-green-600">
                            {selectedStaff.attendanceRate}%
                          </div>
                          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                            Attendance Rate
                          </div>
                        </div>
                      )}
                      {selectedStaff.lastEvaluation && (
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                          <div className="text-sm font-mono font-bold text-blue-600">
                            {new Date(selectedStaff.lastEvaluation).toLocaleDateString()}
                          </div>
                          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                            Last Evaluation
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                {selectedStaff.emergencyContact && (
                  <div className="border-2 border-primary/20 rounded-xl p-6">
                    <div className="inline-block w-fit px-3 py-1 bg-primary/5 border border-primary/20 rounded-md mb-4">
                      <span className="text-xs font-mono uppercase tracking-wide text-primary">
                        Emergency Contact
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-slate-400" />
                        <div>
                          <div className="text-xs font-mono text-slate-500 uppercase">Name</div>
                          <div className="text-sm font-mono">{selectedStaff.emergencyContact.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-slate-400" />
                        <div>
                          <div className="text-xs font-mono text-slate-500 uppercase">Relationship</div>
                          <div className="text-sm font-mono">{selectedStaff.emergencyContact.relationship}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-slate-400" />
                        <div>
                          <div className="text-xs font-mono text-slate-500 uppercase">Phone</div>
                          <div className="text-sm font-mono">{selectedStaff.emergencyContact.phone}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Staff Drawer */}
      <CreateStaffDrawer
        open={showCreateDrawer}
        onOpenChange={setShowCreateDrawer}
        onStaffCreated={() => {
          // Handle staff creation success
          console.log('Non-teaching staff member created successfully')
        }}
      />
    </div>
  )
} 
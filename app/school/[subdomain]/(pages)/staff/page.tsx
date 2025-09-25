"use client"

import { useState, useMemo } from 'react'
import { 
  Users, 
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  AlertCircle
} from "lucide-react"

// Import CreateStaffDrawer component
import { CreateStaffDrawer } from "./components/CreateStaffDrawer"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import our custom components and hooks
import { useStaff } from './hooks/useStaff'
import { StaffList } from './components/StaffList'
import { StaffDetail } from './components/StaffDetail'
import { SearchAndFilters } from './components/SearchAndFilters'

export default function StaffPage() {
  // State for selected staff and filters
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('fullName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeTab, setActiveTab] = useState('all-staff');
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);

  // Get staff data from API
  const { staff, loading, error, refetchStaff, tryDirectFetch } = useStaff();

  // Selected staff member
  const selectedStaff = useMemo(() => {
    return staff.find(s => s.id === selectedStaffId);
  }, [staff, selectedStaffId]);

  // Filter and sort staff based on search and filters
  const filteredStaff = useMemo(() => {
    let filtered = staff.filter(staffMember => {
      // Search filter
      const matchesSearch = 
        (staffMember.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (staffMember.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (staffMember.phoneNumber?.includes(searchTerm) || false) ||
        (staffMember.employeeId?.includes(searchTerm) || false);
      
      // Role filter
      const matchesRole = !roleFilter || staffMember.role === roleFilter;
      
      // Department filter
      const matchesDepartment = !departmentFilter || staffMember.department === departmentFilter;
      
      // Status filter
      const matchesStatus = !statusFilter || staffMember.status === statusFilter;
      
      // Active/Inactive tab filter
      if (activeTab === 'active-staff') {
        return matchesSearch && matchesRole && matchesDepartment && matchesStatus && staffMember.isActive;
      } else if (activeTab === 'inactive-staff') {
        return matchesSearch && matchesRole && matchesDepartment && matchesStatus && !staffMember.isActive;
      }
      
      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });
    
    // Sort the filtered list
    return filtered.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';
      
      // Get the values to compare based on sort field
      switch (sortField) {
        case 'fullName':
          aValue = a.fullName || '';
          bValue = b.fullName || '';
          break;
        case 'role':
          aValue = a.role || '';
          bValue = b.role || '';
          break;
        case 'department':
          aValue = a.department || '';
          bValue = b.department || '';
          break;
        case 'dateOfJoining':
          aValue = a.dateOfJoining ? new Date(a.dateOfJoining) : new Date(0);
          bValue = b.dateOfJoining ? new Date(b.dateOfJoining) : new Date(0);
          break;
        default:
          aValue = a.fullName || '';
          bValue = b.fullName || '';
      }
      
      // Compare values based on sort direction
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [staff, searchTerm, roleFilter, departmentFilter, statusFilter, activeTab, sortField, sortDirection]);

  // Handle direct fetch attempt when needed
  const [directFetchAttempted, setDirectFetchAttempted] = useState(false);
  
  // Display loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center">
          <Users className="h-16 w-16 animate-pulse text-primary/60" />
          <h3 className="mt-4 text-xl font-medium">Loading staff data...</h3>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Unable to Load Staff</h3>
          <p className="mb-4 text-red-600">{error}</p>
          <div className="text-sm text-gray-600 mb-4">
            <p>We're having trouble accessing the staff data from the API.</p>
            <p className="mt-2 font-medium">Possible Solutions:</p>
            <ul className="list-disc list-inside mt-1 text-left">
              <li>Check if the API schema includes getAllStaff query</li>
              <li>Ensure you have proper permissions to access staff data</li>
              <li>Try direct API access (bypasses some client-side restrictions)</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={refetchStaff} variant="default" className="mt-2">
              Try Standard Fetch
            </Button>
            <Button 
              onClick={async () => {
                setDirectFetchAttempted(true);
                const success = await tryDirectFetch();
                if (!success) {
                  // If still failing after direct fetch attempt, provide more guidance
                  alert('Direct fetch also failed. Please check browser console for more details.');
                }
              }} 
              variant="outline" 
              className="mt-2"
              disabled={directFetchAttempted}
            >
              {directFetchAttempted ? 'Direct Fetch Attempted' : 'Try Direct API Access'}
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header section */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Staff Management</h1>
          <p className="text-slate-500">
            Manage your school's staff, teachers, and other employees
          </p>
        </div>
        <Button onClick={() => setShowAddStaffDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex h-full gap-4">
          {/* Left sidebar for filters */}
          <div className="w-64 flex-shrink-0 overflow-auto p-4 border rounded-lg bg-white">
            <SearchAndFilters 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              departmentFilter={departmentFilter}
              onDepartmentFilterChange={setDepartmentFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortField={sortField}
              onSortFieldChange={setSortField}
              sortDirection={sortDirection}
              onSortDirectionChange={setSortDirection}
              staff={staff}
            />
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col h-full">
            <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all-staff">All Staff</TabsTrigger>
                  <TabsTrigger value="active-staff">Active</TabsTrigger>
                  <TabsTrigger value="inactive-staff">Inactive</TabsTrigger>
                </TabsList>
                <div className="text-sm text-slate-500">
                  {filteredStaff.length} staff members found
                </div>
              </div>

              <Card className="flex-1 overflow-hidden">
                <CardHeader className="py-3">
                  <CardTitle>Staff Directory</CardTitle>
                </CardHeader>
                <CardContent className="p-4 overflow-auto">
                  <TabsContent value="all-staff" className="mt-0">
                    <StaffList staff={filteredStaff} onSelectStaff={setSelectedStaffId} />
                  </TabsContent>
                  <TabsContent value="active-staff" className="mt-0">
                    <StaffList 
                      staff={filteredStaff.filter(s => s.isActive)} 
                      onSelectStaff={setSelectedStaffId} 
                    />
                  </TabsContent>
                  <TabsContent value="inactive-staff" className="mt-0">
                    <StaffList 
                      staff={filteredStaff.filter(s => !s.isActive)} 
                      onSelectStaff={setSelectedStaffId} 
                    />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>

          {/* Right sidebar for details */}
          {selectedStaff && (
            <div className="w-1/3 flex-shrink-0 overflow-auto border rounded-lg bg-white p-4">
              <StaffDetail staffMember={selectedStaff} />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setSelectedStaffId(null)}>
                  Close
                </Button>
                <Button variant="default">
                  Edit Staff
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Staff Drawer */}
      <CreateStaffDrawer 
        open={showAddStaffDialog} 
        onOpenChange={setShowAddStaffDialog}
        onStaffCreated={() => {
          refetchStaff();
        }} 
      />
    </div>
  );
}

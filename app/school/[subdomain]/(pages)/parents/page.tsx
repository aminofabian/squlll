"use client";

import React, { useState, useMemo } from "react";
import { Button } from '@/components/ui/button';
import { CreateParentDrawer } from './components/CreateParentDrawer';
import { PendingInvitationsSection } from './components/PendingInvitationsSection';
import { ParentSidebar } from './components/ParentSidebar';
import { ParentStatistics } from './components/ParentStatistics';
import { GradeFilter } from './components/GradeFilter';
import { ParentsGrid } from './components/ParentsGrid';
import { ParentDetailView } from './components/ParentDetailView';
import { mockGrades } from './data/mockData';
import { useExactParents as useParents } from './hooks/useExactParents';
import { 
  PanelLeftOpen, 
  PanelLeftClose,
  UserCheck,
  UserPlus
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  getRelationshipColor, 
  getStatusColor, 
  formatCurrency 
} from "./utils/helpers";

export default function ParentsPage() {
  // State for selected parent and filters
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  // Track if we've attempted direct fetch
  const [directFetchAttempted, setDirectFetchAttempted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [displayedParentsCount, setDisplayedParentsCount] = useState(10);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState('active-parents');

  // Get parents data from API
  const { parents, loading, error, refetchParents, tryDirectFetch } = useParents();

  // Filter parents based on search and filters
  const filteredParents = useMemo(() => {
    let filtered = parents.filter((parent) => {
      const matchesSearch = parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          parent.phone.includes(searchTerm) ||
                          (parent.email && parent.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          parent.students.some((student) => 
                            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
                          );
      
      const matchesGrade = selectedGradeId === 'all' || 
                          parent.students.some((student) => student.grade === selectedGradeId);

      return matchesSearch && matchesGrade;
    });

    // Sort parents
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'relationship':
          aValue = a.relationship;
          bValue = b.relationship;
          break;
        case 'registrationDate':
          aValue = new Date(a.registrationDate);
          bValue = new Date(b.registrationDate);
          break;
        case 'studentCount':
          aValue = a.students.length;
          bValue = b.students.length;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [parents, searchTerm, selectedGradeId, sortField, sortDirection]);

  // Get selected parent
  const selectedParent = parents.find((parent) => parent.id === selectedParentId);

  // Event handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedGradeId('all');
    setDisplayedParentsCount(10);
  };

  const handleSelectParent = (id: string) => {
    setSelectedParentId(id);
  };

  const handleLoadMore = () => {
    setDisplayedParentsCount(prev => Math.min(prev + 10, filteredParents.length));
  };

  const handleToggleStats = () => {
    setShowStats(!showStats);
  };

  const handleSelectGrade = (gradeId: string) => {
    setSelectedGradeId(gradeId);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-slate-600">Loading parents data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Unable to Load Parents</h3>
          <p className="mb-4 text-red-600">{error}</p>
          <div className="text-sm text-gray-600 mb-4">
            <p>We're having trouble accessing the parent data from the API.</p>
            <p className="mt-2 font-medium">Possible Solutions:</p>
            <ul className="list-disc list-inside mt-1 text-left">
              <li>Check if the API schema includes getAllParents query</li>
              <li>Ensure you have proper permissions to access parent data</li>
              <li>Try direct API access (bypasses some client-side restrictions)</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={refetchParents} variant="default" className="mt-2">
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
    <div className="flex h-full">
      {/* Search filter column */}
      {!isSidebarCollapsed && (
        <ParentSidebar
          parents={parents}
          filteredParents={filteredParents}
          searchTerm={searchTerm}
          selectedParentId={selectedParentId}
          selectedGradeId={selectedGradeId}
          displayedParentsCount={displayedParentsCount}
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
          onSelectParent={handleSelectParent}
          onLoadMore={handleLoadMore}
          onCollapseSidebar={() => setIsSidebarCollapsed(true)}
          getRelationshipColor={getRelationshipColor}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Main content column */}
      <div className="flex-1 overflow-auto p-8 transition-all duration-300 ease-in-out relative">
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
            <h1 className="text-2xl font-bold">
              {selectedParent ? 'Parent Details' : 'Parents'}
            </h1>
            {!loading && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refetchParents} 
                className="text-xs hover:bg-primary/5"
                title="Refresh parents data"
              >
                Refresh
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
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
            <CreateParentDrawer onParentCreated={() => {}} />
          </div>
        </div>
        
        {/* Tab navigation */}
        {!selectedParent && (
          <Tabs defaultValue="active-parents" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="active-parents" className="flex-1">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Active Parents</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="pending-invitations" className="flex-1">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Pending Invitations</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active-parents" className="mt-6">
              {/* Show grade filter and stats for active parents */}
              {selectedGradeId === 'all' && (
                <ParentStatistics 
                  parents={parents} 
                  showStats={showStats} 
                  onToggleStats={handleToggleStats} 
                />
              )}

              <GradeFilter 
                grades={mockGrades} 
                selectedGradeId={selectedGradeId} 
                onSelectGrade={handleSelectGrade} 
              />

              <ParentsGrid 
                parents={filteredParents} 
                onSelectParent={handleSelectParent} 
                getRelationshipColor={getRelationshipColor}
                formatCurrency={formatCurrency}
              />
            </TabsContent>
            
            <TabsContent value="pending-invitations" className="mt-6">
                <PendingInvitationsSection />
            </TabsContent>
          </Tabs>
        )}
        
        {/* Parent Detail View */}
        {selectedParent && (
          <ParentDetailView 
            parent={selectedParent} 
            formatCurrency={formatCurrency}
            getRelationshipColor={getRelationshipColor}
            getStatusColor={getStatusColor}
          />
        )}
      </div>
    </div>
  );
}

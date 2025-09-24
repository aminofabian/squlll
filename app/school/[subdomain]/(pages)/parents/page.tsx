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
import { mockParents, mockGrades } from './data/mockData';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [displayedParentsCount, setDisplayedParentsCount] = useState(10);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState('active-parents');

  // Filter parents based on search and filters
  const filteredParents = useMemo(() => {
    let filtered = mockParents.filter(parent => {
      const matchesSearch = parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          parent.phone.includes(searchTerm) ||
                          (parent.email && parent.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          parent.students.some(student => 
                            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
                          );
      
      const matchesGrade = selectedGradeId === 'all' || 
                          parent.students.some(student => student.grade === selectedGradeId);

      return matchesSearch && matchesGrade;
    });

    // Sort parents
    filtered.sort((a, b) => {
      let aValue, bValue;
      
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
          bValue = a.name;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedGradeId, sortField, sortDirection]);

  // Get selected parent
  const selectedParent = mockParents.find(parent => parent.id === selectedParentId);

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

  return (
    <div className="flex h-full">
      {/* Search filter column */}
      {!isSidebarCollapsed && (
        <ParentSidebar
          parents={mockParents}
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
                  parents={mockParents} 
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

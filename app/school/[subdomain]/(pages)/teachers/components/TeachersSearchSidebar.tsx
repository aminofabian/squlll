"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  PanelLeftClose,
  User,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useGetTeachers } from '@/lib/hooks/useTeachers';

// Teacher type definition (simplified for sidebar use)
type Teacher = {
  id: string;
  name: string;
  department: string;
  subjects: string[];
  status: "active" | "on leave" | "former" | "substitute" | "retired";
};

interface TeachersSearchSidebarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTeacherId: string | null;
  onTeacherSelect: (teacherId: string) => void;
  displayedTeachersCount: number;
  onLoadMore: () => void;
  onCollapse: () => void;
}

export function TeachersSearchSidebar({
  searchTerm,
  onSearchChange,
  selectedTeacherId,
  onTeacherSelect,
  displayedTeachersCount,
  onLoadMore,
  onCollapse
}: TeachersSearchSidebarProps) {
  // Fetch teachers using the getTeachers query
  const { teachers: graphqlTeachers, isLoading, isError, error, refetch } = useGetTeachers();

  // Debug logging
  useEffect(() => {
    console.log('TeachersSearchSidebar - graphqlTeachers:', graphqlTeachers);
    console.log('TeachersSearchSidebar - isLoading:', isLoading);
    console.log('TeachersSearchSidebar - isError:', isError);
    console.log('TeachersSearchSidebar - error:', error);
  }, [graphqlTeachers, isLoading, isError, error]);

  // Transform GraphQL teachers to Teacher format
  const teachers: Teacher[] = useMemo(() => {
    console.log('Transforming teachers, graphqlTeachers:', graphqlTeachers);
    
    if (!graphqlTeachers || !Array.isArray(graphqlTeachers)) {
      console.log('No teachers data or not an array');
      return [];
    }

    if (graphqlTeachers.length === 0) {
      console.log('Teachers array is empty');
      return [];
    }

    const transformed = graphqlTeachers.map((teacher: any) => {
      // Get name from fullName, firstName/lastName, or user.name
      const name = teacher.fullName || 
                   (teacher.firstName && teacher.lastName ? `${teacher.firstName} ${teacher.lastName}` : '') ||
                   teacher.user?.name || 
                   'Unknown Teacher';

      // Get department, default to "General" if not available
      const department = teacher.department || 'General';

      // Get subjects from tenantSubjects
      const subjects = teacher.tenantSubjects?.map((subject: any) => subject.name) || [];

      // Determine status based on isActive
      const status: Teacher['status'] = teacher.isActive ? 'active' : 'former';

      return {
        id: teacher.id,
        name,
        department,
        subjects,
        status,
      };
    });

    console.log('Transformed teachers:', transformed);
    return transformed;
  }, [graphqlTeachers]);

  // Filter teachers based on search term
  const filteredTeachers = useMemo(() => {
    if (!searchTerm.trim()) {
      return teachers;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return teachers.filter((teacher) => {
      return (
        teacher.name.toLowerCase().includes(lowerSearchTerm) ||
        teacher.department.toLowerCase().includes(lowerSearchTerm) ||
        teacher.subjects.some(subject => subject.toLowerCase().includes(lowerSearchTerm)) ||
        teacher.id.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [teachers, searchTerm]);

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="hidden md:flex flex-col w-96 border-r border-primary/20 overflow-y-auto p-6 shrink-0 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out relative">
      {/* Collapse button positioned at top-right of sidebar */}
      <Button
        variant="outline"
        size="sm"
        onClick={onCollapse}
        className="absolute top-4 right-4 border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all duration-200 z-10"
        title="Hide search sidebar"
      >
        <PanelLeftClose className="h-4 w-4" />
      </Button>
      
      <div className="space-y-6">
        {/* Search Input Section */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
            <label className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
              <Search className="h-3 w-3 mr-2" />
              Teacher Name
            </label>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-primary" />
            <Input
              type="text"
              placeholder="Search by name, employee ID, email..."
              className="pl-9 h-12 text-base font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Clear Search Button */}
        {searchTerm && (
          <div className="pt-1">
            <Button 
              variant="outline" 
              onClick={handleClearSearch}
              className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Teachers List Section */}
      <div className="mt-8 border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">Teachers</h3>
            {isLoading ? (
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading teachers...
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Showing {Math.min(displayedTeachersCount, filteredTeachers.length)} of {filteredTeachers.length} teachers
              </p>
            )}
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/20 font-mono">
            {isLoading ? '...' : filteredTeachers.length}
          </Badge>
        </div>
        
        {/* Error State */}
        {isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm font-mono text-red-600">
                {error instanceof Error ? error.message : 'Failed to load teachers'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="w-full border-red-200 text-red-700 hover:bg-red-100 font-mono text-xs"
            >
              Retry
            </Button>
          </div>
        )}
        
        <div className="space-y-2 mb-4">
          {isLoading ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400 font-medium flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Loading teachers...</span>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400 font-medium">
              {searchTerm ? 'No teachers match your search criteria' : 'No teachers found'}
            </div>
          ) : (
            filteredTeachers.slice(0, displayedTeachersCount).map((teacher) => (
              <div
                key={teacher.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  teacher.id === selectedTeacherId 
                    ? 'bg-primary/10 border-primary/40 shadow-md' 
                    : 'bg-white dark:bg-slate-800 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-sm'
                }`}
                onClick={() => onTeacherSelect(teacher.id)}
                title="Click to view teacher details"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        teacher.status === 'active' ? 'bg-green-500' : 
                        teacher.status === 'on leave' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
                        {teacher.name}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mb-1">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                        {teacher.department}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                      {teacher.subjects.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Section */}
        {filteredTeachers.length > displayedTeachersCount && (
          <div className="border-t border-primary/20 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                Showing {displayedTeachersCount} of {filteredTeachers.length} teachers
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono text-xs"
              >
                Load More ({Math.min(10, filteredTeachers.length - displayedTeachersCount)})
              </Button>
            </div>
          </div>
        )}
        
        {displayedTeachersCount >= filteredTeachers.length && filteredTeachers.length > 10 && (
          <div className="border-t border-primary/20 pt-4">
            <div className="flex items-center justify-center">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                All {filteredTeachers.length} teachers loaded
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

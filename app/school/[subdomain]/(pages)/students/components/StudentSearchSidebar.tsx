"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, PanelLeftClose } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  status: string;
  class: string;
}

interface StudentSearchSidebarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredStudents: Student[];
  selectedStudentId: string | null;
  onStudentSelect: (studentId: string) => void;
  displayedStudentsCount: number;
  onLoadMore: () => void;
  onClearFilters: () => void;
  selectedGradeId: string;
  onCollapse: () => void;
}

export function StudentSearchSidebar({
  searchTerm,
  onSearchChange,
  filteredStudents,
  selectedStudentId,
  onStudentSelect,
  displayedStudentsCount,
  onLoadMore,
  onClearFilters,
  selectedGradeId,
  onCollapse
}: StudentSearchSidebarProps) {
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
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
            <label className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
              <Search className="h-3 w-3 mr-2" />
              Student Name
            </label>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-primary" />
            <Input
              type="text"
              placeholder="Search by name..."
              className="pl-9 h-12 text-base font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {(searchTerm || selectedGradeId !== 'all') && (
          <div className="pt-1">
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-8 border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">Students</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Showing {Math.min(displayedStudentsCount, filteredStudents.length)} of {filteredStudents.length} students
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">
            {filteredStudents.length}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400 font-medium">
              No students match your search criteria
            </div>
          ) : (
            filteredStudents.slice(0, displayedStudentsCount).map((student) => (
              <div
                key={student.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  student.id === selectedStudentId 
                    ? 'bg-primary/10 border-primary/40 shadow-md' 
                    : 'bg-white dark:bg-slate-800 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-sm'
                }`}
                onClick={() => onStudentSelect(student.id)}
                title="Click to view student details"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        student.status === 'active' ? 'bg-green-500' : 
                        student.status === 'inactive' ? 'bg-gray-400' : 'bg-red-500'
                      }`} />
                      <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
                        {student.name}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                      {student.admissionNumber}
                    </div>
                  </div>
                  <div className="text-sm font-mono text-primary font-medium">
                    {student.class}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredStudents.length > displayedStudentsCount && (
          <div className="border-t border-primary/20 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                Showing {displayedStudentsCount} of {filteredStudents.length} students
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono text-xs"
              >
                Load More ({Math.min(10, filteredStudents.length - displayedStudentsCount)})
              </Button>
            </div>
          </div>
        )}
        
        {displayedStudentsCount >= filteredStudents.length && filteredStudents.length > 10 && (
          <div className="border-t border-primary/20 pt-4">
            <div className="flex items-center justify-center">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                All {filteredStudents.length} students loaded
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
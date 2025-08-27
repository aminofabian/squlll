"use client";

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, PanelLeftClose, BarChart3, GraduationCap, ChevronDown, ChevronRight } from 'lucide-react';

interface DashboardSearchSidebarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  selectedGradeId: string;
  onCollapse: () => void;
  students: any[];
  selectedGrade: string | null;
  onGradeSelect: (gradeId: string) => void;
  schoolConfig: any;
}

export function DashboardSearchSidebar({
  searchTerm,
  onSearchChange,
  onClearFilters,
  selectedGradeId,
  onCollapse,
  students,
  selectedGrade,
  onGradeSelect,
  schoolConfig
}: DashboardSearchSidebarProps) {
  const [displayedGradesCount, setDisplayedGradesCount] = useState(7);
  const [showAllGrades, setShowAllGrades] = useState(false);

  // Helper function to get grade display name
  function getGradeDisplayName(gradeName: string): string {
    const lowerName = gradeName.toLowerCase();
    
    // Handle special cases first
    if (lowerName.includes('pp1') || lowerName.includes('baby')) return 'PP1';
    if (lowerName.includes('pp2') || lowerName.includes('nursery')) return 'PP2';
    if (lowerName.includes('pp3') || lowerName.includes('reception')) return 'PP3';
    
    // Handle Form grades explicitly
    if (lowerName.includes('form 1') || lowerName === 'f1') return 'Form 1';
    if (lowerName.includes('form 2') || lowerName === 'f2') return 'Form 2';
    if (lowerName.includes('form 3') || lowerName === 'f3') return 'Form 3';
    if (lowerName.includes('form 4') || lowerName === 'f4') return 'Form 4';
    if (lowerName.includes('form 5') || lowerName === 'f5') return 'Form 5';
    if (lowerName.includes('form 6') || lowerName === 'f6') return 'Form 6';
    
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

  // Helper function to get grade sort order
  function getGradeSortOrder(gradeName: string): number {
    const lowerName = gradeName.toLowerCase();
    
    console.log(`Getting sort order for: "${gradeName}" (lowercase: "${lowerName}")`);
    
    // Pre-primary grades
    if (lowerName.includes('pp1') || lowerName.includes('baby')) return 1;
    if (lowerName.includes('pp2') || lowerName.includes('nursery')) return 2;
    if (lowerName.includes('pp3') || lowerName.includes('reception')) return 3;
    
    // Senior Secondary grades (Form 4-6) - Check these FIRST to avoid conflicts
    if (lowerName.includes('grade 10') || lowerName.includes('g10') || lowerName.includes('form 4')) return 13;
    if (lowerName.includes('grade 11') || lowerName.includes('g11') || lowerName.includes('form 5')) return 14;
    if (lowerName.includes('grade 12') || lowerName.includes('g12') || lowerName.includes('form 6')) return 15;
    
    // Junior Secondary grades (Form 1-3)
    if (lowerName.includes('grade 7') || lowerName.includes('g7') || lowerName.includes('form 1')) return 10;
    if (lowerName.includes('grade 8') || lowerName.includes('g8') || lowerName.includes('form 2')) return 11;
    if (lowerName.includes('grade 9') || lowerName.includes('g9') || lowerName.includes('form 3')) return 12;
    
    // Primary grades - Check these LAST to avoid conflicts
    if (lowerName.includes('grade 1') || lowerName.includes('g1')) return 4;
    if (lowerName.includes('grade 2') || lowerName.includes('g2')) return 5;
    if (lowerName.includes('grade 3') || lowerName.includes('g3')) return 6;
    if (lowerName.includes('grade 4') || lowerName.includes('g4')) return 7;
    if (lowerName.includes('grade 5') || lowerName.includes('g5')) return 8;
    if (lowerName.includes('grade 6') || lowerName.includes('g6')) return 9;
    
    // Additional patterns for Form grades
    if (lowerName === 'form 1' || lowerName === 'f1') return 10;
    if (lowerName === 'form 2' || lowerName === 'f2') return 11;
    if (lowerName === 'form 3' || lowerName === 'f3') return 12;
    if (lowerName === 'form 4' || lowerName === 'f4') return 13;
    if (lowerName === 'form 5' || lowerName === 'f5') return 14;
    if (lowerName === 'form 6' || lowerName === 'f6') return 15;
    
    console.log(`No match found for: "${gradeName}", returning 999`);
    return 999; // Default for unknown grades
  }

  // Get all available grades from school config, sorted properly
  const availableGrades = useMemo(() => {
    if (!schoolConfig?.selectedLevels) return [];
    
    console.log('School config levels:', schoolConfig.selectedLevels);
    
    const grades = [];
    for (const level of schoolConfig.selectedLevels) {
      if (level.gradeLevels) {
        for (const grade of level.gradeLevels) {
          const sortOrder = getGradeSortOrder(grade.name);
          const displayName = getGradeDisplayName(grade.name);
          
          console.log(`Processing grade: "${grade.name}" -> display: "${displayName}", sortOrder: ${sortOrder}`);
          
          grades.push({
            id: grade.id,
            name: grade.name,
            displayName: displayName,
            level: level.name,
            sortOrder: sortOrder,
            studentCount: students.filter(s => 
              s.grade.toLowerCase() === grade.name.toLowerCase()
            ).length
          });
        }
      }
    }
    
    // Sort grades by their proper order
    const sortedGrades = grades.sort((a, b) => {
      console.log(`Comparing: ${a.displayName} (${a.sortOrder}) vs ${b.displayName} (${b.sortOrder})`);
      return a.sortOrder - b.sortOrder;
    });
    
    // Debug logging
    console.log('Available grades before sorting:', grades.map(g => ({ name: g.name, displayName: g.displayName, sortOrder: g.sortOrder })));
    console.log('Available grades after sorting:', sortedGrades.map(g => ({ name: g.name, displayName: g.displayName, sortOrder: g.sortOrder })));
    
    return sortedGrades;
  }, [schoolConfig, students]);

  // Get the grades to display based on current state
  const displayedGrades = useMemo(() => {
    if (showAllGrades) {
      return availableGrades;
    }
    return availableGrades.slice(0, displayedGradesCount);
  }, [availableGrades, displayedGradesCount, showAllGrades]);

  const handleLoadMore = () => {
    setDisplayedGradesCount(prev => Math.min(prev + 7, availableGrades.length));
  };

  const handleToggleAllGrades = () => {
    setShowAllGrades(!showAllGrades);
    if (!showAllGrades) {
      setDisplayedGradesCount(availableGrades.length);
    } else {
      setDisplayedGradesCount(7);
    }
  };

  return (
    <div className="hidden md:flex flex-col w-80 lg:w-96 border-r border-primary/20 overflow-y-auto p-4 lg:p-6 shrink-0 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out relative">
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
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-4 lg:p-6">
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
            <label className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
              <Search className="h-3 w-3 mr-2" />
              Search Dashboard
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

        {(searchTerm || selectedGrade) && (
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
      
      <div className="mt-6 lg:mt-8 border-2 border-primary/20 bg-primary/5 rounded-xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">Grade Overview</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Select a grade to view detailed statistics
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">
            {availableGrades.length}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          {/* All Grades Option */}
          <div
            className={`p-3 lg:p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
              !selectedGrade 
                ? 'bg-primary/10 border-primary/40 shadow-md' 
                : 'bg-white dark:bg-slate-800 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-sm'
            }`}
            onClick={() => onGradeSelect('all')}
            title="View all grades overview"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono font-medium text-slate-900 dark:text-slate-100 text-sm lg:text-base truncate">
                    All Grades
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">
                    School Overview
                  </div>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs shrink-0 ml-2">
                {students.length}
              </Badge>
            </div>
          </div>

          {/* Individual Grades - Grouped by Level */}
          {displayedGrades.map((grade) => (
            <div
              key={grade.id}
              className={`p-3 lg:p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                selectedGrade === grade.id 
                  ? 'bg-primary/10 border-primary/40 shadow-md' 
                  : 'bg-white dark:bg-slate-800 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-sm'
              }`}
              onClick={() => onGradeSelect(grade.id)}
              title={`View ${grade.displayName} details`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <GraduationCap className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono font-medium text-slate-900 dark:text-slate-100 text-sm lg:text-base truncate">
                      {grade.displayName}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">
                      {grade.level}
                    </div>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs shrink-0 ml-2">
                  {grade.studentCount}
                </Badge>
              </div>
            </div>
          ))}

          {/* Load More / Show All Button */}
          {availableGrades.length > displayedGradesCount && (
            <div className="pt-4 border-t border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                  Showing {displayedGradesCount} of {availableGrades.length} grades
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono text-xs"
                >
                  Load More ({Math.min(7, availableGrades.length - displayedGradesCount)})
                </Button>
              </div>
            </div>
          )}

          {/* Show All / Collapse Button */}
          {availableGrades.length > 7 && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAllGrades}
                className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono text-xs"
              >
                {showAllGrades ? (
                  <>
                    <ChevronRight className="w-3 h-3 mr-2" />
                    Show First 7
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-2" />
                    Show All Grades
                  </>
                )}
              </Button>
            </div>
          )}

          {/* All Grades Loaded Message */}
          {displayedGradesCount >= availableGrades.length && availableGrades.length > 7 && !showAllGrades && (
            <div className="border-t border-primary/20 pt-4">
              <div className="flex items-center justify-center">
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                  All {availableGrades.length} grades loaded
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
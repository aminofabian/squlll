"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, PanelLeftClose, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  // Helper function to abbreviate grade names (exact copy from SchoolSearchFilter)
  function abbreviateGrade(gradeName: string): string {
    const lowerName = gradeName.toLowerCase().trim();
    
    // Handle special cases first - check exact matches and variations
    if (
      lowerName === 'baby' ||
      lowerName === 'play group' ||
      lowerName === 'playgroup' ||
      lowerName.startsWith('baby') ||
      lowerName.startsWith('play group') ||
      lowerName.includes('play group') ||
      lowerName.includes('baby class') ||
      (lowerName.includes('baby') && !lowerName.includes('pp1') && !lowerName.includes('pp2'))
    ) {
      return 'PG';
    }
    if (lowerName === 'pp1' || lowerName.includes('pp1') || lowerName.includes('pre-primary 1')) return 'PP1';
    if (lowerName === 'pp2' || lowerName.includes('pp2') || lowerName.includes('pre-primary 2')) return 'PP2';
    if (lowerName === 'pp3' || lowerName.includes('pp3') || lowerName.includes('pre-primary 3')) return 'PP3';
    if (lowerName.includes('early childhood')) return 'EC';
    if (lowerName.includes('kindergarten')) return 'KG';
    if (lowerName.includes('nursery')) return 'NS';
    if (lowerName.includes('reception')) return 'RC';

    // Extract number from grade name
    const match = gradeName.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      
      // G1-G6 display as G1, G2, etc.
      if (num >= 1 && num <= 6) {
        return `G${num}`;
      }
      
      // G7+ display as F1, F2, F3, etc.
      // G7 = F1, G8 = F2, G9 = F3, G10 = F4, G11 = F5, G12 = F6
      if (num >= 7) {
        const formNumber = num - 6; // G7 -> F1, G8 -> F2, etc.
        return `F${formNumber}`;
      }
    }

    // If no number found, return first 2 characters
    return gradeName.slice(0, 2);
  }

  // Helper function to get grade sort order (exact copy from SchoolSearchFilter)
  function getGradeSortOrder(gradeName: string): number {
    const lowerName = gradeName.toLowerCase().trim();
    
    // Play group / Baby class comes first - check exact matches and variations first
    if (
      lowerName === 'baby' ||
      lowerName === 'play group' ||
      lowerName === 'playgroup' ||
      lowerName.startsWith('baby') ||
      lowerName.startsWith('play group') ||
      lowerName.includes('play group') ||
      lowerName.includes('baby class') ||
      (lowerName.includes('baby') && !lowerName.includes('pp1') && !lowerName.includes('pp2'))
    ) {
      return 1;
    }
    
    // PP1 comes second - be more specific to avoid matching "Baby" or other grades
    if (lowerName === 'pp1' || lowerName.includes('pp1') || lowerName.includes('pre-primary 1')) {
      return 2;
    }
    
    // PP2 comes third
    if (lowerName === 'pp2' || lowerName.includes('pp2') || lowerName.includes('pre-primary 2')) {
      return 3;
    }
    
    // PP3 if it exists
    if (lowerName === 'pp3' || lowerName.includes('pp3') || lowerName.includes('pre-primary 3')) {
      return 4;
    }
    
    // Extract number from grade name
    const match = gradeName.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      
      // G1-G6 come after preschool
      if (num >= 1 && num <= 6) {
        return 4 + num; // 5, 6, 7, 8, 9, 10
      }
      
      // G7+ should be displayed as F1, F2, etc.
      // G7 = F1 (sort order 11), G8 = F2 (sort order 12), etc.
      if (num >= 7) {
        return 4 + num; // G7 = 11, G8 = 12, G9 = 13, etc.
      }
    }
    
    // Default for unknown grades
    return 999;
  }

  // Get all available grades from school config, sorted properly
  const allGrades = useMemo(() => {
    if (!schoolConfig?.selectedLevels) return [];

    // Flatten all grades from all levels into a single array
    const grades: Array<{ id: string; name: string; levelId: string; streams?: any[] }> = [];
    
    schoolConfig.selectedLevels.forEach((level: any) => {
      (level.gradeLevels || []).forEach((grade: any) => {
        grades.push({
          ...grade,
          levelId: level.id
        });
      });
    });

    // Sort all grades by their sort order
    const sorted = grades.sort((a, b) => {
      const aOrder = getGradeSortOrder(a.name);
      const bOrder = getGradeSortOrder(b.name);
      return aOrder - bOrder;
    });
    
    return sorted;
  }, [schoolConfig?.selectedLevels]);

  // Filter grades based on search term
  const filteredGrades = useMemo(() => {
    if (!allGrades) return [];
    
    if (!searchTerm) return allGrades;
    
    const term = searchTerm.toLowerCase();
    return allGrades.filter(grade =>
      grade.name.toLowerCase().includes(term) ||
      abbreviateGrade(grade.name).toLowerCase().includes(term)
    );
  }, [allGrades, searchTerm]);

  // Group grades into three categories (exact copy from SchoolSearchFilter)
  const groupedGrades = useMemo(() => {
    const preschool: typeof filteredGrades = [];
    const primary: typeof filteredGrades = [];
    const form: typeof filteredGrades = [];

    filteredGrades.forEach(grade => {
      const sortOrder = getGradeSortOrder(grade.name);
      const abbreviated = abbreviateGrade(grade.name);
      
      // Preschool: PG, PP1, PP2 (sort order 1-3)
      if (sortOrder >= 1 && sortOrder <= 3) {
        preschool.push(grade);
      }
      // Primary: G1-G6 (sort order 5-10, which is 4+1 to 4+6)
      else if (sortOrder >= 5 && sortOrder <= 10) {
        primary.push(grade);
      }
      // Form: F1-F6 (G7-G12, sort order 11-16, which is 4+7 to 4+12)
      else if (sortOrder >= 11 && sortOrder <= 16) {
        form.push(grade);
      }
      // Handle edge cases - check abbreviated name as fallback
      else if (abbreviated.startsWith('PG') || abbreviated.startsWith('PP')) {
        preschool.push(grade);
      } else if (abbreviated.startsWith('G') && /^G[1-6]$/.test(abbreviated)) {
        primary.push(grade);
      } else if (abbreviated.startsWith('F') && /^F[1-6]$/.test(abbreviated)) {
        form.push(grade);
      }
    });

    return { preschool, primary, form };
  }, [filteredGrades]);

  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());

  // Effect to ensure selected grade is expanded when selection changes
  useEffect(() => {
    if (selectedGrade && !expandedGrades.has(selectedGrade)) {
      setExpandedGrades(prev => new Set([...prev, selectedGrade]));
    }
  }, [selectedGrade, expandedGrades]);

  const handleGradeClick = (gradeId: string) => {
    // Toggle expanded state for the grade
    setExpandedGrades(prev => {
      const newSet = new Set(prev);
      if (newSet.has(gradeId)) {
        newSet.delete(gradeId);
      } else {
        newSet.add(gradeId);
      }
      return newSet;
    });
    
    onGradeSelect(gradeId);
  };


  return (
    <div className="hidden md:flex flex-col w-56 border-r-2 border-primary/20 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out relative">
      {/* Collapse button positioned at top-right of sidebar */}
      <div className="p-4 border-b-2 border-primary/20 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCollapse}
          className="border-primary/20 bg-white dark:bg-slate-800 text-primary hover:bg-primary/5 transition-all duration-200"
          title="Hide search sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-col h-full">
        <div className="flex flex-col space-y-4 p-4 border-b">
          {/* Search Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Grade Levels</h3>
            <div className="flex items-center gap-2">
              {(searchTerm || selectedGrade) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  Clear
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search grades..."
              className="pl-9 h-10"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        {/* Grades List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-4 py-3">
            {filteredGrades.length === 0 ? (
              <div className="text-center py-6 rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">No grades found</p>
              </div>
            ) : (
              <div className="space-y-4 py-1">
                {/* Helper function to render a grade group */}
                {(() => {
                  const renderGradeGroup = (
                    grades: typeof filteredGrades,
                    groupTitle: string
                  ) => {
                    if (grades.length === 0) return null;

                    return (
                      <div className="space-y-2">
                        {/* Group Header */}
                        <div className="flex items-center gap-2 px-1">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                          <h4 className="text-xs font-semibold text-primary/80 uppercase tracking-wider px-2">
                            {groupTitle}
                          </h4>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        </div>
                        
                        {/* Grades Grid */}
                        <div className="grid grid-cols-2 gap-1.5 justify-items-center">
                          {grades.map((grade) => {
                            const studentCount = students.filter(s => 
                              s.grade.toLowerCase() === grade.name.toLowerCase()
                            ).length;
                            
                            return (
                              <div key={grade.id} className="flex flex-col gap-1 items-center w-full">
                                <Button
                                  variant={selectedGrade === grade.id ? "default" : "outline"}
                                  className={cn(
                                    "h-7 px-1 py-1 transition-all duration-300 group text-xs relative w-1/2",
                                    selectedGrade === grade.id 
                                      ? "bg-primary text-white hover:text-white shadow-sm"
                                      : "hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                                  )}
                                  onClick={() => handleGradeClick(grade.id)}
                                >
                                  <div className="flex items-center justify-center w-full">
                                    <span className="font-medium">
                                      {abbreviateGrade(grade.name)}
                                    </span>
                                    {grade.streams && grade.streams.length > 0 && (
                                      <div className="flex items-center ml-1">
                                        <Badge 
                                          variant="outline" 
                                          className={cn(
                                            "text-[8px] h-3.5 px-0.5 shrink-0 transition-all duration-300",
                                            selectedGrade === grade.id
                                              ? "border-white/40 text-white bg-white/10 hover:bg-white/20"
                                              : "border-dashed hover:border-primary/50"
                                          )}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleGradeClick(grade.id);
                                          }}
                                        >
                                          {grade.streams.length}
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                  {expandedGrades.has(grade.id) && grade.streams && grade.streams.length > 0 && (
                                    <motion.div 
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="absolute -right-1 -top-1 h-2 w-2 bg-secondary rounded-full" 
                                    />
                                  )}
                                </Button>
                                
                                {/* Streams section */}
                                {expandedGrades.has(grade.id) && grade.streams && grade.streams.length > 0 && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col items-center gap-0.5 pl-0.5 overflow-visible w-full"
                                  >
                                    {grade.streams.map((stream: any) => {
                                      const isSelected = false; // Add stream selection logic if needed
                                      
                                      return (
                                        <Button
                                          key={stream.id}
                                          variant="outline"
                                          size="sm"
                                          className={cn(
                                            "h-5 py-0 px-1 text-[9px] relative group overflow-hidden transition-all duration-300 w-1/2",
                                            isSelected 
                                              ? "bg-white dark:bg-slate-800 border border-primary shadow-sm" 
                                              : "hover:bg-primary/5 dark:hover:bg-primary/10 border border-dashed hover:border-primary/40"
                                          )}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Add stream selection logic if needed
                                          }}
                                        >
                                          <div className="flex items-center justify-center w-full">
                                            <span className={cn(
                                              "font-medium truncate",
                                              isSelected && "text-primary"
                                            )}>{stream.name}</span>
                                          </div>
                                          
                                          {isSelected && (
                                            <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ width: '100%' }}
                                              transition={{ duration: 0.2 }}
                                              className="absolute bottom-0 left-0 h-0.5 bg-primary" 
                                            />
                                          )}
                                        </Button>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  };

                  return (
                    <>
                      {renderGradeGroup(groupedGrades.preschool, 'Preschool')}
                      {groupedGrades.preschool.length > 0 && groupedGrades.primary.length > 0 && (
                        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-1.5" />
                      )}
                      {renderGradeGroup(groupedGrades.primary, 'Primary')}
                      {groupedGrades.primary.length > 0 && groupedGrades.form.length > 0 && (
                        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-1.5" />
                      )}
                      {renderGradeGroup(groupedGrades.form, 'Form')}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 
'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, GraduationCap, X, BookOpen, School, Users, Award, GitBranch } from "lucide-react"
import { useEffect, useState, useMemo } from 'react'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { Level, GradeLevel, Stream } from '@/lib/types/school-config'
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'

// Define the exact education level names and their order
const LEVEL_ORDER: { [key: string]: number } = {
  // International School (IGCSE) levels
  'IGCSE Early Years': 0,
  'IGCSE Primary': 1,
  'IGCSE Lower Secondary': 2,
  'IGCSE Upper Secondary': 3,
  'A Level': 4,
  // Local curriculum levels
  'Pre-Primary': 5,
  'Lower Primary': 6,
  'Upper Primary': 7,
  'Junior Secondary': 8,
  'Senior Secondary': 9,
  // Madrasa levels
  'Madrasa Beginners': 10,
  'Madrasa Lower': 11,
  'Madrasa Upper': 12,
  'Madrasa Secondary': 13
};

// Helper function to get the sort order for a grade
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

// Helper function to sort grades within a level
function sortGrades(grades: GradeLevel[], levelName: string): GradeLevel[] {
  return [...grades].sort((a, b) => {
    const aOrder = getGradeSortOrder(a.name);
    const bOrder = getGradeSortOrder(b.name);
    
    // Always sort in ascending order based on sort order
    return aOrder - bOrder;
  });
}

// Helper function to abbreviate grade names
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

// Props for the SchoolSearchFilter component
interface SchoolSearchFilterProps {
  className?: string
  type?: 'grades' | 'classes' | 'students'
  onSearch?: (term: string) => void
  onGradeSelect?: (gradeId: string, levelId: string) => void
  onStreamSelect?: (streamId: string, gradeId: string, levelId: string) => void
  isLoading?: boolean
  selectedGradeId?: string
  selectedStreamId?: string
}

export function SchoolSearchFilter({ 
  className, 
  type = 'grades',
  onSearch,
  onGradeSelect,
  onStreamSelect,
  isLoading = false,
  selectedGradeId: parentSelectedGradeId,
  selectedStreamId: parentSelectedStreamId
}: SchoolSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set())
  
  // Use parent state for selections, fall back to empty string if not provided
  const selectedGradeId = parentSelectedGradeId || ''
  const selectedStreamId = parentSelectedStreamId || ''
  const { config } = useSchoolConfigStore()
  const queryClient = useQueryClient()

  // Effect to ensure selected grade is expanded when selection changes from parent
  useEffect(() => {
    if (selectedGradeId && !expandedGrades.has(selectedGradeId)) {
      setExpandedGrades(prev => new Set([...prev, selectedGradeId]))
    }
  }, [selectedGradeId, expandedGrades])

  // Get all grades flattened into a single list, sorted by order
  const allGrades = useMemo(() => {
    if (!config?.selectedLevels) return [];

    // Flatten all grades from all levels into a single array
    const grades: Array<GradeLevel & { levelId: string }> = [];
    
    config.selectedLevels.forEach(level => {
      (level.gradeLevels || []).forEach(grade => {
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
      
      // Debug logging to help troubleshoot sorting
      if (a.name.toLowerCase().includes('baby') || a.name.toLowerCase().includes('play') || 
          b.name.toLowerCase().includes('baby') || b.name.toLowerCase().includes('play') ||
          a.name.toLowerCase().includes('pp1') || b.name.toLowerCase().includes('pp1')) {
        console.log(`Sorting: "${a.name}" (order: ${aOrder}) vs "${b.name}" (order: ${bOrder})`);
      }
      
      return aOrder - bOrder;
    });
    
    return sorted;
  }, [config?.selectedLevels]);

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

  // Group grades into three categories
  const groupedGrades = useMemo(() => {
    const preschool: Array<GradeLevel & { levelId: string }> = [];
    const primary: Array<GradeLevel & { levelId: string }> = [];
    const form: Array<GradeLevel & { levelId: string }> = [];

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  const refreshConfig = async () => {
    console.log('Manually refreshing school config...');
    await queryClient.invalidateQueries({ queryKey: ['schoolConfig'] });
  };

  const handleGradeClick = (gradeId: string, levelId: string) => {
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
    
    if (onGradeSelect) {
      onGradeSelect(gradeId, levelId);
    }
  };
  
  const handleStreamClick = (streamId: string, gradeId: string, levelId: string) => {
    // Toggle stream selection if clicking the same stream
    const newStreamId = selectedStreamId === streamId ? '' : streamId;
    
    if (onStreamSelect) {
      onStreamSelect(newStreamId, gradeId, levelId);
    }
  };

  // Enhanced level styling configuration
  const getLevelStyle = (levelName: string) => {
    switch (true) {
      // IGCSE International School levels
      case levelName.includes('IGCSE Early Years'):
        return {
          color: 'text-cyan-600 dark:text-cyan-400',
          bgLight: 'bg-cyan-50 dark:bg-cyan-900/10',
          bgDark: 'bg-cyan-100 dark:bg-cyan-800/20',
          border: 'border-cyan-200 dark:border-cyan-700',
          hover: 'hover:border-cyan-300 dark:hover:border-cyan-600',
          gradient: 'from-cyan-50 to-cyan-100 dark:from-cyan-900/10 dark:to-cyan-800/20',
          icon: School
        };
      case levelName.includes('IGCSE Primary'):
        return {
          color: 'text-indigo-600 dark:text-indigo-400',
          bgLight: 'bg-indigo-50 dark:bg-indigo-900/10',
          bgDark: 'bg-indigo-100 dark:bg-indigo-800/20',
          border: 'border-indigo-200 dark:border-indigo-700',
          hover: 'hover:border-indigo-300 dark:hover:border-indigo-600',
          gradient: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/10 dark:to-indigo-800/20',
          icon: BookOpen
        };
      case levelName.includes('IGCSE Lower Secondary'):
        return {
          color: 'text-violet-600 dark:text-violet-400',
          bgLight: 'bg-violet-50 dark:bg-violet-900/10',
          bgDark: 'bg-violet-100 dark:bg-violet-800/20',
          border: 'border-violet-200 dark:border-violet-700',
          hover: 'hover:border-violet-300 dark:hover:border-violet-600',
          gradient: 'from-violet-50 to-violet-100 dark:from-violet-900/10 dark:to-violet-800/20',
          icon: Users
        };
      case levelName.includes('IGCSE Upper Secondary'):
        return {
          color: 'text-pink-600 dark:text-pink-400',
          bgLight: 'bg-pink-50 dark:bg-pink-900/10',
          bgDark: 'bg-pink-100 dark:bg-pink-800/20',
          border: 'border-pink-200 dark:border-pink-700',
          hover: 'hover:border-pink-300 dark:hover:border-pink-600',
          gradient: 'from-pink-50 to-pink-100 dark:from-pink-900/10 dark:to-pink-800/20',
          icon: GraduationCap
        };
      case levelName.includes('A Level'):
        return {
          color: 'text-rose-600 dark:text-rose-400',
          bgLight: 'bg-rose-50 dark:bg-rose-900/10',
          bgDark: 'bg-rose-100 dark:bg-rose-800/20',
          border: 'border-rose-200 dark:border-rose-700',
          hover: 'hover:border-rose-300 dark:hover:border-rose-600',
          gradient: 'from-rose-50 to-rose-100 dark:from-rose-900/10 dark:to-rose-800/20',
          icon: Award
        };
      // Madrasa levels
      case levelName.includes('Madrasa Beginners'):
        return {
          color: 'text-emerald-600 dark:text-emerald-400',
          bgLight: 'bg-emerald-50 dark:bg-emerald-900/10',
          bgDark: 'bg-emerald-100 dark:bg-emerald-800/20',
          border: 'border-emerald-200 dark:border-emerald-700',
          hover: 'hover:border-emerald-300 dark:hover:border-emerald-600',
          gradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-800/20',
          icon: School
        };
      case levelName.includes('Madrasa Lower'):
        return {
          color: 'text-teal-600 dark:text-teal-400',
          bgLight: 'bg-teal-50 dark:bg-teal-900/10',
          bgDark: 'bg-teal-100 dark:bg-teal-800/20',
          border: 'border-teal-200 dark:border-teal-700',
          hover: 'hover:border-teal-300 dark:hover:border-teal-600',
          gradient: 'from-teal-50 to-teal-100 dark:from-teal-900/10 dark:to-teal-800/20',
          icon: BookOpen
        };
      case levelName.includes('Madrasa Upper'):
        return {
          color: 'text-amber-600 dark:text-amber-400',
          bgLight: 'bg-amber-50 dark:bg-amber-900/10',
          bgDark: 'bg-amber-100 dark:bg-amber-800/20',
          border: 'border-amber-200 dark:border-amber-700',
          hover: 'hover:border-amber-300 dark:hover:border-amber-600',
          gradient: 'from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-800/20',
          icon: Users
        };
      case levelName.includes('Madrasa Secondary'):
        return {
          color: 'text-yellow-600 dark:text-yellow-400',
          bgLight: 'bg-yellow-50 dark:bg-yellow-900/10',
          bgDark: 'bg-yellow-100 dark:bg-yellow-800/20',
          border: 'border-yellow-200 dark:border-yellow-700',
          hover: 'hover:border-yellow-300 dark:hover:border-yellow-600',
          gradient: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/10 dark:to-yellow-800/20',
          icon: GraduationCap
        };
      // Local curriculum levels
      case levelName.includes('Pre-Primary'):
        return {
          color: 'text-purple-600 dark:text-purple-400',
          bgLight: 'bg-purple-50 dark:bg-purple-900/10',
          bgDark: 'bg-purple-100 dark:bg-purple-800/20',
          border: 'border-purple-200 dark:border-purple-700',
          hover: 'hover:border-purple-300 dark:hover:border-purple-600',
          gradient: 'from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/20',
          icon: School
        };
      case levelName.includes('Lower Primary'):
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bgLight: 'bg-blue-50 dark:bg-blue-900/10',
          bgDark: 'bg-blue-100 dark:bg-blue-800/20',
          border: 'border-blue-200 dark:border-blue-700',
          hover: 'hover:border-blue-300 dark:hover:border-blue-600',
          gradient: 'from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/20',
          icon: BookOpen
        };
      case levelName.includes('Upper Primary'):
        return {
          color: 'text-green-600 dark:text-green-400',
          bgLight: 'bg-green-50 dark:bg-green-900/10',
          bgDark: 'bg-green-100 dark:bg-green-800/20',
          border: 'border-green-200 dark:border-green-700',
          hover: 'hover:border-green-300 dark:hover:border-green-600',
          gradient: 'from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/20',
          icon: Users
        };
      case levelName.includes('Junior Secondary'):
        return {
          color: 'text-orange-600 dark:text-orange-400',
          bgLight: 'bg-orange-50 dark:bg-orange-900/10',
          bgDark: 'bg-orange-100 dark:bg-orange-800/20',
          border: 'border-orange-200 dark:border-orange-700',
          hover: 'hover:border-orange-300 dark:hover:border-orange-600',
          gradient: 'from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/20',
          icon: GraduationCap
        };
      case levelName.includes('Senior Secondary'):
        return {
          color: 'text-red-600 dark:text-red-400',
          bgLight: 'bg-red-50 dark:bg-red-900/10',
          bgDark: 'bg-red-100 dark:bg-red-800/20',
          border: 'border-red-200 dark:border-red-700',
          hover: 'hover:border-red-300 dark:hover:border-red-600',
          gradient: 'from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-800/20',
          icon: Award
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgLight: 'bg-gray-50 dark:bg-gray-900/10',
          bgDark: 'bg-gray-100 dark:bg-gray-800/20',
          border: 'border-gray-200 dark:border-gray-700',
          hover: 'hover:border-gray-300 dark:hover:border-gray-600',
          gradient: 'from-gray-50 to-gray-100 dark:from-gray-900/10 dark:to-gray-800/20',
          icon: School
        };
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex flex-col space-y-4 p-4 border-b">
        {/* Search Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Grade Levels</h3>
          <div className="flex items-center gap-2">
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                Clear
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshConfig}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search grades..."
            className="pl-9 h-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      {/* Grades List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-6 py-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2 py-2">
              {/* Grades Grid Skeleton */}
              {[...Array(12)].map((_, j) => (
                <motion.div 
                  key={j} 
                  className="h-8 w-full border border-primary/20 rounded-md bg-muted-foreground/5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: j * 0.03 }}
                >
                  <div className="flex items-center justify-center h-full px-3">
                    <div className="h-3.5 w-3.5 rounded-full bg-muted-foreground/10 animate-pulse" />
                    <div className="h-2 w-12 bg-muted-foreground/10 rounded ml-1.5 animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="text-center py-8 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">No grades found</p>
            </div>
          ) : (
            <div className="space-y-6 py-2">
              {/* Helper function to render a grade group */}
              {(() => {
                const renderGradeGroup = (
                  grades: Array<GradeLevel & { levelId: string }>,
                  groupTitle: string
                ) => {
                  if (grades.length === 0) return null;

                  return (
                    <div className="space-y-3">
                      {/* Group Header */}
                      <div className="flex items-center gap-2 px-1">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <h4 className="text-xs font-semibold text-primary/80 uppercase tracking-wider px-2">
                          {groupTitle}
                        </h4>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      </div>
                      
                      {/* Grades Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {grades.map((grade) => (
                          <div key={grade.id} className="flex flex-col gap-1.5">
                            <Button
                              variant={selectedGradeId === grade.id ? "default" : "outline"}
                              className={cn(
                                "h-8 px-3 transition-all duration-300 group text-xs relative w-full",
                                selectedGradeId === grade.id 
                                  ? "bg-primary text-white hover:text-white shadow-sm"
                                  : "hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                              )}
                              onClick={() => handleGradeClick(grade.id, grade.levelId)}
                            >
                              <div className="flex items-center gap-1.5 justify-center w-full">
                                <div className={cn(
                                  "flex items-center justify-center h-4 w-4 rounded-full transition-colors",
                                  selectedGradeId === grade.id 
                                    ? "bg-white/20" 
                                    : "bg-muted group-hover:bg-primary/10"
                                )}>
                                  <GraduationCap className={cn(
                                    "h-2.5 w-2.5 shrink-0",
                                    selectedGradeId === grade.id 
                                      ? "text-white" 
                                      : "text-muted-foreground group-hover:text-primary"
                                  )} />
                                </div>
                                <span className="font-medium">
                                  {abbreviateGrade(grade.name)}
                                </span>
                                {grade.streams?.length > 0 && (
                                  <div className="flex items-center">
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "ml-1 text-[9px] h-4 px-1.5 shrink-0 transition-all duration-300",
                                        selectedGradeId === grade.id
                                          ? "border-white/40 text-white bg-white/10 hover:bg-white/20"
                                          : "border-dashed hover:border-primary/50"
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGradeClick(grade.id, grade.levelId);
                                      }}
                                    >
                                      <GitBranch className="mr-0.5 h-2 w-2 shrink-0" />
                                      {grade.streams.length}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              {expandedGrades.has(grade.id) && grade.streams?.length > 0 && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="absolute -right-1 -top-1 h-2 w-2 bg-secondary rounded-full" 
                                />
                              )}
                            </Button>
                            
                            {/* Streams section */}
                            {expandedGrades.has(grade.id) && grade.streams?.length > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="grid grid-cols-2 gap-1.5 pl-1 overflow-visible"
                              >
                                {grade.streams.map((stream) => {
                                  const isSelected = selectedStreamId === stream.id;
                                  
                                  return (
                                    <Button
                                      key={stream.id}
                                      variant="outline"
                                      size="sm"
                                      className={cn(
                                        "h-6 py-0 px-2.5 text-[10px] relative group overflow-hidden transition-all duration-300 w-full",
                                        isSelected 
                                          ? "bg-white dark:bg-slate-800 border border-primary shadow-sm" 
                                          : "hover:bg-primary/5 dark:hover:bg-primary/10 border border-dashed hover:border-primary/40"
                                      )}
                                      onClick={() => handleStreamClick(stream.id, grade.id, grade.levelId)}
                                    >
                                      <div className="flex items-center gap-1.5 justify-center w-full">
                                        <div className={cn(
                                          "flex items-center justify-center h-3.5 w-3.5 rounded-full transition-colors",
                                          isSelected
                                            ? "bg-primary" 
                                            : "bg-muted group-hover:bg-primary/10"
                                        )}>
                                          <GitBranch className={cn(
                                            "h-2 w-2 shrink-0",
                                            isSelected ? "text-white" : "text-muted-foreground group-hover:text-primary"
                                          )} />
                                        </div>
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
                        ))}
                      </div>
                    </div>
                  );
                };

                return (
                  <>
                    {renderGradeGroup(groupedGrades.preschool, 'Preschool')}
                    {groupedGrades.preschool.length > 0 && groupedGrades.primary.length > 0 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-2" />
                    )}
                    {renderGradeGroup(groupedGrades.primary, 'Primary')}
                    {groupedGrades.primary.length > 0 && groupedGrades.form.length > 0 && (
                      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-2" />
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
  );
}
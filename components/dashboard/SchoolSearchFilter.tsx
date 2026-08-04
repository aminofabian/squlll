'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, GraduationCap, X, School, BookOpen, Users, Award, LayoutGrid, Check } from "lucide-react"
import { useEffect, useState, useMemo } from 'react'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { Level, GradeLevel, Stream } from '@/lib/types/school-config'
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useQueryClient } from '@tanstack/react-query'
import {
  abbreviateGradeShort,
  getGradeCurriculumBand,
  getGradeSortOrder,
} from '@/lib/utils/grade-display'

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

// Helper function to sort grades within a level
function sortGrades(grades: GradeLevel[], levelName: string): GradeLevel[] {
  return [...grades].sort((a, b) => {
    const aOrder = getGradeSortOrder(a.name);
    const bOrder = getGradeSortOrder(b.name);
    return aOrder - bOrder;
  });
}

// Props for the SchoolSearchFilter component
interface SchoolSearchFilterProps {
  className?: string
  type?: 'grades' | 'classes' | 'students'
  variant?: 'default' | 'minimal'
  surface?: 'sidebar' | 'drawer'
  onSearch?: (term: string) => void
  onGradeSelect?: (gradeId: string, levelId: string) => void
  onStreamSelect?: (streamId: string, gradeId: string, levelId: string) => void
  isLoading?: boolean
  selectedGradeId?: string
  selectedStreamId?: string
  allClassesSelected?: boolean
  onSelectAllClasses?: () => void
  /** When set, only these grade IDs appear in the list (e.g. exam session scope). */
  allowedGradeIds?: string[]
}

export function SchoolSearchFilter({ 
  className, 
  type = 'grades',
  variant = 'default',
  surface = 'sidebar',
  onSearch,
  onGradeSelect,
  onStreamSelect,
  isLoading = false,
  selectedGradeId: parentSelectedGradeId,
  selectedStreamId: parentSelectedStreamId,
  allClassesSelected = false,
  onSelectAllClasses,
  allowedGradeIds,
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

  const scopedGrades = useMemo(() => {
    if (!allowedGradeIds?.length) return allGrades;
    const allowed = new Set(allowedGradeIds);
    return allGrades.filter((grade) => allowed.has(grade.id));
  }, [allGrades, allowedGradeIds]);

  // Filter grades based on search term
  const filteredGrades = useMemo(() => {
    if (!scopedGrades.length) return [];

    if (!searchTerm) return scopedGrades;

    const term = searchTerm.toLowerCase();
    return scopedGrades.filter(grade =>
      grade.name.toLowerCase().includes(term) ||
      abbreviateGradeShort(grade.name).toLowerCase().includes(term)
    );
  }, [scopedGrades, searchTerm]);

  // Group grades by configured school level (minimal sidebar) or curriculum band (default)
  const levelGroups = useMemo(() => {
    if (!config?.selectedLevels) return [];

    return config.selectedLevels
      .map((level) => ({
        key: level.id,
        title: level.name,
        grades: filteredGrades.filter((grade) => grade.levelId === level.id),
      }))
      .filter((group) => group.grades.length > 0);
  }, [config?.selectedLevels, filteredGrades]);

  // Group grades into three categories (default sidebar)
  const groupedGrades = useMemo(() => {
    const preschool: Array<GradeLevel & { levelId: string }> = [];
    const primary: Array<GradeLevel & { levelId: string }> = [];
    const secondary: Array<GradeLevel & { levelId: string }> = [];

    filteredGrades.forEach((grade) => {
      const band = getGradeCurriculumBand(grade.name);
      if (band === "preschool") preschool.push(grade);
      else if (band === "primary") primary.push(grade);
      else if (band === "secondary") secondary.push(grade);
    });

    return { preschool, primary, secondary };
  }, [filteredGrades]);

  // Auto-select first stream when a grade with streams is chosen (minimal sidebar)
  useEffect(() => {
    if (variant !== "minimal" || !selectedGradeId || !onStreamSelect) return;

    const grade = allGrades.find((g) => g.id === selectedGradeId);
    if (!grade?.streams?.length) return;

    const hasValidStream =
      selectedStreamId &&
      grade.streams.some((stream) => stream.id === selectedStreamId);

    if (hasValidStream) return;

    onStreamSelect(grade.streams[0].id, grade.id, grade.levelId);
  }, [
    variant,
    selectedGradeId,
    selectedStreamId,
    allGrades,
    onStreamSelect,
  ]);

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

  const handleGradeClick = (
    grade: GradeLevel & { levelId: string },
  ) => {
    if (variant === "minimal") {
      if (onGradeSelect) {
        onGradeSelect(grade.id, grade.levelId);
      }

      if (grade.streams?.length && onStreamSelect) {
        const keepCurrentStream =
          selectedGradeId === grade.id &&
          selectedStreamId &&
          grade.streams.some((stream) => stream.id === selectedStreamId);
        onStreamSelect(
          keepCurrentStream ? selectedStreamId : grade.streams[0].id,
          grade.id,
          grade.levelId,
        );
      }
      return;
    }

    // Toggle expanded state for the grade
    setExpandedGrades((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(grade.id)) {
        newSet.delete(grade.id);
      } else {
        newSet.add(grade.id);
      }
      return newSet;
    });

    if (onGradeSelect) {
      onGradeSelect(grade.id, grade.levelId);
    }
  };

  const handleStreamClick = (
    streamId: string,
    gradeId: string,
    levelId: string,
  ) => {
    if (variant === "minimal") {
      if (onStreamSelect) {
        onStreamSelect(streamId, gradeId, levelId);
      }
      return;
    }

    // Toggle stream selection if clicking the same stream
    const newStreamId = selectedStreamId === streamId ? "" : streamId;

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

  const isMinimal = variant === "minimal";
  const isMobileDrawer = isMinimal && surface === "drawer";

  const gradeButtonClass = (selected: boolean) => {
    if (!isMinimal) {
      return cn(
        "relative h-8 w-full rounded-none border px-2.5 text-xs font-medium transition-all",
        selected
          ? "border-[#0a1f1a] bg-[#0a1f1a] text-white"
          : "border-[#1a4d42]/15 bg-white hover:border-[#246a59]/40 hover:bg-[#246a59]/[0.06] hover:text-[#246a59]",
      );
    }

    return cn(
      "flex h-7 w-full items-center justify-center gap-1 rounded-none border text-[11px] font-semibold transition-colors",
      selected
        ? "border-[#246a59] bg-[#0a1f1a] text-white"
        : "border-[#1a4d42]/10 bg-[#f8fbfa] text-[#1a4d42]/80 hover:border-[#246a59]/35 hover:bg-[#246a59]/[0.06] dark:border-white/10 dark:bg-[#071411] dark:text-white/70",
    );
  };

  const streamButtonClass = (selected: boolean) => {
    if (isMinimal) {
      return cn(
        "flex-1 rounded-none py-1.5 text-center text-[11px] font-semibold transition-colors",
        selected
          ? "bg-[#0a1f1a] text-white"
          : "text-[#1a4d42]/55 hover:bg-white hover:text-[#0a1f1a] dark:text-white/45",
      );
    }

    return cn(
      "inline-flex items-center justify-center rounded-none border px-3 text-xs font-medium transition-colors",
      "h-8 min-w-[2.25rem]",
      selected
        ? "border-[#246a59] bg-[#246a59]/10 text-[#246a59]"
        : "border-[#1a4d42]/12 text-[#1a4d42]/65 hover:border-[#246a59]/30 hover:bg-[#f3f7f5]",
    );
  };

  return (
    <div className={cn("flex h-full flex-col bg-[#f3f7f5] dark:bg-[#071411]", className)}>
      <div
        className={cn(
          "flex flex-col",
          isMinimal
            ? isMobileDrawer
              ? "gap-1.5 border-b border-[#1a4d42]/10 pb-2"
              : "gap-1.5 border-b border-[#1a4d42]/10 pb-2"
            : "space-y-3 border-b border-[#1a4d42]/12 p-4",
        )}
      >
        {isMinimal ? (
          <div className="flex items-center justify-between gap-2 px-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#246a59]">
              Browse grades
            </p>
            {searchTerm ? (
              <button
                type="button"
                onClick={clearSearch}
                className="text-[11px] font-semibold text-[#246a59] hover:text-[#1a4d42]"
              >
                Clear
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
              Grade Levels
            </h3>
            <div className="flex items-center gap-1">
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-7 rounded-none px-2 text-[#1a4d42]/55 hover:text-[#0a1f1a]"
                >
                  Clear
                  <X className="ml-1 h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshConfig}
                className="h-8 rounded-none border-[#1a4d42]/20 px-2 text-[#1a4d42]/55 hover:text-[#0a1f1a]"
              >
                Refresh
              </Button>
            </div>
          </div>
        )}

        {isMinimal && onSelectAllClasses ? (
          <button
            type="button"
            onClick={onSelectAllClasses}
            className={cn(
              "flex w-full items-center gap-2 border px-2 py-1.5 text-left transition-colors",
              allClassesSelected
                ? "border-[#246a59]/30 bg-[#246a59]/10"
                : "border-[#1a4d42]/12 bg-white hover:border-[#246a59]/30 dark:bg-[#0c1a17]",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center border",
                allClassesSelected
                  ? "border-[#0a1f1a] bg-[#0a1f1a] text-white"
                  : "border-[#1a4d42]/15 bg-[#f8fbfa] text-[#246a59] dark:bg-[#071411]",
              )}
            >
              <LayoutGrid className="h-3 w-3" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-[#0a1f1a] dark:text-white">
                All classes
              </span>
              <span className="block text-[10px] text-[#1a4d42]/50">
                Whole-school overview
              </span>
            </span>
            {allClassesSelected ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-[#246a59]" strokeWidth={2.5} />
            ) : null}
          </button>
        ) : null}

        <div
          className={cn(
            isMinimal &&
              "border border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#0c1a17]",
          )}
        >
          <div className={cn("relative", isMinimal ? "flex items-center px-2" : "")}>
            <Search
              className="absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/40"
            />
            <Input
              placeholder="Search grades..."
              className={cn(
                "rounded-none pl-7",
                isMinimal
                  ? "h-8 border-0 bg-transparent text-[12px] shadow-none focus-visible:ring-0 dark:bg-transparent"
                  : "h-10 border-[#1a4d42]/15 focus-visible:ring-[#246a59]/20",
              )}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
      
      {/* Grades List */}
      <ScrollArea
        className={cn("flex-1", isMinimal ? "px-0.5" : "px-4")}
      >
        <div
          className={cn(
            isMinimal ? "space-y-1.5 py-1.5" : "space-y-4 py-3",
          )}
        >
          {isLoading ? (
            <div className={cn("grid gap-1 py-1", isMinimal ? "grid-cols-3" : "grid-cols-2")}>
              {[...Array(12)].map((_, j) => (
                <div
                  key={j}
                  className="h-7 w-full animate-pulse bg-[#1a4d42]/10 dark:bg-white/10"
                />
              ))}
            </div>
          ) : filteredGrades.length === 0 ? (
            <div
              className={cn(
                "border border-dashed border-[#1a4d42]/20 py-6 text-center",
              )}
            >
              <p className="text-xs text-[#1a4d42]/40">No grades found</p>
            </div>
          ) : (
            <div className={cn(isMinimal ? "space-y-1.5" : "space-y-4")}>
              {(() => {
                const levelDivider = isMinimal ? (
                  <div className="mx-0.5 my-0.5 border-t border-[#1a4d42]/10 dark:border-white/10" />
                ) : (
                  <div className="my-2 h-px bg-[#1a4d42]/10" />
                );

                const renderGradeGroup = (
                  grades: Array<GradeLevel & { levelId: string }>,
                  groupTitle: string,
                ) => {
                  if (grades.length === 0) return null;

                  const activeGrade =
                    isMinimal && selectedGradeId
                      ? grades.find((grade) => grade.id === selectedGradeId)
                      : null;

                  return (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2 px-0.5">
                        {!isMinimal && (
                          <div className="h-px flex-1 bg-[#1a4d42]/15" />
                        )}
                        <h4
                          className={cn(
                            isMinimal
                              ? "text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45"
                              : "px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#246a59]",
                          )}
                        >
                          {groupTitle}
                        </h4>
                        {!isMinimal && (
                          <div className="h-px flex-1 bg-[#1a4d42]/15" />
                        )}
                        {isMinimal && (
                          <span className="border border-[#1a4d42]/12 bg-white px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-[#1a4d42]/50 dark:border-white/10 dark:bg-[#0c1a17]">
                            {grades.length}
                          </span>
                        )}
                      </div>

                      {isMinimal ? (
                        <div className="border border-[#1a4d42]/10 bg-white p-1.5 dark:border-white/10 dark:bg-[#0c1a17]">
                          <div className="grid grid-cols-3 gap-1">
                            {grades.map((grade) => (
                              <button
                                key={grade.id}
                                type="button"
                                className={gradeButtonClass(
                                  selectedGradeId === grade.id,
                                )}
                                onClick={() => handleGradeClick(grade)}
                              >
                                <span>{abbreviateGradeShort(grade.name)}</span>
                                {grade.streams?.length > 0 ? (
                                  <span
                                    className={cn(
                                      "flex h-3.5 min-w-3.5 items-center justify-center px-0.5 text-[8px] font-bold tabular-nums",
                                      selectedGradeId === grade.id
                                        ? "bg-white/20 text-white"
                                        : "bg-[#e8f2ef] text-[#246a59] dark:bg-[#246a59]/20 dark:text-emerald-300",
                                    )}
                                  >
                                    {grade.streams.length}
                                  </span>
                                ) : null}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {grades.map((grade) => (
                          <div key={grade.id} className="flex flex-col gap-1">
                            <button
                              type="button"
                              className={gradeButtonClass(selectedGradeId === grade.id)}
                              onClick={() => handleGradeClick(grade)}
                            >
                              <div className="flex w-full items-center justify-between gap-1">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <div
                                    className={cn(
                                      "flex h-4 w-4 shrink-0 items-center justify-center transition-colors",
                                      selectedGradeId === grade.id
                                        ? "bg-white/20"
                                        : "bg-[#f3f7f5]",
                                    )}
                                  >
                                    <GraduationCap
                                      className={cn(
                                        "h-2.5 w-2.5 shrink-0",
                                        selectedGradeId === grade.id
                                          ? "text-white"
                                          : "text-[#246a59]",
                                      )}
                                    />
                                  </div>
                                  <span>{abbreviateGradeShort(grade.name)}</span>
                                </div>
                                {grade.streams?.length > 0 && (
                                    <span
                                      className={cn(
                                        "text-[10px] tabular-nums",
                                        selectedGradeId === grade.id
                                          ? "text-white/80"
                                          : "text-[#1a4d42]/40",
                                      )}
                                    >
                                      ·{grade.streams.length}
                                    </span>
                                  )}
                              </div>
                            </button>

                            {expandedGrades.has(grade.id) &&
                              grade.streams?.length > 0 && (
                                <div className="grid grid-cols-2 gap-1 pl-0.5">
                                  {grade.streams.map((stream) => {
                                    const isSelected =
                                      selectedStreamId === stream.id;

                                    return (
                                      <button
                                        key={stream.id}
                                        type="button"
                                        className={cn(
                                          "h-6 w-full truncate rounded-none border px-2 py-0 text-[10px] font-medium transition-colors",
                                          isSelected
                                            ? "border-[#246a59] bg-[#246a59]/10 text-[#246a59]"
                                            : "border-dashed border-[#1a4d42]/20 hover:border-[#246a59]/40 hover:bg-[#246a59]/[0.05]",
                                        )}
                                        onClick={() =>
                                          handleStreamClick(
                                            stream.id,
                                            grade.id,
                                            grade.levelId,
                                          )
                                        }
                                      >
                                        {stream.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                      )}

                      {activeGrade && activeGrade.streams?.length > 0 && (
                        <div
                          className={cn(
                            isMinimal
                              ? "space-y-1.5 border border-[#1a4d42]/12 bg-white p-2 dark:border-white/10 dark:bg-[#0c1a17]"
                              : "space-y-2 border-t border-[#1a4d42]/10 pt-2",
                          )}
                        >
                          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
                            Streams in {abbreviateGradeShort(activeGrade.name)}
                          </p>
                          <div
                            className={cn(
                              isMinimal
                                ? "flex gap-0.5 border border-[#1a4d42]/10 bg-[#f3f7f5] p-0.5 dark:bg-[#071411]"
                                : "flex flex-wrap gap-1.5",
                            )}
                          >
                            {activeGrade.streams.map((stream) => {
                              const isSelected = selectedStreamId === stream.id;

                              return (
                                <button
                                  key={stream.id}
                                  type="button"
                                  className={streamButtonClass(isSelected)}
                                  onClick={() =>
                                    handleStreamClick(
                                      stream.id,
                                      activeGrade.id,
                                      activeGrade.levelId,
                                    )
                                  }
                                >
                                  {stream.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                };

                const groups =
                  variant === "minimal"
                    ? levelGroups
                    : [
                        {
                          key: "preschool",
                          title: "Preschool",
                          grades: groupedGrades.preschool,
                        },
                        {
                          key: "primary",
                          title: "Primary",
                          grades: groupedGrades.primary,
                        },
                        {
                          key: "secondary",
                          title: "Secondary",
                          grades: groupedGrades.secondary,
                        },
                      ].filter((group) => group.grades.length > 0);

                return groups.map((group, index) => (
                  <div key={group.key}>
                    {index > 0 && levelDivider}
                    {renderGradeGroup(group.grades, group.title)}
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
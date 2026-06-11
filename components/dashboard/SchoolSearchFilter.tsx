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
        "relative h-8 w-full rounded-lg border px-2.5 text-xs font-medium transition-all",
        selected
          ? "border-primary bg-primary text-white shadow-sm"
          : "border-input bg-background hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
      );
    }

    return cn(
      "flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold transition-colors active:scale-[0.98]",
      selected
        ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
        : "bg-slate-100 text-slate-700 active:bg-slate-200 dark:bg-slate-800 dark:text-slate-200",
    );
  };

  const streamButtonClass = (selected: boolean) => {
    if (isMinimal) {
      return cn(
        "flex-1 rounded-lg py-2 text-center text-[13px] font-semibold transition-all active:scale-[0.98]",
        selected
          ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
          : "text-slate-500 dark:text-slate-400",
      );
    }

    return cn(
      "inline-flex items-center justify-center rounded-lg px-3 text-xs font-medium transition-colors active:opacity-80",
      "h-8 min-w-[2.25rem]",
      selected
        ? "bg-slate-200/80 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
        : "text-slate-600 hover:bg-slate-100/80 dark:text-slate-400",
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div
        className={cn(
          "flex flex-col",
          isMinimal
            ? isMobileDrawer
              ? "gap-3 pb-1"
              : "gap-3 pb-3"
            : "space-y-3 p-4 border-b",
        )}
      >
        {isMinimal ? (
          <div className="flex items-center justify-between gap-2 px-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
              Browse grades
            </p>
            {searchTerm ? (
              <button
                type="button"
                onClick={clearSearch}
                className="text-xs font-semibold text-primary active:opacity-60"
              >
                Clear
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">Grade Levels</h3>
            <div className="flex items-center gap-1">
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                >
                  Clear
                  <X className="ml-1 h-3.5 w-3.5" />
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
        )}

        {isMinimal && onSelectAllClasses ? (
          <button
            type="button"
            onClick={onSelectAllClasses}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors active:scale-[0.99]",
              "bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:bg-slate-900",
              allClassesSelected && "ring-2 ring-slate-900/10 dark:ring-slate-100/10",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                allClassesSelected
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                All classes
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Whole-school overview
              </span>
            </span>
            {allClassesSelected ? (
              <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
            ) : null}
          </button>
        ) : null}

        <div
          className={cn(
            isMinimal &&
              "overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:bg-slate-900",
          )}
        >
          <div className={cn("relative", isMinimal ? "flex items-center px-3" : "")}>
            <Search
              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search grades..."
              className={cn(
                "pl-9",
                isMinimal
                  ? "h-11 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                  : "h-10",
              )}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>
      
      {/* Grades List */}
      <ScrollArea
        className={cn("flex-1", isMinimal ? "px-1" : "px-4")}
      >
        <div
          className={cn(
            isMinimal ? "space-y-3 py-2" : "space-y-6 py-4",
          )}
        >
          {isLoading ? (
            <div className={cn("grid gap-2 py-2", isMinimal ? "grid-cols-3" : "grid-cols-2")}>
              {[...Array(12)].map((_, j) => (
                <div
                  key={j}
                  className={cn(
                    "h-8 w-full rounded-lg animate-pulse",
                    variant === "minimal"
                      ? "bg-slate-100 dark:bg-slate-800"
                      : "border border-primary/20 bg-muted-foreground/5",
                  )}
                />
              ))}
            </div>
          ) : filteredGrades.length === 0 ? (
            <div
              className={cn(
                "text-center py-8 rounded-lg",
                variant === "minimal"
                  ? "border border-dashed border-slate-200 dark:border-slate-800"
                  : "border-2 border-dashed",
              )}
            >
              <p className="text-xs text-slate-400">No grades found</p>
            </div>
          ) : (
            <div className={cn(isMinimal ? "space-y-3 py-1" : "space-y-6 py-2")}>
              {(() => {
                const levelDivider = isMinimal ? null : (
                  <div className="my-2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 px-0.5">
                        {!isMinimal && (
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        )}
                        <h4
                          className={cn(
                            isMinimal
                              ? "text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500"
                              : "px-2 text-xs font-semibold uppercase tracking-wider text-primary/80",
                          )}
                        >
                          {groupTitle}
                        </h4>
                        {!isMinimal && (
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        )}
                        {isMinimal && (
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-500 shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:bg-slate-900 dark:text-slate-400">
                            {grades.length}
                          </span>
                        )}
                      </div>

                      {isMinimal ? (
                        <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:bg-slate-900">
                          <div className="grid grid-cols-3 gap-2">
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
                                      "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold tabular-nums",
                                      selectedGradeId === grade.id
                                        ? "bg-white/20 text-white"
                                        : "bg-white text-slate-500 dark:bg-slate-700 dark:text-slate-300",
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
                                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors",
                                      selectedGradeId === grade.id
                                        ? "bg-white/20"
                                        : "bg-muted group-hover:bg-primary/10",
                                    )}
                                  >
                                    <GraduationCap
                                      className={cn(
                                        "h-2.5 w-2.5 shrink-0",
                                        selectedGradeId === grade.id
                                          ? "text-white"
                                          : "text-muted-foreground group-hover:text-primary",
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
                                          : "text-slate-400",
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
                                          "h-6 w-full truncate rounded-md border px-2 py-0 text-[10px] font-medium transition-colors",
                                          isSelected
                                            ? "border-primary bg-white text-primary shadow-sm dark:bg-slate-800"
                                            : "border-dashed hover:border-primary/40 hover:bg-primary/5",
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
                              ? "space-y-2 rounded-2xl bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:bg-slate-900"
                              : "space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800",
                          )}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                            Streams in {abbreviateGradeShort(activeGrade.name)}
                          </p>
                          <div
                            className={cn(
                              isMinimal
                                ? "flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
                                : "flex flex-wrap gap-2",
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
'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, GraduationCap, X } from "lucide-react"
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
  variant = 'default',
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
      abbreviateGradeShort(grade.name).toLowerCase().includes(term)
    );
  }, [allGrades, searchTerm]);

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

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div
        className={cn(
          "flex flex-col space-y-3",
          variant === "minimal" ? "pb-3" : "p-4 border-b",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              variant === "minimal"
                ? "text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                : "text-lg font-semibold",
            )}
          >
            {variant === "minimal" ? "Browse grades" : "Grade Levels"}
          </h3>
          <div className="flex items-center gap-1">
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className={cn(
                  "h-7 px-2",
                  variant === "minimal"
                    ? "text-xs text-slate-400 hover:text-slate-600"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Clear
                <X className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}
            {variant === "default" && (
              <Button
                variant="outline"
                size="sm"
                onClick={refreshConfig}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                Refresh
              </Button>
            )}
          </div>
        </div>

        <div className="relative">
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
              variant === "minimal" ? "text-slate-400" : "text-muted-foreground",
            )}
          />
          <Input
            placeholder="Search grades..."
            className={cn(
              "pl-9",
              variant === "minimal"
                ? "h-9 border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-slate-900"
                : "h-10",
            )}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      {/* Grades List */}
      <ScrollArea className={cn("flex-1", variant === "minimal" ? "" : "px-4")}>
        <div className={cn(variant === "minimal" ? "space-y-4 py-1" : "space-y-6 py-4")}>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2 py-2">
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
            <div className={cn(variant === "minimal" ? "space-y-4 py-1" : "space-y-6 py-2")}>
              {(() => {
                const levelDivider = (
                  <div
                    className={cn(
                      "h-px",
                      variant === "minimal"
                        ? "bg-slate-100 dark:bg-slate-800"
                        : "bg-gradient-to-r from-transparent via-primary/20 to-transparent my-2",
                    )}
                  />
                );

                const renderGradeGroup = (
                  grades: Array<GradeLevel & { levelId: string }>,
                  groupTitle: string,
                ) => {
                  if (grades.length === 0) return null;

                  const activeGrade =
                    variant === "minimal" && selectedGradeId
                      ? grades.find((grade) => grade.id === selectedGradeId)
                      : null;

                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-0.5">
                        {variant === "default" && (
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        )}
                        <h4
                          className={cn(
                            variant === "minimal"
                              ? "text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                              : "text-xs font-semibold text-primary/80 uppercase tracking-wider px-2",
                          )}
                        >
                          {groupTitle}
                        </h4>
                        {variant === "default" && (
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        )}
                        {variant === "minimal" && (
                          <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-slate-400 dark:bg-slate-800">
                            {grades.length}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {grades.map((grade) => (
                          <div key={grade.id} className="flex flex-col gap-1">
                            <button
                              type="button"
                              className={cn(
                                "h-8 px-2.5 transition-all text-xs relative w-full rounded-lg border font-medium",
                                selectedGradeId === grade.id
                                  ? variant === "minimal"
                                    ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                                    : "bg-primary text-white border-primary shadow-sm"
                                  : variant === "minimal"
                                    ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                    : "border-input bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/30",
                              )}
                              onClick={() => handleGradeClick(grade)}
                            >
                              <div className="flex w-full items-center justify-between gap-1">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  {variant === "default" && (
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
                                  )}
                                  <span>{abbreviateGradeShort(grade.name)}</span>
                                </div>
                                {grade.streams?.length > 0 &&
                                  variant === "minimal" && (
                                    <span
                                      className={cn(
                                        "flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[9px] font-semibold tabular-nums",
                                        selectedGradeId === grade.id
                                          ? "bg-white/20 text-white dark:bg-slate-900/15 dark:text-slate-600"
                                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                                      )}
                                    >
                                      {grade.streams.length}
                                    </span>
                                  )}
                                {grade.streams?.length > 0 &&
                                  variant === "default" && (
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

                            {variant !== "minimal" &&
                              expandedGrades.has(grade.id) &&
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

                      {activeGrade && activeGrade.streams?.length > 0 && (
                        <div className="space-y-1.5 border-t border-slate-100 pt-2 dark:border-slate-800">
                          <p className="text-[10px] font-medium text-slate-400">
                            Streams in {abbreviateGradeShort(activeGrade.name)}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {activeGrade.streams.map((stream) => {
                              const isSelected = selectedStreamId === stream.id;

                              return (
                                <button
                                  key={stream.id}
                                  type="button"
                                  className={cn(
                                    "flex h-8 min-w-[2.25rem] items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors",
                                    isSelected
                                      ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
                                  )}
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
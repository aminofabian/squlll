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

// Define the exact education level names and their order
const LEVEL_ORDER: { [key: string]: number } = {
  'Pre-Primary': 0,
  'Lower Primary': 1,
  'Upper Primary': 2,
  'Junior Secondary': 3,
  'Senior Secondary': 4,
  'Madrasa Beginners': 5,
  'Madrasa Lower': 6,
  'Madrasa Upper': 7
};

// Helper function to get the numeric value from a grade name (e.g., "Grade 1" -> 1)
function getGradeNumber(gradeName: string): number {
  const match = gradeName.match(/\d+/);
  return match ? parseInt(match[0], 10) : 999;
}

// Helper function to sort grades within a level
function sortGrades(grades: GradeLevel[], levelName: string): GradeLevel[] {
  return [...grades].sort((a, b) => {
    const aNum = getGradeNumber(a.name);
    const bNum = getGradeNumber(b.name);
    
    // For secondary levels, sort in descending order (higher grades first)
    if (levelName.includes('Secondary')) {
      return bNum - aNum;
    }
    // For all other levels, sort in ascending order
    return aNum - bNum;
  });
}

// Helper function to abbreviate grade names
function abbreviateGrade(gradeName: string): string {
  // Handle special cases first
  if (gradeName.toLowerCase().includes('early childhood')) return 'EC';
  if (gradeName.toLowerCase().includes('kindergarten')) return 'KG';
  if (gradeName.toLowerCase().includes('nursery')) return 'NS';
  if (gradeName.toLowerCase().includes('reception')) return 'RC';
  if (gradeName.toLowerCase().includes('pp1')) return 'PP1';
  if (gradeName.toLowerCase().includes('pp2')) return 'PP2';

  // Handle regular grade numbers
  const match = gradeName.match(/\d+/);
  if (match) {
    return `G${match[0]}`;
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
}

export function SchoolSearchFilter({ 
  className, 
  type = 'grades',
  onSearch,
  onGradeSelect,
  onStreamSelect
}: SchoolSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')
  const [selectedStreamId, setSelectedStreamId] = useState<string>('')
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set())
  const { config } = useSchoolConfigStore()

  // Get all grades grouped by level and sorted
  const gradesData = useMemo(() => {
    if (!config?.selectedLevels) return [];

    return config.selectedLevels
      .map(level => ({
        levelId: level.id,
        levelName: level.name,
        levelOrder: LEVEL_ORDER[level.name] ?? 999,
        grades: sortGrades(level.gradeLevels || [], level.name)
      }))
      .sort((a, b) => a.levelOrder - b.levelOrder);
  }, [config?.selectedLevels]);

  // Filter grades based on search term
  const filteredGrades = useMemo(() => {
    if (!gradesData) return [];
    
    if (!searchTerm) return gradesData;
    
    const term = searchTerm.toLowerCase();
    return gradesData
      .map(levelData => ({
        ...levelData,
        grades: levelData.grades.filter(grade =>
          grade.name.toLowerCase().includes(term) ||
          levelData.levelName.toLowerCase().includes(term)
        )
      }))
      .filter(levelData => levelData.grades.length > 0);
  }, [gradesData, searchTerm]);

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

  const handleGradeClick = (gradeId: string, levelId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedStreamId(''); // Reset stream selection when grade changes
    
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
    setSelectedStreamId(newStreamId);
    
    if (onStreamSelect) {
      onStreamSelect(newStreamId, gradeId, levelId);
    }
  };

  // Enhanced level styling configuration
  const getLevelStyle = (levelName: string) => {
    switch (true) {
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
          {filteredGrades.length === 0 ? (
            <div className="text-center py-8 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">No grades found</p>
            </div>
          ) : (
            filteredGrades.map((levelData) => (
              <div key={levelData.levelId} className="space-y-3">
                {/* Level Header */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-primary/5 border">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
                    <h4 className="font-medium text-sm truncate">{levelData.levelName}</h4>
                  </div>
                  <Badge variant="outline" className="ml-1.5 text-[10px] h-5 px-1.5 shrink-0">
                    {levelData.grades.length}
                  </Badge>
                </div>
                
                {/* Grades Grid */}
                <div className="flex flex-wrap gap-1 pl-1 mt-1">
                  {levelData.grades.map((grade) => (
                    <div key={grade.id} className="flex flex-col gap-1 mb-1">
                      <Button
                        variant={selectedGradeId === grade.id ? "default" : "outline"}
                        className={cn(
                          "h-6 px-1 transition-all duration-200 group text-[11px]",
                          selectedGradeId === grade.id 
                            ? "bg-primary text-white hover:text-white"
                            : "hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                        )}
                        onClick={() => handleGradeClick(grade.id, levelData.levelId)}
                      >
                        <div className="flex items-center gap-0.5">
                          <GraduationCap className={cn(
                            "h-2.5 w-2.5 shrink-0",
                            selectedGradeId === grade.id 
                              ? "text-white" 
                              : "text-muted-foreground group-hover:text-primary"
                          )} />
                          <span className="font-medium">
                            {abbreviateGrade(grade.name)}
                          </span>
                          {grade.streams?.length > 0 && (
                            <Badge variant="outline" className="ml-1 text-[8px] h-4 px-1 shrink-0 border-dashed">
                              {grade.streams.length}
                            </Badge>
                          )}
                        </div>
                      </Button>
                      
                      {/* Streams section */}
                      {expandedGrades.has(grade.id) && grade.streams?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pl-3 mt-0.5">
                          {grade.streams.map((stream) => (
                            <Button
                              key={stream.id}
                              variant={selectedStreamId === stream.id ? "secondary" : "outline"}
                              size="sm"
                              className={cn(
                                "h-5 px-1.5 text-[10px] border-dashed",
                                selectedStreamId === stream.id 
                                  ? "bg-secondary/20 text-secondary-foreground" 
                                  : "hover:bg-secondary/10 hover:text-secondary hover:border-secondary/30"
                              )}
                              onClick={() => handleStreamClick(stream.id, grade.id, levelData.levelId)}
                            >
                              <div className="flex items-center gap-0.5">
                                <GitBranch className={cn(
                                  "h-2 w-2 shrink-0",
                                  selectedStreamId === stream.id 
                                    ? "text-secondary" 
                                    : "text-muted-foreground"
                                )} />
                                <span>{stream.name}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
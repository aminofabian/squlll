'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, GraduationCap, X } from "lucide-react"
import { useEffect, useState, useMemo } from 'react'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { Level, GradeLevel } from '@/lib/types/school-config'
import { ScrollArea } from "@/components/ui/scroll-area"

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

// Props for the SchoolSearchFilter component
interface SchoolSearchFilterProps {
  className?: string
  type?: 'grades' | 'classes' | 'students'
  onSearch?: (term: string) => void
  onGradeSelect?: (gradeId: string, levelId: string) => void
}

export function SchoolSearchFilter({ 
  className, 
  type = 'grades',
  onSearch,
  onGradeSelect
}: SchoolSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')
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
    if (onGradeSelect) {
      onGradeSelect(gradeId, levelId);
    }
  };

  // Helper function to get the appropriate icon color based on level name
  const getLevelColor = (levelName: string): string => {
    switch (true) {
      case levelName.includes('Pre-Primary'):
        return 'text-purple-500';
      case levelName.includes('Lower Primary'):
        return 'text-blue-500';
      case levelName.includes('Upper Primary'):
        return 'text-green-500';
      case levelName.includes('Junior Secondary'):
        return 'text-orange-500';
      case levelName.includes('Senior Secondary'):
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col space-y-4">
        {/* Search Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Filter by Grade</h3>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-8 px-2 text-muted-foreground"
            >
              Clear
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search grades..."
            className="pl-9 h-9"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        {/* Grades List */}
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-6">
            {filteredGrades.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-md">
                <p className="text-muted-foreground">No grades found</p>
              </div>
            ) : (
              filteredGrades.map((levelData) => (
                <div key={levelData.levelId} className="space-y-2">
                  {/* Level Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className={`h-4 w-4 ${getLevelColor(levelData.levelName)}`} />
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {levelData.levelName}
                      </h4>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getLevelColor(levelData.levelName)} border-current bg-opacity-10`}
                    >
                      {levelData.grades.length} Grades
                    </Badge>
                  </div>
                  
                  {/* Grades Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {levelData.grades.map((grade) => (
                      <Button
                        key={grade.id}
                        variant={selectedGradeId === grade.id ? "default" : "outline"}
                        className={`
                          w-full justify-start text-left h-auto py-2 px-3
                          ${selectedGradeId === grade.id 
                            ? 'bg-primary text-primary-foreground' 
                            : `hover:border-${getLevelColor(levelData.levelName)}`}
                        `}
                        onClick={() => handleGradeClick(grade.id, levelData.levelId)}
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">{grade.name}</span>
                            {grade.age && (
                              <span className="text-xs opacity-75">
                                Age: {grade.age} years
                              </span>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
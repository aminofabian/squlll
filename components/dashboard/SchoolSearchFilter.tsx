'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, BookText, BookOpen, Layers, GraduationCap, Users } from "lucide-react"
import { useEffect, useState, useMemo } from 'react'

// Education level type
type EducationLevel = 'preschool' | 'primary' | 'junior-secondary' | 'senior-secondary' | 'all'

// Grade type
interface Grade {
  id: string
  name: string
  level: EducationLevel
  ageGroup: string
  students: number
  classes: number
}

// Props for the SchoolSearchFilter component
interface SchoolSearchFilterProps {
  className?: string
  type?: 'grades' | 'classes' | 'students'
  level?: EducationLevel // Kept for backwards compatibility
  onSearch?: (term: string) => void
  onGradeSelect?: (grade: Grade) => void
}

// Helper function to get level icon
const getLevelIcon = (level: EducationLevel) => {
  switch (level) {
    case 'preschool':
      return <BookText className="h-4 w-4" />
    case 'primary':
      return <BookOpen className="h-4 w-4" />
    case 'junior-secondary':
      return <Layers className="h-4 w-4" />
    case 'senior-secondary':
      return <GraduationCap className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

// Helper function to get level color
const getLevelColor = (level: EducationLevel): string => {
  switch (level) {
    case 'preschool':
      return 'bg-purple-100 text-purple-800'
    case 'primary':
      return 'bg-blue-100 text-blue-800'
    case 'junior-secondary':
      return 'bg-yellow-100 text-yellow-800'
    case 'senior-secondary':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Mock data for grades
const mockGrades: Grade[] = [
  // Preschool grades
  {
    id: 'baby-class',
    name: 'Baby Class',
    level: 'preschool',
    ageGroup: '3 years',
    students: 42,
    classes: 2
  },
  {
    id: 'pp1',
    name: 'PP1',
    level: 'preschool',
    ageGroup: '4 years',
    students: 56,
    classes: 3
  },
  {
    id: 'pp2',
    name: 'PP2',
    level: 'preschool',
    ageGroup: '5 years',
    students: 48,
    classes: 2
  },
  
  // Primary grades
  {
    id: 'grade1',
    name: 'Grade 1',
    level: 'primary',
    ageGroup: '6 years',
    students: 65,
    classes: 3
  },
  {
    id: 'grade2',
    name: 'Grade 2',
    level: 'primary',
    ageGroup: '7 years',
    students: 62,
    classes: 3
  },
  {
    id: 'grade3',
    name: 'Grade 3',
    level: 'primary',
    ageGroup: '8 years',
    students: 58,
    classes: 2
  },
  {
    id: 'grade4',
    name: 'Grade 4',
    level: 'primary',
    ageGroup: '9 years',
    students: 60,
    classes: 2
  },
  {
    id: 'grade5',
    name: 'Grade 5',
    level: 'primary',
    ageGroup: '10 years',
    students: 54,
    classes: 2
  },
  {
    id: 'grade6',
    name: 'Grade 6',
    level: 'primary',
    ageGroup: '11 years',
    students: 52,
    classes: 2
  },
  
  // Junior Secondary grades
  {
    id: 'grade7',
    name: 'Grade 7',
    level: 'junior-secondary',
    ageGroup: '12 years',
    students: 86,
    classes: 3
  },
  {
    id: 'grade8',
    name: 'Grade 8',
    level: 'junior-secondary',
    ageGroup: '13 years',
    students: 78,
    classes: 3
  },
  {
    id: 'grade9',
    name: 'Grade 9',
    level: 'junior-secondary',
    ageGroup: '14 years',
    students: 72,
    classes: 2
  },
  
  // Senior Secondary grades
  {
    id: 'grade10',
    name: 'Grade 10',
    level: 'senior-secondary',
    ageGroup: '15 years',
    students: 68,
    classes: 3
  },
  {
    id: 'grade11',
    name: 'Grade 11',
    level: 'senior-secondary',
    ageGroup: '16 years',
    students: 54,
    classes: 2
  },
  {
    id: 'grade12',
    name: 'Grade 12',
    level: 'senior-secondary',
    ageGroup: '17 years',
    students: 48,
    classes: 2
  }
]

export function SchoolSearchFilter({ 
  className, 
  type = 'grades',
  level = 'all',
  onSearch,
  onGradeSelect
}: SchoolSearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [grades, setGrades] = useState<Grade[]>([])
  const [selectedGrade, setSelectedGrade] = useState<string>('all')

  // Filter grades based on search term only
  const filteredGrades = useMemo(() => {
    let filtered = mockGrades
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(grade => 
        grade.name.toLowerCase().includes(term) || 
        grade.ageGroup.toLowerCase().includes(term)
      )
    }
    
    return filtered
  }, [searchTerm])
  
  // Handle grade selection
  const handleGradeClick = (grade: Grade) => {
    setSelectedGrade(grade.id)
    if (onGradeSelect) {
      onGradeSelect(grade)
    }
  }
  
  // No longer using education level selection
  
  // Handle search term changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    if (onSearch) {
      onSearch(e.target.value)
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-col space-y-4">
        {/* Search Section */}
        <div className="flex items-center">
          <div className="flex-1 flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a grade..."
              className="h-8 w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        {/* Grades Section */}
        <div className="mt-2">
          {/* If no grades match filters */}
          {filteredGrades.length === 0 && (
            <div className="text-center py-8 bg-muted/30 rounded-md">
              <p className="text-muted-foreground">No grades match your search</p>
            </div>
          )}
          
          {/* Grades Buttons */}
          <div className="flex flex-wrap gap-2">
            {filteredGrades.map((grade) => (
              <Button
                key={grade.id}
                variant={selectedGrade === grade.id ? "default" : "outline"}
                className={`
                  flex-grow min-w-[140px] h-auto py-3 px-3 
                  transition-all hover:scale-105 
                  ${selectedGrade === grade.id ? 'shadow-md ring-1 ring-primary/30' : 'shadow-sm hover:shadow-md'} 
                  relative overflow-hidden group
                `}
                onClick={() => handleGradeClick(grade)}
              >
                {selectedGrade === grade.id && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-8 border-r-8 border-primary border-l-transparent border-b-transparent"></div>
                )}
                <div className="w-full flex flex-col items-start gap-2">
                  <div className="w-full flex justify-between items-center">
                    <span className="font-medium text-base">{grade.name}</span>
                    <Badge variant="outline" className="text-xs font-normal">
                      {grade.ageGroup}
                    </Badge>
                  </div>
                  
                  <div className="w-full flex justify-between text-xs mt-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3 opacity-70" />
                      {grade.classes} Classes
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 opacity-70" />
                      {grade.students} Students
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
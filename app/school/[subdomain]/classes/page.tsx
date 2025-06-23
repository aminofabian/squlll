'use client'

import React, { useState, useMemo } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { ClassCard } from '../components/ClassCard'
import { ClassCardSkeleton } from '../components/ClassCardSkeleton'
import { Filter, X } from 'lucide-react'
import { SchoolSearchFilter } from '@/components/dashboard/SchoolSearchFilter'

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

function getLevelOrder(levelName: string): number {
  const normalizedName = levelName.trim();
  return LEVEL_ORDER[normalizedName] ?? 999;
}

function EmptyState({ selectedGrade = null, searchTerm = '' }: {
  selectedGrade?: { name: string; levelName: string } | null,
  searchTerm?: string
}) {
  let message = 'Try adjusting your search or filters to find what you\'re looking for.'
  
  if (selectedGrade) {
    message = `No classes found for ${selectedGrade.name} in ${selectedGrade.levelName}. Try selecting a different grade.`
  } else if (searchTerm) {
    message = 'No classes match your search term "' + searchTerm + '". Try a different search.'
  }

  return (
    <div className="bg-gray-50 border p-8 text-center animate-fadeIn">
      <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {message}
      </p>
    </div>
  )
}

function ClassesPage() {
  const { config } = useSchoolConfigStore()
  const { isLoading, error } = useSchoolConfig()
  
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')
  const [selectedLevelId, setSelectedLevelId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Filter and sort levels
  const filteredLevels = useMemo(() => {
    if (!config?.selectedLevels) return [];
    
    let levels = config.selectedLevels;
    
    // Filter based on grade selection and search
    levels = levels.filter((level) => {
      if (selectedGradeId && selectedLevelId) {
        const hasSelectedGrade = level.gradeLevels?.some(g => g.id === selectedGradeId);
        return level.id === selectedLevelId && hasSelectedGrade;
      }
      
      if (!searchTerm) return true;
      
      const search = searchTerm.toLowerCase();
      const levelMatches = level.name.toLowerCase().includes(search) ||
        level.description.toLowerCase().includes(search);
      
      const gradeMatches = level.gradeLevels?.some(grade =>
        grade.name.toLowerCase().includes(search)
      );
      
      const subjectMatches = level.subjects.some(subject =>
        subject.name.toLowerCase().includes(search) ||
        subject.code.toLowerCase().includes(search)
      );
      
      return levelMatches || gradeMatches || subjectMatches;
    });

    return levels;
  }, [config?.selectedLevels, selectedGradeId, selectedLevelId, searchTerm]);

  const handleGradeSelect = (gradeId: string, levelId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedLevelId(levelId);
  };

  const selectedGrade = useMemo(() => {
    if (!selectedGradeId || !config) return null;
    
    for (const level of config.selectedLevels) {
      const grade = level.gradeLevels?.find(g => g.id === selectedGradeId);
      if (grade) {
        return {
          name: grade.name,
          levelName: level.name
        };
      }
    }
    return null;
  }, [selectedGradeId, config]);

  if (error) return <div>Error: {error instanceof Error ? error.message : 'An error occurred'}</div>
  if (!config && !isLoading) return <div>No configuration found</div>

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform md:relative md:translate-x-0 transition-transform duration-200 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <SchoolSearchFilter
          className="p-4"
          type="grades"
          onSearch={setSearchTerm}
          onGradeSelect={handleGradeSelect}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Classes</h1>
            <p className="text-gray-600">
              Manage class information and subjects across all levels
            </p>
          </div>

          <div className="flex gap-2">
            {/* Show filter button on mobile */}
            <Button 
              variant="outline" 
              className="md:hidden" 
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Active filter indicators */}
        {!isLoading && config && (selectedGrade || searchTerm) && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <p className="text-sm font-medium mr-2">Active filters:</p>
            
            {selectedGrade && (
              <Badge variant="outline" className="flex gap-1 items-center">
                Grade: {selectedGrade.name} ({selectedGrade.levelName})
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    setSelectedGradeId('');
                    setSelectedLevelId('');
                  }} 
                />
              </Badge>
            )}
            
            {searchTerm && (
              <Badge variant="outline" className="flex gap-1 items-center">
                Search: {searchTerm}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-gray-500 hover:text-gray-700" 
              onClick={() => {
                setSelectedGradeId('');
                setSelectedLevelId('');
                setSearchTerm('');
              }}
            >Clear all</Button>
          </div>
        )}
        
        {/* Display filtered levels or empty state */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            // Show skeleton loading state
            Array.from({ length: 3 }).map((_, index) => (
              <ClassCardSkeleton key={index} />
            ))
          ) : filteredLevels.length > 0 ? (
            filteredLevels.map((level) => (
              <ClassCard 
                key={level.id} 
                level={level} 
                selectedGradeId={selectedGradeId}
              />
            ))
          ) : config ? (
            <EmptyState 
              selectedGrade={selectedGrade}
              searchTerm={searchTerm} 
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ClassesPage;


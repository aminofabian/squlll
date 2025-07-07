'use client'

import React, { useState, useMemo } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { ClassCard } from '../components/ClassCard'
import { ClassCardSkeleton } from '../components/ClassCardSkeleton'
import { Filter, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { SchoolSearchFilter } from '@/components/dashboard/SchoolSearchFilter'
import CreateClassDrawer from '@/app/school/components/CreateClassDrawer'

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

function getLevelOrder(levelName: string): number {
  const normalizedName = levelName.trim();
  return LEVEL_ORDER[normalizedName] ?? 999;
}

function EmptyState({ selectedGrade = null, searchTerm = '' }: {
  selectedGrade?: { name: string; levelName: string; streamName?: string } | null,
  searchTerm?: string
}) {
  let message = 'Try adjusting your search or filters to find what you\'re looking for.'
  
  if (selectedGrade) {
    message = selectedGrade.streamName
      ? `No classes found for ${selectedGrade.name} (${selectedGrade.streamName}) in ${selectedGrade.levelName}. Try selecting a different grade or stream.`
      : `No classes found for ${selectedGrade.name} in ${selectedGrade.levelName}. Try selecting a different grade.`
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
  const [selectedStreamId, setSelectedStreamId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)

  // Filter and sort levels
  const filteredLevels = useMemo(() => {
    if (!config?.selectedLevels) return [];
    
    let levels = config.selectedLevels;
    
    // Filter based on grade selection, stream selection, and search
    levels = levels.filter((level) => {
      if (selectedGradeId && selectedLevelId) {
        const hasSelectedGrade = level.gradeLevels?.some(g => g.id === selectedGradeId);
        
        // If both grade and stream are selected, filter accordingly
        if (selectedStreamId) {
          const gradeWithStream = level.gradeLevels?.find(g => 
            g.id === selectedGradeId && 
            g.streams?.some(s => s.id === selectedStreamId)
          );
          return level.id === selectedLevelId && !!gradeWithStream;
        }
        
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
    setSelectedStreamId(''); // Reset stream selection when grade changes
  };

  const handleStreamSelect = (streamId: string, gradeId: string, levelId: string) => {
    setSelectedStreamId(streamId);
    // Ensure the correct grade and level are also selected
    if (gradeId !== selectedGradeId || levelId !== selectedLevelId) {
      setSelectedGradeId(gradeId);
      setSelectedLevelId(levelId);
    }
  };

  const selectedGrade = useMemo(() => {
    if (!selectedGradeId || !config) return null;
    
    for (const level of config.selectedLevels) {
      const grade = level.gradeLevels?.find(g => g.id === selectedGradeId);
      if (grade) {
        // If a stream is selected, include it in the information
        const selectedStream = selectedStreamId ? 
          grade.streams?.find(s => s.id === selectedStreamId) : null;
          
        return {
          name: grade.name,
          levelName: level.name,
          streamName: selectedStream?.name
        };
      }
    }
    return null;
  }, [selectedGradeId, selectedStreamId, config]);

  if (error) return <div>Error: {error instanceof Error ? error.message : 'An error occurred'}</div>
  if (!config && !isLoading) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <ClassCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isSidebarMinimized ? 'w-16' : 'w-64'}
      `}>
        {/* Toggle button for minimize/expand */}
        <div className={`p-2 ${isSidebarMinimized ? 'flex justify-center' : 'flex justify-end'}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="border-primary/30 hover:bg-primary/5"
            title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {!isSidebarMinimized && (
          <SchoolSearchFilter
            className="p-4"
            type="grades"
            onSearch={setSearchTerm}
            onGradeSelect={handleGradeSelect}
            onStreamSelect={handleStreamSelect}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto relative">
        {/* Floating toggle button when sidebar is minimized */}
        {isSidebarMinimized && (
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarMinimized(false)}
              className="border-primary/30 hover:bg-primary/5 shadow-lg bg-white"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex justify-between items-start">
          <div></div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#246a59] via-emerald-500 to-teal-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative">
                <CreateClassDrawer onClassCreated={() => {
                  // TODO: Refresh class list
                  console.log('Class created successfully');
                }} />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Create a new class
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Sidebar toggle button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className="border-primary/30 hover:bg-primary/5"
                title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
              >
                {isSidebarMinimized ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </Button>
              {/* Show filter button on mobile */}
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowMobileFilter(true)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active filter indicators */}
        {!isLoading && config && (selectedGrade || searchTerm) && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <p className="text-sm font-medium mr-2">Active filters:</p>
            
            {selectedGrade && (
              <Badge variant="outline" className="flex gap-1 items-center">
                Grade: {selectedGrade.name} {selectedGrade.streamName && `(${selectedGrade.streamName})`} ({selectedGrade.levelName})
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    setSelectedGradeId('');
                    setSelectedLevelId('');
                    setSelectedStreamId('');
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
                setSelectedStreamId('');
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
                selectedStreamId={selectedStreamId}
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


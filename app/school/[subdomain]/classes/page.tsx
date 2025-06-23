'use client'

import React, { useState, useMemo } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { ClassCard } from '../components/ClassCard'
import { ClassCardSkeleton } from '../components/ClassCardSkeleton'
import { Filter, Search, Users, X } from 'lucide-react'

// Mock component for empty state
function EmptyState({ selectedLevel = null, searchTerm = '' }: {
  selectedLevel?: string | null,
  searchTerm?: string
}) {
  let message = 'Try adjusting your search or filters to find what you\'re looking for.'
  
  if (selectedLevel) {
    message = 'No classes found for the selected level. Try selecting a different level.'
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
  
  const [selectedLevelId, setSelectedLevelId] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Filter levels based on search term
  const filteredLevels = useMemo(() => {
    if (!config?.selectedLevels) return []
    
    return config.selectedLevels.filter((level) => {
      if (selectedLevelId !== 'all' && level.id !== selectedLevelId) return false
      if (!searchTerm) return true
      
      const search = searchTerm.toLowerCase()
      return (
        level.name.toLowerCase().includes(search) ||
        level.description.toLowerCase().includes(search) ||
        level.subjects.some(subject => 
          subject.name.toLowerCase().includes(search) ||
          subject.code.toLowerCase().includes(search)
        )
      )
    })
  }, [config?.selectedLevels, selectedLevelId, searchTerm])

  if (error) return <div>Error: {error instanceof Error ? error.message : 'An error occurred'}</div>
  if (!config && !isLoading) return <div>No configuration found</div>

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform md:relative md:translate-x-0 transition-transform duration-200 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 space-y-6">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium mb-2">Search Classes</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search classes..."
                className="pl-9 h-12 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Level filters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Filter by Level</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedLevelId('all')} 
                className="h-7 px-2 text-xs"
                disabled={selectedLevelId === 'all'}
              >
                Clear
              </Button>
            </div>
            <div className="space-y-2.5 relative">
              {isLoading ? (
                // Show skeleton loading for filters
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-14 bg-gray-100 rounded-lg mb-1"></div>
                  </div>
                ))
              ) : config?.selectedLevels ? (
                config.selectedLevels.map((level) => (
                  <Button
                    key={level.id}
                    variant="outline"
                    className={`
                      w-full h-14 relative overflow-hidden rounded-lg transition-all duration-300 ease-out
                      font-medium text-sm group border-2
                      ${selectedLevelId === level.id 
                        ? 'border-primary bg-primary/5 text-primary shadow-sm hover:bg-primary/10' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }
                    `}
                    onClick={() => setSelectedLevelId(level.id)}
                  >
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <span className="uppercase tracking-wider mb-0.5">{level.name}</span>
                      <span className={`text-xs font-normal transition-colors duration-300
                        ${selectedLevelId === level.id 
                          ? 'text-primary/70' 
                          : 'text-gray-500 group-hover:text-gray-600'
                        }`}
                      >
                        {level.subjects.length} Subjects
                      </span>
                    </div>
                    {selectedLevelId === level.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-shimmer"></div>
                    )}
                  </Button>
                ))
              ) : null}
              <style jsx global>{`
                @keyframes shimmer {
                  0% {
                    transform: translateX(-100%);
                  }
                  100% {
                    transform: translateX(100%);
                  }
                }
                .animate-shimmer {
                  animation: shimmer 2s infinite;
                }
              `}</style>
            </div>
          </div>
        </div>
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
        {!isLoading && config && (selectedLevelId !== 'all' || searchTerm) && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <p className="text-sm font-medium mr-2">Active filters:</p>
            
            {selectedLevelId !== 'all' && (
              <Badge variant="outline" className="flex gap-1 items-center">
                Level: {config.selectedLevels.find(l => l.id === selectedLevelId)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLevelId('all')} />
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
                setSelectedLevelId('all')
                setSearchTerm('')
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
              <ClassCard key={level.id} level={level} />
            ))
          ) : config ? (
            <EmptyState 
              selectedLevel={config.selectedLevels.find(l => l.id === selectedLevelId)?.name || null} 
              searchTerm={searchTerm} 
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ClassesPage;


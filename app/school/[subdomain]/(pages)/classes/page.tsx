'use client'

import React, { useState, useMemo } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { ClassCard } from '../components/ClassCard'
import { ClassCardSkeleton } from '../components/ClassCardSkeleton'
import { X, PanelLeftClose, PanelLeftOpen, BookOpen, GraduationCap } from 'lucide-react'
import { SchoolSearchFilter } from '@/components/dashboard/SchoolSearchFilter'
import CreateClassDrawer from '@/app/school/components/CreateClassDrawer'
import { ClassesStats } from './components/ClassesStats'
import { SubjectsView } from './components/SubjectsView'
import { GradeDetailsView } from './components/GradeDetailsView'
import { ActionsBar } from './components/ActionsBar'
import { AddStreamModal } from '../components/AddStreamModal'
import { AssignTeacherModal } from '../components/AssignTeacherModal'

function EmptyState({ selectedGrade, searchTerm }: {
  selectedGrade?: { name: string; levelName: string; streamName?: string } | null,
  searchTerm?: string
}) {
  const getMessage = () => {
    if (selectedGrade) {
      return selectedGrade.streamName
        ? `No classes found for ${selectedGrade.name} (${selectedGrade.streamName}) in ${selectedGrade.levelName}.`
        : `No classes found for ${selectedGrade.name} in ${selectedGrade.levelName}.`
    }
    if (searchTerm) {
      return `No classes match your search term "${searchTerm}".`
    }
    return 'Try adjusting your search or filters to find what you\'re looking for.'
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800 border-2 border-primary/20 p-8 text-center rounded-lg">
      <h3 className="text-lg font-medium text-primary">No classes found</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {getMessage()}
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
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects'>('classes')
  const [showSubjectsDrawer, setShowSubjectsDrawer] = useState(false)
  const [showAddStreamModal, setShowAddStreamModal] = useState(false)
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false)
  const [assignTeacherData, setAssignTeacherData] = useState<{
    streamId?: string
    streamName?: string
    gradeLevelId?: string
    gradeName?: string
  }>({})

  // Filter levels based on selections and search
  const filteredLevels = useMemo(() => {
    if (!config?.selectedLevels) return [];
    
    return config.selectedLevels.filter((level) => {
      // Filter by grade/stream selection
      if (selectedGradeId && selectedLevelId) {
        const hasSelectedGrade = level.gradeLevels?.some(g => g.id === selectedGradeId);
        
        if (selectedStreamId) {
          const gradeWithStream = level.gradeLevels?.find(g => 
            g.id === selectedGradeId && 
            g.streams?.some(s => s.id === selectedStreamId)
          );
          return level.id === selectedLevelId && !!gradeWithStream;
        }
        
        return level.id === selectedLevelId && hasSelectedGrade;
      }
      
      // Filter by search term
      if (!searchTerm) return true;
      
      const search = searchTerm.toLowerCase();
      return level.name.toLowerCase().includes(search) ||
        level.description.toLowerCase().includes(search) ||
        level.gradeLevels?.some(grade => grade.name.toLowerCase().includes(search)) ||
        level.subjects.some(subject => 
          subject.name.toLowerCase().includes(search) ||
          subject.code.toLowerCase().includes(search)
        );
    });
  }, [config?.selectedLevels, selectedGradeId, selectedLevelId, selectedStreamId, searchTerm]);

  const handleGradeSelect = (gradeId: string, levelId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedLevelId(levelId);
    setSelectedStreamId('');
  };

  const handleStreamSelect = (streamId: string, gradeId: string, levelId: string) => {
    setSelectedStreamId(streamId);
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
        const selectedStream = selectedStreamId ? 
          grade.streams?.find(s => s.id === selectedStreamId) : null;
          
        return {
          name: grade.name,
          levelName: level.name,
          streamName: selectedStream?.name,
          grade: grade,
          level: level
        };
      }
    }
    return null;
  }, [selectedGradeId, selectedStreamId, config]);

  if (error) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Classes</h2>
          <p className="text-red-500">{error instanceof Error ? error.message : 'An error occurred'}</p>
        </div>
      </div>
    )
  }

  if (!config && !isLoading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <ClassCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r-2 border-primary/20 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out
        ${isSidebarMinimized ? 'w-16' : 'w-72'}
        flex flex-col
      `}>
        {/* Sidebar Toggle */}
        <div className={`p-4 border-b-2 border-primary/20 ${isSidebarMinimized ? 'flex justify-center' : 'flex justify-end'}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="border-primary/20 bg-white dark:bg-slate-800 text-primary hover:bg-primary/5 transition-all duration-200"
            title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Search Filter */}
        {!isSidebarMinimized && (
          <div className="flex-1 overflow-y-auto">
            <SchoolSearchFilter
              className="p-4"
              type="grades"
              onSearch={setSearchTerm}
              onGradeSelect={handleGradeSelect}
              onStreamSelect={handleStreamSelect}
              isLoading={isLoading}
              selectedGradeId={selectedGradeId}
              selectedStreamId={selectedStreamId}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Tabs Navigation - Moved to Top */}
          <Tabs value={activeTab} onValueChange={(value) => {
            const newTab = value as 'classes' | 'subjects'
            setActiveTab(newTab)
            if (newTab === 'subjects') {
              setShowSubjectsDrawer(true)
            }
          }} className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 border-2 border-primary/20">
              <TabsTrigger 
                value="classes"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="font-medium">Classes & Grades</span>
              </TabsTrigger>
              <TabsTrigger 
                value="subjects"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200"
              >
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">Subjects</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                  Classes & Grades
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Manage class information, subjects, and financial summaries
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {isSidebarMinimized && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSidebarMinimized(false)}
                    className="border-primary/20 bg-white dark:bg-slate-800 text-primary hover:bg-primary/5"
                  >
                    <PanelLeftOpen className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Filters</span>
                  </Button>
                )}
                
                <ActionsBar
                  onCreateClass={() => {
                    console.log('Class created successfully');
                  }}
                  onViewSubjects={() => {
                    setActiveTab('subjects')
                    setShowSubjectsDrawer(true)
                  }}
                  selectedGrade={selectedGrade?.grade || null}
                  selectedStreamId={selectedStreamId || undefined}
                  selectedStreamName={selectedGrade?.streamName || undefined}
                  onAddStream={(gradeId) => {
                    const grade = selectedGrade?.grade;
                    if (grade) {
                      setShowAddStreamModal(true);
                    }
                  }}
                  onAssignTeacher={(gradeLevelId, gradeName) => {
                    setAssignTeacherData({ gradeLevelId, gradeName });
                    setShowAssignTeacherModal(true);
                  }}
                  onAssignStreamTeacher={(streamId, streamName) => {
                    setAssignTeacherData({ streamId, streamName });
                    setShowAssignTeacherModal(true);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stats Section - Show overall stats when no grade selected, grade stats are in GradeDetailsView */}
          {!selectedGradeId && (
            <div className="mb-8">
              <ClassesStats config={config} isLoading={isLoading} />
            </div>
          )}

          {/* Classes Content */}
          {activeTab === 'classes' && (
            <div className="space-y-6">
              {/* Active Filters */}
              {!isLoading && config && (selectedGrade || searchTerm) && (
                <div className="p-4 border border-primary/20 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-sm font-semibold text-primary">Active Filters:</span>
                    
                    {selectedGrade && (
                      <Badge variant="outline" className="flex gap-2 items-center border-primary/20 bg-primary/5 text-primary px-3 py-1.5">
                        <span>Grade: {selectedGrade.name} {selectedGrade.streamName && `(${selectedGrade.streamName})`} ({selectedGrade.levelName})</span>
                        <X 
                          className="h-4 w-4 cursor-pointer hover:text-red-500 transition-colors" 
                          onClick={() => {
                            setSelectedGradeId('');
                            setSelectedLevelId('');
                            setSelectedStreamId('');
                          }} 
                        />
                      </Badge>
                    )}
                    
                    {searchTerm && (
                      <Badge variant="outline" className="flex gap-2 items-center border-primary/20 bg-primary/5 text-primary px-3 py-1.5">
                        <span>Search: "{searchTerm}"</span>
                        <X className="h-4 w-4 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setSearchTerm('')} />
                      </Badge>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-auto text-slate-600 dark:text-slate-400 hover:text-red-600 hover:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-950/20 border-primary/20 transition-all duration-200" 
                      onClick={() => {
                        setSelectedGradeId('');
                        setSelectedLevelId('');
                        setSelectedStreamId('');
                        setSearchTerm('');
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Grade Details View - Show when a grade is selected */}
              {selectedGradeId && selectedGrade?.grade && (
                <div className="mb-6">
                  <GradeDetailsView
                    grade={selectedGrade.grade}
                    levelName={selectedGrade.levelName}
                    selectedStreamId={selectedStreamId || undefined}
                  />
                </div>
              )}

              {/* Classes Content */}
              <div className="space-y-6">
                {isLoading ? (
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
                      onStreamSelect={handleStreamSelect}
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
          )}

          {/* Subjects Drawer */}
          <Drawer 
            open={showSubjectsDrawer} 
            onOpenChange={(open) => {
              setShowSubjectsDrawer(open)
              if (!open) {
                // Reset to classes tab when drawer closes
                setActiveTab('classes')
              }
            }} 
            direction="right"
          >
            <DrawerContent className="max-w-4xl h-[95vh] flex flex-col">
              <DrawerHeader className="px-4 py-3 border-b border-primary/20 bg-white dark:bg-slate-900 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <DrawerTitle className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Subjects Management
                    </DrawerTitle>
                    <DrawerDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      View and manage all subjects across grades
                    </DrawerDescription>
                  </div>
                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
                <SubjectsView selectedGradeId={selectedGradeId || null} />
              </div>
            </DrawerContent>
          </Drawer>

          {/* Modals */}
          {showAddStreamModal && selectedGrade?.grade && (
            <AddStreamModal
              isOpen={showAddStreamModal}
              onClose={() => setShowAddStreamModal(false)}
              onSuccess={() => {
                setShowAddStreamModal(false);
                // Refresh will happen automatically
              }}
              gradeId={selectedGrade.grade.id}
              gradeName={selectedGrade.grade.name}
            />
          )}

          {showAssignTeacherModal && (
            <AssignTeacherModal
              isOpen={showAssignTeacherModal}
              onClose={() => setShowAssignTeacherModal(false)}
              onSuccess={() => {
                setShowAssignTeacherModal(false);
                // Refresh will happen automatically
              }}
              streamId={assignTeacherData.streamId}
              streamName={assignTeacherData.streamName}
              gradeLevelId={assignTeacherData.gradeLevelId}
              gradeName={assignTeacherData.gradeName}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ClassesPage;


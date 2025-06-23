'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronDown, ChevronUp, Edit, Plus, Trash2, GraduationCap, Layers } from 'lucide-react'
import type { Level, Subject, GradeLevel } from '@/lib/types/school-config'
import { useState, useMemo } from 'react'
import { EditSubjectDialog } from './EditSubjectDialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import CreateClassDrawer from "../../components/CreateClassDrawer";

interface ClassCardProps {
  level: Level;
  selectedGradeId?: string;
}

// Helper function to get component level color
function getComponentLevelColor(name: string) {
  switch(name.toLowerCase()) {
    case 'madrasa lower': return 'bg-purple-100 text-purple-800 border-purple-400';
    case 'madrasa beginners': return 'bg-custom-blue/10 text-custom-blue border-custom-blue/40';
    default: return 'bg-gray-100 text-gray-800 border-gray-400';
  }
}

export function ClassHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Classes</h2>
        <p className="text-muted-foreground">
          Manage class information and subjects across all levels
        </p>
      </div>
      <div className="flex items-center gap-2">
        <CreateClassDrawer onClassCreated={() => {
          // Refresh class list or show success message
          console.log('Class created successfully');
        }} />
      </div>
    </div>
  )
}

export function ClassCard({ level, selectedGradeId }: ClassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'core' | 'optional'>('all')
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  // Filter subjects based on selected grade and filter type
  const filteredSubjects = useMemo(() => {
    let subjects = level.subjects;

    // First filter based on selected type
    subjects = subjects.filter(subject => {
      if (selectedFilter === 'all') return true;
      return selectedFilter === 'core' ? subject.subjectType === 'core' : subject.subjectType !== 'core';
    });

    // Then sort: core subjects first, then by name within each group
    return subjects.sort((a, b) => {
      // First sort by type (core comes first)
      if (a.subjectType === 'core' && b.subjectType !== 'core') return -1;
      if (a.subjectType !== 'core' && b.subjectType === 'core') return 1;
      
      // Then sort alphabetically by name within each group
      return a.name.localeCompare(b.name);
    });
  }, [level.subjects, selectedFilter]);

  // Get the selected grade if any
  const selectedGrade = useMemo(() => {
    if (!selectedGradeId) return null;
    return level.gradeLevels?.find(grade => grade.id === selectedGradeId) || null;
  }, [level.gradeLevels, selectedGradeId]);

  const handleDeleteSubject = (subjectId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete subject:', subjectId);
  };

  const handleAddSubject = () => {
    // TODO: Implement add subject functionality
    console.log('Add new subject to level:', level.id);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
  };

  const handleSaveSubject = (updatedSubject: Subject) => {
    // TODO: Implement save functionality
    console.log('Save updated subject:', updatedSubject);
  };

  const handleAddStream = (gradeId: string) => {
    // TODO: Implement add stream functionality
    console.log('Add stream to grade:', gradeId);
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <CardTitle className="text-xl font-bold">{level.name}</CardTitle>
          <CardDescription>{level.description}</CardDescription>
          {selectedGrade && (
            <div className="flex items-center gap-2 mt-2">
              <GraduationCap className="h-4 w-4" />
              <span className="text-sm font-medium">{selectedGrade.name}</span>
              {selectedGrade.age && (
                <span className="text-xs text-muted-foreground">
                  (Age: {selectedGrade.age} years)
                </span>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 ml-2"
                      onClick={() => handleAddStream(selectedGrade.id)}
                    >
                      <Layers className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Add Stream</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add a new stream to this grade</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative group"
              >
                <div className="absolute -left-24 top-1/2 -translate-y-1/2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {isExpanded ? 'Hide subjects' : 'Show subjects'}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isExpanded ? 'Hide subjects list' : 'Show subjects list'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'core' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('core')}
              >
                Core
              </Button>
              <Button
                variant={selectedFilter === 'optional' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('optional')}
              >
                Optional
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddSubject}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{subject.name}</div>
                  <div className="text-sm text-gray-500">{subject.code}</div>
                  <Badge variant="outline" className="mt-1">
                    {subject.subjectType}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSubject(subject)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {editingSubject && (
        <EditSubjectDialog
          subject={editingSubject}
          onClose={() => setEditingSubject(null)}
          onSave={handleSaveSubject}
          isOpen={!!editingSubject}
        />
      )}
    </Card>
  );
} 
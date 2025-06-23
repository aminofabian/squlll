'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronDown, ChevronUp, Edit, Filter, Plus, Trash2, School, Clock, Trophy } from 'lucide-react'
import type { Level, Subject } from '@/lib/types/school-config'
import { useState, useMemo } from 'react'
import { EditSubjectDialog } from './EditSubjectDialog'

// Helper function to get component level color
function getComponentLevelColor(name: string) {
  switch(name.toLowerCase()) {
    case 'madrasa lower': return 'bg-purple-100 text-purple-800 border-purple-400';
    case 'madrasa beginners': return 'bg-custom-blue/10 text-custom-blue border-custom-blue/40';
    default: return 'bg-gray-100 text-gray-800 border-gray-400';
  }
}

export function ClassCard({ level }: { level: Level }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'core' | 'optional'>('all');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const filteredSubjects = useMemo(() => {
    // First filter based on selected type
    const filtered = level.subjects.filter(subject => {
      if (selectedFilter === 'all') return true;
      return selectedFilter === 'core' ? subject.subjectType === 'core' : subject.subjectType !== 'core';
    });

    // Then sort: core subjects first, then by name within each group
    return filtered.sort((a, b) => {
      // First sort by type (core comes first)
      if (a.subjectType === 'core' && b.subjectType !== 'core') return -1;
      if (a.subjectType !== 'core' && b.subjectType === 'core') return 1;
      
      // Then sort alphabetically by name within each group
      return a.name.localeCompare(b.name);
    });
  }, [level.subjects, selectedFilter]);

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

  return (
    <>
      <Card 
        className="transition-all duration-300 ease-in-out hover:shadow-lg transform hover:-translate-y-1 border-l-4 overflow-hidden" 
        style={{
          borderLeftColor: '#3b82f6'
        }}
      >
        <CardHeader className="pb-0 pt-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold">{level.name}</CardTitle>
              </div>
              <CardDescription className="mt-1">{level.description}</CardDescription>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={getComponentLevelColor(level.name) + " px-2 py-1 font-medium"}>
                  {level.name}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Subjects Section */}
          <div className="mb-5 bg-custom-blue/5 p-4 rounded-lg border border-custom-blue/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-custom-blue/10 rounded-md">
                  <BookOpen className="h-4 w-4 text-custom-blue" />
                </div>
                <h4 className="text-sm font-semibold text-custom-blue">
                  Subjects ({filteredSubjects.length})
                </h4>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-2 py-1 h-7 text-xs ${selectedFilter === 'all' ? 'bg-gray-100' : ''}`}
                    onClick={() => setSelectedFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-2 py-1 h-7 text-xs ${selectedFilter === 'core' ? 'bg-gray-100' : ''}`}
                    onClick={() => setSelectedFilter('core')}
                  >
                    Core
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-2 py-1 h-7 text-xs ${selectedFilter === 'optional' ? 'bg-gray-100' : ''}`}
                    onClick={() => setSelectedFilter('optional')}
                  >
                    Optional
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs border-dashed hover:border-custom-blue hover:text-custom-blue"
                  onClick={handleAddSubject}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredSubjects.map((subject) => (
                <div 
                  key={subject.id} 
                  className={`group bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-300
                    hover:shadow-lg hover:shadow-[#246a59]/5 hover:-translate-y-0.5 hover:border-[#246a59]/30
                    relative overflow-hidden cursor-pointer
                    ${isExpanded ? 'p-4' : 'p-3'}`}
                >
                  {/* Decorative elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#246a59]/0 via-transparent to-[#246a59]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-0 right-0 h-20 w-20 bg-[#246a59]/5 rounded-full -translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:translate-y-[-40%] transition-transform duration-500" />
                  
                  <div className="relative flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <h5 className="font-medium text-sm truncate group-hover:text-[#246a59] transition-colors duration-300">
                          {subject.name}
                        </h5>
                        <p className="text-xs text-gray-500 mt-0.5 group-hover:text-[#246a59]/70 transition-colors duration-300">
                          {subject.code}
                        </p>
                      </div>
                      
                      <Badge 
                        className={`${
                          subject.subjectType === 'core' 
                            ? 'bg-[#246a59]/10 text-[#246a59] border-[#246a59]/20 group-hover:bg-[#246a59]/20' 
                            : 'bg-gray-100 text-gray-800 border-gray-200 group-hover:bg-gray-200'
                        } text-xs shrink-0 transition-colors duration-300`}
                      >
                        {subject.subjectType}
                      </Badge>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-xs space-y-1.5">
                        {subject.department && (
                          <div className="flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform duration-300">
                            <School className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#246a59] transition-colors duration-300" />
                            <span className="text-gray-600 group-hover:text-[#246a59]/90 transition-colors duration-300">
                              {subject.department}
                            </span>
                          </div>
                        )}
                        {subject.creditHours && (
                          <div className="flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform duration-300">
                            <Clock className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#246a59] transition-colors duration-300" />
                            <span className="text-gray-600 group-hover:text-[#246a59]/90 transition-colors duration-300">
                              {subject.creditHours} credits
                            </span>
                          </div>
                        )}
                        {subject.totalMarks && (
                          <div className="flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform duration-300">
                            <Trophy className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#246a59] transition-colors duration-300" />
                            <span className="text-gray-600 group-hover:text-[#246a59]/90 transition-colors duration-300">
                              {subject.totalMarks} marks
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-end gap-1 mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 bg-[#246a59]/5 hover:bg-[#246a59]/10 hover:text-[#246a59] transition-colors duration-300"
                        onClick={() => handleEditSubject(subject)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 bg-red-50/50 hover:bg-red-50 hover:text-red-600 transition-colors duration-300"
                        onClick={() => handleDeleteSubject(subject.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Subject Dialog */}
      {editingSubject && (
        <EditSubjectDialog
          subject={editingSubject}
          isOpen={!!editingSubject}
          onClose={() => setEditingSubject(null)}
          onSave={handleSaveSubject}
        />
      )}
    </>
  )
} 
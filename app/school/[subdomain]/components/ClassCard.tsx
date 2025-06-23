'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronDown, ChevronUp, Edit, Filter, Plus, Trash2 } from 'lucide-react'
import type { Level } from '@/lib/types/school-config'
import { useState, useMemo } from 'react'

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

  const handleEditSubject = (subjectId: string) => {
    // TODO: Implement edit functionality
    console.log('Edit subject:', subjectId);
  };

  return (
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
          
          <div className={`grid gap-2 transition-all duration-300 ${isExpanded ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
            {filteredSubjects.map((subject) => (
              <div 
                key={subject.id} 
                className={`bg-white rounded-lg border border-gray-100 shadow-sm transition-all duration-300
                  ${isExpanded ? 'p-4' : 'p-2'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h5 className="font-medium text-sm truncate">{subject.name}</h5>
                    {isExpanded && (
                      <p className="text-xs text-gray-500 mt-1">{subject.code}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge 
                      className={`${
                        subject.subjectType === 'core' 
                          ? 'bg-custom-blue/10 text-custom-blue border-custom-blue/20' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      } text-xs`}
                    >
                      {subject.subjectType}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => handleEditSubject(subject.id)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDeleteSubject(subject.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {subject.department && (
                        <div>
                          <span className="text-gray-500">Department:</span>
                          <span className="font-medium ml-1">{subject.department}</span>
                        </div>
                      )}
                      {subject.creditHours && (
                        <div>
                          <span className="text-gray-500">Credits:</span>
                          <span className="font-medium ml-1">{subject.creditHours}</span>
                        </div>
                      )}
                      {subject.totalMarks && (
                        <div>
                          <span className="text-gray-500">Total Marks:</span>
                          <span className="font-medium ml-1">{subject.totalMarks}</span>
                        </div>
                      )}
                      {subject.passingMarks && (
                        <div>
                          <span className="text-gray-500">Passing:</span>
                          <span className="font-medium ml-1">{subject.passingMarks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School, Calendar, BookOpen, Clock, Users, Filter, Search } from 'lucide-react';
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimetableFilterProps {
  selectedGrade: string;
  onGradeSelect: (grade: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export function TimetableFilter({ 
  selectedGrade, 
  onGradeSelect, 
  searchTerm = '', 
  onSearchChange 
}: TimetableFilterProps) {
  const { getAllGradeLevels } = useSchoolConfigStore();
  
  const allGradeLevels = getAllGradeLevels();
  
  // Create a list of all grades for timetable filtering
  const timetableGrades = React.useMemo(() => {
    const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
                    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
                    'Grade 11', 'Grade 12'];
    return grades;
  }, []);
  
  // Enhanced grade levels with fallback for missing grades
  const enhancedGradeLevels = React.useMemo(() => {
    const levels = [...allGradeLevels];
    
    // Add fallback levels if they don't exist
    const levelNames = levels.map(l => l.levelName.toLowerCase());
    
    if (!levelNames.some(name => name.includes('primary'))) {
      levels.push({
        levelId: 'fallback-primary',
        levelName: 'Primary',
        grades: timetableGrades.slice(0, 8).map((grade, index) => ({
          id: `primary-${index + 1}`,
          name: grade,
          age: 6 + index,
          streams: []
        }))
      });
    }
    
    if (!levelNames.some(name => name.includes('secondary'))) {
      levels.push({
        levelId: 'fallback-secondary',
        levelName: 'Secondary',
        grades: timetableGrades.slice(8).map((grade, index) => ({
          id: `secondary-${index + 1}`,
          name: grade,
          age: 14 + index,
          streams: []
        }))
      });
    }
    
    return levels;
  }, [allGradeLevels, timetableGrades]);

  const getGradeOrder = (gradeName: string): number => {
    const gradeNumber = parseInt(gradeName.match(/\d+/)?.[0] || '0');
    return gradeNumber;
  };

  const getShortName = (gradeName: string): string => {
    const gradeNumber = parseInt(gradeName.match(/\d+/)?.[0] || '0');
    if (gradeNumber <= 8) {
      return `G${gradeNumber}`;
    } else {
      return `F${gradeNumber - 8}`;
    }
  };

  const getGradeLevel = (shortName: string): string => {
    const gradeNumber = parseInt(shortName.match(/\d+/)?.[0] || '0');
    if (shortName.startsWith('G')) {
      return 'Primary';
    } else if (shortName.startsWith('F')) {
      return 'Secondary';
    }
    return 'Unknown';
  };

  return (
    <div className="w-80 h-screen bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Timetable Filters</h3>
            <p className="text-sm text-gray-500">Filter by grade and search</p>
          </div>
        </div>

        {/* Search */}
        {onSearchChange && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Timetable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="search">Search subjects, teachers, or classes</Label>
                <Input
                  id="search"
                  placeholder="Type to search..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grade Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Grade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {enhancedGradeLevels.map((level) => {
              const sortedGrades = [...level.grades].sort((a, b) => 
                getGradeOrder(a.name) - getGradeOrder(b.name)
              );

              return (
                <div key={level.levelId} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-gray-100 rounded">
                      <School className="h-3 w-3 text-gray-600" />
                    </div>
                    <Label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {level.levelName}
                    </Label>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {sortedGrades.map((grade) => {
                      const shortName = getShortName(grade.name);
                      const isSelected = selectedGrade === grade.name;
                      
                      return (
                        <Button
                          key={grade.id}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`h-8 text-xs font-medium transition-all duration-200 ${
                            isSelected 
                              ? 'bg-primary text-white shadow-md' 
                              : 'hover:bg-gray-50 hover:border-gray-300'
                          }`}
                          onClick={() => onGradeSelect(grade.name)}
                        >
                          {shortName}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Current Selection Info */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Current Grade: {selectedGrade}
                </div>
                <div className="text-xs text-gray-500">
                  {getGradeLevel(getShortName(selectedGrade))} Level
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
            Quick Actions
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => onGradeSelect('Grade 1')}
            >
              <Users className="h-3 w-3 mr-1" />
              Primary
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs"
              onClick={() => onGradeSelect('Grade 9')}
            >
              <Clock className="h-3 w-3 mr-1" />
              Secondary
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
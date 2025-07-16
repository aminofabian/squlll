"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School, Calendar, BookOpen, Clock, Users, Filter, Search } from 'lucide-react';
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TimetableFilterProps {
  selectedGrade: string;
  onGradeSelect: (grade: string) => void;
  searchTerm?: string;
  onSearchChange: (value: string) => void;
  getDisplayGradeName?: (gradeName: string) => string;
}

export function TimetableFilter({ 
  selectedGrade, 
  onGradeSelect, 
  searchTerm = '', 
  onSearchChange,
  getDisplayGradeName = (name) => name
}: TimetableFilterProps) {
  const { getAllGradeLevels } = useSchoolConfigStore();
  
  // Define the complete grade structure following educational progression
  const educationalLevels = React.useMemo(() => [
    {
      levelId: 'preprimary',
      levelName: 'Pre-Primary',
      grades: [
        { id: 'pp1', name: 'PP1', age: 4, streams: [] },
        { id: 'pp2', name: 'PP2', age: 5, streams: [] }
      ]
    },
    {
      levelId: 'lower-primary',
      levelName: 'Lower Primary',
      grades: [
        { id: 'grade1', name: 'Grade 1', age: 6, streams: [] },
        { id: 'grade2', name: 'Grade 2', age: 7, streams: [] },
        { id: 'grade3', name: 'Grade 3', age: 8, streams: [] }
      ]
    },
    {
      levelId: 'upper-primary',
      levelName: 'Upper Primary',
      grades: [
        { id: 'grade4', name: 'Grade 4', age: 9, streams: [] },
        { id: 'grade5', name: 'Grade 5', age: 10, streams: [] },
        { id: 'grade6', name: 'Grade 6', age: 11, streams: [] }
      ]
    },
    {
      levelId: 'junior-secondary',
      levelName: 'Junior Secondary',
      grades: [
        { id: 'grade7', name: 'Grade 7', age: 12, streams: [] },
        { id: 'grade8', name: 'Grade 8', age: 13, streams: [] },
        { id: 'grade9', name: 'Grade 9', age: 14, streams: [] }
      ]
    },
    {
      levelId: 'senior-secondary',
      levelName: 'Senior Secondary',
      grades: [
        { id: 'grade10', name: 'Grade 10', age: 15, streams: [] },
        { id: 'grade11', name: 'Grade 11', age: 16, streams: [] },
        { id: 'grade12', name: 'Grade 12', age: 17, streams: [] }
      ]
    }
  ], []);

  const getGradePriority = (gradeName: string): number => {
    const name = gradeName.toLowerCase();
    
    // Pre-primary
    if (name.includes('pp1')) return 1;
    if (name.includes('pp2')) return 2;
    
    // Primary
    if (name.includes('grade 1') || name === 'grade 1') return 3;
    if (name.includes('grade 2') || name === 'grade 2') return 4;
    if (name.includes('grade 3') || name === 'grade 3') return 5;
    if (name.includes('grade 4') || name === 'grade 4') return 6;
    if (name.includes('grade 5') || name === 'grade 5') return 7;
    if (name.includes('grade 6') || name === 'grade 6') return 8;
    
    // Secondary
    if (name.includes('grade 7') || name === 'grade 7') return 9;
    if (name.includes('grade 8') || name === 'grade 8') return 10;
    if (name.includes('grade 9') || name === 'grade 9') return 11;
    if (name.includes('grade 10') || name === 'grade 10') return 12;
    if (name.includes('grade 11') || name === 'grade 11') return 13;
    if (name.includes('grade 12') || name === 'grade 12') return 14;
    
    // Form system
    if (name.includes('form 1') || name.includes('f1')) return 12;
    if (name.includes('form 2') || name.includes('f2')) return 13;
    if (name.includes('form 3') || name.includes('f3')) return 14;
    if (name.includes('form 4') || name.includes('f4')) return 15;
    if (name.includes('form 5') || name.includes('f5')) return 16;
    if (name.includes('form 6') || name.includes('f6')) return 17;
    
    // Extract number for fallback
    const match = gradeName.match(/(\d+)/);
    return match ? parseInt(match[1]) + 100 : 999;
  };

  // Enhanced grade levels merging config store data with predefined structure
  const enhancedGradeLevels = React.useMemo(() => {
    // Use the predefined structure as the base
    const finalLevels = educationalLevels.map(level => ({
      ...level,
      grades: [...level.grades] // Create a copy
    }));
    
    // Get config levels to check for any additional grades
    const configLevels = getAllGradeLevels();
    
    configLevels.forEach(configLevel => {
      const matchingLevel = finalLevels.find(level => 
        level.levelName.toLowerCase().includes(configLevel.levelName.toLowerCase()) ||
        configLevel.levelName.toLowerCase().includes(level.levelName.toLowerCase())
      );
      
      if (matchingLevel) {
        // Add any grades from config that aren't already in our predefined structure
        configLevel.grades.forEach(configGrade => {
          const existingGrade = matchingLevel.grades.find(grade =>
            grade.name.toLowerCase() === configGrade.name.toLowerCase()
          );
          
          if (!existingGrade) {
            matchingLevel.grades.push({
              id: configGrade.id,
              name: configGrade.name,
              age: configGrade.age || 0,
              streams: []
            });
          }
        });
      } else {
        // Add completely new level if it doesn't match any existing one
        finalLevels.push({
          levelId: configLevel.levelId,
          levelName: configLevel.levelName,
          grades: configLevel.grades.map(grade => ({
            id: grade.id,
            name: grade.name,
            age: grade.age || 0,
            streams: []
          }))
        });
      }
    });
    
    // Remove duplicates and sort grades within each level
    return finalLevels.map(level => ({
      ...level,
      grades: level.grades
        .filter((grade, index, array) => 
          // Remove duplicates by name
          array.findIndex(g => g.name.toLowerCase() === grade.name.toLowerCase()) === index
        )
        .sort((a, b) => getGradePriority(a.name) - getGradePriority(b.name))
    }));
  }, [getAllGradeLevels, educationalLevels]);

  const getShortName = (gradeName: string): string => {
    const name = gradeName.toLowerCase();
    
    console.log(`Processing grade: "${gradeName}" (lowercase: "${name}")`);
    
    // Pre-primary
    if (name.includes('pp1')) return 'PP1';
    if (name.includes('pp2')) return 'PP2';
    
    // Primary grades (1-6) - check exact matches first
    if (name === 'grade 1' || name.includes('grade 1 ')) return 'G1';
    if (name === 'grade 2' || name.includes('grade 2 ')) return 'G2';
    if (name === 'grade 3' || name.includes('grade 3 ')) return 'G3';
    if (name === 'grade 4' || name.includes('grade 4 ')) return 'G4';
    if (name === 'grade 5' || name.includes('grade 5 ')) return 'G5';
    if (name === 'grade 6' || name.includes('grade 6 ')) return 'G6';
    
    // Secondary grades - Use Form system (check double digits first and be more specific)
    if (name === 'grade 10' || name.includes('grade 10 ')) {
      console.log('Matched Grade 10 -> F4');
      return 'F4';
    }
    if (name === 'grade 11' || name.includes('grade 11 ')) {
      console.log('Matched Grade 11 -> F5');
      return 'F5';
    }
    if (name === 'grade 12' || name.includes('grade 12 ')) {
      console.log('Matched Grade 12 -> F6');
      return 'F6';
    }
    if (name === 'grade 7' || name.includes('grade 7 ')) return 'F1';
    if (name === 'grade 8' || name.includes('grade 8 ')) return 'F2';
    if (name === 'grade 9' || name.includes('grade 9 ')) return 'F3';
    
    // Form system (alternative naming)
    if (name.includes('form 1') || name.includes('f1')) return 'F1';
    if (name.includes('form 2') || name.includes('f2')) return 'F2';
    if (name.includes('form 3') || name.includes('f3')) return 'F3';
    if (name.includes('form 4') || name.includes('f4')) return 'F4';
    if (name.includes('form 5') || name.includes('f5')) return 'F5';
    if (name.includes('form 6') || name.includes('f6')) return 'F6';
    
    // Fallback: extract all digits (handles multi-digit numbers)
    const match = gradeName.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1]);
      console.log(`Fallback: extracted number ${num} from "${gradeName}"`);
      if (num >= 7 && num <= 12) {
        const formNum = num - 6;
        console.log(`Converting Grade ${num} to F${formNum}`);
        return `F${formNum}`;
      } else if (num >= 1 && num <= 6) {
        console.log(`Converting Grade ${num} to G${num}`);
        return `G${num}`;
      }
      return `G${num}`;
    }
    
    console.log(`No match found for "${gradeName}", using fallback`);
    return gradeName.substring(0, 3).toUpperCase();
  };

  const getLevelColor = (levelId: string): string => {
    switch (levelId) {
      case 'preprimary': return 'bg-pink-100 text-pink-800';
      case 'lower-primary': return 'bg-blue-100 text-blue-800';
      case 'upper-primary': return 'bg-green-100 text-green-800';
      case 'junior-secondary': return 'bg-orange-100 text-orange-800';
      case 'senior-secondary': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeLevel = (gradeName: string): string => {
    const name = gradeName.toLowerCase();
    
    if (name.includes('pp')) return 'Pre-Primary';
    if (name.includes('grade 1') || name.includes('grade 2') || name.includes('grade 3')) return 'Lower Primary';
    if (name.includes('grade 4') || name.includes('grade 5') || name.includes('grade 6')) return 'Upper Primary';
    if (name.includes('grade 7') || name.includes('grade 8') || name.includes('grade 9')) return 'Junior Secondary';
    if (name.includes('grade 10') || name.includes('grade 11') || name.includes('grade 12')) return 'Senior Secondary';
    if (name.includes('form')) return 'Secondary';
    
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
          <CardContent className="space-y-5">
            {enhancedGradeLevels.map((level) => {
              const sortedGrades = [...level.grades].sort((a, b) => 
                getGradePriority(a.name) - getGradePriority(b.name)
              );

              if (sortedGrades.length === 0) return null;

              return (
                <div key={level.levelId} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gray-100 rounded">
                        <School className="h-3 w-3 text-gray-600" />
                      </div>
                      <Label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {level.levelName}
                      </Label>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-1 ${getLevelColor(level.levelId)}`}
                    >
                      {sortedGrades.length} grades
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {sortedGrades.map((grade) => {
                      const shortName = getShortName(grade.name);
                      const isSelected = selectedGrade === grade.name;
                      
                      return (
                        <Button
                          key={grade.id}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`h-9 text-xs font-medium transition-all duration-200 ${
                            isSelected 
                              ? 'bg-primary text-white shadow-md scale-105' 
                              : 'hover:bg-gray-50 hover:border-gray-300 hover:scale-102'
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
                  Current: {getShortName(selectedGrade)}
                </div>
                <div className="text-xs text-gray-500">
                  {getGradeLevel(selectedGrade)} • {selectedGrade}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
            Quick Navigation
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs bg-pink-50 hover:bg-pink-100 border-pink-200"
              onClick={() => onGradeSelect('PP1')}
            >
              <Users className="h-3 w-3 mr-1" />
              Pre-Primary
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200"
              onClick={() => onGradeSelect('Grade 1')}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Primary
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs bg-orange-50 hover:bg-orange-100 border-orange-200"
              onClick={() => onGradeSelect('Grade 7')}
            >
              <Clock className="h-3 w-3 mr-1" />
              Junior Sec
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs bg-purple-50 hover:bg-purple-100 border-purple-200"
              onClick={() => onGradeSelect('Grade 10')}
            >
              <School className="h-3 w-3 mr-1" />
              Senior Sec
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
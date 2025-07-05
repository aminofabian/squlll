"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School } from 'lucide-react';
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore';

interface GradeFilterProps {
  selectedGradeId: string;
  onGradeSelect: (gradeId: string) => void;
}

export function GradeFilter({ selectedGradeId, onGradeSelect }: GradeFilterProps) {
  const { getAllGradeLevels, getGradeById } = useSchoolConfigStore();
  
  const allGradeLevels = getAllGradeLevels();
  
  const enhancedGradeLevels = React.useMemo(() => {
    const levels = [...allGradeLevels];
    
    let seniorSecondaryLevel = levels.find(level => 
      level.levelName.toLowerCase().includes('senior secondary')
    );
    
    if (!seniorSecondaryLevel) {
      seniorSecondaryLevel = {
        levelId: 'fallback-senior-secondary',
        levelName: 'Senior Secondary',
        grades: []
      };
      levels.push(seniorSecondaryLevel);
    }
    
    if (seniorSecondaryLevel) {
      const existingGradeNames = seniorSecondaryLevel.grades.map(g => g.name.toLowerCase());
      const missingGrades = [];
      
      const hasGrade10 = existingGradeNames.some(name => name.includes('grade 10') || name.includes('form 4') || name.includes('f4'));
      const hasGrade11 = existingGradeNames.some(name => name.includes('grade 11') || name.includes('form 5') || name.includes('f5'));
      const hasGrade12 = existingGradeNames.some(name => name.includes('grade 12') || name.includes('form 6') || name.includes('f6'));
      
      if (!hasGrade10) {
        missingGrades.push({
          id: 'fallback-f4',
          name: 'Grade 10',
          age: 17,
          streams: []
        });
      }
      
      if (!hasGrade11) {
        missingGrades.push({
          id: 'fallback-f5',
          name: 'Grade 11',
          age: 18,
          streams: []
        });
      }
      
      if (!hasGrade12) {
        missingGrades.push({
          id: 'fallback-f6',
          name: 'Grade 12',
          age: 19,
          streams: []
        });
      }
      
      if (missingGrades.length > 0) {
        seniorSecondaryLevel.grades = [...seniorSecondaryLevel.grades, ...missingGrades];
      }
    }
    
    return levels;
  }, [allGradeLevels]);

  return (
    <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-2">
            <span className="text-xs font-mono uppercase tracking-wide text-primary">
              Grade Filter
            </span>
          </div>
          <h2 className="text-xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
            Filter by Grade Level
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Select a specific grade to view students or view all grades
          </p>
        </div>
        {selectedGradeId !== 'all' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onGradeSelect('all')}
            className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono"
          >
            Clear Filter
          </Button>
        )}
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-primary/20 p-6">
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedGradeId === 'all' ? "default" : "outline"}
            size="sm"
            className={`font-mono min-w-[6rem] h-10 rounded-lg transition-all duration-200 font-semibold tracking-wide ${
              selectedGradeId === 'all' 
                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-2 border-primary/80' 
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md'
            }`}
            onClick={() => onGradeSelect('all')}
          >
            All Grades
          </Button>
          
          {(() => {
            const allGrades = enhancedGradeLevels.flatMap(level => level.grades);
            return allGrades
              .sort((a, b) => {
                const getGradeOrder = (gradeName: string): number => {
                  const lowerName = gradeName.toLowerCase();
                  if (lowerName.includes('pp1') || lowerName.includes('baby')) return 1;
                  if (lowerName.includes('pp2') || lowerName.includes('nursery')) return 2;
                  if (lowerName.includes('pp3') || lowerName.includes('reception')) return 3;
                  if (lowerName.includes('grade 12') || lowerName.includes('form 6') || lowerName.includes('f6')) return 15;
                  if (lowerName.includes('grade 11') || lowerName.includes('form 5') || lowerName.includes('f5')) return 14;
                  if (lowerName.includes('grade 10') || lowerName.includes('form 4') || lowerName.includes('f4')) return 13;
                  if (lowerName.includes('grade 9') || lowerName.includes('form 3') || lowerName.includes('f3')) return 12;
                  if (lowerName.includes('grade 8') || lowerName.includes('form 2') || lowerName.includes('f2')) return 11;
                  if (lowerName.includes('grade 7') || lowerName.includes('form 1') || lowerName.includes('f1')) return 10;
                  if (lowerName.includes('grade 6') || lowerName.includes('g6')) return 9;
                  if (lowerName.includes('grade 5') || lowerName.includes('g5')) return 8;
                  if (lowerName.includes('grade 4') || lowerName.includes('g4')) return 7;
                  if (lowerName.includes('grade 3') || lowerName.includes('g3')) return 6;
                  if (lowerName.includes('grade 2') || lowerName.includes('g2')) return 5;
                  if (lowerName.includes('grade 1') || lowerName.includes('g1')) return 4;
                  return 999;
                };
                const orderA = getGradeOrder(a.name);
                const orderB = getGradeOrder(b.name);
                return orderA - orderB;
              })
              .filter((grade, index, array) => {
                const getShortName = (gradeName: string): string => {
                  const lowerName = gradeName.toLowerCase();
                  if (lowerName.includes('pp1') || lowerName.includes('baby')) return 'PP1';
                  if (lowerName.includes('pp2') || lowerName.includes('nursery')) return 'PP2';
                  if (lowerName.includes('pp3') || lowerName.includes('reception')) return 'PP3';
                  if (lowerName.includes('grade 12') || lowerName.includes('form 6') || lowerName.includes('f6')) return 'F6';
                  if (lowerName.includes('grade 11') || lowerName.includes('form 5') || lowerName.includes('f5')) return 'F5';
                  if (lowerName.includes('grade 10') || lowerName.includes('form 4') || lowerName.includes('f4')) return 'F4';
                  if (lowerName.includes('grade 9') || lowerName.includes('form 3') || lowerName.includes('f3')) return 'F3';
                  if (lowerName.includes('grade 8') || lowerName.includes('form 2') || lowerName.includes('f2')) return 'F2';
                  if (lowerName.includes('grade 7') || lowerName.includes('form 1') || lowerName.includes('f1')) return 'F1';
                  if (lowerName.includes('grade 6') || lowerName.includes('g6')) return 'G6';
                  if (lowerName.includes('grade 5') || lowerName.includes('g5')) return 'G5';
                  if (lowerName.includes('grade 4') || lowerName.includes('g4')) return 'G4';
                  if (lowerName.includes('grade 3') || lowerName.includes('g3')) return 'G3';
                  if (lowerName.includes('grade 2') || lowerName.includes('g2')) return 'G2';
                  if (lowerName.includes('grade 1') || lowerName.includes('g1')) return 'G1';
                  return gradeName.substring(0, 3).toUpperCase();
                };
                
                const currentShortName = getShortName(grade.name);
                const firstIndex = array.findIndex(g => getShortName(g.name) === currentShortName);
                return index === firstIndex;
              })
              .map((grade, index, array) => {
                const getShortName = (gradeName: string): string => {
                  const lowerName = gradeName.toLowerCase();
                  if (lowerName.includes('pp1') || lowerName.includes('baby')) return 'PP1';
                  if (lowerName.includes('pp2') || lowerName.includes('nursery')) return 'PP2';
                  if (lowerName.includes('pp3') || lowerName.includes('reception')) return 'PP3';
                  if (lowerName.includes('grade 12') || lowerName.includes('form 6') || lowerName.includes('f6')) return 'F6';
                  if (lowerName.includes('grade 11') || lowerName.includes('form 5') || lowerName.includes('f5')) return 'F5';
                  if (lowerName.includes('grade 10') || lowerName.includes('form 4') || lowerName.includes('f4')) return 'F4';
                  if (lowerName.includes('grade 9') || lowerName.includes('form 3') || lowerName.includes('f3')) return 'F3';
                  if (lowerName.includes('grade 8') || lowerName.includes('form 2') || lowerName.includes('f2')) return 'F2';
                  if (lowerName.includes('grade 7') || lowerName.includes('form 1') || lowerName.includes('f1')) return 'F1';
                  if (lowerName.includes('grade 6') || lowerName.includes('g6')) return 'G6';
                  if (lowerName.includes('grade 5') || lowerName.includes('g5')) return 'G5';
                  if (lowerName.includes('grade 4') || lowerName.includes('g4')) return 'G4';
                  if (lowerName.includes('grade 3') || lowerName.includes('g3')) return 'G3';
                  if (lowerName.includes('grade 2') || lowerName.includes('g2')) return 'G2';
                  if (lowerName.includes('grade 1') || lowerName.includes('g1')) return 'G1';
                  return gradeName.substring(0, 3).toUpperCase();
                };
                
                const shortName = getShortName(grade.name);
                const isSelected = selectedGradeId === grade.id;
                
                const getGradeLevel = (shortName: string): string => {
                  if (shortName.startsWith('PP')) return 'preschool';
                  if (shortName.startsWith('G')) return 'primary';
                  if (shortName.startsWith('F')) return 'secondary';
                  return 'other';
                };
                
                const gradeLevel = getGradeLevel(shortName);
                
                const shouldAddSeparator = () => {
                  if (index === 0) return false;
                  const prevGrade = array[index - 1];
                  const prevShortName = getShortName(prevGrade.name);
                  const prevLevel = getGradeLevel(prevShortName);
                  return prevLevel !== gradeLevel;
                };
                
                return (
                  <React.Fragment key={grade.id}>
                    {shouldAddSeparator() && (
                      <div className="w-px h-8 bg-primary/30 mx-2 self-center" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`font-mono min-w-[3.5rem] h-10 rounded-lg transition-all duration-200 font-semibold tracking-wide ${
                        isSelected
                          ? 'bg-primary text-white shadow-lg shadow-primary/25 border-2 border-primary/80'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md'
                      }`}
                      onClick={() => onGradeSelect(grade.id)}
                      title={grade.name}
                    >
                      {shortName}
                    </Button>
                  </React.Fragment>
                );
              });
          })()}
        </div>
      </div>
      
      {selectedGradeId !== 'all' && (
        <div className="mt-6 flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
            <School className="h-4 w-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-mono text-slate-700 dark:text-slate-300">Currently viewing:</span>
            <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 font-mono">
              {getGradeById(selectedGradeId)?.grade.name || 'All Grades'}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
} 
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Grade } from "../types";

interface GradeFilterProps {
  grades: Grade[];
  selectedGradeId: string;
  onSelectGrade: (gradeId: string) => void;
}

export function GradeFilter({ grades, selectedGradeId, onSelectGrade }: GradeFilterProps) {
  return (
    <div className="mb-8">
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-2">
              <span className="text-xs font-mono uppercase tracking-wide text-primary">
                Grade Filter
              </span>
            </div>
            <h2 className="text-xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
              Filter by Student Grade
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Select a specific grade to view parents or view all grades
            </p>
          </div>
          {selectedGradeId !== 'all' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSelectGrade('all')}
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
              onClick={() => onSelectGrade('all')}
            >
              All Grades
            </Button>
            
            {grades.map((grade) => (
              <Button
                key={grade.id}
                variant={selectedGradeId === grade.id ? "default" : "outline"}
                size="sm"
                className={`font-mono min-w-[6rem] h-10 rounded-lg transition-all duration-200 font-semibold tracking-wide ${
                  selectedGradeId === grade.id 
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 border-2 border-primary/80' 
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md'
                }`}
                onClick={() => onSelectGrade(grade.id)}
              >
                {grade.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

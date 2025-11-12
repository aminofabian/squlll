import { useMemo } from 'react';
import type { CellData } from '@/lib/stores/useTimetableStore';

/**
 * Optimized hook to merge subjects with breaks from all grades
 * Memoizes the result to prevent unnecessary recalculations
 */
export const useMergedSubjects = (
  subjects: Record<string, CellData>,
  selectedGrade: string
): Record<string, CellData> => {
  return useMemo(() => {
    const merged = { ...subjects };

    // Add breaks from all grades to ensure they're always visible
    Object.entries(subjects).forEach(([cellKey, cellData]) => {
      if (cellData?.isBreak) {
        // Extract the time and day from the cell key
        const [_grade, dayIndex, timeId] = cellKey.split('-');

        // Create a cell key for the current grade with the same time and day
        const currentGradeCellKey = `${selectedGrade}-${dayIndex}-${timeId}`;

        // Always add the break for the current grade
        merged[currentGradeCellKey] = cellData;
      }
    });

    return merged;
  }, [subjects, selectedGrade]);
};

/**
 * Optimized hook to filter subjects based on search term
 * Memoizes the result and only recalculates when dependencies change
 */
export const useFilteredSubjects = (
  subjects: Record<string, CellData>,
  searchTerm: string
): Record<string, CellData> => {
  return useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();
    
    if (!trimmedSearch) return subjects;

    const filtered: Record<string, CellData> = {};
    
    Object.entries(subjects).forEach(([cellKey, cellData]) => {
      if (
        cellData &&
        (cellData.subject.toLowerCase().includes(trimmedSearch) ||
          cellData.teacher.toLowerCase().includes(trimmedSearch))
      ) {
        filtered[cellKey] = cellData;
      }
    });

    return filtered;
  }, [subjects, searchTerm]);
};


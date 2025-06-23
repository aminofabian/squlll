import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SchoolConfiguration, Level, Subject, GradeLevel } from '../types/school-config';

interface SchoolConfigState {
  config: SchoolConfiguration | null;
  isLoading: boolean;
  error: string | null;
  
  // Setters
  setConfig: (config: SchoolConfiguration) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getLevelById: (levelId: string) => Level | undefined;
  getSubjectsByLevelId: (levelId: string) => Subject[];
  getAllSubjects: () => Subject[];
  getGradeLevelsByLevelId: (levelId: string) => GradeLevel[];
  getAllGradeLevels: () => { levelId: string; levelName: string; grades: GradeLevel[] }[];
  getGradeById: (gradeId: string) => { grade: GradeLevel; levelId: string; levelName: string } | undefined;
  
  // Reset
  reset: () => void;
}

const initialState = {
  config: null,
  isLoading: false,
  error: null,
};

export const useSchoolConfigStore = create<SchoolConfigState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Setters
      setConfig: (config) => {
        // Debug: Log the config being set
        console.log('Setting config:', {
          id: config.id,
          levels: config.selectedLevels.map(l => ({
            name: l.name,
            subjects: l.subjects.length,
            grades: l.gradeLevels?.map(g => ({
              id: g.id,
              name: g.name,
              age: g.age
            }))
          }))
        });
        set({ config, error: null });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Getters
      getLevelById: (levelId) => {
        const state = get();
        return state.config?.selectedLevels.find(level => level.id === levelId);
      },

      getSubjectsByLevelId: (levelId) => {
        const state = get();
        return state.config?.selectedLevels.find(level => level.id === levelId)?.subjects || [];
      },

      getAllSubjects: () => {
        const state = get();
        return state.config?.selectedLevels.reduce((acc, level) => {
          return [...acc, ...level.subjects];
        }, [] as Subject[]) || [];
      },

      getGradeLevelsByLevelId: (levelId) => {
        const state = get();
        const level = state.config?.selectedLevels.find(level => level.id === levelId);
        // Debug: Log the grades being returned
        console.log('Getting grades for level:', {
          levelId,
          levelName: level?.name,
          grades: level?.gradeLevels?.map(g => ({
            id: g.id,
            name: g.name,
            age: g.age
          }))
        });
        return level?.gradeLevels || [];
      },

      getAllGradeLevels: () => {
        const state = get();
        return state.config?.selectedLevels.map(level => ({
          levelId: level.id,
          levelName: level.name,
          grades: level.gradeLevels || []
        })) || [];
      },

      getGradeById: (gradeId) => {
        const state = get();
        if (!state.config) return undefined;

        for (const level of state.config.selectedLevels) {
          const grade = level.gradeLevels?.find(g => g.id === gradeId);
          if (grade) {
            return {
              grade,
              levelId: level.id,
              levelName: level.name
            };
          }
        }
        return undefined;
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'school-config-store',
    }
  )
); 
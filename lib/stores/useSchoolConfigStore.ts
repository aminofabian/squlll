import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SchoolConfiguration, Level, Subject, GradeLevel, Stream } from '../types/school-config';

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
  getStreamsByGradeId: (gradeId: string) => Stream[];
  
  // Reset
  reset: () => void;
}

const initialState = {
  config: null,
  isLoading: false,
  error: null,
};

// Only enable devtools in browser environment
const createStore = (set: any, get: any) => ({
  ...initialState,

  // Setters
  setConfig: (config: SchoolConfiguration) => {
    // Debug: Log the config being set
    console.log('Setting config:', {
      id: config.id,
      levels: config.selectedLevels.map((l: Level) => ({
        name: l.name,
        subjects: l.subjects.length,
        grades: l.gradeLevels?.map((g: GradeLevel) => ({
          id: g.id,
          name: g.name,
          age: g.age,
          streams: g.streams?.length || 0
        }))
      }))
    });
    set({ config, error: null });
  },
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),

  // Getters
  getLevelById: (levelId: string) => {
    const state = get();
    return state.config?.selectedLevels.find((level: Level) => level.id === levelId);
  },

  getSubjectsByLevelId: (levelId: string) => {
    const state = get();
    return state.config?.selectedLevels.find((level: Level) => level.id === levelId)?.subjects || [];
  },

  getAllSubjects: () => {
    const state = get();
    return state.config?.selectedLevels.reduce((acc: Subject[], level: Level) => {
      return [...acc, ...level.subjects];
    }, [] as Subject[]) || [];
  },

  getGradeLevelsByLevelId: (levelId: string) => {
    const state = get();
    const level = state.config?.selectedLevels.find((level: Level) => level.id === levelId);
    // Debug: Log the grades being returned
    console.log('Getting grades for level:', {
      levelId,
      levelName: level?.name,
      grades: level?.gradeLevels?.map((g: GradeLevel) => ({
        id: g.id,
        name: g.name,
        age: g.age,
        streams: g.streams?.map((s: Stream) => s.name) || []
      }))
    });
    return level?.gradeLevels || [];
  },

  getAllGradeLevels: () => {
    const state = get();
    return state.config?.selectedLevels.map((level: Level) => ({
      levelId: level.id,
      levelName: level.name,
      grades: level.gradeLevels || []
    })) || [];
  },

  getGradeById: (gradeId: string) => {
    const state = get();
    if (!state.config) return undefined;

    for (const level of state.config.selectedLevels) {
      const grade = level.gradeLevels?.find((g: GradeLevel) => g.id === gradeId);
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
  
  getStreamsByGradeId: (gradeId: string) => {
    const state = get();
    if (!state.config) return [];
    
    for (const level of state.config.selectedLevels) {
      const grade = level.gradeLevels?.find((g: GradeLevel) => g.id === gradeId);
      if (grade) {
        return grade.streams || [];
      }
    }
    return [];
  },

  // Reset
  reset: () => set(initialState),
});

export const useSchoolConfigStore = create<SchoolConfigState>()(
  typeof window !== 'undefined'
    ? devtools(createStore, { name: 'school-config-store' })
    : createStore
); 
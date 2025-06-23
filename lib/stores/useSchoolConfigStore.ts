import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SchoolConfiguration, Level, Subject } from '../types/school-config';

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
      setConfig: (config) => set({ config, error: null }),
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

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'school-config-store',
    }
  )
); 
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SchoolConfiguration, Level, Subject, GradeLevel, Stream, TenantSubject } from '../types/school-config';

interface SchoolConfigState {
  config: SchoolConfiguration | null;
  tenantSubjects: TenantSubject[];
  isLoading: boolean;
  error: string | null;
  
  // Setters
  setConfig: (config: SchoolConfiguration, tenantSubjects?: TenantSubject[]) => void;
  setTenantSubjects: (tenantSubjects: TenantSubject[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getLevelById: (levelId: string) => Level | undefined;
  getSubjectsByLevelId: (levelId: string) => Subject[];
  getAllSubjects: () => Subject[];
  getTenantSubjects: () => TenantSubject[];
  getTenantSubjectsByCurriculum: (curriculumId: string) => TenantSubject[];
  convertTenantSubjectToLegacy: (tenantSubject: TenantSubject) => Subject;
  getGradeLevelsByLevelId: (levelId: string) => GradeLevel[];
  getAllGradeLevels: () => { levelId: string; levelName: string; grades: GradeLevel[] }[];
  getGradeById: (gradeId: string) => { grade: GradeLevel; levelId: string; levelName: string } | undefined;
  getStreamsByGradeId: (gradeId: string) => Stream[];
  
  // Reset
  reset: () => void;
}

const initialState = {
  config: null,
  tenantSubjects: [],
  isLoading: false,
  error: null,
};

export const useSchoolConfigStore = create<SchoolConfigState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Setters
      setConfig: (config, tenantSubjects) => {
        // Debug: Log the config being set
        console.log('Setting config:', {
          id: config.id,
          levels: config.selectedLevels.map(l => ({
            name: l.name,
            subjects: l.subjects?.length || 0,
            grades: l.gradeLevels?.map(g => ({
              id: g.id,
              name: g.name,
              age: g.age,
              streams: g.streams?.length || 0
            }))
          })),
          tenantSubjectsCount: tenantSubjects?.length || 0
        });
        
        const updates: Partial<SchoolConfigState> = { config, error: null };
        if (tenantSubjects) {
          updates.tenantSubjects = tenantSubjects;
        }
        set(updates);
      },
      setTenantSubjects: (tenantSubjects) => set({ tenantSubjects }),
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
          return [...acc, ...(level.subjects || [])];
        }, [] as Subject[]) || [];
      },

      getTenantSubjects: () => {
        const state = get();
        return state.tenantSubjects;
      },

      getTenantSubjectsByCurriculum: (curriculumId) => {
        const state = get();
        return state.tenantSubjects.filter(subject => subject.curriculum.id === curriculumId);
      },

      convertTenantSubjectToLegacy: (tenantSubject) => {
        // Convert TenantSubject to legacy Subject format for backward compatibility
        const baseSubject = tenantSubject.subject || tenantSubject.customSubject;
        if (!baseSubject) {
          throw new Error('TenantSubject must have either subject or customSubject');
        }
        
        return {
          id: tenantSubject.id,
          name: baseSubject.name,
          code: baseSubject.code,
          subjectType: tenantSubject.subjectType,
          category: baseSubject.category,
          department: baseSubject.department,
          shortName: baseSubject.shortName,
          isCompulsory: tenantSubject.isCompulsory,
          totalMarks: tenantSubject.totalMarks,
          passingMarks: tenantSubject.passingMarks,
          creditHours: tenantSubject.creditHours,
          curriculum: tenantSubject.curriculum.id,
        };
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
            age: g.age,
            streams: g.streams?.map(s => s.name) || []
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
      
      getStreamsByGradeId: (gradeId) => {
        const state = get();
        if (!state.config) return [];
        
        for (const level of state.config.selectedLevels) {
          const grade = level.gradeLevels?.find(g => g.id === gradeId);
          if (grade) {
            return grade.streams || [];
          }
        }
        return [];
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'school-config-store',
    }
  )
); 
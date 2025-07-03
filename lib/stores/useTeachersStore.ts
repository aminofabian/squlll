import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GraphQLTeacher } from '../../types/teacher';

interface TeachersState {
  teachers: GraphQLTeacher[];
  isLoading: boolean;
  error: string | null;
  
  // Setters
  setTeachers: (teachers: GraphQLTeacher[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getTeacherById: (teacherId: string) => GraphQLTeacher | undefined;
  getTeachersByTenantId: (tenantId: string) => GraphQLTeacher[];
  getTeacherByEmail: (email: string) => GraphQLTeacher | undefined;
  getTeacherByName: (name: string) => GraphQLTeacher | undefined;
  
  // Actions
  addTeacher: (teacher: GraphQLTeacher) => void;
  updateTeacher: (teacherId: string, updates: Partial<GraphQLTeacher>) => void;
  removeTeacher: (teacherId: string) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  teachers: [],
  isLoading: false,
  error: null,
};

export const useTeachersStore = create<TeachersState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Setters
      setTeachers: (teachers) => {
        console.log('Setting teachers:', teachers.length);
        set({ teachers, error: null });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Getters
      getTeacherById: (teacherId) => {
        const state = get();
        return state.teachers.find(teacher => teacher.id === teacherId);
      },

      getTeachersByTenantId: (tenantId) => {
        const state = get();
        return state.teachers.filter(teacher => teacher.tenantId === tenantId);
      },

      getTeacherByEmail: (email) => {
        const state = get();
        return state.teachers.find(teacher => teacher.email === email);
      },

      getTeacherByName: (name) => {
        const state = get();
        return state.teachers.find(teacher => teacher.name === name);
      },

      // Actions
      addTeacher: (teacher) => {
        const state = get();
        set({ teachers: [...state.teachers, teacher] });
      },

      updateTeacher: (teacherId, updates) => {
        const state = get();
        set({
          teachers: state.teachers.map(teacher =>
            teacher.id === teacherId ? { ...teacher, ...updates } : teacher
          )
        });
      },

      removeTeacher: (teacherId) => {
        const state = get();
        set({
          teachers: state.teachers.filter(teacher => teacher.id !== teacherId)
        });
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'teachers-store',
    }
  )
); 
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GraphQLTeacher } from '../../types/teacher';
import { graphqlClient } from '../graphql-client';
import { gql } from 'graphql-request';
import { useCallback, useRef } from 'react';

const GET_TEACHERS_BY_TENANT = gql`
  query GetTeachersByTenant($tenantId: String!, $role: String!) {
    usersByTenant(tenantId: $tenantId, role: $role) {
      id
      name
      email
    }
  }
`;

interface TeacherStaffUser {
  id: string;
  name: string;
  email: string;
}

interface GetTeachersByTenantResponse {
  usersByTenant: TeacherStaffUser[];
}

interface TeachersState {
  teachers: GraphQLTeacher[];
  teacherStaffUsers: TeacherStaffUser[];
  isLoading: boolean;
  error: string | null;
  
  // Setters
  setTeachers: (teachers: GraphQLTeacher[]) => void;
  setTeacherStaffUsers: (users: TeacherStaffUser[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getTeacherById: (teacherId: string) => GraphQLTeacher | undefined;
  getTeachersByTenantId: (tenantId: string) => GraphQLTeacher[];
  getTeacherByEmail: (email: string) => GraphQLTeacher | undefined;
  getTeacherByName: (name: string) => GraphQLTeacher | undefined;
  getTeacherStaffUserById: (userId: string) => TeacherStaffUser | undefined;
  getTeacherStaffUserByEmail: (email: string) => TeacherStaffUser | undefined;
  
  // Actions
  addTeacher: (teacher: GraphQLTeacher) => void;
  updateTeacher: (teacherId: string, updates: Partial<GraphQLTeacher>) => void;
  removeTeacher: (teacherId: string) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  teachers: [],
  teacherStaffUsers: [],
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
      setTeacherStaffUsers: (teacherStaffUsers) => {
        console.log('Setting teacher/staff users:', teacherStaffUsers.length);
        set({ teacherStaffUsers, error: null });
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
        // Since tenantId is not available on teacher objects, return all teachers
        // The filtering should be done at the API level
        return state.teachers;
      },

      getTeacherByEmail: (email) => {
        const state = get();
        return state.teachers.find(teacher => teacher.email === email);
      },

      getTeacherByName: (name) => {
        const state = get();
        return state.teachers.find(teacher => teacher.fullName === name);
      },

      getTeacherStaffUserById: (userId) => {
        const state = get();
        return state.teacherStaffUsers.find(user => user.id === userId);
      },

      getTeacherStaffUserByEmail: (email) => {
        const state = get();
        return state.teacherStaffUsers.find(user => user.email === email);
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

// React Query hook for fetching teachers/staff by tenant
export const useTeachersByTenantQuery = () => {
  const { setTeacherStaffUsers, setLoading, setError } = useTeachersStore();
  const isFetchingRef = useRef(false);

  const fetchTeachersByTenant = useCallback(async (tenantId: string, role: string = "TEACHER"): Promise<GetTeachersByTenantResponse> => {
    if (!tenantId || tenantId.trim() === '') {
      const error = new Error('Tenant ID is required');
      setError(error.message);
      throw error;
    }

    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      console.log('Teachers fetch already in progress, skipping...');
      return { usersByTenant: [] };
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Use the simple API route instead of GraphQL client
      const response = await fetch('/api/teachers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch teachers');
      }

      const result = await response.json();
      
      console.log('Fetched teachers by tenant:', result.usersByTenant?.length || 0);
      setTeacherStaffUsers(result.usersByTenant || []);
      return { usersByTenant: result.usersByTenant || [] };
    } catch (error) {
      console.error('Error fetching teachers by tenant:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // Empty dependency array

  return {
    fetchTeachersByTenant,
    refetch: (tenantId: string, role: string = "TEACHER") => fetchTeachersByTenant(tenantId, role),
  };
};

// Hook to access teacher data from the store
export const useTeacherData = () => {
  const { teachers, teacherStaffUsers, isLoading, error } = useTeachersStore();
  
  return {
    teachers,
    teacherStaffUsers, // Keep this for backward compatibility
    isLoading,
    error,
  };
}; 
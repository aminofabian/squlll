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

const DELETE_STAFF = gql`
  mutation DeleteStaff($id: String!, $tenantId: String!) {
    deleteStaff(id: $id, tenantId: $tenantId)
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
  deleteTeacher: (teacherId: string, tenantId: string) => Promise<void>;
  
  // Reset
  reset: () => void;
}

const initialState = {
  teachers: [],
  teacherStaffUsers: [],
  isLoading: false,
  error: null,
};

// Only enable devtools in browser environment
const createStore = (set: any, get: any) => ({
      ...initialState,

      // Setters
      setTeachers: (teachers: GraphQLTeacher[]) => {
        console.log('Setting teachers:', teachers.length);
        set({ teachers, error: null });
      },
      setTeacherStaffUsers: (teacherStaffUsers: TeacherStaffUser[]) => {
        console.log('Setting teacher/staff users:', teacherStaffUsers.length);
        set({ teacherStaffUsers, error: null });
      },
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),

      // Getters
      getTeacherById: (teacherId: string) => {
        const state = get();
        return state.teachers.find((teacher: GraphQLTeacher) => teacher.id === teacherId);
      },

      getTeachersByTenantId: (tenantId: string) => {
        const state = get();
        // Since tenantId is not available on teacher objects, return all teachers
        // The filtering should be done at the API level
        return state.teachers;
      },

      getTeacherByEmail: (email: string) => {
        const state = get();
        return state.teachers.find((teacher: GraphQLTeacher) => teacher.email === email);
      },

      getTeacherByName: (name: string) => {
        const state = get();
        return state.teachers.find((teacher: GraphQLTeacher) => teacher.fullName === name);
      },

      getTeacherStaffUserById: (userId: string) => {
        const state = get();
        return state.teacherStaffUsers.find((user: TeacherStaffUser) => user.id === userId);
      },

      getTeacherStaffUserByEmail: (email: string) => {
        const state = get();
        return state.teacherStaffUsers.find((user: TeacherStaffUser) => user.email === email);
      },

      // Actions
      addTeacher: (teacher: GraphQLTeacher) => {
        const state = get();
        set({ teachers: [...state.teachers, teacher] });
      },

      updateTeacher: (teacherId: string, updates: Partial<GraphQLTeacher>) => {
        const state = get();
        set({
          teachers: state.teachers.map((teacher: GraphQLTeacher) =>
            teacher.id === teacherId ? { ...teacher, ...updates } : teacher
          )
        });
      },

      removeTeacher: (teacherId: string) => {
        const state = get();
        set({
          teachers: state.teachers.filter((teacher: GraphQLTeacher) => teacher.id !== teacherId)
        });
      },

      deleteTeacher: async (teacherId: string, tenantId: string) => {
        const state = get();
        set({ isLoading: true, error: null });
        
        try {
          // Try to delete using the staff mutation
          const result = await graphqlClient.request(DELETE_STAFF, {
            id: teacherId,
            tenantId: tenantId
          });
          
          // Remove teacher from store after successful deletion
          set({
            teachers: state.teachers.filter((teacher: GraphQLTeacher) => teacher.id !== teacherId),
            teacherStaffUsers: state.teacherStaffUsers.filter((user: TeacherStaffUser) => user.id !== teacherId),
            isLoading: false
          });
          
          console.log('Teacher deleted successfully:', result);
        } catch (error) {
          console.error('Error deleting teacher:', error);
          
          // Check if it's a "not found" error - this means the user exists but not as a staff record
          const isNotFoundError = error instanceof Error && 
            (error.message.includes('not found') || error.message.includes('NOTFOUNDEXCEPTION'));
          
          if (isNotFoundError) {
            // Remove from local state since the user doesn't have a corresponding staff record
            // This is likely a user with TEACHER role but no staff record
            set({
              teachers: state.teachers.filter((teacher: GraphQLTeacher) => teacher.id !== teacherId),
              teacherStaffUsers: state.teacherStaffUsers.filter((user: TeacherStaffUser) => user.id !== teacherId),
              isLoading: false,
              error: null
            });
            
            console.log('Teacher removed from local state (no corresponding staff record found)');
            return; // Don't throw error, treat as successful removal
          }
          
          // For other errors, set error state and throw
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete teacher';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      // Reset
      reset: () => set(initialState),
});

export const useTeachersStore = create<TeachersState>()(
  typeof window !== 'undefined'
    ? devtools(createStore, { name: 'teachers-store' })
    : createStore
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
      console.log('Fetching teachers by tenant:', { tenantId, role });
      
      // Use the API route that handles authentication properly
      const response = await fetch('/api/teachers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
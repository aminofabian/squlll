import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GraphQLTeacher } from '../../types/teacher';
import { graphqlClient } from '../graphql-client';
import { gql } from 'graphql-request';

const GET_TEACHERS_BY_TENANT = gql`
  query GetTeachersByTenant($tenantId: String!) {
    getTeachersByTenant(tenantId: $tenantId) {
      id
      fullName
      firstName
      lastName
      email
      phoneNumber
      gender
      department
      address
      subject
      employeeId
      dateOfBirth
      isActive
      hasCompletedProfile
      userId
    }
  }
`;

interface TeacherStaffUser {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  department: string;
  address: string;
  subject: string;
  employeeId: string;
  dateOfBirth: string | null;
  isActive: boolean;
  hasCompletedProfile: boolean;
  userId: string | null;
}

interface GetTeachersByTenantResponse {
  getTeachersByTenant: TeacherStaffUser[];
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

  const fetchTeachersByTenant = async (tenantId: string): Promise<GetTeachersByTenantResponse> => {
    if (!tenantId || tenantId.trim() === '') {
      const error = new Error('Tenant ID is required');
      setError(error.message);
      throw error;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await graphqlClient.request<GetTeachersByTenantResponse>(GET_TEACHERS_BY_TENANT, {
        tenantId
      });
      
      console.log('Fetched teachers/staff by tenant:', response.getTeachersByTenant.length);
      setTeacherStaffUsers(response.getTeachersByTenant);
      return response;
    } catch (error) {
      console.error('Error fetching teachers/staff by tenant:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchTeachersByTenant,
    refetch: (tenantId: string) => fetchTeachersByTenant(tenantId),
  };
}; 
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { GraphQLStudent, StudentsResponse } from '../../types/student';
import { graphqlClient } from '../graphql-client';
import { gql } from 'graphql-request';

const GET_STUDENTS = gql`
  query GetStudents {
    students {
      id
      admission_number
      user_id
      feesOwed
      gender
      totalFeesPaid
      createdAt
      isActive
      updatedAt
      streamId
      phone
      grade
      user {
        email
      }
    }
  }
`;

interface GetStudentsResponse {
  students: GraphQLStudent[];
}

interface StudentsState {
  students: GraphQLStudent[];
  isLoading: boolean;
  error: string | null;
  
  // Setters
  setStudents: (students: GraphQLStudent[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getStudentById: (studentId: string) => GraphQLStudent | undefined;
  getStudentsByTenantId: (tenantId: string) => GraphQLStudent[];
  getStudentByAdmissionNumber: (admissionNumber: string) => GraphQLStudent | undefined;
  getStudentByEmail: (email: string) => GraphQLStudent | undefined;
  
  // Actions
  addStudent: (student: GraphQLStudent) => void;
  updateStudent: (studentId: string, updates: Partial<GraphQLStudent>) => void;
  removeStudent: (studentId: string) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  students: [],
  isLoading: false,
  error: null,
};

export const useStudentsStore = create<StudentsState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Setters
      setStudents: (students) => {
        console.log('Setting students:', students.length);
        set({ students, error: null });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Getters
      getStudentById: (studentId) => {
        const state = get();
        return state.students.find(student => student.id === studentId);
      },

      getStudentsByTenantId: (tenantId) => {
        const state = get();
        // Since tenantId is not available on student objects, return all students
        // The filtering should be done at the API level
        return state.students;
      },

      getStudentByAdmissionNumber: (admissionNumber) => {
        const state = get();
        return state.students.find(student => student.admission_number === admissionNumber);
      },

      getStudentByEmail: (email) => {
        const state = get();
        return state.students.find(student => student.user.email === email);
      },

      // Actions
      addStudent: (student) => {
        const state = get();
        set({ students: [...state.students, student] });
      },

      updateStudent: (studentId, updates) => {
        const state = get();
        set({
          students: state.students.map(student =>
            student.id === studentId ? { ...student, ...updates } : student
          )
        });
      },

      removeStudent: (studentId) => {
        const state = get();
        set({
          students: state.students.filter(student => student.id !== studentId)
        });
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'students-store',
    }
  )
);

// React Query hook for fetching students
export const useStudentsQuery = () => {
  const { setStudents, setLoading, setError } = useStudentsStore();

  const fetchStudents = async (): Promise<StudentsResponse> => {
    setLoading(true);
    setError(null);

    try {
      // Use GraphQL client instead of REST API
      const response = await graphqlClient.request<GetStudentsResponse>(GET_STUDENTS);
      const data: StudentsResponse = { students: response.students };
      
      console.log('Fetched students:', data.students.length);
      setStudents(data.students);
      return data;
    } catch (error) {
      console.error('Error fetching students:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchStudents,
    refetch: fetchStudents,
  };
}; 
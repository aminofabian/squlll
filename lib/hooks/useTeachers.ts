import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTeachersStore, useTeachersByTenantQuery } from '../stores/useTeachersStore';

interface TeachersResponse {
  usersByTenant: any[];
}

interface Teacher {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  department?: string;
  role?: string;
  isActive?: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  tenantSubjects: Array<{
    id: string;
    name: string;
  }>;
  tenantGradeLevels: Array<{
    id: string;
    gradeLevel: {
      name: string;
    };
  }>;
  tenantStreams: Array<{
    id: string;
  }>;
  classTeacherAssignments: Array<{
    id: string;
    gradeLevel: {
      gradeLevel: {
        name: string;
      };
    };
  }>;
  tenant: {
    id: string;
    name: string;
  };
}

interface GetTeachersResponse {
  data: {
    getTeachers: Teacher[];
  };
}

const fetchTeachers = async (): Promise<TeachersResponse> => {
  const response = await fetch('/api/teachers');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch teachers');
  }

  return response.json();
};

export const useTeachers = () => {
  const { setTeachers, setLoading, setError } = useTeachersStore();

  const query = useQuery({
    queryKey: ['teachers'],
    queryFn: fetchTeachers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Update store when query state changes
  React.useEffect(() => {
    if (query.isSuccess && query.data) {
      setTeachers(query.data.usersByTenant || []);
      setError(null);
    }
  }, [query.isSuccess, query.data, setTeachers, setError]);

  React.useEffect(() => {
    if (query.isError && query.error) {
      const errorMessage = query.error instanceof Error ? query.error.message : 'An error occurred';
      setError(errorMessage);
    }
  }, [query.isError, query.error, setError]);

  React.useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  return query;
};

// Hook to get teachers from the store
export const useTeachersFromStore = () => {
  const { teachers, isLoading, error } = useTeachersStore();
  return { teachers, isLoading, error };
};

// Hook to get teacher/staff users from the store
export const useTeacherStaffUsersFromStore = () => {
  const { teacherStaffUsers, isLoading, error } = useTeachersStore();
  return { teacherStaffUsers, isLoading, error };
};

// Hook to get a specific teacher by ID
export const useTeacherById = (teacherId: string) => {
  const { getTeacherById } = useTeachersStore();
  return getTeacherById(teacherId);
};

// Hook to get teachers by tenant ID
export const useTeachersByTenantId = (tenantId: string) => {
  const { getTeachersByTenantId } = useTeachersStore();
  return getTeachersByTenantId(tenantId);
};

// Hook to get a teacher by email
export const useTeacherByEmail = (email: string) => {
  const { getTeacherByEmail } = useTeachersStore();
  return getTeacherByEmail(email);
};

// Hook to get a teacher/staff user by ID
export const useTeacherStaffUserById = (userId: string) => {
  const { getTeacherStaffUserById } = useTeachersStore();
  return getTeacherStaffUserById(userId);
};

// Hook to get a teacher/staff user by email
export const useTeacherStaffUserByEmail = (email: string) => {
  const { getTeacherStaffUserByEmail } = useTeachersStore();
  return getTeacherStaffUserByEmail(email);
};

// Hook to fetch teachers/staff by tenant using GraphQL
export const useTeachersByTenant = (tenantId: string, role: string = "TEACHER") => {
  const { fetchTeachersByTenant } = useTeachersByTenantQuery();

  const query = useQuery({
    queryKey: ['teachers-by-tenant', tenantId, role],
    queryFn: () => fetchTeachersByTenant(tenantId, role),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!tenantId, // Only run query if tenantId is provided
  });

  return query;
};

// Hook to delete a teacher
export const useDeleteTeacher = () => {
  const { deleteTeacher } = useTeachersStore();
  
  return {
    deleteTeacher,
  };
};

// Hook to fetch teachers using GraphQL getTeachers query
export const useGetTeachers = () => {
  const query = useQuery({
    queryKey: ['getTeachers'],
    queryFn: async (): Promise<Teacher[]> => {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            query GetTeachers {
              getTeachers {
                id
                fullName
                firstName
                lastName
                email
                phoneNumber
                gender
                department
                role
                isActive
                user {
                  id
                  name
                  email
                }
                tenantSubjects {
                  id
                  name
                }
                tenantGradeLevels {
                  id
                  gradeLevel {
                    name
                  }
                }
                tenantStreams {
                  id
                }
                classTeacherAssignments {
                  id
                  gradeLevel {
                    gradeLevel {
                      name
                    }
                  }
                }
                tenant {
                  id
                  name
                }
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL error');
      }

      if (result.data?.getTeachers) {
        return result.data.getTeachers;
      }

      throw new Error('Invalid response format');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    teachers: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

// Hook to set teacher status (activate/deactivate)
export const useSetTeacherStatus = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const setTeacherStatus = React.useCallback(async (teacherId: string, isActive: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            mutation SetTeacherStatus($teacherId: String!, $isActive: Boolean!) {
              setTeacherStatus(teacherId: $teacherId, isActive: $isActive)
            }
          `,
          variables: {
            teacherId,
            isActive,
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to set teacher status');
      }

      if (!result.data?.setTeacherStatus) {
        throw new Error('Failed to set teacher status');
      }

      return result.data.setTeacherStatus;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    setTeacherStatus,
    isLoading,
    error,
  };
}; 
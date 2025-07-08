import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTeachersStore, useTeachersByTenantQuery } from '../stores/useTeachersStore';
import { TeachersResponse } from '../../types/teacher';

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
      setTeachers(query.data.getTeachersByTenant);
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
export const useTeachersByTenant = (tenantId: string) => {
  const { fetchTeachersByTenant } = useTeachersByTenantQuery();

  const query = useQuery({
    queryKey: ['teachers-by-tenant', tenantId],
    queryFn: () => fetchTeachersByTenant(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!tenantId, // Only run query if tenantId is provided
  });

  return query;
}; 
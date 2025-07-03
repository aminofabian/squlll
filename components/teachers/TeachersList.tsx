"use client"

import React from 'react';
import { useTeachers, useTeachersFromStore } from '../../lib/hooks/useTeachers';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

export const TeachersList: React.FC = () => {
  // Use React Query to fetch teachers
  const { isLoading, isError, error, refetch } = useTeachers();
  
  // Get teachers from the store
  const { teachers } = useTeachersFromStore();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Teachers</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Teachers</h2>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">
              Error loading teachers: {error?.message || 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Teachers ({teachers.length})</h2>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      {teachers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-center">No teachers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{teacher.name}</span>
                  <Badge variant={teacher.userId ? "default" : "secondary"}>
                    {teacher.userId ? 'Active' : 'Pending'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{teacher.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tenant ID</p>
                    <p className="font-medium text-sm text-gray-600">{teacher.tenantId}</p>
                  </div>
                  {teacher.userId && (
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium text-sm text-gray-600">{teacher.userId}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}; 
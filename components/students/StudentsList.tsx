"use client"

import React from 'react';
import { useStudents, useStudentsFromStore } from '../../lib/hooks/useStudents';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

export const StudentsList: React.FC = () => {
  // Use React Query to fetch students
  const { isLoading, isError, error, refetch } = useStudents();
  
  // Get students from the store
  const { students } = useStudentsFromStore();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Students</h2>
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
          <h2 className="text-2xl font-bold">Students</h2>
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
              Error loading students: {error?.message || 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Students ({students.length})</h2>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      {students.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-center">No students found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card key={student.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{student.admission_number}</span>
                  <Badge variant="default">
                    {student.gender}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {student.id}</div>
                  <div><strong>Admission Number:</strong> {student.admission_number}</div>
                  <div><strong>Name:</strong> {student.user.name || (student.user.email ? student.user.email.split('@')[0].replace(/[0-9]/g, '').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim() : 'Unknown')}</div>
                  <div><strong>Email:</strong> {student.user.email}</div>
                  <div><strong>User ID:</strong> {student.user_id}</div>
                  <div><strong>Phone:</strong> {student.phone}</div>
                  <div><strong>Gender:</strong> {student.gender}</div>
                  <div><strong>Grade:</strong> {typeof student.grade === 'object' ? student.grade.gradeLevel.name : student.grade}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}; 
"use client";

import { useState, useEffect } from 'react';

interface TeacherUser {
  id: string;
  name: string;
  email: string;
}

interface TenantSubject {
  id: string;
  name: string;
}

interface TenantGradeLevel {
  id: string;
  name: string;
}

interface TenantStream {
  id: string;
}

interface GradeLevel {
  gradeLevel: {
    name: string;
  };
}

interface ClassTeacherAssignment {
  id: string;
  gradeLevel: GradeLevel;
}

interface Tenant {
  id: string;
  name: string;
}

interface TeacherDetail {
  id: string;
  user: TeacherUser;
  tenantSubjects: TenantSubject[];
  tenantGradeLevels: TenantGradeLevel[];
  tenantStreams: TenantStream[];
  classTeacherAssignments: ClassTeacherAssignment[];
  tenant: Tenant;
}

interface UseTeacherDetailSummaryResult {
  teacherDetail: TeacherDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const GET_TEACHERS_QUERY = `
  query GetTeachers {
    getTeachers {
      id
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
        name
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
`;

const GET_TEACHER_BY_ID_QUERY = `
  query GetTeacherById($teacherId: String!) {
    getTeacherById(teacherId: $teacherId) {
      id
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
        name
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
`;

export function useTeacherDetailSummary(userIdOrTeacherId: string): UseTeacherDetailSummaryResult {
  const [teacherDetail, setTeacherDetail] = useState<TeacherDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeacherDetail = async () => {
    if (!userIdOrTeacherId) return;
    
    setLoading(true);
    setError(null);

    try {
      // First, try to get all teachers to find the teacher ID from user ID
      const teachersResponse = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({
          query: GET_TEACHERS_QUERY,
        }),
      });

      const teachersData = await teachersResponse.json();

      if (teachersData.errors) {
        throw new Error(teachersData.errors[0]?.message || 'GraphQL error');
      }

      const allTeachers = teachersData.data?.getTeachers || [];
      
      // Find the teacher that matches either by user.id or teacher.id
      const matchingTeacher = allTeachers.find((teacher: TeacherDetail) => 
        teacher.user.id === userIdOrTeacherId || teacher.id === userIdOrTeacherId
      );

      if (!matchingTeacher) {
        setError('Teacher not found');
        setLoading(false);
        return;
      }

      // Use the teacher's ID to fetch full details
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({
          query: GET_TEACHER_BY_ID_QUERY,
          variables: {
            teacherId: matchingTeacher.id,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        // If getTeacherById fails, use the data we already have from getTeachers
        if (matchingTeacher) {
          setTeacherDetail(matchingTeacher);
        } else {
          throw new Error(data.errors[0]?.message || 'GraphQL error');
        }
      } else {
        const teacher = data.data?.getTeacherById;
        if (teacher) {
          setTeacherDetail(teacher);
        } else if (matchingTeacher) {
          // Fallback to data from getTeachers
          setTeacherDetail(matchingTeacher);
        } else {
          setError('Teacher not found');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teacher details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherDetail();
  }, [userIdOrTeacherId]);

  return {
    teacherDetail,
    loading,
    error,
    refetch: fetchTeacherDetail,
  };
}


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
  gradeLevel: {
    name: string;
  };
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
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  department?: string;
  role?: string;
  isActive?: boolean;
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
      fullName
      firstName
      lastName
      email
      phoneNumber
      gender
      department
      role
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
`;

const GET_TEACHER_BY_ID_QUERY = `
  query GetTeacherById($teacherId: String!) {
    getTeacherById(teacherId: $teacherId) {
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
      // Check if userIdOrTeacherId is a UUID (teacher ID format)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrTeacherId);
      let teacherIdToUse = userIdOrTeacherId;

      // If not a UUID, it might be a user ID, so we need to find the teacher ID first
      if (!isUUID) {
        const teachersResponse = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          credentials: 'include',
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

        teacherIdToUse = matchingTeacher.id;
      }

      // Fetch full teacher details using getTeacherById
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: GET_TEACHER_BY_ID_QUERY,
          variables: {
            teacherId: teacherIdToUse,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      const teacher = data.data?.getTeacherById;
      if (teacher) {
        setTeacherDetail(teacher);
      } else {
        setError('Teacher not found');
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


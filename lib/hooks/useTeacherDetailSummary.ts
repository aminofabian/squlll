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
  subjectType?: string;
  customSubject?: { name?: string } | null;
  subject?: { name?: string } | null;
}

interface TenantGradeLevel {
  id: string;
  gradeLevel: {
    name: string;
  };
}

interface TenantStream {
  id: string;
  stream?: {
    name: string;
  };
  tenantGradeLevel?: {
    id: string;
    gradeLevel?: {
      name: string;
    };
  };
}

interface ClassTeacherAssignment {
  id: string;
  active?: boolean;
  startDate?: string;
  endDate?: string;
  stream?: {
    id: string;
    stream?: {
      id: string;
      name: string;
    };
    tenantGradeLevel?: {
      id: string;
      gradeLevel?: {
        id: string;
        name: string;
      };
    };
  };
  gradeLevel?: {
    id: string;
    gradeLevel?: {
      id: string;
      name: string;
    };
  };
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
  employeeId?: string;
  dateOfBirth?: string;
  address?: string;
  qualifications?: string;
  hasCompletedProfile?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
      employeeId
      dateOfBirth
      address
      qualifications
      hasCompletedProfile
      createdAt
      updatedAt
      user {
        id
        name
        email
      }
      tenantSubjects {
        id
        name
        subjectType
        customSubject {
          name
        }
        subject {
          name
        }
      }
      tenantGradeLevels {
        id
        gradeLevel {
          name
        }
      }
      tenantStreams {
        id
        stream {
          name
        }
        tenantGradeLevel {
          id
          gradeLevel {
            name
          }
        }
      }
      classTeacherAssignments {
        id
        active
        startDate
        endDate
        stream {
          id
          stream {
            id
            name
          }
          tenantGradeLevel {
            id
            gradeLevel {
              id
              name
            }
          }
        }
        gradeLevel {
          id
          gradeLevel {
            id
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
      employeeId
      dateOfBirth
      address
      qualifications
      hasCompletedProfile
      createdAt
      updatedAt
      user {
        id
        name
        email
      }
      tenantSubjects {
        id
        name
        subjectType
        customSubject {
          name
        }
        subject {
          name
        }
      }
      tenantGradeLevels {
        id
        gradeLevel {
          name
        }
      }
      tenantStreams {
        id
        stream {
          name
        }
        tenantGradeLevel {
          id
          gradeLevel {
            name
          }
        }
      }
      classTeacherAssignments {
        id
        active
        startDate
        endDate
        stream {
          id
          stream {
            id
            name
          }
          tenantGradeLevel {
            id
            gradeLevel {
              id
              name
            }
          }
        }
        gradeLevel {
          id
          gradeLevel {
            id
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

      // Match by teacher record id OR linked user id (table/sidebar may pass either)
      const matchingTeacher = allTeachers.find(
        (teacher: TeacherDetail) =>
          teacher.id === userIdOrTeacherId ||
          teacher.user?.id === userIdOrTeacherId,
      );

      if (!matchingTeacher) {
        setError('Teacher not found');
        setTeacherDetail(null);
        return;
      }

      const teacherIdToUse = matchingTeacher.id;

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


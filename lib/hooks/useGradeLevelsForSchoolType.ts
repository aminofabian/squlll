import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../graphql-client';
import { gql } from 'graphql-request';

const GET_GRADE_LEVELS_FOR_SCHOOL_TYPE = gql`
  query GradeLevelsForSchoolType {
    gradeLevelsForSchoolType {
      id
      isActive
      createdAt
      updatedAt
      shortName
      sortOrder
      streams {
        id
        name
      }
      gradeLevel {
        id
        name
      }
      curriculum {
        id
        name
        schoolType {
          id
          name
        }
      }
    }
  }
`;

export interface GradeLevelForSchoolType {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shortName: string | null;
  sortOrder: number;
  streams: Array<{
    id: string;
    name: string;
  }>;
  gradeLevel: {
    id: string;
    name: string;
  };
  curriculum: {
    id: string;
    name: string;
    schoolType: {
      id: string;
      name: string;
    };
  };
}

interface GetGradeLevelsForSchoolTypeResponse {
  gradeLevelsForSchoolType: GradeLevelForSchoolType[];
}

const fetchGradeLevelsForSchoolType = async (): Promise<GradeLevelForSchoolType[]> => {
  const response = await graphqlClient.request<GetGradeLevelsForSchoolTypeResponse>(GET_GRADE_LEVELS_FOR_SCHOOL_TYPE);
  return response.gradeLevelsForSchoolType;
};

export const useGradeLevelsForSchoolType = () => {
  return useQuery({
    queryKey: ['gradeLevelsForSchoolType'],
    queryFn: fetchGradeLevelsForSchoolType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

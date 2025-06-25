import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../graphql-client';
import { useSchoolConfigStore } from '../stores/useSchoolConfigStore';
import { SchoolConfiguration } from '../types/school-config';
import { gql } from 'graphql-request';

interface GetSchoolConfigResponse {
  getSchoolConfiguration: SchoolConfiguration;
}

const GET_SCHOOL_CONFIG = gql`
  query GetSchoolConfiguration {
    getSchoolConfiguration {
      id
      selectedLevels {
        id
        name
        description
        subjects {
          id
          name
          code
          subjectType
          category
          department
          shortName
          isCompulsory
          totalMarks
          passingMarks
          creditHours
          curriculum
        }
        gradeLevels {
          id
          name
          age
          streams {
            id
            name
            capacity
            isActive
          }
        }
      }
      school {
        schoolId
        schoolName
        subdomain
      }
    }
  }
`;

export function useSchoolConfig() {
  const { setConfig, setLoading, setError } = useSchoolConfigStore();

  const query = useQuery({
    queryKey: ['schoolConfig'],
    queryFn: async () => {
      try {
        setLoading(true);
        const response = await graphqlClient.request<GetSchoolConfigResponse>(GET_SCHOOL_CONFIG);
        const config = response.getSchoolConfiguration;
        
        // Debug: Log the response to see if we're getting gradeLevels
        console.log('School config response:', {
          id: config.id,
          levels: config.selectedLevels.map(l => ({
            name: l.name,
            subjects: l.subjects.length,
            grades: l.gradeLevels?.map(g => ({
              id: g.id,
              name: g.name,
              age: g.age
            }))
          }))
        });
        
        setConfig(config);
        return config;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch school configuration';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });

  return query;
} 
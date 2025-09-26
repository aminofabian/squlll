import { useState, useEffect } from 'react';

interface Stream {
  id: string;
  name: string;
}

interface TenantStream {
  id: string;
  stream: Stream;
}

interface SchoolType {
  id: string;
  name: string;
}

interface Curriculum {
  id: string;
  name: string;
  schoolType: SchoolType;
}

interface GradeLevel {
  id: string;
  name: string;
}

export interface TenantGradeLevel {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shortName: string | null;
  sortOrder: number;
  tenantStreams: TenantStream[];
  gradeLevel: GradeLevel;
  curriculum: Curriculum;
}

export const useGradeLevels = () => {
  const [gradeLevels, setGradeLevels] = useState<TenantGradeLevel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const fetchGradeLevels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GradeLevelsForSchoolType {
              gradeLevelsForSchoolType {
                id
                isActive
                createdAt
                updatedAt
                shortName
                sortOrder
                tenantStreams {
                  id
                  stream {
                    id
                    name
                  }
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
          `
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Error fetching grade levels');
      }
      
      const fetchedGradeLevels = result.data?.gradeLevelsForSchoolType || [];
      console.log('Fetched grade levels:', fetchedGradeLevels);
      
      // Sort grade levels by sortOrder or by name if sortOrder is the same
      const sortedGradeLevels = [...fetchedGradeLevels].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.gradeLevel.name.localeCompare(b.gradeLevel.name);
      });
      
      setGradeLevels(sortedGradeLevels);
      setLastFetchTime(new Date());
      return sortedGradeLevels;
    } catch (err) {
      console.error('Error fetching grade levels:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGradeLevels();
  }, []);

  return {
    gradeLevels,
    isLoading,
    error,
    lastFetchTime,
    fetchGradeLevels
  };
};

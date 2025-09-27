"use client";

import { useState, useEffect } from 'react';
import { Grade } from '../types';
import { mockGrades } from '../data/mockData';

// Define TypeScript interfaces for the GraphQL response
export interface GraphQLGradeLevel {
  id: string;
  name: string;
  code: string;
}

export interface GraphQLGrade {
  id: string;
  name: string;
  level: number;
  section: string;
  gradeLevel: GraphQLGradeLevel;
  studentCount: number;
  isActive: boolean;
  feeStructureId?: string;
  boardingType: 'day' | 'boarding' | 'both';
}

export interface GradesResponse {
  grades: GraphQLGrade[];
}

export const useGradeData = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [usedFallback, setUsedFallback] = useState<boolean>(false);

  const fetchGradeData = async () => {
    setIsLoading(true);
    setError(null);
    setUsedFallback(false);
    
    try {
      // First try to fetch from GraphQL API
      // Using getGradesByTenant instead of grades, following the pattern in other successful queries
      const query = `
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
            }
          }
        }
      `;

      console.log('Fetching grade data from GraphQL API...');
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join(', '));
      }

      // Check if we have valid grade data
      if (result.data && result.data.gradeLevelsForSchoolType && Array.isArray(result.data.gradeLevelsForSchoolType)) {
        console.log(`Received ${result.data.gradeLevelsForSchoolType.length} grade levels from API`);
        
        // Extract all streams from all grade levels and transform them to Grade objects
        const transformedGrades: Grade[] = [];
        
        result.data.gradeLevelsForSchoolType.forEach((tenantGradeLevel: any) => {
          // Get the grade level name from the gradeLevel object
          const gradeLevelName = tenantGradeLevel.gradeLevel?.name || 'Unknown Grade';
          
          // Process tenant streams if they exist
          if (tenantGradeLevel.tenantStreams && Array.isArray(tenantGradeLevel.tenantStreams)) {
            tenantGradeLevel.tenantStreams.forEach((tenantStream: any) => {
              const streamName = tenantStream.stream?.name || '';
              
              transformedGrades.push({
                id: tenantStream.id,
                name: `${gradeLevelName} ${streamName}`.trim(),
                level: 0, // We don't have this in the API response
                section: streamName || 'A',
                boardingType: 'day', // Default since we don't have this in the API
                feeStructureId: '', // This needs to be set elsewhere
                studentCount: 0, // We don't have this information from the API
                isActive: tenantGradeLevel.isActive !== false // default to true if not specified
              });
            });
          } else {
            // If there are no streams, create a single grade for this grade level
            transformedGrades.push({
              id: tenantGradeLevel.id,
              name: gradeLevelName,
              level: 0, // Default level
              section: 'A', // Default section
              boardingType: 'day',
              feeStructureId: '',
              studentCount: 0,
              isActive: tenantGradeLevel.isActive !== false
            });
          }
        });
        
        console.log(`Transformed ${transformedGrades.length} tenant streams into grades`);
        setGrades(transformedGrades);
        setLastFetchTime(new Date());
        setUsedFallback(false);
        return transformedGrades;
      }
      
      // If we got an empty or invalid response, use fallback data
      console.warn('No valid grade data in API response, using fallback data');
      setGrades(mockGrades);
      setLastFetchTime(new Date());
      setUsedFallback(true);
      return mockGrades;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching grades:', err);
      
      // Use fallback data when API fails
      console.log('Using fallback grade data due to API error');
      setGrades(mockGrades);
      setLastFetchTime(new Date());
      setUsedFallback(true);
      return mockGrades;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch grade data on initial mount
  useEffect(() => {
    fetchGradeData();
  }, []);

  return {
    grades,
    isLoading,
    error,
    lastFetchTime,
    usedFallback,
    fetchGradeData,
  };
};

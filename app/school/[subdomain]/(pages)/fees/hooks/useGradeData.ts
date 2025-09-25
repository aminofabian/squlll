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
      const query = `
        query GetGrades {
          grades {
            id
            name
            level
            section
            gradeLevel {
              id
              name
              code
            }
            studentCount
            isActive
            feeStructureId
            boardingType
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
      if (result.data && result.data.grades && Array.isArray(result.data.grades) && result.data.grades.length > 0) {
        console.log(`Received ${result.data.grades.length} grades from API`);
        
        // Transform GraphQL grades to our Grade interface
        const transformedGrades = result.data.grades.map((grade: GraphQLGrade) => ({
          id: grade.id,
          name: grade.name || grade.gradeLevel?.name || 'Unknown Grade',
          level: grade.level || 0,
          section: grade.section || 'A',
          boardingType: grade.boardingType || 'day',
          feeStructureId: grade.feeStructureId,
          studentCount: grade.studentCount || 0,
          isActive: grade.isActive !== false // default to true if not specified
        }));
        
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

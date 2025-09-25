"use client";

import { useState, useEffect } from 'react';

// Define TypeScript interfaces for the GraphQL response
export interface GraphQLFeeStructureItem {
  id: string;
  feeBucket: {
    name: string;
    id: string;
  };
  amount: number;
  isMandatory: boolean;
}

export interface GraphQLTerm {
  name: string;
}

export interface GraphQLAcademicYear {
  name: string;
}

export interface GraphQLFeeStructure {
  id: string;
  name: string;
  academicYear: GraphQLAcademicYear | null;
  term: GraphQLTerm | null;
  items: GraphQLFeeStructureItem[];
  isActive: boolean;
}

export interface FeeStructuresResponse {
  feeStructures: GraphQLFeeStructure[];
}

export const useGraphQLFeeStructures = () => {
  const [structures, setStructures] = useState<GraphQLFeeStructure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const fetchFeeStructures = async () => {
    setIsLoading(true);
    setError(null);
    console.log('Fetching fee structures from GraphQL API...');

    try {
      const query = `
        query GetFeeStructures {
          feeStructures {
            id
            name
            academicYear {
              name
            }
            term {
              name
            }
            items {
              id
              feeBucket {
                name
                id
              }
              amount
              isMandatory
            }
            isActive
          }
        }
      `;

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
        }),
        cache: 'no-store', // Ensure fresh data
      });

      console.log(`GraphQL response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Raw GraphQL response:', result);
      
      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join(', '));
      }

      if (!result.data) {
        throw new Error('GraphQL response missing data field');
      }

      if (!result.data.feeStructures) {
        console.warn('GraphQL response missing feeStructures field');
        setStructures([]);
        return [];
      }

      console.log(`Received ${result.data.feeStructures.length} fee structures`);
      setStructures(result.data.feeStructures);
      setLastFetchTime(new Date());
      return result.data.feeStructures;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching fee structures:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    structures,
    isLoading,
    error,
    lastFetchTime,
    fetchFeeStructures,
  };
};

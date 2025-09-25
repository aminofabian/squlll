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

// Interface for the update fee structure input
export interface UpdateFeeStructureInput {
  name?: string;
  academicYearId?: string;
  termId?: string;
  isActive?: boolean;
}

export const useGraphQLFeeStructures = () => {
  const [structures, setStructures] = useState<GraphQLFeeStructure[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  /**
   * Updates a fee structure using GraphQL mutation
   */
  const updateFeeStructure = async (id: string, input: UpdateFeeStructureInput): Promise<string | null> => {
    setIsUpdating(true);
    setUpdateError(null);
    console.log('Updating fee structure with ID:', id, 'Input:', input);

    try {
      const mutation = `
        mutation UpdateFeeStructure($id: ID!, $input: UpdateFeeStructureInput!) {
          updateFeeStructure(id: $id, input: $input) {
            id
            name
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
          query: mutation,
          variables: {
            id,
            input
          }
        }),
      });

      console.log(`GraphQL update response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Update response:', result);
      
      if (result.errors) {
        const errorMessage = result.errors.map((e: any) => e.message).join(', ');
        console.error('GraphQL errors:', result.errors);
        throw new Error(errorMessage);
      }

      if (!result.data?.updateFeeStructure) {
        throw new Error('GraphQL response missing updateFeeStructure field');
      }

      // Update the structure in the local state
      const updatedStructure = result.data.updateFeeStructure;
      setStructures(prev => prev.map(structure => 
        structure.id === id ? { ...structure, ...updatedStructure } : structure
      ));

      console.log('Fee structure updated successfully:', updatedStructure);
      return updatedStructure.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setUpdateError(errorMessage);
      console.error('Error updating fee structure:', err);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Deletes a fee structure using GraphQL mutation
   */
  const deleteFeeStructure = async (id: string): Promise<boolean> => {
    setIsDeleting(true);
    setDeleteError(null);
    console.log('Deleting fee structure with ID:', id);

    try {
      const mutation = `
        mutation DeleteFeeStructure($id: ID!) {
          deleteFeeStructure(id: $id)
        }
      `;

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            id
          }
        }),
      });

      console.log(`GraphQL delete response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Delete response:', result);
      
      if (result.errors) {
        const errorMessage = result.errors.map((e: any) => e.message).join(', ');
        console.error('GraphQL errors:', result.errors);
        throw new Error(errorMessage);
      }

      if (result.data?.deleteFeeStructure !== true) {
        throw new Error('Failed to delete fee structure');
      }

      // Remove the structure from local state
      setStructures(prev => prev.filter(structure => structure.id !== id));

      console.log('Fee structure deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setDeleteError(errorMessage);
      console.error('Error deleting fee structure:', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    structures,
    isLoading,
    isUpdating,
    isDeleting,
    error,
    updateError,
    deleteError,
    lastFetchTime,
    fetchFeeStructures,
    updateFeeStructure,
    deleteFeeStructure,
  };
};

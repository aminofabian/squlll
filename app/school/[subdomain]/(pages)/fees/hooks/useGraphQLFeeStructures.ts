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
  id: string;
  name: string;
}

export interface GraphQLAcademicYear {
  id: string;
  name: string;
}

export interface GraphQLGradeLevel {
  id: string;
  shortName: string | null;
  gradeLevel?: {
    id: string;
    name: string;
  };
  name?: string; // Fallback field if available
}

export interface GraphQLFeeStructure {
  id: string;
  name: string;
  academicYear: GraphQLAcademicYear | null;
  terms: GraphQLTerm[] | null;
  gradeLevels: GraphQLGradeLevel[];
  items: GraphQLFeeStructureItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeStructuresResponse {
  feeStructures: GraphQLFeeStructure[];
}

// Interface for the update fee structure input
export interface UpdateFeeStructureInput {
  name?: string;
  academicYearId?: string;
  termIds?: string[];
  isActive?: boolean;
}

// Interface for creating a fee structure
export interface CreateFeeStructureInput {
  name: string;
  academicYearId: string;
  termIds: string[];
  gradeLevelIds: string[];
}

// Interface for creating a fee structure with items
export interface FeeStructureItemInput {
  feeBucketId: string;
  amount: number;
  isMandatory: boolean;
}

export interface CreateFeeStructureWithItemsInput {
  name: string;
  academicYearId: string;
  termIds: string[];
  gradeLevelIds: string[];
  items: FeeStructureItemInput[];
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
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreatingWithItems, setIsCreatingWithItems] = useState<boolean>(false);
  const [createWithItemsError, setCreateWithItemsError] = useState<string | null>(null);

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
              id
              name
            }
            terms {
              id
              name
            }
            gradeLevels {
              id
              shortName
              gradeLevel {
                id
                name
              }
            }
            items {
              id
              feeBucket {
                id
                name
              }
              amount
              isMandatory
            }
            isActive
            createdAt
            updatedAt
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

  /**
   * Creates a fee structure using GraphQL mutation
   */
  const createFeeStructure = async (input: CreateFeeStructureInput): Promise<GraphQLFeeStructure | null> => {
    setIsCreating(true);
    setCreateError(null);
    console.log('Creating fee structure with input:', input);

    try {
      const mutation = `
        mutation CreateFeeStructure($input: CreateFeeStructureInput!) {
          createFeeStructure(input: $input) {
            id
            name
            academicYear {
              id
              name
            }
            terms {
              id
              name
            }
            gradeLevels {
              id
              shortName
              gradeLevel {
                id
                name
              }
            }
            isActive
            createdAt
            updatedAt
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
            input
          }
        }),
      });

      console.log(`GraphQL create response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Create response:', result);
      
      if (result.errors) {
        // Extract the primary error message
        const primaryError = result.errors[0];
        const errorMessage = primaryError?.message || 'Unknown GraphQL error';
        const errorCode = primaryError?.extensions?.code;
        
        console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
        
        // Capture the original error message and raw error data
        const errorWithDetails = new Error(errorMessage);
        
        // Use a type assertion to add custom properties without TypeScript errors
        const enhancedError = errorWithDetails as Error & {
          graphqlError: boolean;
          code?: string;
          extensions?: any;
          rawGraphQLResponse?: any;
          rawGraphQLErrors?: any[];
        };
        
        // Add all the GraphQL error details we have
        enhancedError.graphqlError = true;
        enhancedError.rawGraphQLResponse = result;
        enhancedError.rawGraphQLErrors = result.errors;
        
        if (errorCode) {
          enhancedError.code = errorCode;
        }
        if (primaryError?.extensions) {
          enhancedError.extensions = primaryError.extensions;
        }
        
        throw enhancedError;
      }

      if (!result.data?.createFeeStructure) {
        throw new Error('GraphQL response missing createFeeStructure field');
      }

      // Add the new structure to the local state
      const newStructure = result.data.createFeeStructure;
      setStructures(prev => [...prev, newStructure]);

      console.log('Fee structure created successfully:', newStructure);
      return newStructure;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setCreateError(errorMessage);
      console.error('Error creating fee structure:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Creates a fee structure with items using the updated GraphQL mutation
   */
  const createFeeStructureWithItems = async (input: CreateFeeStructureWithItemsInput): Promise<GraphQLFeeStructure | null> => {
    setIsCreatingWithItems(true);
    setCreateWithItemsError(null);
    console.log('Creating fee structure with items input:', input);

    try {
      const mutation = `
        mutation CreateFeeStructureWithItems($input: CreateFeeStructureWithItemsInput!) {
          createFeeStructureWithItems(input: $input) {
            id
            name
            academicYear {
              id
              name
            }
            terms {
              id
              name
            }
            gradeLevels {
              id
              shortName
              gradeLevel {
                id
                name
              }
            }
            items {
              id
              feeBucket {
                id
                name
                description
              }
              amount
              isMandatory
            }
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
            input
          }
        }),
      });

      console.log(`GraphQL create with items response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Create with items response:', result);
      
      if (result.errors) {
        // Extract the primary error message
        const primaryError = result.errors[0];
        const errorMessage = primaryError?.message || 'Unknown GraphQL error';
        const errorCode = primaryError?.extensions?.code;
        
        console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
        
        // Capture the original error message and raw error data
        const errorWithDetails = new Error(errorMessage);
        
        // Use a type assertion to add custom properties without TypeScript errors
        const enhancedError = errorWithDetails as Error & {
          graphqlError: boolean;
          code?: string;
          extensions?: any;
          rawGraphQLResponse?: any;
          rawGraphQLErrors?: any[];
        };
        
        // Add all the GraphQL error details we have
        enhancedError.graphqlError = true;
        enhancedError.rawGraphQLResponse = result;
        enhancedError.rawGraphQLErrors = result.errors;
        
        if (errorCode) {
          enhancedError.code = errorCode;
        }
        if (primaryError?.extensions) {
          enhancedError.extensions = primaryError.extensions;
        }
        
        throw enhancedError;
      }

      if (!result.data?.createFeeStructureWithItems) {
        throw new Error('GraphQL response missing createFeeStructureWithItems field');
      }

      // Add the new structure to the local state
      const newStructure = result.data.createFeeStructureWithItems;
      setStructures(prev => [...prev, newStructure]);

      console.log('Fee structure with items created successfully:', newStructure);
      return newStructure;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setCreateWithItemsError(errorMessage);
      console.error('Error creating fee structure with items:', err);
      return null;
    } finally {
      setIsCreatingWithItems(false);
    }
  };

  return {
    structures,
    isLoading,
    isUpdating,
    isDeleting,
    isCreating,
    isCreatingWithItems,
    error,
    updateError,
    deleteError,
    createError,
    createWithItemsError,
    lastFetchTime,
    fetchFeeStructures,
    createFeeStructure,
    createFeeStructureWithItems,
    updateFeeStructure,
    deleteFeeStructure,
  };
};

"use client";

import { useState, useEffect, useCallback } from 'react';

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
  isActive?: boolean;
  gradeLevelIds?: string[];
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
  termIds: string[];
}

export interface CreateFeeStructureWithItemsInput {
  name: string;
  academicYearId: string;
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

  const fetchFeeStructures = useCallback(async () => {
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
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('GraphQL request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500)
        });
        throw new Error(`GraphQL request failed with status ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Raw GraphQL response:', result);
      
      if (result.errors) {
        const errorMessages = result.errors.map((e: any) => e.message).join(', ');
        console.error('GraphQL errors:', result.errors);
        throw new Error(errorMessages);
      }

      if (!result.data) {
        console.error('GraphQL response missing data field. Full response:', result);
        throw new Error('GraphQL response missing data field');
      }

      if (!result.data.feeStructures) {
        console.warn('GraphQL response missing feeStructures field. Available data keys:', Object.keys(result.data || {}));
        setStructures([]);
        setError('GraphQL response missing feeStructures field');
        return [];
      }

      console.log(`✅ Successfully received ${result.data.feeStructures.length} fee structures`);
      setStructures(result.data.feeStructures);
      setError(null); // Clear any previous errors
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
  }, []); // Empty deps - function doesn't depend on any props or state

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
            gradeLevels {
              id
              shortName
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
            id,
            input
          }
        }),
      });

      console.log(`GraphQL update response status: ${response.status}`);
      console.log('📤 Update request details:', {
        id,
        input: JSON.stringify(input, null, 2),
        url: '/api/graphql',
        method: 'POST'
      });

      // Parse JSON even if status is not ok - GraphQL may return errors in JSON body
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        // If we can't parse JSON, throw a generic error
        const text = await response.text();
        console.error('❌ Failed to parse JSON response. Raw response:', text);
        throw new Error(`GraphQL request failed with status ${response.status} and could not parse response`);
      }

      console.log('📥 Update response:', JSON.stringify(result, null, 2));
      
      // Check for GraphQL errors first (even if status is 200)
      if (result.errors) {
        // Extract detailed error information
        const errorMessages = result.errors.map((e: any) => {
          const baseMessage = e.message || 'Unknown error';
          const exceptionMessage = e.extensions?.exception?.message;
          const code = e.extensions?.code;
          const originalError = e.extensions?.originalError?.message;
          const statusCode = e.extensions?.exception?.status;
          
          let detailedMessage = baseMessage;
          if (code) detailedMessage += ` [${code}]`;
          if (statusCode) detailedMessage += ` (HTTP ${statusCode})`;
          if (exceptionMessage && exceptionMessage !== baseMessage) {
            detailedMessage += `: ${exceptionMessage}`;
          } else if (originalError) {
            detailedMessage += `: ${originalError}`;
          }
          
          return detailedMessage;
        }).join(', ');
        
        console.error('❌ GraphQL Update Fee Structure Error:', {
          message: result.errors[0]?.message,
          path: result.errors[0]?.path,
          code: result.errors[0]?.extensions?.code,
          exception: result.errors[0]?.extensions?.exception,
          originalError: result.errors[0]?.extensions?.originalError,
          fullError: result.errors[0],
          allErrors: result.errors,
          // Log the full error object as JSON for easier inspection
          fullErrorJSON: JSON.stringify(result.errors[0], null, 2),
          allErrorsJSON: JSON.stringify(result.errors, null, 2)
        });
        
        throw new Error(errorMessages);
      }

      // If no GraphQL errors but HTTP status is not ok, throw generic error
      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
      }

      if (!result.data?.updateFeeStructure) {
        throw new Error('GraphQL response missing updateFeeStructure field');
      }

      // Update the structure in the local state
      const updatedStructure = result.data.updateFeeStructure;
      setStructures(prev => prev.map(structure => 
        structure.id === id ? { 
          ...structure, 
          name: updatedStructure.name,
          isActive: updatedStructure.isActive,
          gradeLevels: updatedStructure.gradeLevels || structure.gradeLevels
        } : structure
      ));

      // Refresh the full list to ensure proper grouping and processing
      await fetchFeeStructures();

      console.log('Fee structure updated successfully:', updatedStructure);
      setUpdateError(null); // Clear any previous errors
      return updatedStructure.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setUpdateError(errorMessage);
      console.error('Error updating fee structure:', err);
      // Re-throw the error so the caller can handle it
      throw err;
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
      console.log('📦 Delete response:', JSON.stringify(result, null, 2));
      
      if (result.errors) {
        // Extract detailed error information
        const errorMessages = result.errors.map((e: any) => {
          const baseMessage = e.message || 'Unknown error';
          
          // Check for additional error details in extensions
          const exceptionMessage = e.extensions?.exception?.message;
          const exceptionStack = e.extensions?.exception?.stack;
          const code = e.extensions?.code;
          const originalError = e.extensions?.originalError?.message;
          
          // Build detailed error message
          let detailedMessage = baseMessage;
          if (code) detailedMessage += ` [${code}]`;
          if (exceptionMessage && exceptionMessage !== baseMessage) {
            detailedMessage += `: ${exceptionMessage}`;
          } else if (originalError) {
            detailedMessage += `: ${originalError}`;
          }
          
          return detailedMessage;
        }).join(', ');
        
        // Log full error details for debugging
        console.error('❌ GraphQL Delete Fee Structure Error:', {
          message: result.errors[0]?.message,
          path: result.errors[0]?.path,
          code: result.errors[0]?.extensions?.code,
          exception: result.errors[0]?.extensions?.exception,
          originalError: result.errors[0]?.extensions?.originalError,
          fullError: result.errors[0],
          allErrors: result.errors
        });
        
        throw new Error(errorMessages);
      }

      // Check the response more carefully
      console.log('🔍 Checking delete response data:', {
        hasData: !!result.data,
        deleteFeeStructure: result.data?.deleteFeeStructure,
        dataType: typeof result.data?.deleteFeeStructure,
        fullData: result.data
      });

      // Handle different response formats
      if (!result.data) {
        console.error('❌ No data in response');
        throw new Error('Failed to delete fee structure: No response data from server');
      }

      const deleteResult = result.data.deleteFeeStructure;
      
      // Check if result is explicitly false or null
      if (deleteResult === false || deleteResult === null) {
        console.error('❌ Delete returned false or null');
        throw new Error('Failed to delete fee structure: The structure may be in use or does not exist');
      }

      // Check if result is true (success)
      if (deleteResult === true) {
        console.log('✅ Delete mutation returned true - success!');
      } else {
        // Unexpected response format
        console.error('❌ Unexpected delete response format:', deleteResult);
        throw new Error(`Failed to delete fee structure: Unexpected response format. Got: ${JSON.stringify(deleteResult)}`);
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

      // Refresh the full list to ensure proper grouping and processing
      await fetchFeeStructures();

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

      // Refresh the full list to ensure proper grouping and processing
      await fetchFeeStructures();

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

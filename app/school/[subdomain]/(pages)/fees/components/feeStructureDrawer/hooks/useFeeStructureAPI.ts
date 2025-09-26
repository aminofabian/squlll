'use client'

import { useState } from 'react'
import { useToast } from '../ToastNotification'
import { FeeStructureForm } from '../../../types'

export const useFeeStructureAPI = () => {
  const { showToast } = useToast()
  const [isCreatingBucket, setIsCreatingBucket] = useState(false)

  // GraphQL mutation for creating fee bucket
  const createFeeBucket = async (bucketData: { name: string; description: string }) => {
    setIsCreatingBucket(true)
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateFeeBucket($input: CreateFeeBucketInput!) {
              createFeeBucket(input: $input) {
                id
                name
                description
                isActive
                createdAt
              }
            }
          `,
          variables: {
            input: bucketData
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to create fee bucket')
      }

      showToast(`✅ Fee bucket "${bucketData.name}" created successfully!`, 'success')
      return result.data.createFeeBucket
    } catch (error) {
      console.error('Error creating fee bucket:', error)
      showToast(`❌ Failed to create fee bucket: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      throw error
    } finally {
      setIsCreatingBucket(false)
    }
  }

  // Update existing bucket via GraphQL
  const updateFeeBucket = async (bucketId: string, bucketData: { name: string; description: string; isActive?: boolean }) => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateFeeBucket($id: ID!, $input: UpdateFeeBucketInput!) {
              updateFeeBucket(id: $id, input: $input) {
                id
                name
                description
                isActive
              }
            }
          `,
          variables: {
            id: bucketId,
            input: bucketData
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to update fee bucket')
      }

      showToast(`✅ Fee bucket updated successfully!`, 'success')
      return result.data.updateFeeBucket
    } catch (error) {
      console.error('Error updating fee bucket:', error)
      showToast(`❌ Failed to update fee bucket: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      throw error
    }
  }

  // Delete existing bucket via GraphQL
  const deleteFeeBucket = async (bucketId: string) => {
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteFeeBucket($id: ID!) {
              deleteFeeBucket(id: $id)
            }
          `,
          variables: {
            id: bucketId
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to delete fee bucket')
      }

      showToast(`✅ Fee bucket deleted successfully!`, 'success')
    } catch (error) {
      console.error('Error deleting fee bucket:', error)
      showToast(`❌ Failed to delete fee bucket: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  // Create fee structure via GraphQL
  const createFeeStructureGraphQL = async (name: string, academicYear: string, termName: string, academicYears: any[]): Promise<string | null> => {
    try {
      console.log('Creating fee structure with name:', name);
      
      // Find academic year ID by name
      const academicYearObj = academicYears.find(year => year.name === academicYear);
      if (!academicYearObj) {
        console.error(`Academic year "${academicYear}" not found in available years:`, academicYears.map(y => y.name));
        showToast(`❌ Academic year "${academicYear}" not found. Available years: ${academicYears.map(y => y.name).join(', ')}`, 'error');
        return null;
      }
      
      // Find term ID by name for the selected academic year
      const terms = academicYearObj.terms || [];
      console.log('Looking for term:', termName);
      
      const termObj = terms.find(term => term.name === termName);
      if (!termObj) {
        console.error(`Term "${termName}" not found in available terms:`, terms.map(t => t.name));
        showToast(`❌ Term "${termName}" not found for academic year ${academicYear}. Available terms: ${terms.map(t => t.name).join(', ') || 'None'}`, 'error');
        return null;
      }
      
      console.log(`Creating fee structure with academicYearId: ${academicYearObj.id}, termId: ${termObj.id}`);
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Using the exact mutation format provided
          query: `
            mutation CreateFeeStructure {
              createFeeStructure(
                input: {
                  name: "${name.replace(/"/g, '\"')}" 
                  academicYearId: "${academicYearObj.id}"
                  termId: "${termObj.id}"
                }
              ) {
                id
                name
                academicYear { id name }
                term { id name }
              }
            }
          `
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
        
        // Extract useful information from the errors
        const errorMessages = result.errors.map((err: any) => {
          // Look for field validation errors
          if (err.message.includes('got invalid value') && err.message.includes('Field')) {
            const fieldMatch = err.message.match(/Field "([^"]+)" of required type/);
            const field = fieldMatch ? fieldMatch[1] : 'unknown field';
            return `Missing required field: ${field}`;
          }
          
          // Check for specific error codes
          if (err.extensions?.code === 'NOTFOUNDEXCEPTION') {
            return `Resource not found: The academic year or term may not exist on the server.`;
          } else if (err.extensions?.code === 'BAD_USER_INPUT') {
            return `Invalid input: ${err.message}`;
          } else if (err.extensions?.code === 'VALIDATION_ERROR') {
            return `Validation error: ${err.message}`;
          }
          
          return err.message;
        });
        
        // Show the first few errors (avoid overwhelming the user)
        const displayErrors = errorMessages.slice(0, 2).join('\n');
        showToast(`\u274c GraphQL error: ${displayErrors}`, 'error');
        throw new Error(displayErrors || 'Failed to create fee structure');
      }

      // Log the full response for debugging
      console.log('Fee structure creation response:', JSON.stringify(result, null, 2));
      
      if (result.data?.createFeeStructure?.id) {
        const feeStructureId = result.data.createFeeStructure.id;
        console.log('Fee structure created successfully with ID:', feeStructureId);
        showToast(`✅ Fee structure "${name}" created with ID: ${feeStructureId}`, 'success');
        return feeStructureId;
      } else {
        console.error('Fee structure created but ID is missing in response:', result);
        showToast(`⚠ Fee structure created but ID is missing in response`, 'error');
        return null;
      }
    } catch (error) {
      console.error('Error creating fee structure via GraphQL:', error)
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'Failed to create fee structure'}`, 'error');
      return null
    }
  }

  // Create fee structure item in database
  const createFeeStructureItem = async (feeStructureId: string, feeBucketId: string, amount: number, isMandatory: boolean) => {
    try {
      // Use the actual fee structure ID passed to the function
      const formattedAmount = parseFloat(amount.toFixed(2))
      
      console.log(`Creating fee structure item:`, {
        feeStructureId,
        feeBucketId,
        amount: formattedAmount,
        isMandatory
      })
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateFeeStructureItem($input: CreateFeeStructureItemInput!) {
              createFeeStructureItem(input: $input) {
                id
                feeBucket {
                  id
                  name
                  description
                }
                feeStructure {
                  id
                  name
                  academicYear {
                    name
                  }
                  term {
                    name
                  }
                }
                amount
                isMandatory
              }
            }
          `,
          variables: {
            input: {
              feeStructureId,
              feeBucketId,
              amount: formattedAmount,
              isMandatory
            }
          }
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.errors) {
        console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2))
        
        // Extract detailed error information
        const errorDetail = result.errors[0];
        let errorMessage = errorDetail?.message || 'Failed to create fee structure item';
        
        // Check for specific error types
        if (errorDetail?.extensions?.code === 'NOTFOUNDEXCEPTION') {
          errorMessage = `Fee structure not found with ID: ${feeStructureId}. Make sure you're using a valid UUID from createFeeStructure.`;
        } else if (errorDetail?.extensions?.code === 'BAD_USER_INPUT') {
          if (errorMessage.includes('feeStructureId')) {
            errorMessage = `Invalid fee structure ID format: ${feeStructureId}. Must be a valid UUID.`;
          }
        }
        
        showToast(`\u274c ${errorMessage}`, 'error');
        throw new Error(errorMessage)
      }
      
      console.log(`Fee structure item created successfully:`, result.data.createFeeStructureItem)
      showToast(`✅ Fee item created successfully!`, 'success');
      return result.data.createFeeStructureItem
    } catch (error) {
      console.error('Error creating fee structure item:', error)
      showToast(`❌ ${error instanceof Error ? error.message : 'Unknown error creating fee item'}`, 'error');
      throw error
    }
  }

  // Handle save fee structure - this is the main entry point
  const handleSaveStructure = async (
    formData: FeeStructureForm, 
    selectedGrades: string[], 
    availableGrades: any[],
    academicYears: any[],
    onSave: (formData: FeeStructureForm) => Promise<string | null>
  ) => {
    try {
      // Create separate fee structures for each selected grade
      for (const gradeId of selectedGrades) {
        const gradeData = {
          ...formData,
          grade: gradeId,
          name: selectedGrades.length > 1 
            ? `${formData.name} - ${availableGrades.find(g => g.id === gradeId)?.name || gradeId}`
            : formData.name
        }
        
        // Save the fee structure first via GraphQL and get the ID (use first term)
        const firstTerm = gradeData.termStructures[0] || { term: '', academicYear: '' }
        const firstTermName = firstTerm.term || 'Term 1'
        
        // Use term-specific academic year if available, otherwise use the global one
        const termAcademicYear = firstTerm.academicYear || gradeData.academicYear
        
        // Try to create the fee structure using GraphQL
        let feeStructureId = await createFeeStructureGraphQL(gradeData.name, termAcademicYear, firstTermName, academicYears)
        
        // If GraphQL creation failed and we have a fallback handler, try that
        if (!feeStructureId) {
          console.log(`GraphQL fee structure creation failed, trying fallback handler for ${gradeData.name}`);
          try {
            // Try fallback handler
            const fallbackId = await onSave(gradeData);
            
            // Check if the fallback ID is a valid UUID
            const isValidUUID = typeof fallbackId === 'string' && 
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fallbackId);
            
            if (isValidUUID) {
              feeStructureId = fallbackId;
              console.log(`Fallback handler returned valid UUID: ${feeStructureId}`);
            } else {
              console.error(`Fallback handler returned invalid UUID format: ${fallbackId}`);
              showToast(`\u26a0 Fallback handler returned invalid ID format`, 'error');
              continue;
            }
          } catch (fallbackError) {
            console.error('Fallback handler also failed:', fallbackError);
            showToast(`\u274c Failed to create fee structure: Could not find valid academic year or term IDs`, 'error');
            continue; // Skip this grade and try the next one
          }
        }
        
        // Validate the fee structure ID format - it should be a UUID
        const isValidUUID = typeof feeStructureId === 'string' && 
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(feeStructureId);
        
        if (!isValidUUID) {
          console.error('Invalid fee structure ID format:', feeStructureId);
          showToast(`\u274c Invalid fee structure ID format. Expected UUID format.`, 'error');
          continue; // Skip this grade and try the next one
        }
          
        if (feeStructureId) {
          // Create fee structure items for each bucket component
          let itemsCreated = 0
          let itemsFailed = 0
          
          for (const term of formData.termStructures) {
            // Only create items for the same term as the created fee structure
            if (term.term !== firstTermName) {
              console.log(`Skipping term ${term.term} (created structure term is ${firstTermName})`)
              continue
            }
            console.log(`Processing term: ${term.term} - Academic Year: ${term.academicYear || formData.academicYear}`)
            for (const bucket of term.buckets) {
              console.log(`Processing bucket: ${bucket.name} (ID: ${bucket.id})`)
              if (bucket.id) { // Only create items for buckets with server IDs
                for (const component of bucket.components) {
                  const amountNum = parseFloat(component.amount) || 0
                  console.log(`Processing component: ${component.name} (Amount: ${amountNum})`)
                  
                  if (amountNum > 0) { // Only create items with valid amounts
                    try {
                      console.log(`Creating fee structure item:`, {
                        feeStructureId,
                        bucketId: bucket.id,
                        amount: amountNum,
                        isMandatory: !bucket.isOptional
                      })
                      
                      await createFeeStructureItem(
                        feeStructureId,
                        bucket.id,
                        amountNum,
                        !bucket.isOptional
                      )
                      
                      itemsCreated++
                    } catch (itemError) {
                      console.error('Failed to create fee structure item:', itemError)
                      itemsFailed++
                    }
                  }
                }
              }
            }
          }
          
          // Show a summary of created items
          if (itemsCreated > 0) {
            showToast(`✅ Created ${itemsCreated} fee items successfully!`, 'success')
          }
          
          if (itemsFailed > 0) {
            showToast(`⚠️ Failed to create ${itemsFailed} fee items`, 'error')
          }
        }
      }

      return true
    } catch (error) {
      console.error('Error saving fee structure:', error)
      showToast(`❌ Failed to save fee structure: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
      return false
    }
  }

  return {
    isCreatingBucket,
    createFeeBucket,
    updateFeeBucket,
    deleteFeeBucket,
    createFeeStructureGraphQL,
    createFeeStructureItem,
    handleSaveStructure
  }
}

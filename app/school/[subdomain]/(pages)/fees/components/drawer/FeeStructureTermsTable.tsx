'use client'

import React from 'react'
import { Sparkles } from "lucide-react"
import {
  TableHeader,
  FeeItemRow,
  ActionsRow,
  TotalRow
} from './FeeStructureTable'

interface FeeStructureTermsTableProps {
  formData: any
  currentEditingField: string | null
  setCurrentEditingField: (field: string | null) => void
  updateComponent: (termIndex: number, bucketIndex: number, componentIndex: number, field: keyof any, value: any) => void
  updateBucket: (termIndex: number, bucketIndex: number, field: keyof any, value: any) => void
  calculateBucketTotal: (termIndex: number, bucketIndex: number) => number
  calculateTermTotal: (termIndex: number) => number
  calculateGrandTotal: () => number
  addComponent: (termIndex: number, bucketIndex: number) => void
  removeComponent: (termIndex: number, bucketIndex: number, componentIndex: number) => void
  feeBuckets: any[]
  addBucket: (termIndex: number) => void
  deleteFormBucket: (termIndex: number, bucketIndex: number) => void
  deleteFeeBucket: (bucketId: string) => void
  setEditingBucket: (bucket: any) => void
  setShowEditBucketModal: (show: boolean) => void
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export const FeeStructureTermsTable: React.FC<FeeStructureTermsTableProps> = ({
  formData,
  currentEditingField,
  setCurrentEditingField,
  updateComponent,
  updateBucket,
  calculateBucketTotal,
  calculateTermTotal,
  calculateGrandTotal,
  addComponent,
  removeComponent,
  feeBuckets,
  addBucket,
  deleteFormBucket,
  deleteFeeBucket,
  setEditingBucket,
  setShowEditBucketModal,
  showToast
}) => {
  
  // Ensure we use all buckets without filtering
  const allFeeBuckets = feeBuckets
  
  // Function to reset a component to ensure it shows all buckets
  const resetComponent = (termIndex: number, bucketIndex: number, actualComponentIndex: number) => {
    // Reset both the bucket and component to force a refresh of options
    updateBucket(termIndex, bucketIndex, 'name', '')
    updateComponent(termIndex, bucketIndex, actualComponentIndex, 'name', '')
  }
  
  return (
    <table className="w-full border-collapse border border-black shadow-lg">
      <TableHeader />
      <tbody>
        {formData.termStructures.map((term: any, termIndex: number) => {
          const termComponents = term.buckets.flatMap((bucket: any) => bucket.components)
          
          return termComponents.map((component: any, componentIndex: number) => {
            const bucketIndex = term.buckets.findIndex((bucket: any) => 
              bucket.components.some((comp: any) => comp === component)
            )
            const actualComponentIndex = term.buckets[bucketIndex].components.findIndex((comp: any) => comp === component)
            
            // If this component doesn't have a name yet, we can offer to reset it
            // This helps ensure all buckets are shown
            if (!component.name) {
              // Wait for React to finish rendering
              setTimeout(() => {
                resetComponent(termIndex, bucketIndex, actualComponentIndex)
              }, 0)
            }
            
            return (
              <FeeItemRow
                key={`${termIndex}-${bucketIndex}-${actualComponentIndex}`}
                termIndex={termIndex}
                bucketIndex={bucketIndex}
                actualComponentIndex={actualComponentIndex}
                componentIndex={componentIndex}
                term={term}
                component={component}
                formData={formData}
                // Pass the complete list of ALL buckets without filtering
                feeBuckets={allFeeBuckets}
                currentEditingField={currentEditingField}
                setCurrentEditingField={setCurrentEditingField}
                updateComponent={updateComponent}
                updateBucket={updateBucket}
                removeComponent={removeComponent}
                addComponent={addComponent}
                setEditingBucket={setEditingBucket}
                setShowEditBucketModal={setShowEditBucketModal}
                deleteFeeBucket={deleteFeeBucket}
                deleteFormBucket={deleteFormBucket}
              />
            )
          })
        })}
        
        <ActionsRow
          formData={formData}
          addComponent={addComponent}
          addBucket={addBucket}
          updateComponent={updateComponent}
          showToast={showToast}
        />
        
        <TotalRow calculateGrandTotal={calculateGrandTotal} />
      </tbody>
    </table>
  )
}

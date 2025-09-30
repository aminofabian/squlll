import React from 'react'
import { TermBadges } from './TermBadges'
import { BucketSelector } from './BucketSelector'
import { FeeAmountInput } from './FeeAmountInput'
import { FeeActionButtons } from './FeeActionButtons'

interface FeeItemRowProps {
  termIndex: number
  bucketIndex: number
  actualComponentIndex: number
  componentIndex: number
  term: any
  component: any
  formData: any
  feeBuckets: any[]
  currentEditingField: string | null
  setCurrentEditingField: (field: string | null) => void
  updateComponent: (termIndex: number, bucketIndex: number, componentIndex: number, field: keyof any, value: any) => void
  updateBucket: (termIndex: number, bucketIndex: number, field: keyof any, value: any) => void
  removeComponent: (termIndex: number, bucketIndex: number, componentIndex: number) => void
  addComponent: (termIndex: number, bucketIndex: number) => void
  setEditingBucket: (bucket: any) => void
  setShowEditBucketModal: (show: boolean) => void
  deleteFeeBucket: (bucketId: string) => void
  deleteFormBucket: (termIndex: number, bucketIndex: number) => void
}

export const FeeItemRow: React.FC<FeeItemRowProps> = ({
  termIndex,
  bucketIndex,
  actualComponentIndex,
  componentIndex,
  term,
  component,
  formData,
  feeBuckets,
  currentEditingField,
  setCurrentEditingField,
  updateComponent,
  updateBucket,
  removeComponent,
  addComponent,
  setEditingBucket,
  setShowEditBucketModal,
  deleteFeeBucket,
  deleteFormBucket
}) => {
  return (
    <tr key={`${termIndex}-${bucketIndex}-${actualComponentIndex}`} className="hover:bg-primary/5 group transition-all duration-200">
      <td className="border border-primary/30 p-3 text-center">
        <TermBadges 
          term={term.term}
          academicYear={term.academicYear || formData.academicYear}
          isFirstComponent={componentIndex === 0}
        />
      </td>
      <td className="border border-primary/30 p-3">
        {/* Using key with termIndex+bucketIndex forces React to re-mount the component when terms change */}
        <BucketSelector
          key={`bucket-selector-${termIndex}-${bucketIndex}`}
          termIndex={termIndex}
          bucketIndex={bucketIndex}
          actualComponentIndex={actualComponentIndex}
          formData={formData}
          component={component}
          feeBuckets={feeBuckets}
          updateBucket={updateBucket}
          updateComponent={updateComponent}
        />
        {currentEditingField === `${termIndex}-${bucketIndex}-${actualComponentIndex}-name` && (
          <div className="absolute top-full left-0 mt-1 text-xs text-primary bg-primary/5 px-2 py-1 shadow-sm">
            💡 Choose from existing buckets or create custom
          </div>
        )}
      </td>
      <td className="border border-primary/30 p-3 text-right">
        <FeeAmountInput
          termIndex={termIndex}
          bucketIndex={bucketIndex}
          componentIndex={actualComponentIndex}
          component={component}
          currentEditingField={currentEditingField}
          setCurrentEditingField={setCurrentEditingField}
          updateComponent={updateComponent}
        />
      </td>
      <td className="border border-primary/30 p-2 text-center">
        <FeeActionButtons
          termIndex={termIndex}
          bucketIndex={bucketIndex}
          componentIndex={componentIndex}
          actualComponentIndex={actualComponentIndex}
          formData={formData}
          component={component}
          removeComponent={removeComponent}
          addComponent={addComponent}
          updateComponent={updateComponent}
          setEditingBucket={setEditingBucket}
          setShowEditBucketModal={setShowEditBucketModal}
          deleteFeeBucket={deleteFeeBucket}
          deleteFormBucket={deleteFormBucket}
        />
      </td>
    </tr>
  )
}

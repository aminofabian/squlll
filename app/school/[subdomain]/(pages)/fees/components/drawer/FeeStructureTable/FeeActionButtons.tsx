import React from 'react'
import { X, Copy, Edit3, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeeActionButtonsProps {
  termIndex: number
  bucketIndex: number
  componentIndex: number
  actualComponentIndex: number
  formData: any
  component: any
  removeComponent: (termIndex: number, bucketIndex: number, componentIndex: number) => void
  addComponent: (termIndex: number, bucketIndex: number) => void
  updateComponent: (termIndex: number, bucketIndex: number, componentIndex: number, field: keyof any, value: any) => void
  setEditingBucket: (bucket: any) => void
  setShowEditBucketModal: (show: boolean) => void
  deleteFeeBucket: (bucketId: string) => void
  deleteFormBucket: (termIndex: number, bucketIndex: number) => void
}

export const FeeActionButtons: React.FC<FeeActionButtonsProps> = ({
  termIndex,
  bucketIndex,
  componentIndex,
  actualComponentIndex,
  formData,
  component,
  removeComponent,
  addComponent,
  updateComponent,
  setEditingBucket,
  setShowEditBucketModal,
  deleteFeeBucket,
  deleteFormBucket
}) => {
  const handleDuplicate = () => {
    // Duplicate this fee item
    addComponent(termIndex, bucketIndex)
    const newIndex = formData.termStructures[termIndex].buckets[bucketIndex].components.length - 1
    updateComponent(termIndex, bucketIndex, newIndex, 'name', component.name)
    updateComponent(termIndex, bucketIndex, newIndex, 'amount', component.amount)
  }
  
  const handleEditBucket = () => {
    const bucket = formData.termStructures[termIndex].buckets[bucketIndex]
    setEditingBucket({
      id: bucket.id!,
      name: bucket.name,
      description: bucket.description,
      isActive: true // Default to active, could be enhanced to track actual status
    })
    setShowEditBucketModal(true)
  }
  
  const handleDeleteBucket = async () => {
    const bucket = formData.termStructures[termIndex].buckets[bucketIndex]
    if (bucket.id) {
      // Delete from server if it has an ID
      if (confirm(`Are you sure you want to delete the entire "${bucket.name}" bucket? This will remove it from the server and all fee structures.`)) {
        await deleteFeeBucket(bucket.id)
        // Also remove from form
        deleteFormBucket(termIndex, bucketIndex)
      }
    } else {
      // Just remove from form if no server ID
      if (confirm(`Are you sure you want to remove the "${bucket.name}" bucket from this fee structure?`)) {
        deleteFormBucket(termIndex, bucketIndex)
      }
    }
  }
  
  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110"
        onClick={() => removeComponent(termIndex, bucketIndex, actualComponentIndex)}
        title="Delete fee"
      >
        <X className="h-3 w-3 text-red-500" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-primary/10 hover:scale-110"
        onClick={handleDuplicate}
        title="Duplicate fee"
      >
        <Copy className="h-3 w-3 text-primary" />
      </Button>
      
      {/* Show edit and delete bucket buttons only for the first component of each bucket */}
      {actualComponentIndex === 0 && (
        <>
          {formData.termStructures[termIndex].buckets[bucketIndex].id && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-50 hover:scale-110"
              onClick={handleEditBucket}
              title="Edit bucket"
            >
              <Edit3 className="h-3 w-3 text-blue-500" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110"
            onClick={handleDeleteBucket}
            title="Delete entire bucket"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </>
      )}
    </div>
  )
}

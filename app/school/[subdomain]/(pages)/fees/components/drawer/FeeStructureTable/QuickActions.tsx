import React from 'react'
import { Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  formData: any
  addComponent: (termIndex: number, bucketIndex: number) => void
  addBucket: (termIndex: number) => void
  updateComponent: (termIndex: number, bucketIndex: number, componentIndex: number, field: keyof any, value: any) => void
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  formData,
  addComponent,
  addBucket,
  updateComponent,
  showToast
}) => {
  const handleAddFee = () => {
    // Add new component to first term, first bucket
    if (formData.termStructures[0]?.buckets[0]) {
      addComponent(0, 0)
    } else {
      // If no buckets exist, add a default bucket first
      addBucket(0)
    }
  }

  const handleAddCategory = () => {
    // Add a new bucket/category
    if (formData.termStructures[0]) {
      addBucket(0)
    }
  }

  const handleBulkAdd = () => {
    // Get buckets from the current fee structure form data
    const existingBuckets = formData.feeBuckets || []
    
    // Use actual buckets from the API/database instead of hardcoded values
    // We're using the first two buckets from the API response - Boarding and Tuition
    const bucketsToAdd = existingBuckets.slice(0, 3).map((bucket: {name: string; id: string; description: string}) => ({
      name: bucket.name,
      amount: bucket.name.includes('Board') ? '8000' : '15000', // Set reasonable defaults based on type
      id: bucket.id,
      description: bucket.description
    }))
    
    // If no buckets are found, use fallback values from the API response
    const commonFees = bucketsToAdd.length > 0 ? bucketsToAdd : [
      { name: 'Tuition', amount: '15000', id: '1efb4c69-ba32-48b5-9a32-4125b6bcbb91', description: '' },
      { name: 'Boarding', amount: '8000', id: '04c58333-9b58-4416-a5bb-fd3f5ff80ae1', description: 'Boarding' }
    ]
    
    commonFees.forEach((fee: {name: string; amount: string; id: string; description: string}) => {
      if (formData.termStructures[0]?.buckets[0]) {
        addComponent(0, 0)
        const termIndex = 0
        const bucketIndex = 0
        const componentIndex = formData.termStructures[termIndex].buckets[bucketIndex].components.length - 1
        updateComponent(termIndex, bucketIndex, componentIndex, 'name', fee.name)
        updateComponent(termIndex, bucketIndex, componentIndex, 'amount', fee.amount)
      }
    })
    
    showToast(`🚀 ${commonFees.length} fee buckets added in bulk!`, 'success')
  }

  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        className="text-xs bg-primary text-white border-primary hover:bg-primary/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        onClick={handleAddFee}
      >
        <Plus className="h-3 w-3 mr-1" />
        ✨ Add Fee
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="text-xs bg-primary text-white border-primary hover:bg-primary/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        onClick={handleAddCategory}
      >
        <Plus className="h-3 w-3 mr-1" />
        📁 Add Category
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="text-xs bg-primary text-white border-primary hover:bg-primary/80 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        onClick={handleBulkAdd}
      >
        <Zap className="h-3 w-3 mr-1" />
        🚀 Bulk Add
      </Button>
    </div>
  )
}

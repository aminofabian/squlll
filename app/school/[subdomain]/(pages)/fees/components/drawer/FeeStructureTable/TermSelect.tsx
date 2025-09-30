import React, { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TermSelectProps {
  formData: any
  addComponent: (termIndex: number, bucketIndex: number) => void
  addBucket: (termIndex: number) => void
}

export const TermSelect: React.FC<TermSelectProps> = ({
  formData,
  addComponent,
  addBucket
}) => {
  // Reset and select a term
  const handleTermSelect = (value: string) => {
    const termIndex = parseInt(value)
    
    // Scenario 1: Term has no buckets - create one
    if (formData.termStructures[termIndex]?.buckets.length === 0) {
      addBucket(termIndex)
      
      // Delay slightly to let the UI update
      setTimeout(() => {
        // Add a component to the newly created bucket
        if (formData.termStructures[termIndex]?.buckets.length > 0) {
          addComponent(termIndex, 0)
        }
      }, 10)
      
      return
    }
    
    // Scenario 2: Term has buckets - add a component
    // This forces a fresh component to be created that will see all buckets
    addComponent(termIndex, 0)
  }
  
  // On first render, make sure first term has at least one bucket and component
  useEffect(() => {
    if (formData.termStructures.length > 0) {
      const firstTermIndex = 0
      
      // If first term has no buckets, add one
      if (formData.termStructures[firstTermIndex]?.buckets.length === 0) {
        addBucket(firstTermIndex)
      }
      
      // Ensure first term's first bucket has at least one component
      if (formData.termStructures[firstTermIndex]?.buckets[0]?.components.length === 0) {
        addComponent(firstTermIndex, 0)
      }
    }
  }, [])
  
  return (
    <Select onValueChange={handleTermSelect}>
      <SelectTrigger className="text-xs bg-white border-2 border-primary/30 px-3 py-2 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-primary/30 h-8">
        <SelectValue placeholder="🎯 Select Term" />
      </SelectTrigger>
      <SelectContent>
        {formData.termStructures.map((term: any, index: number) => (
          <SelectItem key={index} value={index.toString()}>
            📅 {term.term}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

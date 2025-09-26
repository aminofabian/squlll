'use client'

import React, { useState, createElement } from 'react'
import { Edit3, BookOpen, Home, Bus, Trophy, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FeeStructureForm } from '../../types'

interface FeeCategoryEditorProps {
  termIndex: number
  bucketIndex: number
  componentIndex: number
  formData: FeeStructureForm
  updateComponent: (
    termIndex: number, 
    bucketIndex: number, 
    componentIndex: number, 
    field: string, 
    value: any
  ) => void
  showToast: (message: string, type: 'success' | 'error' | 'info') => void
  onSave?: () => void
}

export const FeeCategoryEditor: React.FC<FeeCategoryEditorProps> = ({
  termIndex,
  bucketIndex,
  componentIndex,
  formData,
  updateComponent,
  showToast,
  onSave
}) => {
  const term = formData.termStructures[termIndex]
  const bucket = term?.buckets[bucketIndex]
  const component = bucket?.components[componentIndex]
  
  const [editing, setEditing] = useState(false)
  const [editedName, setEditedName] = useState(component?.name || '')
  const [editedAmount, setEditedAmount] = useState(component?.amount || '0')
  const [editedCategory, setEditedCategory] = useState(component?.category || 'academic')
  
  // Categories with icons
  const categories = [
    { id: 'academic', name: 'Academic', icon: BookOpen },
    { id: 'boarding', name: 'Boarding', icon: Home },
    { id: 'transport', name: 'Transport', icon: Bus },
    { id: 'activity', name: 'Activity', icon: Trophy },
    { id: 'other', name: 'Other', icon: FileText },
  ]
  
  const saveChanges = () => {
    // Update component name
    updateComponent(termIndex, bucketIndex, componentIndex, 'name', editedName)
    
    // Update component amount
    updateComponent(termIndex, bucketIndex, componentIndex, 'amount', editedAmount)
    
    // Update component category
    updateComponent(termIndex, bucketIndex, componentIndex, 'category', editedCategory)
    
    setEditing(false)
    if (onSave) onSave()
    showToast('✅ Fee item updated successfully!', 'success')
  }
  
  // Get icon for category
  const CategoryIcon = categories.find(cat => cat.id === editedCategory)?.icon || FileText
  
  if (!component) return null
  
  return (
    <div className="relative border rounded-md p-2 hover:bg-slate-50 transition-colors">
      {editing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input 
              className="flex-1 text-sm h-8"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Fee name"
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={editedCategory}
              onValueChange={setEditedCategory}
            >
              <SelectTrigger className="h-8 text-xs flex-1 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {createElement(category.icon, { className: "h-3.5 w-3.5" })}
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative w-24">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-500">Ksh</span>
              <Input 
                className="pl-8 text-right h-8 text-xs"
                value={editedAmount}
                onChange={(e) => setEditedAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                type="text"
                inputMode="decimal"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 text-xs" 
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              variant="default" 
              className="h-7 text-xs" 
              onClick={saveChanges}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 flex items-center justify-center rounded-full bg-primary/10">
              <CategoryIcon className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm">{component.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="font-medium text-sm">
              {parseFloat(component.amount).toLocaleString('en-KE')}
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" 
              onClick={() => setEditing(true)}
            >
              <Edit3 className="h-3 w-3 text-slate-500" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

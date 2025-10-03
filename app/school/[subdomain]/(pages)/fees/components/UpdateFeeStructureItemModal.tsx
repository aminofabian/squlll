'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Edit3 } from "lucide-react"

interface FeeStructureItem {
  id: string
  amount: number
  isMandatory: boolean
  feeBucket?: {
    id: string
    name: string
  }
  feeStructure?: {
    id: string
    name: string
    academicYear?: {
      name: string
    }
    terms?: {
      name: string
    }[]
  }
}

interface UpdateFeeStructureItemModalProps {
  isOpen: boolean
  onClose: () => void
  feeStructureItem: FeeStructureItem | null
  onSuccess?: (updatedItem: FeeStructureItem) => void
}

export const UpdateFeeStructureItemModal = ({
  isOpen,
  onClose,
  feeStructureItem,
  onSuccess
}: UpdateFeeStructureItemModalProps) => {
  const [amount, setAmount] = useState<string>('0')
  const [isMandatory, setIsMandatory] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Reset form when modal opens with new item
  useEffect(() => {
    if (feeStructureItem) {
      setAmount(feeStructureItem.amount.toString())
      setIsMandatory(feeStructureItem.isMandatory)
      setError(null)
    }
  }, [feeStructureItem])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feeStructureItem) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const parsedAmount = parseFloat(amount)
      
      if (isNaN(parsedAmount)) {
        throw new Error('Please enter a valid amount')
      }
      
      // Validate the fee structure item ID
      if (!feeStructureItem.id || feeStructureItem.id.trim() === '') {
        throw new Error('Invalid fee structure item ID')
      }
      
      // Log the request for debugging
      console.log('Updating fee structure item:', {
        id: feeStructureItem.id,
        amount: parsedAmount,
        isMandatory: isMandatory,
        itemData: feeStructureItem // Log the full item for debugging
      })
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateFeeStructureItem($id: ID!, $input: UpdateFeeStructureItemInput!) {
              updateFeeStructureItem(id: $id, input: $input) {
                id
                amount
                isMandatory
                feeBucket {
                  id
                  name
                }
                feeStructure {
                  id
                  name
                  academicYear {
                    name
                  }
                  terms {
                    name
                  }
                }
              }
            }
          `,
          variables: {
            id: feeStructureItem.id,
            input: {
              amount: parsedAmount,
              isMandatory: isMandatory
            }
          }
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Log the response for debugging
      console.log('Update fee structure item response:', result)
      
      if (result.errors) {
        const error = result.errors[0]
        console.error('GraphQL error details:', error)
        
        // Provide more specific error messages
        if (error.message === 'Fee structure item not found') {
          throw new Error(`Fee structure item with ID "${feeStructureItem.id}" was not found. This item may have been deleted or you may not have permission to update it.`)
        }
        
        throw new Error(error.message || 'Failed to update fee structure item')
      }
      
      // Handle successful update
      const updatedItem = result.data.updateFeeStructureItem
      if (onSuccess && updatedItem) {
        onSuccess(updatedItem)
      }
      
      // Close the modal
      onClose()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error updating fee structure item:', err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            Update Fee Structure Item
          </DialogTitle>
          <DialogDescription>
            Modify the fee amount and mandatory status for this item.
          </DialogDescription>
        </DialogHeader>
        
        {feeStructureItem && (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <div className="border rounded-md p-3 bg-slate-50">
                  <div className="text-sm font-medium">{feeStructureItem.feeBucket?.name || 'Fee Bucket'}</div>
                  {feeStructureItem.feeStructure && (
                    <div className="text-xs text-slate-500 mt-1">
                      {feeStructureItem.feeStructure.name} • 
                      {feeStructureItem.feeStructure.academicYear?.name && ` ${feeStructureItem.feeStructure.academicYear.name} •`} 
                      {feeStructureItem.feeStructure.terms && feeStructureItem.feeStructure.terms.length > 0 
                        ? feeStructureItem.feeStructure.terms[0].name 
                        : ''}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">KES</span>
                    <Input
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-12"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="mandatory" className="text-right">
                  Mandatory
                </Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="mandatory" 
                    checked={isMandatory}
                    onCheckedChange={(checked) => setIsMandatory(checked === true)}
                  />
                  <label htmlFor="mandatory" className="text-sm text-slate-500 cursor-pointer">
                    This fee is required for all students
                  </label>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Fee Item'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

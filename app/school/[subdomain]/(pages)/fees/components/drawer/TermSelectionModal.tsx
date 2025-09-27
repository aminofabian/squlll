'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

interface TermOption {
  id: string
  name: string
}

interface TermSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  availableTerms: TermOption[]
  selectedTermId: string
  onTermSelect: (termId: string) => void
  onComplete: () => void
}

export const TermSelectionModal: React.FC<TermSelectionModalProps> = ({
  isOpen,
  onClose,
  availableTerms,
  selectedTermId,
  onTermSelect,
  onComplete
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Term for Fee Structure</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-slate-600 mb-4">
            Please select which term you want to use for this fee structure item:
          </p>
          
          {availableTerms.length === 0 ? (
            <div className="p-4 text-center bg-yellow-50 border border-yellow-200">
              <p className="text-sm text-yellow-700">No terms available. Using default term.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTerms.map((term) => (
                <div 
                  key={term.id} 
                  className={`p-3 border cursor-pointer transition-all ${selectedTermId === term.id ? 'bg-primary/10 border-primary' : 'hover:bg-slate-50 border-slate-200'}`}
                  onClick={() => onTermSelect(term.id)}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={selectedTermId === term.id} />
                    <span className="font-medium">{term.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-primary text-white hover:bg-primary/90"
            onClick={onComplete}
            disabled={!selectedTermId || availableTerms.length === 0}
          >
            Create Fee Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

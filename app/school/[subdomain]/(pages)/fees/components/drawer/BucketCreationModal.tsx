'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap } from "lucide-react"

interface BucketModalData {
  name: string
  description: string
  type?: string
  isOptional?: boolean
}

interface BucketCreationModalProps {
  isOpen: boolean
  onClose: () => void
  bucketData: BucketModalData
  isCreating: boolean
  onChange: (data: BucketModalData) => void
  onCreateBucket: () => void
}

export const BucketCreationModal: React.FC<BucketCreationModalProps> = ({
  isOpen,
  onClose,
  bucketData,
  isCreating,
  onChange,
  onCreateBucket
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Create New Fee Bucket
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bucket-name" className="text-sm font-medium text-slate-700">
              Bucket Name
            </Label>
            <Input
              id="bucket-name"
              placeholder="e.g., Tuition Fees, Transport Fees"
              value={bucketData.name}
              onChange={(e) => onChange({ ...bucketData, name: e.target.value })}
              className="focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bucket-description" className="text-sm font-medium text-slate-700">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Input
              id="bucket-description"
              placeholder="e.g., Academic fees for the term"
              value={bucketData.description}
              onChange={(e) => onChange({ ...bucketData, description: e.target.value })}
              className="focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              onClose()
              onChange({ name: '', description: '' })
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={onCreateBucket}
            disabled={!bucketData.name.trim() || isCreating}
            className="bg-primary text-white hover:bg-primary/80"
          >
            {isCreating ? 'Creating...' : 'Create Bucket'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

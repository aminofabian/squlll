'use client'

import React, { useState } from 'react'
import { GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CreateBucketModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCreateBucket: (name: string, description: string) => Promise<void>
  isCreatingBucket: boolean
}

interface BucketModalData {
  name: string
  description: string
  type?: string
  isOptional?: boolean
}

export const CreateBucketModal: React.FC<CreateBucketModalProps> = ({
  isOpen,
  onOpenChange,
  onCreateBucket,
  isCreatingBucket
}) => {
  const [bucketModalData, setBucketModalData] = useState<BucketModalData>({ 
    name: '', 
    description: '' 
  })

  const handleCancel = () => {
    onOpenChange(false)
    setBucketModalData({ name: '', description: '' })
  }

  const handleCreate = async () => {
    if (bucketModalData.name.trim() && bucketModalData.description.trim()) {
      await onCreateBucket(
        bucketModalData.name.trim(), 
        bucketModalData.description.trim()
      )
      onOpenChange(false)
      setBucketModalData({ name: '', description: '' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              value={bucketModalData.name}
              onChange={(e) => setBucketModalData(prev => ({ ...prev, name: e.target.value }))}
              className="focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bucket-description" className="text-sm font-medium text-slate-700">
              Description
            </Label>
            <Input
              id="bucket-description"
              placeholder="e.g., Academic fees for the term"
              value={bucketModalData.description}
              onChange={(e) => setBucketModalData(prev => ({ ...prev, description: e.target.value }))}
              className="focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!bucketModalData.name.trim() || !bucketModalData.description.trim() || isCreatingBucket}
            className="bg-primary text-white hover:bg-primary/80"
          >
            {isCreatingBucket ? 'Creating...' : 'Create Bucket'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit3 } from "lucide-react"

interface EditingBucket {
  id: string
  name: string
  description: string
  isActive: boolean
}

interface BucketEditModalProps {
  isOpen: boolean
  onClose: () => void
  editingBucket: EditingBucket | null
  onChange: (bucket: EditingBucket) => void
  onUpdateBucket: () => void
}

export const BucketEditModal: React.FC<BucketEditModalProps> = ({
  isOpen,
  onClose,
  editingBucket,
  onChange,
  onUpdateBucket
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            Edit Fee Bucket
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-bucket-name" className="text-sm font-medium text-slate-700">
              Bucket Name
            </Label>
            <Input
              id="edit-bucket-name"
              placeholder="e.g., Tuition Fees, Transport Fees"
              value={editingBucket?.name || ''}
              onChange={(e) => editingBucket && onChange({ ...editingBucket, name: e.target.value })}
              className="focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-bucket-description" className="text-sm font-medium text-slate-700">
              Description
            </Label>
            <Input
              id="edit-bucket-description"
              placeholder="e.g., Academic fees for the term"
              value={editingBucket?.description || ''}
              onChange={(e) => editingBucket && onChange({ ...editingBucket, description: e.target.value })}
              className="focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-bucket-active"
                checked={editingBucket?.isActive || false}
                onCheckedChange={(checked) => editingBucket && onChange({ ...editingBucket, isActive: checked as boolean })}
              />
              <Label htmlFor="edit-bucket-active" className="text-sm font-medium text-slate-700">
                Active (available for use in fee structures)
              </Label>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={onUpdateBucket}
            disabled={!editingBucket?.name.trim() || !editingBucket?.description.trim()}
            className="bg-primary text-white hover:bg-primary/80"
          >
            Update Bucket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

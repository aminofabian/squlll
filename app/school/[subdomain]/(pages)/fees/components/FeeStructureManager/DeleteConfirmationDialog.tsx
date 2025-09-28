'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2 } from 'lucide-react'
import { StructureToDelete } from './types'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  structureToDelete: StructureToDelete | null
  onConfirmDelete: (id: string) => void
}

export const DeleteConfirmationDialog = ({
  isOpen,
  onOpenChange,
  structureToDelete,
  onConfirmDelete
}: DeleteConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Fee Structure</DialogTitle>
          <DialogDescription className="pt-2">
            Are you sure you want to delete <span className="font-semibold">{structureToDelete?.name}</span>?
            <p className="mt-2 text-red-500">This action cannot be undone.</p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            variant="destructive"
            onClick={() => {
              if (structureToDelete) {
                onConfirmDelete(structureToDelete.id);
                onOpenChange(false);
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

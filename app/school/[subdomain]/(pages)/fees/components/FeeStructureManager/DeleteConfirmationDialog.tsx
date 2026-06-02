'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle, Trash2 } from 'lucide-react'
import { StructureToDelete } from './types'
import type { FeePlanDeleteEligibility } from '../../lib/feePlanLifecycle'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  structureToDelete: StructureToDelete | null
  eligibility?: FeePlanDeleteEligibility | null
  eligibilityLoading?: boolean
  onConfirmDelete: (id: string) => void
}

export const DeleteConfirmationDialog = ({
  isOpen,
  onOpenChange,
  structureToDelete,
  eligibility = null,
  eligibilityLoading = false,
  onConfirmDelete
}: DeleteConfirmationDialogProps) => {
  const canDelete = eligibility?.canDelete ?? false
  const blockReasons = eligibility?.blockReasons ?? []

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete fee plan</DialogTitle>
          <DialogDescription className="pt-2 space-y-3">
            <span>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{structureToDelete?.name}</span>?
            </span>

            {eligibilityLoading ? (
              <span className="block text-slate-600">
                Checking whether this plan can be deleted…
              </span>
            ) : eligibility && !canDelete ? (
              <span className="block rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <span className="mb-1 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Cannot delete — financial activity exists
                </span>
                <span className="block text-sm">
                  This plan must be kept for auditing and reporting. Historical
                  records linked to it include:
                </span>
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm">
                  {blockReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </span>
            ) : canDelete ? (
              <span className="block text-red-600">
                This action cannot be undone. The plan has no student assignments,
                balances, payments, or invoices.
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {canDelete || eligibilityLoading ? "Cancel" : "Close"}
          </Button>
          {canDelete ? (
            <Button 
              variant="destructive"
              disabled={eligibilityLoading}
              onClick={() => {
                if (structureToDelete) {
                  onConfirmDelete(structureToDelete.id);
                  onOpenChange(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete plan
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

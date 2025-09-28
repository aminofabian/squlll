'use client'

// Import from refactored component folder
import { FeeStructureManager as RefactoredManager } from './FeeStructureManager/'
import { FeeStructure } from '../types'

interface FeeStructureManagerProps {
  onCreateNew: () => void
  onEdit: (feeStructure: FeeStructure) => void
  onGenerateInvoices: (feeStructureId: string, term: string) => void
  onAssignToGrade: (feeStructureId: string) => void
  onDelete?: (feeStructureId: string) => void
}

export const FeeStructureManager = (props: FeeStructureManagerProps) => {
  return <RefactoredManager {...props} />
}